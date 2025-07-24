"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Briefcase, Mail, MessageCircle, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePicker } from "@/components/ui/calendar" // Renombrado para evitar conflicto
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CorporateEventsFormProps {
  onBackToSelector: () => void
}

export default function CorporateEventsForm({ onBackToSelector }: CorporateEventsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [estimatedAttendees, setEstimatedAttendees] = useState("")
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date())
  const [eventType, setEventType] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsSubmitted(false)

    // Simular envío de datos a un backend
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Solicitud de Evento Corporativo enviada:", {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      estimatedAttendees,
      eventDate: eventDate ? format(eventDate, "PPP") : "No seleccionada",
      eventType,
      specialRequests,
    })

    setIsLoading(false)
    setIsSubmitted(true)
    // Aquí podrías limpiar el formulario o redirigir
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Reserva para Eventos Corporativos / Grandes Grupos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-emerald-700">
            Para empresas, eventos especiales, conferencias o grupos muy grandes. Por favor, completa el siguiente
            formulario y nos pondremos en contacto contigo para diseñar una experiencia a medida.
          </p>

          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <MessageCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-emerald-800">¡Solicitud Recibida!</h3>
              <p className="text-sm text-emerald-700">
                Gracias por tu interés. Nos pondremos en contacto contigo en las próximas 24-48 horas para discutir los
                detalles de tu evento.
              </p>
              <Button onClick={onBackToSelector} className="bg-emerald-600 hover:bg-emerald-700">
                Hacer otra reserva
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-emerald-800">
                  Nombre de la Empresa (Opcional)
                </Label>
                <Input
                  id="companyName"
                  placeholder="Tu Empresa S.A."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-emerald-300 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-emerald-800">
                  Nombre de Contacto
                </Label>
                <Input
                  id="contactName"
                  placeholder="Tu Nombre Completo"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="border-emerald-300 focus-visible:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-emerald-800">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-emerald-800">
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+58 412 1234567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedAttendees" className="text-emerald-800">
                    Número Estimado de Asistentes
                  </Label>
                  <Input
                    id="estimatedAttendees"
                    type="number"
                    placeholder="Ej: 100"
                    value={estimatedAttendees}
                    onChange={(e) => setEstimatedAttendees(e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-emerald-800">
                    Fecha Preferida del Evento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal border-emerald-300 text-emerald-700 hover:bg-emerald-50",
                          !eventDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {eventDate ? format(eventDate, "PPP") : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-emerald-200">
                      <DatePicker
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        initialFocus
                        className="bg-emerald-50 rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-emerald-800">
                  Tipo de Evento (Conferencia, Lanzamiento, etc.)
                </Label>
                <Input
                  id="eventType"
                  placeholder="Ej: Conferencia Anual"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="border-emerald-300 focus-visible:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests" className="text-emerald-800">
                  Requerimientos Especiales / Comentarios
                </Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Ej: Necesitamos proyector, sonido y catering para 100 personas."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="border-emerald-300 focus-visible:ring-emerald-500"
                  rows={4}
                />
              </div>

              <div className="flex justify-between gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBackToSelector}
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
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
