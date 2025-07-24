"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentFormSimpleProps {
  reservationDetails: {
    bookerFirstName: string
    bookerLastName: string
    bookerIdNumber: string
    bookerEmail: string
    bookerPhone: string
    visitDate: string
    adults: number
    children: number
    exonerated: number
    totalPeople: number
    payingPeople: number
    entriesSubtotalUSD: number
    areasSubtotalUSD: number
    totalUSD: number
    subtotalVEF: number
    ivaAmountVEF: number
    finalTotalVEF: number
    selectedAreas: string[]
    selectedAreasDetails: Array<{ name: string; price: number }>
  }
  onBack: () => void
}

export function PaymentFormSimple({ reservationDetails, onBack }: PaymentFormSimpleProps) {
  const [transactionReference, setTransactionReference] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")
  const [solicitudId, setSolicitudId] = useState("")

  const bcvRate = 120.4239

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionReference.trim()) {
      alert("Por favor ingresa la referencia de pago")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      console.log("=== ENVIANDO RESERVA ===")
      console.log("Datos de reserva:", reservationDetails)
      console.log("Referencia de pago:", transactionReference)

      const response = await fetch("/api/process-reservation-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationDetails,
          transactionReference: transactionReference.trim(),
        }),
      })

      console.log("Status de respuesta:", response.status)

      const result = await response.json()
      console.log("Respuesta del servidor:", result)

      if (result.success) {
        setSubmitStatus("success")
        setSubmitMessage(result.message || "¡Solicitud enviada exitosamente!")
        setSolicitudId(result.solicitudId || "N/A")
        setTransactionReference("")
      } else {
        setSubmitStatus("error")
        setSubmitMessage(result.error || "Error procesando la solicitud")
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error)
      setSubmitStatus("error")
      setSubmitMessage("Error de conexión. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">¡Solicitud Enviada!</CardTitle>
          <CardDescription>Tu solicitud de reserva ha sido procesada exitosamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-green-600 mb-2">Número de Solicitud</p>
              <p className="text-2xl font-mono font-bold text-green-800">{solicitudId}</p>
            </div>
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos pasos:</strong>
              <br />• Recibirás un email de confirmación en los próximos minutos
              <br />• Verificaremos tu pago y te contactaremos por WhatsApp
              <br />• Una vez autorizada, recibirás tu código QR de entrada
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📞 Información de Contacto</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>WhatsApp:</strong> +58 412-232-8332
              </p>
              <p>
                <strong>Email:</strong> haciendarincongrande@gmail.com
              </p>
              <p>
                <strong>Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={onBack} variant="outline" className="w-full bg-transparent">
              Hacer Nueva Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Información de Pago
        </CardTitle>
        <CardDescription>Completa los datos de tu transferencia para finalizar la reserva</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de la Reserva */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Resumen de tu Reserva
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Cliente:</strong> {reservationDetails.bookerFirstName} {reservationDetails.bookerLastName}
              </p>
              <p>
                <strong>Cédula:</strong> {reservationDetails.bookerIdNumber}
              </p>
              <p>
                <strong>Fecha:</strong> {reservationDetails.visitDate}
              </p>
            </div>
            <div>
              <p>
                <strong>Adultos:</strong> {reservationDetails.adults}
              </p>
              <p>
                <strong>Niños:</strong> {reservationDetails.children}
              </p>
              <p>
                <strong>Exonerados:</strong> {reservationDetails.exonerated}
              </p>
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Datos para tu Transferencia
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              <strong>Banco:</strong> Banesco
            </p>
            <p>
              <strong>Tipo de Cuenta:</strong> Corriente
            </p>
            <p>
              <strong>Número:</strong> 0134-0123-45-1234567890
            </p>
            <p>
              <strong>Titular:</strong> Hacienda Rincón Grande C.A.
            </p>
            <p>
              <strong>RIF:</strong> J-12345678-9
            </p>
            <p>
              <strong>Email:</strong> haciendarincongrande@gmail.com
            </p>
          </div>
        </div>

        {/* Cálculo de Montos */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3">💰 Monto a Transferir</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal USD:</span>
              <span className="font-mono">${reservationDetails.totalUSD}</span>
            </div>
            <div className="flex justify-between">
              <span>Tasa BCV:</span>
              <span className="font-mono">Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 4 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal Bs.:</span>
              <span className="font-mono">
                Bs. {reservationDetails.subtotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span className="font-mono">
                Bs. {reservationDetails.ivaAmountVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <hr className="border-green-300" />
            <div className="flex justify-between text-lg font-bold text-green-800">
              <span>Total a Pagar:</span>
              <span className="font-mono">
                Bs. {reservationDetails.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {submitStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitMessage}</AlertDescription>
          </Alert>
        )}

        {/* Formulario de Referencia */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transactionReference">Referencia de Pago *</Label>
            <Input
              id="transactionReference"
              type="text"
              placeholder="Ej: 123456789"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              Ingresa el número de referencia que aparece en tu comprobante de transferencia
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Realiza la transferencia por el monto exacto mostrado arriba</li>
              <li>• Guarda el comprobante de tu transferencia</li>
              <li>• Ingresa la referencia exactamente como aparece en tu comprobante</li>
              <li>• Recibirás confirmación por email una vez verificado el pago</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Volver
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !transactionReference.trim()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>Al enviar esta solicitud, aceptas nuestros términos y condiciones.</p>
          <p>Tu reserva será confirmada una vez verificado el pago.</p>
        </div>
      </CardContent>
    </Card>
  )
}
