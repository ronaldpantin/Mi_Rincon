"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Users, DollarSign, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReservationDetails {
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
  finalTotalVEF: number
  subtotalVEF: number
  ivaAmountVEF: number
  bcvRate: number
  selectedAreas: string[]
  selectedAreasDetails: Array<{ name: string; price: number }>
  paymentNotes?: string
}

export default function NewReservationSystem() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [solicitudId, setSolicitudId] = useState("")

  // Datos del formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    email: "",
    phone: "",
    visitDate: "",
    adults: 1,
    children: 0,
    exonerated: 0,
    selectedAreas: [] as string[],
    paymentReference: "",
    paymentNotes: "",
  })

  // Precios y configuración
  const ENTRY_PRICE_USD = 15
  const BCV_RATE = 50.85 // Esto debería venir de una API
  const IVA_RATE = 0.16

  const areas = [
    { id: "pool", name: "Piscina", price: 10 },
    { id: "horses", name: "Caballos", price: 20 },
    { id: "restaurant", name: "Restaurante", price: 15 },
  ]

  // Cálculos
  const totalPeople = formData.adults + formData.children + formData.exonerated
  const payingPeople = formData.adults + formData.children
  const entriesSubtotalUSD = payingPeople * ENTRY_PRICE_USD
  const areasSubtotalUSD = formData.selectedAreas.reduce((sum, areaId) => {
    const area = areas.find((a) => a.id === areaId)
    return sum + (area ? area.price * payingPeople : 0)
  }, 0)
  const totalUSD = entriesSubtotalUSD + areasSubtotalUSD
  const subtotalVEF = totalUSD * BCV_RATE
  const ivaAmountVEF = subtotalVEF * IVA_RATE
  const finalTotalVEF = subtotalVEF + ivaAmountVEF

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleAreaToggle = (areaId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(areaId)
        ? prev.selectedAreas.filter((id) => id !== areaId)
        : [...prev.selectedAreas, areaId],
    }))
  }

  const validateStep1 = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.idNumber ||
      !formData.email ||
      !formData.phone ||
      !formData.visitDate
    ) {
      setError("Por favor completa todos los campos obligatorios")
      return false
    }
    if (totalPeople === 0) {
      setError("Debe haber al menos una persona en la reserva")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.paymentReference.trim()) {
      setError("Por favor ingresa la referencia de pago")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setIsLoading(true)
    setError("")

    try {
      // Generar ID único para la solicitud
      const newSolicitudId = `HRG-${Date.now()}`
      setSolicitudId(newSolicitudId)

      // Preparar datos de la reserva
      const reservationDetails: ReservationDetails = {
        bookerFirstName: formData.firstName,
        bookerLastName: formData.lastName,
        bookerIdNumber: formData.idNumber,
        bookerEmail: formData.email,
        bookerPhone: formData.phone,
        visitDate: formData.visitDate,
        adults: formData.adults,
        children: formData.children,
        exonerated: formData.exonerated,
        totalPeople,
        payingPeople,
        entriesSubtotalUSD,
        areasSubtotalUSD,
        totalUSD,
        finalTotalVEF,
        subtotalVEF,
        ivaAmountVEF,
        bcvRate: BCV_RATE,
        selectedAreas: formData.selectedAreas,
        selectedAreasDetails: formData.selectedAreas.map((areaId) => {
          const area = areas.find((a) => a.id === areaId)!
          return { name: area.name, price: area.price }
        }),
        paymentNotes: formData.paymentNotes,
      }

      // Enviar a la nueva API de EmailJS
      const response = await fetch("/api/send-reservation-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationDetails,
          transactionReference: formData.paymentReference,
          solicitudId: newSolicitudId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("¡Reserva enviada exitosamente! Revisa tu email para la confirmación.")
        setStep(3)
      } else {
        throw new Error(result.error || "Error desconocido")
      }
    } catch (error) {
      console.error("Error enviando reserva:", error)
      setError(error instanceof Error ? error.message : "Error enviando la reserva")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 3) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-700">¡Reserva Enviada!</CardTitle>
          <CardDescription>Tu solicitud de reserva ha sido procesada exitosamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>ID de Solicitud:</strong> {solicitudId}
            </p>
            <p className="text-sm text-green-800 mt-2">
              Hemos enviado un email de confirmación a <strong>{formData.email}</strong>
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos pasos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verificaremos tu pago en las próximas 24 horas</li>
                <li>Te contactaremos por WhatsApp para confirmar disponibilidad</li>
                <li>Una vez autorizada, recibirás tu código QR de entrada</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="text-center pt-4">
            <Button
              onClick={() => {
                setStep(1)
                setFormData({
                  firstName: "",
                  lastName: "",
                  idNumber: "",
                  email: "",
                  phone: "",
                  visitDate: "",
                  adults: 1,
                  children: 0,
                  exonerated: 0,
                  selectedAreas: [],
                  paymentReference: "",
                  paymentNotes: "",
                })
                setSuccess("")
                setSolicitudId("")
              }}
              variant="outline"
            >
              Hacer otra reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step >= 1 ? "text-green-600" : "text-gray-400"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            1
          </div>
          <span>Información</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className={`flex items-center space-x-2 ${step >= 2 ? "text-green-600" : "text-gray-400"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            2
          </div>
          <span>Pago</span>
        </div>
        <div className="w-8 h-px bg-gray-300" />
        <div className={`flex items-center space-x-2 ${step >= 3 ? "text-green-600" : "text-gray-400"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            3
          </div>
          <span>Confirmación</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="idNumber">Cédula *</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  placeholder="V-12345678"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0412-1234567"
                />
              </div>

              <div>
                <Label htmlFor="visitDate">Fecha de Visita *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange("visitDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personas y Áreas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Detalles de la Visita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adults">Adultos</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="0"
                    value={formData.adults}
                    onChange={(e) => handleInputChange("adults", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="children">Niños</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => handleInputChange("children", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="exonerated">Exonerados</Label>
                  <Input
                    id="exonerated"
                    type="number"
                    min="0"
                    value={formData.exonerated}
                    onChange={(e) => handleInputChange("exonerated", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label>Áreas Adicionales (Opcional)</Label>
                <div className="space-y-2 mt-2">
                  {areas.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={area.id}
                        checked={formData.selectedAreas.includes(area.id)}
                        onChange={() => handleAreaToggle(area.id)}
                        className="rounded"
                      />
                      <Label htmlFor={area.id} className="flex-1">
                        {area.name} (+${area.price} por persona)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de costos */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Resumen de Costos:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Entradas ({payingPeople} personas):</span>
                    <span>${entriesSubtotalUSD.toFixed(2)}</span>
                  </div>
                  {areasSubtotalUSD > 0 && (
                    <div className="flex justify-between">
                      <span>Áreas adicionales:</span>
                      <span>${areasSubtotalUSD.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total USD:</span>
                    <span>${totalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Total VEF (con IVA):</span>
                    <span>Bs. {finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Información de Pago
            </CardTitle>
            <CardDescription>Realiza tu pago y proporciona la referencia de la transacción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumen de la reserva */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen de tu Reserva:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Nombre:</strong> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formData.visitDate}
                  </p>
                  <p>
                    <strong>Personas:</strong> {totalPeople} total ({payingPeople} pagan entrada)
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Total USD:</strong> ${totalUSD.toFixed(2)}
                  </p>
                  <p>
                    <strong>Total VEF:</strong> Bs.{" "}
                    {finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </p>
                  <p>
                    <strong>Tasa BCV:</strong> {BCV_RATE.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de pago */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Datos para el Pago:</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Banco:</strong> Banesco
                </p>
                <p>
                  <strong>Cuenta:</strong> 0134-0123-4567-8901-2345
                </p>
                <p>
                  <strong>Titular:</strong> Hacienda Rincón Grande C.A.
                </p>
                <p>
                  <strong>RIF:</strong> J-12345678-9
                </p>
                <p>
                  <strong>Monto a pagar:</strong> Bs.{" "}
                  {finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Formulario de referencia */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentReference">Referencia de Pago *</Label>
                <Input
                  id="paymentReference"
                  value={formData.paymentReference}
                  onChange={(e) => handleInputChange("paymentReference", e.target.value)}
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <Label htmlFor="paymentNotes">Notas Adicionales (Opcional)</Label>
                <Textarea
                  id="paymentNotes"
                  value={formData.paymentNotes}
                  onChange={(e) => handleInputChange("paymentNotes", e.target.value)}
                  placeholder="Cualquier información adicional sobre el pago..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
            Anterior
          </Button>
        )}

        <div className="ml-auto">
          {step === 1 && (
            <Button
              onClick={() => {
                if (validateStep1()) {
                  setStep(2)
                }
              }}
            >
              Continuar
            </Button>
          )}

          {step === 2 && (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Reserva"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
