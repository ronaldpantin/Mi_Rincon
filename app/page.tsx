"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MapPin,
  Calendar,
  UtensilsCrossed,
  MessageCircle,
  Phone,
  Instagram,
  Facebook,
  Clock,
  Users,
  TreePine,
  Camera,
  Wifi,
  Car,
  Utensils,
  Leaf,
  Mountain,
  Waves,
  Tent,
  ShieldCheck,
  Flame,
  Dumbbell,
  Table,
  Briefcase,
  UserCheck,
  ArrowLeft,
  CreditCard,
  Send,
  Bot,
  User,
  Mail,
  HelpCircle,
  X,
  Home,
  Heart,
  Activity,
} from "lucide-react"
import Image from "next/image"
import { ParkMap } from "../park-map"
import RestaurantMenu from "../restaurant-menu"
import SmallGroupsForm from "../reservation-small-groups-form"
import CorporateEventsForm from "../reservation-corporate-events-form"
import { PaymentForm } from "../payment-form"
import { PaymentPending } from "../payment-pending"
import FaqSection from "../faq-section"
import BcvReservationWidget from "../bcv-reservation-widget"

interface HomeProps {
  setActiveSection: (section: string) => void
}

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface ExclusiveArea {
  id: string
  name: string
  price: number
  description: string
  icon: any
}

const exclusiveAreas: ExclusiveArea[] = [
  {
    id: "salon_colonial_mesa",
    name: "Salón Colonial (Por Mesa)",
    price: 25,
    description: "Alquiler por mesa individual",
    icon: Table,
  },
  {
    id: "caney_piscina_grande",
    name: "Caney Piscina Grande",
    price: 50,
    description: "Área exclusiva junto a la piscina grande",
    icon: Waves,
  },
  {
    id: "bohio_potrero",
    name: "Bohío Potrero",
    price: 30,
    description: "Espacio rústico en área de potrero",
    icon: Home,
  },
  {
    id: "area_piscina_pequena",
    name: "Área Piscina Pequeña",
    price: 20,
    description: "Área exclusiva junto a la piscina pequeña",
    icon: Waves,
  },
]

export default function MiRinconApp() {
  const [activeSection, setActiveSection] = useState("home")
  const [selectedReservationType, setSelectedReservationType] = useState<string | null>(null)
  const [generalEntrySubStep, setGeneralEntrySubStep] = useState<"details" | "payment" | "pending">("details")
  const [currentReservationDetails, setCurrentReservationDetails] = useState<any>(null)
  const [solicitudId, setSolicitudId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cedula: "",
    bookerEmail: "",
    bookerPhone: "",
    visitDate: "",
    entradas: 1,
    exonerados: 0,
    selectedAreas: [] as string[],
    specialRequests: "",
    acceptsTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // AI Assistant state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy tu asistente virtual de Hacienda Rincón Grande. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestras instalaciones, precios, horarios, actividades y más.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Add BCV rate state at the top of the component
  const [bcvRate, setBcvRate] = useState<number>(122.17)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeSection])

  const handleProceedToPayment = (details: any) => {
    console.log("Datos recibidos para pago:", details)
    setCurrentReservationDetails(details)
    setGeneralEntrySubStep("payment")
  }

  const handlePaymentSuccess = async (generatedSolicitudId: string) => {
    setSolicitudId(generatedSolicitudId)
    setGeneralEntrySubStep("pending")
  }

  const handleBackFromPayment = () => {
    setGeneralEntrySubStep("details")
    setCurrentReservationDetails(null)
  }

  const handleResetGeneralEntryReservation = () => {
    setGeneralEntrySubStep("details")
    setCurrentReservationDetails(null)
    setSolicitudId(null)
    setSelectedReservationType(null)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAreaSelection = (areaId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedAreas: checked ? [...prev.selectedAreas, areaId] : prev.selectedAreas.filter((id) => id !== areaId),
    }))
  }

  // Add this function to handle BCV rate updates
  const handleBcvRateUpdate = (rate: number) => {
    setBcvRate(rate)
  }

  // Updated pricing calculation functions - IVA calculated in VEF
  const calculateAreasTotal = () => {
    return formData.selectedAreas.reduce((total, areaId) => {
      const area = exclusiveAreas.find((a) => a.id === areaId)
      return total + (area?.price || 0)
    }, 0)
  }

  const calculateSubtotalUSD = () => {
    const entradasTotal = formData.entradas * 5
    const areasTotal = calculateAreasTotal()
    return entradasTotal + areasTotal
  }

  const calculateSubtotalVEF = () => {
    return calculateSubtotalUSD() * bcvRate
  }

  const calculateIVAVEF = () => {
    return calculateSubtotalVEF() * 0.16
  }

  const calculateTotalVEF = () => {
    return calculateSubtotalVEF() + calculateIVAVEF()
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida"
    }

    if (!formData.bookerEmail.trim()) {
      newErrors.bookerEmail = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.bookerEmail)) {
      newErrors.bookerEmail = "Email inválido"
    }

    if (!formData.bookerPhone.trim()) {
      newErrors.bookerPhone = "El teléfono es requerido"
    }

    if (!formData.visitDate) {
      newErrors.visitDate = "La fecha de visita es requerida"
    }

    if (formData.entradas < 1) {
      newErrors.entradas = "Debe haber al menos 1 entrada"
    }

    if (!formData.acceptsTerms) {
      newErrors.acceptsTerms = "Debe aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const totalPeople = formData.entradas + formData.exonerados
    const entradaPrice = 5
    const subtotalUSD = calculateSubtotalUSD()
    const subtotalVEF = calculateSubtotalVEF()
    const ivaVEF = calculateIVAVEF()
    const totalVEF = calculateTotalVEF()

    const reservationDetails = {
      ...formData,
      bookerName: `${formData.firstName} ${formData.lastName}`,
      totalPeople,
      subtotalUSD,
      subtotalVEF,
      ivaVEF,
      totalVEF,
      bcvRate,
      entradaPrice,
      selectedAreasDetails: formData.selectedAreas.map((areaId) => exclusiveAreas.find((a) => a.id === areaId)),
    }

    handleProceedToPayment(reservationDetails)
  }

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    // Precios - Updated to reflect new price
    if (message.includes("precio") || message.includes("costo") || message.includes("tarifa")) {
      return "Nuestros precios son: $5 USD por entrada (personas a partir de 4 años). Los menores de 4 años y personas con discapacidades entran gratis. También tenemos áreas exclusivas para alquilar: Salón Colonial ($25 por mesa), Caney Piscina Grande ($50), Bohío Potrero ($30), y Área Piscina Pequeña ($20). Aceptamos pagos en bolívares al cambio del día."
    }

    // Horarios
    if (
      message.includes("horario") ||
      message.includes("hora") ||
      message.includes("abierto") ||
      message.includes("cerrado")
    ) {
      return "Estamos abiertos todos los días de 8:00 AM a 6:00 PM. Te recomendamos llegar temprano para disfrutar mejor de todas nuestras actividades."
    }

    // Actividades
    if (message.includes("actividad") || message.includes("hacer") || message.includes("diversión")) {
      return "Tenemos muchas actividades: paseos a caballo, piscinas, granja de contacto, mini golf, senderismo, skatepark, pista de motocross, trail de bicicletas, zoológico Leslie Pantin, área de camping, canchas deportivas y mucho más."
    }

    // Ubicación
    if (
      message.includes("ubicación") ||
      message.includes("dirección") ||
      message.includes("llegar") ||
      message.includes("dónde")
    ) {
      return "Estamos ubicados en Hacienda Paya, Turmero 2115, Aragua, Venezuela. Antes del puente de Paya, cruza a mano derecha si vienes desde Turmero. Busca nuestro letrero."
    }

    // Reservas
    if (message.includes("reserva") || message.includes("reservar") || message.includes("booking")) {
      return "Puedes hacer tu reserva directamente desde nuestra app. Ofrecemos entrada general para grupos hasta 40 personas con pago inmediato, y también manejamos grupos grandes y eventos corporativos."
    }

    // Áreas exclusivas
    if (
      message.includes("área") ||
      message.includes("salon") ||
      message.includes("exclusiv") ||
      message.includes("alquil")
    ) {
      return "Tenemos varias áreas exclusivas para alquilar: Salón Colonial ($25 por mesa), Caney Piscina Grande ($50), Bohío Potrero ($30), y Área Piscina Pequeña ($20). Perfectas para celebraciones y eventos especiales."
    }

    // Comida
    if (
      message.includes("comida") ||
      message.includes("restaurante") ||
      message.includes("menú") ||
      message.includes("comer")
    ) {
      return "Tenemos un restaurante con deliciosa comida criolla y parrilleras disponibles. También puedes traer tu propia comida para disfrutar en nuestras áreas de picnic."
    }

    // Estacionamiento
    if (message.includes("estacionamiento") || message.includes("parquear") || message.includes("carro")) {
      return "Contamos con amplio estacionamiento gratuito para todos nuestros visitantes. No te preocupes por el espacio para tu vehículo."
    }

    // Mascotas
    if (
      message.includes("mascota") ||
      message.includes("perro") ||
      message.includes("gato") ||
      message.includes("animal")
    ) {
      return "Tenemos una granja de contacto donde puedes interactuar con nuestros animales. Para mascotas propias, consulta nuestras políticas llamando al parque."
    }

    // Capacidad
    if (message.includes("capacidad") || message.includes("cuánta gente") || message.includes("personas")) {
      return "Nuestra capacidad máxima es de 1000 visitantes. Para grupos grandes, te recomendamos hacer reserva previa para garantizar disponibilidad."
    }

    // Respuesta por defecto
    return "Gracias por tu pregunta. Para información más específica, puedes contactarnos directamente o explorar las diferentes secciones de nuestra app. ¿Hay algo más en lo que pueda ayudarte?"
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputMessage),
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const today = new Date().toISOString().split("T")[0]

  const renderReservationSelector = () => {
    return (
      <div className="p-4 space-y-6">
        <Card className="rounded-xl border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Tipo de Reserva</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-emerald-700 mb-4">
              Selecciona el tipo de reserva que mejor se adapte a tus necesidades:
            </p>

            <div className="space-y-3">
              <Card
                className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100"
                onClick={() => setSelectedReservationType("general")}
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Entrada General</h3>
                    <p className="text-sm text-emerald-600">
                      Para individuos, familias y grupos pequeños (hasta 40 personas)
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">Pago inmediato • Confirmación instantánea</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-emerald-300 bg-gradient-to-br from-lime-50 to-emerald-100"
                onClick={() => setSelectedReservationType("small_groups")}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Grupos Pequeños</h3>
                    <p className="text-sm text-emerald-600">
                      Para grupos de 41+ personas, cumpleaños, reuniones familiares
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">Solicitud • Respuesta en 24-48h</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-emerald-300 bg-gradient-to-br from-teal-50 to-emerald-100"
                onClick={() => setSelectedReservationType("corporate_events")}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Eventos Corporativos</h3>
                    <p className="text-sm text-emerald-600">
                      Para empresas, conferencias, eventos especiales y grandes grupos
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">Solicitud personalizada • Respuesta en 24-48h</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button
              variant="outline"
              onClick={() => setActiveSection("home")}
              className="w-full mt-4 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGeneralEntryForm = () => {
    return (
      <div className="p-4 space-y-6">
        <Card className="rounded-xl border-emerald-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReservationType(null)}
                className="p-2 hover:bg-emerald-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2 text-emerald-800">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Entrada General</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800">Información Personal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-emerald-700">
                      Nombre *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 ${errors.firstName ? "border-red-500" : ""}`}
                      placeholder="Tu nombre"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-emerald-700">
                      Apellido *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 ${errors.lastName ? "border-red-500" : ""}`}
                      placeholder="Tu apellido"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedula" className="text-emerald-700">
                    Cédula de Identidad *
                  </Label>
                  <Input
                    id="cedula"
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => handleInputChange("cedula", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 ${errors.cedula ? "border-red-500" : ""}`}
                    placeholder="V-12345678 o E-12345678"
                  />
                  {errors.cedula && <p className="text-red-500 text-sm">{errors.cedula}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookerEmail" className="text-emerald-700">
                    Email *
                  </Label>
                  <Input
                    id="bookerEmail"
                    type="email"
                    value={formData.bookerEmail}
                    onChange={(e) => handleInputChange("bookerEmail", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 ${errors.bookerEmail ? "border-red-500" : ""}`}
                    placeholder="tu@email.com"
                  />
                  {errors.bookerEmail && <p className="text-red-500 text-sm">{errors.bookerEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookerPhone" className="text-emerald-700">
                    Teléfono *
                  </Label>
                  <Input
                    id="bookerPhone"
                    type="tel"
                    value={formData.bookerPhone}
                    onChange={(e) => handleInputChange("bookerPhone", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 ${errors.bookerPhone ? "border-red-500" : ""}`}
                    placeholder="+58 412 123 4567"
                  />
                  {errors.bookerPhone && <p className="text-red-500 text-sm">{errors.bookerPhone}</p>}
                </div>
              </div>

              {/* Visit Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800">Detalles de la Visita</h3>

                <div className="space-y-2">
                  <Label htmlFor="visitDate" className="text-emerald-700">
                    Fecha de Visita *
                  </Label>
                  <Input
                    id="visitDate"
                    type="date"
                    min={today}
                    value={formData.visitDate}
                    onChange={(e) => handleInputChange("visitDate", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 ${errors.visitDate ? "border-red-500" : ""}`}
                  />
                  {errors.visitDate && <p className="text-red-500 text-sm">{errors.visitDate}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entradas" className="text-emerald-700">
                      Entradas *
                    </Label>
                    <Select
                      value={formData.entradas.toString()}
                      onValueChange={(value) => handleInputChange("entradas", Number.parseInt(value))}
                    >
                      <SelectTrigger
                        className={`border-emerald-200 focus:border-emerald-500 ${errors.entradas ? "border-red-500" : ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(40)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "Entrada" : "Entradas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.entradas && <p className="text-red-500 text-sm">{errors.entradas}</p>}
                    <p className="text-xs text-emerald-600">Personas a partir de 4 años</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exonerados" className="text-emerald-700">
                      Exonerados
                    </Label>
                    <Select
                      value={formData.exonerados.toString()}
                      onValueChange={(value) => handleInputChange("exonerados", Number.parseInt(value))}
                    >
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(21)].map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i} {i === 1 ? "Exonerado" : "Exonerados"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-emerald-600">Menores de 4 años y personas con discapacidades</p>
                  </div>
                </div>
              </div>

              {/* Exclusive Areas - Dropdown Version */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800">Áreas Exclusivas (Opcional)</h3>
                <p className="text-sm text-emerald-600">
                  Selecciona las áreas exclusivas que deseas alquilar para tu evento:
                </p>

                <div className="space-y-3">
                  <Label className="text-emerald-700">Seleccionar Áreas</Label>
                  <Select
                    onValueChange={(value) => {
                      if (value && !formData.selectedAreas.includes(value)) {
                        handleAreaSelection(value, true)
                      }
                    }}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                      <SelectValue placeholder="Selecciona un área exclusiva..." />
                    </SelectTrigger>
                    <SelectContent>
                      {exclusiveAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id} disabled={formData.selectedAreas.includes(area.id)}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <area.icon className="w-4 h-4 text-emerald-600" />
                              <div>
                                <span className="font-medium">{area.name}</span>
                                <p className="text-xs text-emerald-600">{area.description}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-emerald-700 ml-2">${area.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Areas Display */}
                  {formData.selectedAreas.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-emerald-700">Áreas Seleccionadas:</Label>
                      <div className="space-y-2">
                        {formData.selectedAreas.map((areaId) => {
                          const area = exclusiveAreas.find((a) => a.id === areaId)
                          if (!area) return null
                          return (
                            <Card key={areaId} className="p-3 bg-emerald-50 border-emerald-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <area.icon className="w-4 h-4 text-emerald-600" />
                                  <div>
                                    <span className="text-sm font-medium text-emerald-800">{area.name}</span>
                                    <p className="text-xs text-emerald-600">{area.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-emerald-700">${area.price} USD</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAreaSelection(areaId, false)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Import BCV Widget */}
              <div className="space-y-4">
                <BcvReservationWidget onRateFetched={handleBcvRateUpdate} />
              </div>

              {/* Enhanced Pricing Summary - Updated with VEF IVA calculation */}
              <div className="bg-emerald-50 p-4 rounded-lg space-y-3 border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 text-lg">Resumen de Precios</h4>

                {/* Items breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Entradas ({formData.entradas} × $5)</span>
                    <span>${(formData.entradas * 5).toFixed(2)}</span>
                  </div>
                  {formData.exonerados > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Exonerados ({formData.exonerados})</span>
                      <span>Gratis</span>
                    </div>
                  )}
                  {formData.selectedAreas.length > 0 && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <p className="font-medium text-emerald-800 mb-1">Áreas Exclusivas:</p>
                        {formData.selectedAreas.map((areaId) => {
                          const area = exclusiveAreas.find((a) => a.id === areaId)
                          return (
                            <div key={areaId} className="flex justify-between text-xs ml-2">
                              <span>{area?.name}</span>
                              <span>${area?.price?.toFixed(2)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Totals - Updated to show VEF calculations */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal USD:</span>
                    <span>${calculateSubtotalUSD().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal VEF (BCV {bcvRate.toFixed(8).replace(".", ",")}):</span>
                    <span>Bs. {calculateSubtotalVEF().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16% sobre VEF):</span>
                    <span>Bs. {calculateIVAVEF().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-emerald-900 border-t pt-2">
                    <span>Total Final VEF:</span>
                    <span>Bs. {calculateTotalVEF().toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-emerald-500 mt-3 space-y-1">
                  <p>• Entradas: Personas a partir de 4 años ($5 USD c/u)</p>
                  <p>• Exonerados: Menores de 4 años y personas con discapacidades (Gratis)</p>
                  <p>• Áreas exclusivas: Alquiler por día completo</p>
                  <p>• IVA: Calculado sobre el monto en bolívares (16% - Venezuela)</p>
                  <p>• Tasa BCV actualizada automáticamente</p>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-emerald-700">
                  Solicitudes Especiales (Opcional)
                </Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500"
                  placeholder="¿Hay algo especial que debamos saber sobre tu visita?"
                  rows={3}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptsTerms"
                    checked={formData.acceptsTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptsTerms", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptsTerms" className="text-sm text-emerald-700 leading-relaxed">
                    Acepto los términos y condiciones de la reserva. Entiendo que esta reserva está sujeta a
                    disponibilidad y que recibiré una confirmación por email.
                  </Label>
                </div>
                {errors.acceptsTerms && <p className="text-red-500 text-sm">{errors.acceptsTerms}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Proceder al Pago
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderAIAssistant = () => {
    return (
      <div className="p-4 space-y-4">
        <Card className="rounded-xl border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>Asistente Virtual</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "assistant" && <Bot className="w-4 h-4 mt-0.5 text-emerald-600" />}
                        {message.sender === "user" && <User className="w-4 h-4 mt-0.5 text-white" />}
                        <div>
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === "user" ? "text-emerald-100" : "text-gray-500"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-emerald-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 border-emerald-200 focus:border-emerald-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "¿Cuáles son los precios?",
                  "¿Qué horarios tienen?",
                  "¿Qué actividades hay?",
                  "¿Cómo llego al parque?",
                  "¿Tienen restaurante?",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContactSection = () => {
    return (
      <div className="p-4 space-y-6">
        <Card className="rounded-xl border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>Contacto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">¡Estamos aquí para ayudarte!</h2>
              <p className="text-emerald-600">
                Ponte en contacto con nosotros para cualquier consulta o información adicional.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Teléfono</h3>
                    <p className="text-emerald-700">+58 243 123 4567</p>
                    <p className="text-sm text-emerald-600">Lun-Dom: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-lime-50 border-emerald-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Email</h3>
                    <p className="text-emerald-700">info@haciendarincongrande.com</p>
                    <p className="text-sm text-emerald-600">Respuesta en 24 horas</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-teal-50 border-emerald-200">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-800">Dirección</h3>
                    <p className="text-emerald-700">Hacienda Paya</p>
                    <p className="text-emerald-700">Turmero 2115, Aragua, Venezuela</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-800">Síguenos en Redes Sociales</h3>
              <div className="flex justify-around">
                {[
                  {
                    icon: Facebook,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    label: "Facebook",
                    type: "icon",
                    url: "https://www.facebook.com/HaciendaRinconGrande",
                  },
                  {
                    icon: Instagram,
                    color: "text-pink-600",
                    bg: "bg-pink-50",
                    label: "Instagram",
                    type: "icon",
                    url: "https://www.instagram.com/HaciendaRinconGrande",
                  },
                  {
                    icon: "/images/tiktok-icon.png",
                    color: "text-black",
                    bg: "bg-gray-100",
                    label: "TikTok",
                    type: "image",
                    url: "https://www.tiktok.com/@HaciendaRinconGrande",
                  },
                ].map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                    <button className={`p-4 rounded-full ${social.bg} hover:scale-110 transition-all duration-200`}>
                      {social.type === "icon" ? (
                        <social.icon className={`w-8 h-8 ${social.color}`} />
                      ) : (
                        <Image
                          src={(social.icon as string) || "/placeholder.svg"}
                          alt={social.label}
                          width={32}
                          height={32}
                        />
                      )}
                      <span className="sr-only">{social.label}</span>
                    </button>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-800">Enlaces Útiles</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveSection("faq")}
                  className="w-full justify-start border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Preguntas Frecuentes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveSection("directions")}
                  className="w-full justify-start border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Cómo Llegar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveSection("reservations")}
                  className="w-full justify-start border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Hacer Reserva
                </Button>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-800 mb-2">Horarios de Atención</h4>
              <div className="space-y-1 text-sm text-emerald-700">
                <div className="flex justify-between">
                  <span>Lunes - Domingo</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Días Festivos</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-2">
                * Los horarios pueden variar en fechas especiales. Consulta nuestras redes sociales para
                actualizaciones.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setActiveSection("home")}
              className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection setActiveSection={setActiveSection} />
      case "directions":
        return <DirectionsSection />
      case "reservations":
        if (selectedReservationType === "general") {
          if (generalEntrySubStep === "details") {
            return renderGeneralEntryForm()
          } else if (generalEntrySubStep === "payment") {
            return (
              <PaymentForm
                onPaymentSuccess={handlePaymentSuccess}
                onBack={handleBackFromPayment}
                totalVEF={currentReservationDetails?.totalVEF || 0}
                reservationDetails={currentReservationDetails}
              />
            )
          } else if (generalEntrySubStep === "pending") {
            return (
              <PaymentPending
                solicitudId={solicitudId || ""}
                customerEmail={currentReservationDetails?.bookerEmail || ""}
                customerPhone={currentReservationDetails?.bookerPhone || ""}
                onStartOver={handleResetGeneralEntryReservation}
              />
            )
          }
        } else if (selectedReservationType === "small_groups") {
          return <SmallGroupsForm onBackToSelector={() => setSelectedReservationType(null)} />
        } else if (selectedReservationType === "corporate_events") {
          return <CorporateEventsForm onBackToSelector={() => setSelectedReservationType(null)} />
        } else {
          return renderReservationSelector()
        }
        break
      case "map":
        return <ParkMap />
      case "menu":
        return <RestaurantMenu />
      case "assistant":
        return renderAIAssistant()
      case "contact":
        return renderContactSection()
      case "faq":
        return <FaqSection onBack={() => setActiveSection("contact")} />
      default:
        return <HomeSection setActiveSection={setActiveSection} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-0.5 shadow-lg">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative">
                  <Image
                    src="/images/logo_verde.png"
                    alt="Logo Hacienda Rincón Grande"
                    width={44}
                    height={44}
                    className="object-contain rounded-full"
                    onError={(e) => {
                      const img = e.currentTarget
                      if (img.src.includes("logo_verde.png")) {
                        img.src = "/images/logo.png"
                      } else {
                        img.style.display = "none"
                        const fallback = img.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = "flex"
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full">
                    <div className="relative">
                      <Mountain className="w-5 h-5 text-emerald-600 absolute -top-1 left-1" />
                      <TreePine className="w-6 h-6 text-green-600" />
                      <Leaf className="w-3 h-3 text-green-500 absolute -bottom-1 right-0" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mi Rincón</h1>
                <p className="text-xs text-emerald-600 font-medium">Hacienda Rincón Grande</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 font-semibold border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Abierto
            </Badge>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto pb-20">{renderSection()}</main>
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { id: "home", icon: TreePine, label: "Inicio" },
            { id: "directions", icon: MapPin, label: "Ubicación" },
            { id: "reservations", icon: Calendar, label: "Reservar" },
            { id: "map", icon: MapPin, label: "Mapa" },
            { id: "menu", icon: UtensilsCrossed, label: "Menú" },
            { id: "assistant", icon: MessageCircle, label: "Asistente" },
            { id: "contact", icon: Phone, label: "Contacto" },
            { id: "faq", icon: MessageCircle, label: "FAQ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setSelectedReservationType(null)
                setGeneralEntrySubStep("details")
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? "text-emerald-600 bg-emerald-50 transform scale-110"
                  : "text-gray-500 hover:text-gray-700"
              } hover:scale-105`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function HomeSection({ setActiveSection }: HomeProps) {
  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-emerald-200">
        <div className="relative h-64">
          <Image
            src="/images/hero-hacienda-rincon-grande.jpeg"
            alt="Hacienda Rincón Grande - Vista Panorámica"
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=256&width=400&text=Hacienda+Rincon+Grande"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h2 className="mb-1 tracking-wide font-bold text-3xl">Hacienda Rincón Grande</h2>
              <p className="opacity-90 text-lg">Naturaleza, aventura y tranquilidad</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card
          className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100"
          onClick={() => setActiveSection("reservations")}
        >
          <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-emerald-800">Reservar Ahora</h3>
          <p className="text-xs text-emerald-600">Asegura tu visita</p>
        </Card>
        <Card
          className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-lime-50 to-emerald-100"
          onClick={() => setActiveSection("directions")}
        >
          <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-emerald-800">Cómo Llegar</h3>
          <p className="text-xs text-emerald-600">Direcciones GPS</p>
        </Card>
      </div>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Sobre el Parque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Hacienda Rincón Grande es un oasis natural donde puedes disfrutar de la tranquilidad del campo, actividades
            al aire libre y deliciosa gastronomía local.
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-emerald-50">
              <Clock className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Horarios</p>
                <p className="text-xs text-emerald-600">Lun-Dom: 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2 rounded-lg bg-lime-50">
              <Users className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Capacidad</p>
                <p className="text-xs text-emerald-600">Hasta 1000 visitantes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Comodidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Car, label: "Estacionamiento", color: "text-emerald-600" },
              { icon: Wifi, label: "WiFi Gratis", color: "text-emerald-600" },
              { icon: Utensils, label: "Restaurante", color: "text-emerald-600" },
              { icon: Camera, label: "Áreas Fotográficas", color: "text-emerald-600" },
              { icon: Waves, label: "Área de Piscinas", color: "text-emerald-600" },
              { icon: Heart, label: "Granja de Contacto", color: "text-emerald-600" },
              { icon: Activity, label: "Paseo a Caballos", color: "text-emerald-600" },
              { icon: TreePine, label: "Mini Golf", color: "text-emerald-600" },
              { icon: Mountain, label: "Senderismo", color: "text-emerald-600" },
              { icon: Activity, label: "Skatepark", color: "text-emerald-600" },
              { icon: Activity, label: "Pista de Motocross", color: "text-emerald-600" },
              { icon: Activity, label: "Trail de Bicicletas", color: "text-emerald-600" },
              { icon: TreePine, label: "Zoológico Leslie Pantin", color: "text-emerald-600" },
              { icon: Home, label: "Alojamiento", color: "text-emerald-600" },
              { icon: Tent, label: "Área de Camping", color: "text-emerald-600" },
              { icon: Flame, label: "Parrilleras", color: "text-emerald-600" },
              { icon: ShieldCheck, label: "Seguridad", color: "text-emerald-600" },
              { icon: Home, label: "Baños Públicos", color: "text-emerald-600" },
              { icon: Heart, label: "Enfermería", color: "text-emerald-600" },
              { icon: Dumbbell, label: "Canchas Deportivas", color: "text-emerald-600" },
              { icon: Table, label: "Área de Picnic", color: "text-emerald-600" },
            ].map((amenity, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <amenity.icon className={`w-4 h-4 ${amenity.color}`} />
                <span className="text-sm font-medium text-emerald-800">{amenity.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800 flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Galería</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/horses-grazing.jpeg"
                alt="Dos caballos pastando en un campo verde"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Caballos"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Caballos</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/person-riding-horse.jpeg"
                alt="Persona montando un caballo blanco en un sendero"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Paseo+a+Caballo"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Paseo a Caballo</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/yellow-building-pool.jpeg"
                alt="Edificio amarillo con piscina en primer plano"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Piscina"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Piscina</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/green-fields-mountains.jpeg"
                alt="Amplios campos verdes con montañas al fondo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Paisaje"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Paisaje</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/large-tree-gazebo.jpeg"
                alt="Gran árbol y un gazebo en un campo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Área+Verde"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Área Verde</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/group-tour.jpeg"
                alt="Grupo de personas en un tour o visita educativa"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Tour+Grupal"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Tour Grupal</div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-3 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            onClick={() => window.open("https://www.instagram.com/HaciendaRinconGrande", "_blank")}
          >
            <Camera className="w-4 h-4 mr-2" />
            Ver más fotos
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Síguenos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around">
            {[
              {
                icon: Facebook,
                color: "text-blue-600",
                bg: "bg-blue-50",
                label: "Facebook",
                type: "icon",
                url: "https://www.facebook.com/HaciendaRinconGrande",
              },
              {
                icon: Instagram,
                color: "text-pink-600",
                bg: "bg-pink-50",
                label: "Instagram",
                type: "icon",
                url: "https://www.instagram.com/HaciendaRinconGrande",
              },
              {
                icon: "/images/tiktok-icon.png",
                color: "text-black",
                bg: "bg-gray-100",
                label: "TikTok",
                type: "image",
                url: "https://www.tiktok.com/@HaciendaRinconGrande",
              },
            ].map((social, index) => (
              <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                <button className={`p-3 rounded-full ${social.bg} hover:scale-110 transition-all duration-200`}>
                  {social.type === "icon" ? (
                    <social.icon className={`w-6 h-6 ${social.color}`} />
                  ) : (
                    <Image
                      src={(social.icon as string) || "/placeholder.svg"}
                      alt={social.label}
                      width={24}
                      height={24}
                    />
                  )}
                  <span className="sr-only">{social.label}</span>
                </button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DirectionsSection() {
  const latitude = 10.240245
  const longitude = -67.459364
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=14&output=embed`
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-64 w-full rounded-lg overflow-hidden border border-emerald-300">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Hacienda Rincón Grande"
            ></iframe>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-1 text-emerald-800">Dirección</h3>
              <p className="text-sm text-emerald-700">
                Hacienda Paya
                <br />
                Turmero 2115, Aragua
                <br />
                Venezuela
              </p>
            </div>

            <div className="p-3 bg-lime-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-1 text-emerald-800">Coordenadas GPS</h3>
              <p className="text-sm text-emerald-700 font-mono">
                {latitude}° N, {Math.abs(longitude)}° W
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
              onClick={() => window.open(googleMapsDirectionsUrl, "_blank")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Abrir en Maps
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-emerald-800">Instrucciones de Llegada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p className="text-emerald-700">
                Utiliza el botón "Abrir en Maps" para obtener la ruta más precisa desde tu ubicación.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p className="text-emerald-700">Sigue las indicaciones de tu GPS hasta llegar a Hacienda Paya.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p className="text-emerald-700">
                Antes del puente de Paya cruza a mano derecha si vienes desde Turmero, busca el letrero de Hacienda
                Rincón Grande al llegar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
