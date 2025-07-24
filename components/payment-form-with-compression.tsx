"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Upload,
  CreditCard,
  DollarSign,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileArchiveIcon as Compress,
  Info,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentFormProps {
  onPaymentSuccess: (solicitudId: string) => void
  onBack: () => void
  totalUSD: number
  finalTotalVEF: number
  reservationDetails: any
}

// Función para comprimir imagen
const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.8,
): Promise<{
  compressedFile: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Convertir a blob con compresión
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al comprimir imagen"))
            return
          }

          const originalSize = file.size
          const compressedSize = blob.size
          const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100)

          // Crear nuevo archivo comprimido
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })

          resolve({
            compressedFile,
            originalSize,
            compressedSize,
            compressionRatio,
          })
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => reject(new Error("Error al cargar imagen"))
    img.src = URL.createObjectURL(file)
  })
}

export function PaymentFormWithCompression({
  onPaymentSuccess,
  onBack,
  totalUSD,
  finalTotalVEF,
  reservationDetails,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    referencia: "",
    banco: "",
    monto: "",
    comentarios: "",
  })

  const [comprobante, setComprobante] = useState<File | null>(null)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number
    compressedSize: number
    compressionRatio: number
  } | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 10MB permitido")
      return
    }

    setError("")
    setIsCompressing(true)

    try {
      // Comprimir imagen
      const result = await compressImage(file, 1200, 0.8)

      // Si la imagen comprimida sigue siendo muy grande, comprimir más
      let finalResult = result
      if (result.compressedSize > 300 * 1024) {
        // Si es mayor a 300KB
        finalResult = await compressImage(file, 800, 0.6) // Comprimir más agresivamente
      }

      setComprobante(finalResult.compressedFile)
      setCompressionInfo({
        originalSize: finalResult.originalSize,
        compressedSize: finalResult.compressedSize,
        compressionRatio: finalResult.compressionRatio,
      })
    } catch (error) {
      console.error("Error al comprimir imagen:", error)
      setError("Error al procesar la imagen. Intenta con otra imagen.")
    } finally {
      setIsCompressing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remover el prefijo data:image/...;base64,
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.nombre ||
      !formData.email ||
      !formData.telefono ||
      !formData.referencia ||
      !formData.banco ||
      !formData.monto
    ) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    if (!comprobante) {
      setError("Por favor sube el comprobante de pago")
      return
    }

    setIsSubmitting(true)
    setError("")
    setUploadProgress(0)

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Convertir imagen a base64
      const imageBase64 = await convertFileToBase64(comprobante)

      // Generar ID único para la solicitud
      const solicitudId = `SOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Preparar datos para enviar
      const paymentData = {
        solicitudId,
        reservationDetails,
        paymentInfo: {
          ...formData,
          totalUSD,
          finalTotalVEF,
          comprobante: {
            filename: comprobante.name,
            data: imageBase64,
            size: comprobante.size,
            type: comprobante.type,
          },
          compressionInfo,
        },
        timestamp: new Date().toISOString(),
      }

      // Enviar a la API
      const response = await fetch("/api/process-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al procesar el pago")
      }

      const result = await response.json()

      // Simular un pequeño delay para mostrar el progreso completo
      setTimeout(() => {
        onPaymentSuccess(solicitudId)
      }, 500)
    } catch (error) {
      console.error("Error al enviar pago:", error)
      setError(error instanceof Error ? error.message : "Error al procesar el pago")
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <div>
          <h2 className="text-xl font-bold text-emerald-800">Información de Pago</h2>
          <p className="text-sm text-emerald-600">Completa los datos del pago realizado</p>
        </div>
      </div>

      {/* Resumen del pago */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <DollarSign className="w-5 h-5" />
            <span>Resumen del Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
            <span className="font-medium text-emerald-800">Total en USD:</span>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 font-bold">
              ${totalUSD.toFixed(2)}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-lime-50 rounded-lg">
            <span className="font-medium text-emerald-800">Total en Bolívares:</span>
            <Badge variant="secondary" className="bg-lime-100 text-emerald-800 font-bold">
              Bs. {finalTotalVEF.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información personal */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre" className="text-emerald-700">
                Nombre Completo *
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-emerald-700">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefono" className="text-emerald-700">
                Teléfono *
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="0414-1234567"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del pago */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <CreditCard className="w-5 h-5" />
              <span>Datos del Pago</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="referencia" className="text-emerald-700">
                Número de Referencia *
              </Label>
              <Input
                id="referencia"
                name="referencia"
                value={formData.referencia}
                onChange={handleInputChange}
                placeholder="123456789"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="banco" className="text-emerald-700">
                Banco *
              </Label>
              <Input
                id="banco"
                name="banco"
                value={formData.banco}
                onChange={handleInputChange}
                placeholder="Nombre del banco"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="monto" className="text-emerald-700">
                Monto Pagado *
              </Label>
              <Input
                id="monto"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                placeholder="Bs. 1,234.56"
                className="border-emerald-200 focus:border-emerald-400"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Comprobante de pago */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <FileImage className="w-5 h-5" />
              <span>Comprobante de Pago</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-emerald-700">Subir Comprobante *</Label>
              <div className="mt-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Compress className="w-4 h-4 mr-2 animate-spin" />
                      Comprimiendo imagen...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar imagen
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Información de compresión */}
            {compressionInfo && comprobante && (
              <div className="p-4 bg-emerald-50 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Imagen procesada exitosamente</span>
                </div>
                <div className="text-xs text-emerald-600 space-y-1">
                  <div>📁 Archivo: {comprobante.name}</div>
                  <div>📏 Tamaño original: {formatFileSize(compressionInfo.originalSize)}</div>
                  <div>🗜️ Tamaño comprimido: {formatFileSize(compressionInfo.compressedSize)}</div>
                  <div>📊 Reducción: {compressionInfo.compressionRatio}%</div>
                </div>
              </div>
            )}

            {/* Información sobre compresión */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                Las imágenes se comprimen automáticamente para optimizar la subida. Formatos aceptados: JPG, PNG, WebP.
                Tamaño máximo: 10MB.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Comentarios adicionales */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Comentarios Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="comentarios"
              value={formData.comentarios}
              onChange={handleInputChange}
              placeholder="Información adicional sobre tu pago (opcional)"
              className="border-emerald-200 focus:border-emerald-400"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Progreso de subida */}
        {isSubmitting && (
          <Card className="border-emerald-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700">Procesando pago...</span>
                  <span className="text-sm text-emerald-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botón de envío */}
        <Button
          type="submit"
          disabled={isSubmitting || isCompressing || !comprobante}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold py-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando Pago...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Confirmar Pago
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
