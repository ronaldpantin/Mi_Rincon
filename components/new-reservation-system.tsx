"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Users,
  MapPin,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  User,
  BadgeIcon as IdCard,
} from "lucide-react"

interface RentalArea {
  id: string
  name: string
  price: number
  description: string
  capacity: number
}

interface BCVRate {
  rate: number
  lastUpdated: string
}

const RENTAL_AREAS: RentalArea[] = [
  {
    id: "caney-principal",
    name: "Caney Principal",
    price: 50,
    description: "Área techada principal con capacidad para 80 personas",
    capacity: 80,
  },
  {
    id: "caney-secundario",
    name: "Caney Secundario",
    price: 30,
    description: "Área techada secundaria con capacidad para 40 personas",
    capacity: 40,
  },
  {
    id: "zona-parrillas",
    name: "Zona de Parrillas",
    price: 25,
    description: "Área con parrillas y mesas para asados",
    capacity: 30,
  },
  {
    id: "area-piscina",
    name: "Área de Piscina",
    price: 40,
    description: "Acceso exclusivo al área de piscina",
    capacity: 50,
  },
]

export default function NewReservationSystem() {
  // Estados del formulario
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bcvRate, setBcvRate] = useState<BCVRate | null>(null)
  const [loadingBCV, setLoadingBCV] = useState(true)

  // Datos de la reserva
  const [formData, setFormData] = useState({
    // Información del cliente
    bookerFirstName: "",
    bookerLastName: "",
    bookerIdNumber: "",
    bookerEmail: "",
    bookerPhone: "",

    // Detalles de la visita
    visitDate: "",
    adults: 1,
    children: 0,
    exonerated: 0,

    // Áreas seleccionadas
    selectedAreas: [] as string[],

    // Información de pago
    transactionReference: "",
    paymentNotes: "",
  })

  // Estados calculados
  const [totals, setTotals] = useState({
    totalPeople: 0,
    payingPeople: 0,
    entriesSubtotalUSD: 0,
    areasSubtotalUSD: 0,
    totalUSD: 0,
    finalTotalVEF: 0,
  })

  const [confirmationData, setConfirmationData] = useState<any>(null)

  // Cargar tasa BCV al montar el componente
  useEffect(() => {
    fetchBCVRate()
  }, [])

  // Recalcular totales cuando cambien los datos
  useEffect(() => {
    calculateTotals()
  }, [formData.adults, formData.children, formData.exonerated, formData.selectedAreas, bcvRate])

  const fetchBCVRate = async () => {
    try {
      setLoadingBCV(true)
      const response = await fetch("https://pydolarve.org/api/v1/dollar?page=bcv")
      const data = await response.json()

      if (data && data.monitors && data.monitors.usd && data.monitors.usd.price) {
        setBcvRate({
          rate: Number.parseFloat(data.monitors.usd.price),
          lastUpdated: new Date().toLocaleString("es-VE"),
        })
      } else {
        // Fallback si la API no responde
        setBcvRate({
          rate: 36.5,
          lastUpdated: "Tasa de referencia",
        })
      }
    } catch (error) {
      console.error("Error fetching BCV rate:", error)
      setBcvRate({
        rate: 36.5,
        lastUpdated: "Tasa de referencia",
      })
    } finally {
      setLoadingBCV(false)
    }
  }

  const calculateTotals = () => {
    const totalPeople = formData.adults + formData.children + formData.exonerated
    const payingPeople = formData.adults + formData.children

    // Precio por entrada: $5 USD
    const entriesSubtotalUSD = payingPeople * 5

    // Calcular total de áreas seleccionadas
    const areasSubtotalUSD = formData.selectedAreas.reduce((sum, areaId) => {
      const area = RENTAL_AREAS.find((a) => a.id === areaId)
      return sum + (area ? area.price : 0)
    }, 0)

    const totalUSD = entriesSubtotalUSD + areasSubtotalUSD
    const finalTotalVEF = bcvRate ? totalUSD * bcvRate.rate : 0

    setTotals({
      totalPeople,
      payingPeople,
      entriesSubtotalUSD,
      areasSubtotalUSD,
      totalUSD,
      finalTotalVEF,
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
    return (
      formData.bookerFirstName &&
      formData.bookerLastName &&
      formData.bookerIdNumber &&
      formData.bookerEmail &&
      formData.bookerPhone &&
      formData.visitDate &&
      totals.totalPeople > 0
    )
  }

  const validateStep2 = () => {
    return formData.transactionReference.trim().length > 0
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setLoading(true)

    try {
      const solicitudId = `SOL-${Date.now()}`

      const selectedAreasDetails = formData.selectedAreas
        .map((areaId) => {
          const area = RENTAL_AREAS.find((a) => a.id === areaId)
          return area ? { name: area.name, price: area.price } : null
        })
        .filter(Boolean)

      const reservationDetails = {
        ...formData,
        ...totals,
        bcvRate: bcvRate?.rate || 36.5,
        selectedAreasDetails,
      }

      const response = await fetch("/api/new-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationDetails,
          transactionReference: formData.transactionReference,
          solicitudId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConfirmationData({
          solicitudId,
          ...reservationDetails,
        })
        setStep(3)
      } else {
        alert("Error al procesar la reserva: " + result.error)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al enviar la reserva. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      bookerFirstName: "",
      bookerLastName: "",
      bookerIdNumber: "",
      bookerEmail: "",
      bookerPhone: "",
      visitDate: "",
      adults: 1,
      children: 0,
      exonerated: 0,
      selectedAreas: [],
      transactionReference: "",
      paymentNotes: "",
    })
    setConfirmationData(null)
  }

  if (step === 3 && confirmationData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">¡Solicitud Enviada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                <p className="text-sm text-gray-600 mb-2">ID de Solicitud</p>
                <p className="text-2xl font-mono font-bold text-green-700">{confirmationData.solicitudId}</p>
              </div>
              <p className="text-gray-700">
                Hemos recibido tu solicitud de reserva. Te contactaremos pronto por WhatsApp para confirmar la
                disponibilidad y el pago.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">Resumen de tu solicitud:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-medium">
                    {confirmationData.bookerFirstName} {confirmationData.bookerLastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cédula:</span>
                  <span className="font-medium">{confirmationData.bookerIdNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">{confirmationData.visitDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Personas:</span>
                  <span className="font-medium">
                    {confirmationData.totalPeople} ({confirmationData.adults} adultos, {confirmationData.children}{" "}
                    niños, {confirmationData.exonerated} exonerados)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total a pagar:</span>
                  <span className="font-bold text-green-600">
                    ${confirmationData.totalUSD} USD (Bs.{" "}
                    {confirmationData.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {confirmationData.transactionReference}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Estado: PENDIENTE</span>
              </div>
              <p className="text-sm text-yellow-700">
                Verificaremos tu pago y te contactaremos por WhatsApp para confirmar la disponibilidad.
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                <Phone className="w-4 h-4 inline mr-1" />
                WhatsApp: +58 412-232-8332
              </p>
              <p className="text-sm text-gray-600">
                <Mail className="w-4 h-4 inline mr-1" />
                Email: haciendarincongrande@gmail.com
              </p>
            </div>

            <Button onClick={resetForm} className="w-full">
              Hacer otra reserva
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sistema de Reservas</h1>
        <p className="text-center text-gray-600">Hacienda Rincón Grande</p>

        {/* Indicador de pasos */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-green-100" : "bg-gray-100"}`}
              >
                <User className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Información</span>
            </div>
            <div className={`w-8 h-1 ${step >= 2 ? "bg-green-600" : "bg-gray-300"}`}></div>
            <div className={`flex items-center ${step >= 2 ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-green-100" : "bg-gray-100"}`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Pago</span>
            </div>
            <div className={`w-8 h-1 ${step >= 3 ? "bg-green-600" : "bg-gray-300"}`}></div>
            <div className={`flex items-center ${step >= 3 ? "text-green-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-green-100" : "bg-gray-100"}`}
              >
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Confirmación</span>
            </div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.bookerFirstName}
                      onChange={(e) => handleInputChange("bookerFirstName", e.target.value)}
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.bookerLastName}
                      onChange={(e) => handleInputChange("bookerLastName", e.target.value)}
                      placeholder="Ingresa tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="idNumber">Cédula de Identidad *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="idNumber"
                      value={formData.bookerIdNumber}
                      onChange={(e) => handleInputChange("bookerIdNumber", e.target.value)}
                      placeholder="V-12345678 o E-12345678"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.bookerEmail}
                        onChange={(e) => handleInputChange("bookerEmail", e.target.value)}
                        placeholder="tu@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.bookerPhone}
                        onChange={(e) => handleInputChange("bookerPhone", e.target.value)}
                        placeholder="+58 412-123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la visita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Detalles de la Visita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adults">Adultos *</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      value={formData.adults}
                      onChange={(e) => handleInputChange("adults", Number.parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500 mt-1">$5 USD c/u</p>
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
                    <p className="text-xs text-gray-500 mt-1">$5 USD c/u</p>
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
                    <p className="text-xs text-gray-500 mt-1">Gratis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de alquiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Áreas de Alquiler (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RENTAL_AREAS.map((area) => (
                    <div
                      key={area.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.selectedAreas.includes(area.id)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAreaToggle(area.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{area.name}</h3>
                        <Badge variant={formData.selectedAreas.includes(area.id) ? "default" : "secondary"}>
                          ${area.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                      <p className="text-xs text-gray-500">Capacidad: {area.capacity} personas</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen lateral */}
          <div className="space-y-6">
            {/* Widget BCV */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Tasa BCV
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBCV ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando tasa...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      Bs. {bcvRate?.rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-blue-600">por cada $1 USD</p>
                    <p className="text-xs text-gray-500 mt-2">{bcvRate?.lastUpdated}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de costos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total personas:</span>
                  <span className="font-medium">{totals.totalPeople}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Personas que pagan:</span>
                  <span className="font-medium">{totals.payingPeople}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span>Entradas:</span>
                  <span className="font-medium">${totals.entriesSubtotalUSD}</span>
                </div>

                {totals.areasSubtotalUSD > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Áreas:</span>
                    <span className="font-medium">${totals.areasSubtotalUSD}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total USD:</span>
                  <span className="text-green-600">${totals.totalUSD}</span>
                </div>

                {bcvRate && (
                  <div className="flex justify-between font-semibold">
                    <span>Total VEF:</span>
                    <span className="text-green-600">
                      Bs. {totals.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {formData.selectedAreas.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Áreas seleccionadas:</p>
                    <div className="space-y-1">
                      {formData.selectedAreas.map((areaId) => {
                        const area = RENTAL_AREAS.find((a) => a.id === areaId)
                        return area ? (
                          <div key={areaId} className="flex justify-between text-xs">
                            <span>{area.name}</span>
                            <span>${area.price}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={() => setStep(2)} disabled={!validateStep1()} className="w-full">
              Continuar al Pago
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen del pedido */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Resumen de tu reserva:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">
                      {formData.bookerFirstName} {formData.bookerLastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cédula:</span>
                    <span className="font-medium">{formData.bookerIdNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium">{formData.visitDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personas:</span>
                    <span className="font-medium">
                      {totals.totalPeople} ({formData.adults} adultos, {formData.children} niños, {formData.exonerated}{" "}
                      exonerados)
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total a pagar:</span>
                    <div className="text-right">
                      <div className="text-green-600">${totals.totalUSD} USD</div>
                      <div className="text-sm text-gray-600">
                        Bs. {totals.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instrucciones de pago */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Instrucciones de Pago:</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Realiza la transferencia por el monto total</li>
                  <li>Guarda el comprobante de pago</li>
                  <li>Ingresa la referencia de la transacción abajo</li>
                  <li>Enviaremos confirmación por email y WhatsApp</li>
                </ol>
              </div>

              {/* Formulario de pago */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transactionReference">Referencia de Transacción *</Label>
                  <Input
                    id="transactionReference"
                    value={formData.transactionReference}
                    onChange={(e) => handleInputChange("transactionReference", e.target.value)}
                    placeholder="Ingresa la referencia de tu pago"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ejemplo: 123456789, TRF-ABC123, etc.</p>
                </div>

                <div>
                  <Label htmlFor="paymentNotes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="paymentNotes"
                    value={formData.paymentNotes}
                    onChange={(e) => handleInputChange("paymentNotes", e.target.value)}
                    placeholder="Información adicional sobre el pago..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Volver
                </Button>
                <Button onClick={handleSubmit} disabled={!validateStep2() || loading} className="flex-1">
                  {loading ? "Procesando..." : "Enviar Reserva"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
