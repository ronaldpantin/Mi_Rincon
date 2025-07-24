"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, Loader2, Phone, User, Landmark, CreditCard, Upload, DollarSign } from "lucide-react"
import Image from "next/image"

interface PaymentFormProps {
  onPaymentSuccess: (solicitudId: string) => void
  onBack: () => void
  totalUSD: number
  finalTotalVEF: number
  reservationDetails: any
}

export function PaymentForm({
  onPaymentSuccess,
  onBack,
  totalUSD,
  finalTotalVEF,
  reservationDetails,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [transactionReference, setTransactionReference] = useState("")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [compressedScreenshot, setCompressedScreenshot] = useState<string | null>(null)

  // Datos bancarios
  const bankDetails = {
    bankName: "Banco de Venezuela",
    accountNumber: "0102-0115-23-0001070385",
    idNumber: "J-505396544",
    accountHolderName: "Cafe Paya C.A.",
    pagoMovilPhone: "0412-2328332",
    pagoMovilBank: "Banco de Venezuela",
    pagoMovilId: "J-505396544",
  }

  // Añadir esta función para comprimir imágenes
  const compressImage = async (file: File, maxSizeKB = 500): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Calcular el factor de escala para reducir el tamaño
          let scale = 1
          if (file.size > maxSizeKB * 1024) {
            scale = Math.sqrt((maxSizeKB * 1024) / file.size)
          }

          // Aplicar escala
          width *= scale
          height *= scale

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Convertir a base64 con calidad reducida
          const quality = 0.7 // 70% de calidad
          const dataUrl = canvas.toDataURL("image/jpeg", quality)
          resolve(dataUrl)
        }
        img.onerror = (error) => {
          reject(error)
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsLoading(true)
        // Comprimir la imagen antes de mostrarla y guardarla
        const compressedDataUrl = await compressImage(file, 500) // Máximo 500KB
        setScreenshotPreview(compressedDataUrl)
        setScreenshotFile(file) // Mantener el archivo original para referencia
        setCompressedScreenshot(compressedDataUrl) // Nueva variable de estado para la imagen comprimida
        setIsLoading(false)
      } catch (error) {
        console.error("Error al comprimir la imagen:", error)
        // Fallback al método original si falla la compresión
        setScreenshotFile(file)
        setScreenshotPreview(URL.createObjectURL(file))
        setIsLoading(false)
      }
    } else {
      setScreenshotFile(null)
      setScreenshotPreview(null)
      setCompressedScreenshot(null)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (transactionReference.trim() === "") {
      alert("Por favor, ingresa el número de referencia de tu pago.")
      return
    }
    if (!screenshotFile && !compressedScreenshot) {
      alert("Por favor, sube una captura de pantalla de la transferencia.")
      return
    }

    setIsLoading(true)

    try {
      // Usar la imagen comprimida si está disponible
      const screenshotBase64 =
        compressedScreenshot ||
        (await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(screenshotFile as File)
        }))

      const response = await fetch("/api/process-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationDetails,
          transactionReference,
          screenshotFileBase64: screenshotBase64,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onPaymentSuccess(data.solicitudId)
      } else {
        alert(`Error al procesar el pago: ${data.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error al enviar el pago:", error)
      alert("Ocurrió un error al procesar tu pago. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <span>Realizar Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sección de Totales a Pagar */}
          <Card className="p-4 bg-lime-50 rounded-lg border border-lime-100">
            <h3 className="font-bold text-lg text-emerald-800 flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Monto a Pagar</span>
            </h3>
            <div className="space-y-2 text-sm text-emerald-700">
              <div className="flex justify-between font-bold text-base text-emerald-900">
                <span>Total en Dólares:</span>
                <span>${totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-emerald-900">
                <span>Total Final en Bolívares:</span>
                <span>Bs. {finalTotalVEF.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-bold text-emerald-800 text-lg">Datos para Transferencia Bancaria</h3>
            <div className="space-y-2 text-sm text-emerald-700">
              <p>
                <Landmark className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-semibold">Banco:</span> {bankDetails.bankName}
              </p>
              <p>
                <CreditCard className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-semibold">N° de Cuenta:</span> {bankDetails.accountNumber}
              </p>
              <p>
                <User className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-semibold">Titular:</span> {bankDetails.accountHolderName}
              </p>
              <p>
                <span className="font-semibold ml-6">C.I./RIF:</span> {bankDetails.idNumber}
              </p>
            </div>

            <h3 className="font-bold text-emerald-800 text-lg mt-6">Datos para Pago Móvil</h3>
            <div className="space-y-2 text-sm text-emerald-700">
              <p>
                <Phone className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-semibold">Teléfono:</span> {bankDetails.pagoMovilPhone}
              </p>
              <p>
                <Landmark className="inline-block w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-semibold">Banco:</span> {bankDetails.pagoMovilBank}
              </p>
              <p>
                <span className="font-semibold ml-6">C.I./RIF:</span> {bankDetails.pagoMovilId}
              </p>
            </div>
            <p className="text-xs text-emerald-600 mt-4">
              Por favor, realiza la transferencia o pago móvil a los datos indicados y luego ingresa el número de
              referencia.
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionReference" className="text-emerald-800">
                Número de Referencia de tu Pago
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot" className="text-emerald-800">
                Comprobante de Transferencia (Screenshot)
              </Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border-emerald-300 focus-visible:ring-emerald-500 file:text-emerald-600 file:bg-emerald-50 file:border-emerald-200 file:rounded-md file:px-3 file:py-1 file:mr-2"
                required
              />
              {screenshotPreview && (
                <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border border-emerald-200">
                  <Image
                    src={screenshotPreview || "/placeholder.svg"}
                    alt="Previsualización del comprobante"
                    layout="fill"
                    objectFit="contain"
                    className="p-2"
                  />
                </div>
              )}
              {!screenshotPreview && (
                <div className="mt-2 w-full h-48 rounded-md border border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                  <Upload className="w-8 h-8 mr-2" />
                  <span>Sube tu comprobante aquí</span>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                disabled={isLoading}
              >
                Atrás
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4 mr-2" />
                    Enviar para Revisión
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
