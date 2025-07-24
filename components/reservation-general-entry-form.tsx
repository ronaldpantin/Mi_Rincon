"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Users, DollarSign, User, Mail, Phone, MapPin } from "lucide-react"
import BcvReservationWidget from "./bcv-reservation-widget"

interface ReservationGeneralEntryFormProps {
  onBackToSelector: () => void
  onProceedToPayment: (details: any) => void
}

export default function ReservationGeneralEntryForm({
  onBackToSelector,
  onProceedToPayment,
}: ReservationGeneralEntryFormProps) {
  const [formData, setFormData] = useState({
    bookerFirstName: "",
    bookerLastName: "",
    bookerCedula: "",
    bookerEmail: "",
    bookerPhone: "",
    visitDate: "",
    adults: 1,
    children: 0,
    exonerated: 0,
    selectedAreas: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bcvRate, setBcvRate] = useState<number>(120.4239) // Tasa actualizada del BCV

  // Precios y cálculos
  const BASE_PRICE_USD = 5
  const USD_TO_VEF_RATE = bcvRate // Usar la tasa del BCV
  const IVA_RATE = 0.16

  // Áreas disponibles para alquilar
  const availableAreas = [
    { id: "caney", name: "Caney Principal", price: 50 },
    { id: "rancho", name: "Rancho Familiar", price: 30 },
    { id: "gazebo", name: "Gazebo del Lago", price: 25 },
    { id: "parrillera", name: "Área de Parrilleras", price: 20 },
    { id: "salon", name: "Salón de Eventos", price: 100 },
    { id: "piscina", name: "Área Privada de Piscina", price: 75 },
  ]

  // Solo adultos y niños pagan (exonerados no pagan)
  const payingPeople = formData.adults + formData.children
  const totalPeople = formData.adults + formData.children + formData.exonerated
  const entriesSubtotalUSD = BASE_PRICE_USD * payingPeople

  // Calcular costo de áreas seleccionadas
  const areasSubtotalUSD = formData.selectedAreas.reduce((total, areaId) => {
    const area = availableAreas.find((a) => a.id === areaId)
    return total + (area?.price || 0)
  }, 0)

  const subtotalUSD = entriesSubtotalUSD + areasSubtotalUSD
  const subtotalVEF = subtotalUSD * USD_TO_VEF_RATE
  const ivaAmountVEF = subtotalVEF * IVA_RATE
  const finalTotalVEF = subtotalVEF + ivaAmountVEF

  // Fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0]

  const handleInputChange = (field: string, value: string | number) => {
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

  const handleAreaToggle = (areaId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(areaId)
        ? prev.selectedAreas.filter((id) => id !== areaId)
        : [...prev.selectedAreas, areaId],
    }))
  }

  const handleBcvRateFetched = (rate: number) => {
    setBcvRate(rate)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bookerFirstName.trim()) {
      newErrors.bookerFirstName = "El nombre es requerido"
    }

    if (!formData.bookerLastName.trim()) {
      newErrors.bookerLastName = "El apellido es requerido"
    }

    if (!formData.bookerCedula.trim()) {
      newErrors.bookerCedula = "La cédula es requerida"
    }

    if (!formData.bookerEmail.trim()) {
      newErrors.bookerEmail = "El email es requerido"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.bookerEmail)) {
        newErrors.bookerEmail = "Por favor ingresa un email válido"
      }
    }

    if (!formData.bookerPhone.trim()) {
      newErrors.bookerPhone = "El teléfono es requerido"
    }

    if (!formData.visitDate) {
      newErrors.visitDate = "La fecha de visita es requerida"
    } else {
      const selectedDate = new Date(formData.visitDate)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)

      if (selectedDate < todayDate) {
        newErrors.visitDate = "La fecha de visita no puede ser en el pasado"
      }
    }

    if (formData.adults < 1) {
      newErrors.adults = "Debe haber al menos 1 adulto"
    }

    if (totalPeople < 1) {
      newErrors.general = "Debe haber al menos 1 persona en total"
    }

    if (totalPeople > 50) {
      newErrors.general = "Máximo 50 personas por reserva"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Preparar datos completos para el pago
    const reservationDetails = {
      ...formData,
      totalPeople,
      payingPeople,
      entriesSubtotalUSD,
      areasSubtotalUSD,
      totalUSD: subtotalUSD,
      bcvRate: bcvRate,
      subtotalVEF: Math.round(subtotalVEF * 100) / 100,
      ivaAmountVEF: Math.round(ivaAmountVEF * 100) / 100,
      finalTotalVEF: Math.round(finalTotalVEF * 100) / 100,
      selectedAreasDetails: formData.selectedAreas.map((areaId) => {
        const area = availableAreas.find((a) => a.id === areaId)
        return { id: areaId, name: area?.name || "", price: area?.price || 0 }
      }),
    }

    console.log("Enviando datos al pago:", reservationDetails)
    onProceedToPayment(reservationDetails)
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSelector}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-emerald-800 text-xl">🎫 Entrada General</CardTitle>
              <p className="text-emerald-600 text-sm">Completa los datos para tu reserva</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información sobre precios */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4 text-emerald-700">
              <p className="text-sm mb-2">
                El precio de la entrada general al parque es de{" "}
                <span className="font-semibold text-emerald-900">$5 USD al cambio oficial del BCV</span>.
              </p>
              <p className="text-sm mb-2">
                <span className="font-semibold">Adultos y Niños desde los 5 años de edad pagan.</span>
              </p>
              <p className="text-sm">
                Solo están exonerados los <span className="font-semibold">niños menores de 4 años de edad</span> y las{" "}
                <span className="font-semibold">personas con discapacidad</span>.
              </p>
            </div>

            {/* Widget BCV */}
            <BcvReservationWidget onRateFetched={handleBcvRateFetched} />

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.bookerFirstName}
                    onChange={(e) => handleInputChange("bookerFirstName", e.target.value)}
                    placeholder="Tu nombre"
                    className={`border-emerald-200 focus:border-emerald-400 ${
                      errors.bookerFirstName ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  {errors.bookerFirstName && <p className="text-red-600 text-sm">{errors.bookerFirstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.bookerLastName}
                    onChange={(e) => handleInputChange("bookerLastName", e.target.value)}
                    placeholder="Tu apellido"
                    className={`border-emerald-200 focus:border-emerald-400 ${
                      errors.bookerLastName ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  {errors.bookerLastName && <p className="text-red-600 text-sm">{errors.bookerLastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cédula de Identidad *
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.bookerCedula}
                  onChange={(e) => handleInputChange("bookerCedula", e.target.value)}
                  placeholder="V-12345678"
                  className={`border-emerald-200 focus:border-emerald-400 ${
                    errors.bookerCedula ? "border-red-300 focus:border-red-400" : ""
                  }`}
                />
                {errors.bookerCedula && <p className="text-red-600 text-sm">{errors.bookerCedula}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.bookerEmail}
                    onChange={(e) => handleInputChange("bookerEmail", e.target.value)}
                    placeholder="tu@email.com"
                    className={`border-emerald-200 focus:border-emerald-400 ${
                      errors.bookerEmail ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  {errors.bookerEmail && <p className="text-red-600 text-sm">{errors.bookerEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.bookerPhone}
                    onChange={(e) => handleInputChange("bookerPhone", e.target.value)}
                    placeholder="+58 412-123-4567"
                    className={`border-emerald-200 focus:border-emerald-400 ${
                      errors.bookerPhone ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  {errors.bookerPhone && <p className="text-red-600 text-sm">{errors.bookerPhone}</p>}
                </div>
              </div>
            </div>

            <Separator className="bg-emerald-200" />

            {/* Detalles de la Reserva */}
            <div className="space-y-4">
              <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detalles de la Reserva
              </h3>

              <div className="space-y-2">
                <Label htmlFor="visitDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Visita *
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange("visitDate", e.target.value)}
                  min={today}
                  className={`border-emerald-200 focus:border-emerald-400 ${
                    errors.visitDate ? "border-red-300 focus:border-red-400" : ""
                  }`}
                />
                {errors.visitDate && <p className="text-red-600 text-sm">{errors.visitDate}</p>}
                <p className="text-sm text-emerald-600">Selecciona el día que planeas visitarnos</p>
              </div>

              {/* Número de personas por categoría */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-emerald-800">
                    Adultos *
                  </Label>
                  <Select
                    value={formData.adults.toString()}
                    onValueChange={(value) => handleInputChange("adults", Number.parseInt(value))}
                  >
                    <SelectTrigger className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50">
                      <Users className="mr-2 h-4 w-4 text-emerald-600" />
                      <SelectValue placeholder="Adultos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-emerald-200">
                      {[...Array(20)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.adults && <p className="text-red-600 text-sm">{errors.adults}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children" className="text-emerald-800">
                    Niños (5-12 años)
                  </Label>
                  <Select
                    value={formData.children.toString()}
                    onValueChange={(value) => handleInputChange("children", Number.parseInt(value))}
                  >
                    <SelectTrigger className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      <Users className="mr-2 h-4 w-4 text-emerald-600" />
                      <SelectValue placeholder="Niños" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-emerald-200">
                      {[...Array(21)].map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exonerated" className="text-emerald-800">
                    Exonerados
                  </Label>
                  <Select
                    value={formData.exonerated.toString()}
                    onValueChange={(value) => handleInputChange("exonerated", Number.parseInt(value))}
                  >
                    <SelectTrigger className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50">
                      <Users className="mr-2 h-4 w-4 text-emerald-600" />
                      <SelectValue placeholder="Exonerados" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-emerald-200">
                      {[...Array(21)].map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-emerald-600">Menores de 4 años / Discapacitados</p>
                </div>
              </div>

              {/* Resumen de personas */}
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-700">Total de personas:</span>
                  <span className="font-semibold text-emerald-800">{totalPeople}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-700">Personas que pagan:</span>
                  <span className="font-semibold text-emerald-800">{payingPeople}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-700">Exonerados (gratis):</span>
                  <span className="font-semibold text-emerald-800">{formData.exonerated}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-emerald-200" />

            {/* Áreas Adicionales para Alquilar */}
            <div className="space-y-4">
              <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Áreas Adicionales (Opcional)
              </h3>
              <p className="text-sm text-emerald-600">
                Selecciona las áreas adicionales que deseas alquilar para tu evento
              </p>

              <div className="grid grid-cols-1 gap-3">
                {availableAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center space-x-3 p-3 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                  >
                    <Checkbox
                      id={area.id}
                      checked={formData.selectedAreas.includes(area.id)}
                      onCheckedChange={() => handleAreaToggle(area.id)}
                      className="border-emerald-300"
                    />
                    <div className="flex-1">
                      <Label htmlFor={area.id} className="text-emerald-800 font-medium cursor-pointer">
                        {area.name}
                      </Label>
                    </div>
                    <div className="text-emerald-700 font-semibold">${area.price} USD</div>
                  </div>
                ))}
              </div>

              {formData.selectedAreas.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Áreas Seleccionadas:</h4>
                  <div className="space-y-1">
                    {formData.selectedAreas.map((areaId) => {
                      const area = availableAreas.find((a) => a.id === areaId)
                      return (
                        <div key={areaId} className="flex justify-between text-sm">
                          <span className="text-blue-700">{area?.name}</span>
                          <span className="text-blue-800 font-medium">${area?.price} USD</span>
                        </div>
                      )
                    })}
                    <Separator className="bg-blue-200 my-2" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-blue-700">Subtotal Áreas:</span>
                      <span className="text-blue-800">${areasSubtotalUSD} USD</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-emerald-200" />

            {/* Resumen de tu Reserva */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5" />
                Resumen de tu Reserva
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">
                    Entradas ({payingPeople} persona{payingPeople > 1 ? "s" : ""} que pagan):
                  </span>
                  <span className="font-bold text-emerald-900 text-xl">${entriesSubtotalUSD.toFixed(2)}</span>
                </div>

                {formData.exonerated > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-600">
                      + {formData.exonerated} exonerado{formData.exonerated > 1 ? "s" : ""} (gratis):
                    </span>
                    <span className="text-emerald-600">$0.00</span>
                  </div>
                )}

                {areasSubtotalUSD > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700">Áreas adicionales:</span>
                    <span className="font-bold text-emerald-900 text-xl">${areasSubtotalUSD.toFixed(2)}</span>
                  </div>
                )}

                <Separator className="bg-emerald-200" />

                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-semibold">Total en Dólares:</span>
                  <span className="font-bold text-emerald-900 text-xl">${subtotalUSD.toFixed(2)}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-600">Tasa BCV:</span>
                    <span className="text-emerald-800">Bs. {bcvRate.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600">Subtotal en Bolívares:</span>
                    <span className="text-emerald-800">Bs. {subtotalVEF.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600">IVA (16%):</span>
                    <span className="text-emerald-800">Bs. {ivaAmountVEF.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="bg-emerald-200" />

                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-semibold">Total Final en Bolívares:</span>
                  <span className="font-bold text-emerald-900 text-xl">Bs. {finalTotalVEF.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Errores generales */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">⚠️ {errors.general}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBackToSelector}
                className="flex-1 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                Volver
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                Continuar al Pago
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
