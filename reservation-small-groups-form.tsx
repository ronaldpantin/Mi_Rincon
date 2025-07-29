"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Calendar,
  MapPin,
  DollarSign,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
  Star,
  TreePine,
  Waves,
  Mountain,
} from "lucide-react"
import { PaymentForm } from "./payment-form"
import { PaymentPending } from "./payment-pending"

// Definir las áreas exclusivas disponibles
const EXCLUSIVE_AREAS = [
  {
    id: "gazebo-principal",
    name: "Gazebo Principal",
    price: 25,
    description: "Área techada con vista panorámica, ideal para eventos",
    icon: TreePine,
    capacity: 50,
  },
  {
    id: "zona-parrillas",
    name: "Zona de Parrillas Premium",
    price: 20,
    description: "Parrillas exclusivas con mesas y bancos",
    icon: Mountain,
    capacity: 30,
  },
  {
    id: "area-piscina",
    name: "Área de Piscina Privada",
    price: 35,
    description: "Acceso exclusivo a piscina con área de descanso",
    icon: Waves,
    capacity: 40,
  },
]

interface FormData {
  bookerName: string
  cedula: string
  bookerEmail: string
  bookerPhone: string
  visitDate: string
  entradas: number
  exonerados: number
  selectedAreas: string[]
  specialRequests: string
}

interface ReservationDetails extends FormData {
  totalPeople: number
  subtotalUSD: number
  bcvRate: number
  subtotalVEF: number
  ivaVEF: number
  totalVEF: number
  selectedAreasDetails: Array<{
    id: string
    name: string
    price: number
  }>
}

export default function ReservationSmallGroupsForm() {
  const [currentStep, setCurrentStep] = useState<"form" | "payment" | "success">("form")
  const [isLoading, setIsLoading] = useState(false)
  const [bcvRate, setBcvRate] = useState(122.17) // Tasa BCV por defecto
  const [solicitudId, setSolicitudId] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    bookerName: "",
    cedula: "",
    bookerEmail: "",
    bookerPhone: "",
    visitDate: "",
    entradas: 1,
    exonerados: 0,
    selectedAreas: [],
    specialRequests: "",
  })

  // Obtener tasa BCV al cargar el componente
  useEffect(() => {
    const fetchBcvRate = async () => {
      try {
        // En una aplicación real, esto vendría de una API del BCV
        // Por ahora usamos una tasa fija actualizable
        const mockRate = 122.17 + Math.random() * 2 // Simular variación
        setBcvRate(mockRate)
      } catch (error) {
        console.error("Error fetching BCV rate:", error)
        setBcvRate(122.17) // Fallback
      }
    }

    fetchBcvRate()
  }, [])

  // Calcular totales
  const calculateTotals = (): ReservationDetails => {
    const totalPeople = formData.entradas + formData.exonerados
    const selectedAreasDetails = EXCLUSIVE_AREAS.filter((area) => formData.selectedAreas.includes(area.id))

    // Calcular subtotal en USD
    const entradasCost = formData.entradas * 5 // $5 por entrada
    const areasCost = selectedAreasDetails.reduce((sum, area) => sum + area.price, 0)
    const subtotalUSD = entradasCost + areasCost

    // Convertir a VEF
    const subtotalVEF = subtotalUSD * bcvRate

    // Calcular IVA (16% sobre el monto en VEF)
    const ivaVEF = subtotalVEF * 0.16

    // Total final en VEF
    const totalVEF = subtotalVEF + ivaVEF

    return {
      ...formData,
      totalPeople,
      subtotalUSD,
      bcvRate,
      subtotalVEF,
      ivaVEF,
      totalVEF,
      selectedAreasDetails,
    }
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.bookerName.trim()) {
      newErrors.bookerName = "El nombre es requerido"
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida"
    } else if (!/^[VEJ]-?\d{7,8}$/i.test(formData.cedula.replace(/\s/g, ""))) {
      newErrors.cedula = "Formato de cédula inválido (ej: V-12345678)"
    }

    if (!formData.bookerEmail.trim()) {
      newErrors.bookerEmail = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.bookerEmail)) {
      newErrors.bookerEmail = "Email inválido"
    }

    if (!formData.bookerPhone.trim()) {
      newErrors.bookerPhone = "El teléfono es requerido"
    } else if (!/^(\+58|0)?(4\d{2}|2\d{2})-?\d{7}$/.test(formData.bookerPhone.replace(/\s/g, ""))) {
      newErrors.bookerPhone = "Formato de teléfono inválido (ej: 0412-1234567)"
    }

    if (!formData.visitDate) {
      newErrors.visitDate = "La fecha de visita es requerida"
    } else {
      const selectedDate = new Date(formData.visitDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.visitDate = "La fecha debe ser futura"
      }
    }

    if (formData.entradas < 1) {
      newErrors.entradas = "Debe haber al menos 1 entrada"
    }

    if (formData.entradas > 50) {
      newErrors.entradas = "Máximo 50 entradas para grupos pequeños"
    }

    if (formData.exonerados < 0) {
      newErrors.exonerados = "Los exonerados no pueden ser negativos"
    }

    if (formData.entradas + formData.exonerados > 60) {
      newErrors.totalPeople = "El total de personas no puede exceder 60"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Manejar selección de áreas exclusivas
  const handleAreaToggle = (areaId: string) => {
    const newSelectedAreas = formData.selectedAreas.includes(areaId)
      ? formData.selectedAreas.filter((id) => id !== areaId)
      : [...formData.selectedAreas, areaId]

    handleInputChange("selectedAreas", newSelectedAreas)
  }

  // Proceder al pago
  const handleProceedToPayment = () => {
    if (validateForm()) {
      setCurrentStep("payment")
    }
  }

  // Manejar éxito del pago
  const handlePaymentSuccess = (id: string) => {
    setSolicitudId(id)
    setCurrentStep("success")
  }

  // Volver al formulario desde el pago
  const handleBackToForm = () => {
    setCurrentStep("form")
  }

  const reservationDetails = calculateTotals()

  // Renderizar paso actual
  if (currentStep === "payment") {
    return (
      <PaymentForm
        onPaymentSuccess={handlePaymentSuccess}
        onBack={handleBackToForm}
        totalVEF={reservationDetails.totalVEF}
        reservationDetails={reservationDetails}
      />
    )
  }

  if (currentStep === "success") {
    return <PaymentPending solicitudId={solicitudId} />
  }

  // Formulario principal
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-t-xl">
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Reserva para Grupos Pequeños</span>
          </CardTitle>
          <p className="text-emerald-600 text-sm">
            Ideal para familias y grupos de hasta 60 personas • Entrada: $5.00 por persona
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Información del Responsable */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Información del Responsable</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookerName" className="text-emerald-800 font-medium">
                  Nombre Completo *
                </Label>
                <Input
                  id="bookerName"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.bookerName}
                  onChange={(e) => handleInputChange("bookerName", e.target.value)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.bookerName ? "border-red-500" : ""
                  }`}
                />
                {errors.bookerName && <p className="text-red-500 text-xs">{errors.bookerName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula" className="text-emerald-800 font-medium">
                  Cédula de Identidad *
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder="Ej: V-12345678"
                  value={formData.cedula}
                  onChange={(e) => handleInputChange("cedula", e.target.value)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.cedula ? "border-red-500" : ""
                  }`}
                />
                {errors.cedula && <p className="text-red-500 text-xs">{errors.cedula}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookerEmail" className="text-emerald-800 font-medium">
                  Email *
                </Label>
                <Input
                  id="bookerEmail"
                  type="email"
                  placeholder="Ej: juan@email.com"
                  value={formData.bookerEmail}
                  onChange={(e) => handleInputChange("bookerEmail", e.target.value)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.bookerEmail ? "border-red-500" : ""
                  }`}
                />
                {errors.bookerEmail && <p className="text-red-500 text-xs">{errors.bookerEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookerPhone" className="text-emerald-800 font-medium">
                  Teléfono *
                </Label>
                <Input
                  id="bookerPhone"
                  type="tel"
                  placeholder="Ej: 0412-1234567"
                  value={formData.bookerPhone}
                  onChange={(e) => handleInputChange("bookerPhone", e.target.value)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.bookerPhone ? "border-red-500" : ""
                  }`}
                />
                {errors.bookerPhone && <p className="text-red-500 text-xs">{errors.bookerPhone}</p>}
              </div>
            </div>
          </div>

          <Separator className="bg-emerald-200" />

          {/* Detalles de la Visita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Detalles de la Visita</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate" className="text-emerald-800 font-medium">
                  Fecha de Visita *
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange("visitDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.visitDate ? "border-red-500" : ""
                  }`}
                />
                {errors.visitDate && <p className="text-red-500 text-xs">{errors.visitDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entradas" className="text-emerald-800 font-medium">
                  Entradas ($5.00 c/u) *
                </Label>
                <Input
                  id="entradas"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.entradas}
                  onChange={(e) => handleInputChange("entradas", Number.parseInt(e.target.value) || 1)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.entradas ? "border-red-500" : ""
                  }`}
                />
                {errors.entradas && <p className="text-red-500 text-xs">{errors.entradas}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exonerados" className="text-emerald-800 font-medium">
                  Exonerados (Gratis)
                </Label>
                <Input
                  id="exonerados"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.exonerados}
                  onChange={(e) => handleInputChange("exonerados", Number.parseInt(e.target.value) || 0)}
                  className={`border-emerald-300 focus-visible:ring-emerald-500 ${
                    errors.exonerados ? "border-red-500" : ""
                  }`}
                />
                {errors.exonerados && <p className="text-red-500 text-xs">{errors.exonerados}</p>}
                <p className="text-xs text-emerald-600">Niños menores de 3 años, adultos mayores de 65</p>
              </div>
            </div>

            {errors.totalPeople && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{errors.totalPeople}</AlertDescription>
              </Alert>
            )}

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-emerald-800 font-medium">
                Total de Personas: {formData.entradas + formData.exonerados}
              </p>
              <p className="text-emerald-600 text-sm">Máximo permitido para grupos pequeños: 60 personas</p>
            </div>
          </div>

          <Separator className="bg-emerald-200" />

          {/* Áreas Exclusivas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Áreas Exclusivas (Opcional)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXCLUSIVE_AREAS.map((area) => {
                const IconComponent = area.icon
                const isSelected = formData.selectedAreas.includes(area.id)

                return (
                  <Card
                    key={area.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-emerald-200 hover:border-emerald-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleAreaToggle(area.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox checked={isSelected} onChange={() => handleAreaToggle(area.id)} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-semibold text-emerald-800">{area.name}</h4>
                          </div>
                          <p className="text-sm text-emerald-600 mb-2">{area.description}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              ${area.price}.00
                            </Badge>
                            <span className="text-xs text-emerald-600">Cap: {area.capacity} pers.</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator className="bg-emerald-200" />

          {/* Solicitudes Especiales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center space-x-2">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>Solicitudes Especiales</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="text-emerald-800 font-medium">
                Comentarios o solicitudes adicionales
              </Label>
              <Textarea
                id="specialRequests"
                placeholder="Ej: Celebración de cumpleaños, necesidades especiales, etc."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                className="border-emerald-300 focus-visible:ring-emerald-500 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-emerald-600">{formData.specialRequests.length}/500 caracteres</p>
            </div>
          </div>

          <Separator className="bg-emerald-200" />

          {/* Resumen de Costos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Resumen de Costos</span>
            </h3>

            <Card className="p-4 bg-lime-50 rounded-lg border border-lime-100">
              <div className="space-y-3">
                {/* Desglose de items */}
                <div className="space-y-2 text-sm text-emerald-700">
                  <div className="flex justify-between">
                    <span>Entradas ({formData.entradas} × $5.00):</span>
                    <span>${(formData.entradas * 5).toFixed(2)}</span>
                  </div>

                  {reservationDetails.selectedAreasDetails.map((area) => (
                    <div key={area.id} className="flex justify-between">
                      <span>{area.name}:</span>
                      <span>${area.price.toFixed(2)}</span>
                    </div>
                  ))}

                  {formData.exonerados > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Exonerados ({formData.exonerados}):</span>
                      <span>Gratis</span>
                    </div>
                  )}
                </div>

                {/* Totales */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Subtotal USD:</span>
                    <span>${reservationDetails.subtotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Subtotal VEF (BCV {bcvRate.toFixed(8).replace(".", ",")}):</span>
                    <span>Bs. {reservationDetails.subtotalVEF.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>IVA (16% sobre VEF):</span>
                    <span>Bs. {reservationDetails.ivaVEF.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-emerald-900 bg-emerald-100 p-3 rounded">
                    <span>Total Final:</span>
                    <span>Bs. {reservationDetails.totalVEF.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-emerald-600 mt-3 space-y-1">
                  <p>• IVA: Calculado sobre el monto en bolívares (16% - Venezuela)</p>
                  <p>• Tasa BCV oficial del {new Date().toLocaleDateString("es-VE")}</p>
                  <p>• Todos los precios incluyen impuestos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Botón de Proceder */}
          <div className="flex justify-end">
            <Button
              onClick={handleProceedToPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceder al Pago (Bs. {reservationDetails.totalVEF.toFixed(2)})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
