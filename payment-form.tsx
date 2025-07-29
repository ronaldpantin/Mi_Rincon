"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Banknote, Loader2, Phone, User, DollarSign, Upload, X, Camera, AlertCircle } from "lucide-react"

interface PaymentFormProps {
  onPaymentSuccess: (solicitudId: string) => void
  onBack: () => void
  totalVEF: number
  reservationDetails: any
}

export function PaymentForm({ onPaymentSuccess, onBack, totalVEF, reservationDetails }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [transactionReference, setTransactionReference] = useState("")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Datos para Pago Móvil - Solo Banco de Venezuela
  const pagoMovilDetails = {
    phone: "0412-2328332",
    bank: "Banco de Venezuela",
    idNumber: "J-505396544",
    accountHolderName: "Cafe Paya C.A.",
  }

  // Función mejorada para comprimir imágenes
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        reject(new Error("El archivo debe ser una imagen"))
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("La imagen es demasiado grande. Máximo 10MB"))
        return
      }

      const reader = new FileReader()

      reader.onload = (event) => {
        const img = new Image()

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            if (!ctx) {
              reject(new Error("No se pudo procesar la imagen"))
              return
            }

            // Calcular nuevas dimensiones manteniendo la proporción
            const maxWidth = 800
            const maxHeight = 600
            let { width, height } = img

            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height

            // Dibujar la imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height)

            // Convertir a base64 con compresión
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8)
            resolve(compressedDataUrl)
          } catch (error) {
            reject(new Error("Error al procesar la imagen"))
          }
        }

        img.onerror = () => {
          reject(new Error("No se pudo cargar la imagen"))
        }

        // Cargar la imagen
        if (event.target?.result) {
          img.src = event.target.result as string
        } else {
          reject(new Error("Error al leer el archivo"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      // Limpiar si no hay archivo
      setScreenshotFile(null)
      setScreenshotPreview(null)
      setUploadError(null)
      return
    }

    setIsLoading(true)
    setUploadError(null)

    try {
      // Comprimir la imagen
      const compressedDataUrl = await compressImage(file)

      // Establecer los estados
      setScreenshotFile(file)
      setScreenshotPreview(compressedDataUrl)
    } catch (error) {
      console.error("Error al procesar la imagen:", error)
      setUploadError(error instanceof Error ? error.message : "Error al procesar la imagen")
      setScreenshotFile(null)
      setScreenshotPreview(null)

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validaciones
    if (transactionReference.trim() === "") {
      setSubmitError("Por favor, ingresa el número de referencia de tu pago móvil.")
      return
    }

    if (!screenshotFile || !screenshotPreview) {
      setSubmitError("Por favor, sube una captura de pantalla del pago móvil.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Sending payment data:", {
        reservationDetails,
        transactionReference,
        paymentMethod: "pago-movil",
        hasScreenshot: !!screenshotPreview,
      })

      const response = await fetch("/api/process-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationDetails,
          transactionReference,
          screenshotFileBase64: screenshotPreview,
          paymentMethod: "pago-movil",
        }),
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (response.ok && data.success) {
        onPaymentSuccess(data.solicitudId)
      } else {
        const errorMessage = data.error || "Error desconocido al procesar el pago"
        console.error("Payment processing error:", errorMessage)
        setSubmitError(errorMessage)
      }
    } catch (error) {
      console.error("Network error:", error)
      setSubmitError("Error de conexión. Verifica tu internet e inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>Pago Móvil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error de envío */}
          {submitError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Resumen de Pago Mejorado */}
          <Card className="p-4 bg-lime-50 rounded-lg border border-lime-100">
            <h3 className="font-bold text-lg text-emerald-800 flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Total a Pagar</span>
            </h3>

            <div className="space-y-3">
              {/* Desglose de items */}
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex justify-between">
                  <span>Entradas ({reservationDetails?.entradas || 0} × $5.00):</span>
                  <span>${((reservationDetails?.entradas || 0) * 5).toFixed(2)}</span>
                </div>

                {reservationDetails?.selectedAreasDetails?.map((area: any) => (
                  <div key={area?.id} className="flex justify-between">
                    <span>{area?.name}:</span>
                    <span>${area?.price?.toFixed(2)}</span>
                  </div>
                ))}

                {reservationDetails?.exonerados > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Exonerados ({reservationDetails.exonerados}):</span>
                    <span>Gratis</span>
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal USD:</span>
                  <span>${(reservationDetails?.subtotalUSD || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    Subtotal VEF (BCV {(reservationDetails?.bcvRate || 122.17).toFixed(8).replace(".", ",")}):
                  </span>
                  <span>Bs. {(reservationDetails?.subtotalVEF || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>IVA (16% sobre VEF):</span>
                  <span>Bs. {(reservationDetails?.ivaVEF || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-emerald-900 bg-emerald-100 p-3 rounded">
                  <span>Total Final:</span>
                  <span>Bs. {totalVEF.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs text-emerald-600 mt-3 space-y-1">
                <p>• IVA: Calculado sobre el monto en bolívares (16% - Venezuela)</p>
                <p>• Tasa BCV oficial del {new Date().toLocaleDateString("es-VE")}</p>
                <p>• Todos los precios incluyen impuestos</p>
              </div>
            </div>
          </Card>

          {/* Información para Pago Móvil */}
          <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-bold text-emerald-800 text-lg flex items-center space-x-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>Datos para Pago Móvil</span>
            </h3>

            <div className="space-y-3 text-sm text-emerald-700">
              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <p className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Teléfono:</span>
                  <span className="font-mono text-lg">{pagoMovilDetails.phone}</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <p className="flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Banco:</span>
                  <span>{pagoMovilDetails.bank}</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <p className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Titular:</span>
                  <span>{pagoMovilDetails.accountHolderName}</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <p className="flex items-center space-x-2">
                  <span className="font-semibold">C.I./RIF:</span>
                  <span className="font-mono">{pagoMovilDetails.idNumber}</span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">
                💡 <strong>Instrucciones:</strong>
              </p>
              <ol className="text-xs text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
                <li>
                  Realiza el pago móvil por <strong>Bs. {totalVEF.toFixed(2)}</strong>
                </li>
                <li>Toma una captura de pantalla del comprobante</li>
                <li>Ingresa el número de referencia abajo</li>
                <li>Sube la captura de pantalla</li>
                <li>Envía para confirmar tu reserva</li>
              </ol>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionReference" className="text-emerald-800 font-medium">
                Número de Referencia del Pago Móvil *
              </Label>
              <Input
                id="transactionReference"
                type="text"
                placeholder="Ej: 1234567890"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="border-emerald-300 focus-visible:ring-emerald-500"
                required
              />
              <p className="text-xs text-emerald-600">
                Ingresa el número de referencia que aparece en tu comprobante de pago móvil
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot" className="text-emerald-800 font-medium">
                Comprobante de Pago Móvil *
              </Label>

              {/* Área de subida de archivos */}
              <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center bg-emerald-50/50">
                <input
                  ref={fileInputRef}
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!screenshotPreview ? (
                  <div className="space-y-4">
                    <Camera className="w-12 h-12 text-emerald-400 mx-auto" />
                    <div>
                      <p className="text-emerald-700 font-medium mb-2">Sube una foto clara del comprobante</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Seleccionar Imagen
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-600">Formatos: JPG, PNG, WEBP • Máximo 10MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={screenshotPreview || "/placeholder.svg"}
                        alt="Comprobante de pago móvil"
                        className="max-w-full max-h-64 rounded-lg border border-emerald-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-emerald-700">
                      <p className="font-medium">✅ Imagen cargada correctamente</p>
                      <p className="text-xs">
                        {screenshotFile?.name} ({((screenshotFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    >
                      Cambiar Imagen
                    </Button>
                  </div>
                )}
              </div>

              {/* Error de subida */}
              {uploadError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                disabled={isLoading}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                disabled={isLoading || !screenshotPreview || !transactionReference.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Confirmar Pago Móvil
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
