"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Briefcase, Ticket } from "lucide-react"

interface ReservationSelectorProps {
  onSelectReservationType: (type: "general" | "small_groups" | "corporate_events") => void
  onBack: () => void // Para volver a la sección principal si es necesario
}

export default function ReservationSelector({ onSelectReservationType, onBack }: ReservationSelectorProps) {
  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Selecciona tu Tipo de Reserva</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-emerald-700 text-center">
            Elige la opción que mejor se adapte a tu visita a Hacienda Rincón Grande.
          </p>

          <div className="grid gap-4">
            <Card
              className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100"
              onClick={() => onSelectReservationType("general")}
            >
              <Ticket className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-emerald-800">Entrada General</h3>
              <p className="text-sm text-emerald-600">
                Para visitantes individuales o grupos pequeños que van a diario.
              </p>
              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">Reservar</Button>
            </Card>

            <Card
              className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-lime-50 to-emerald-100"
              onClick={() => onSelectReservationType("small_groups")}
            >
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-emerald-800">Grupos Familiares</h3>
              <p className="text-sm text-emerald-600">
                Más de 40 personas: Cumpleaños, reuniones, bodas pequeñas, grupos escolares.
              </p>
              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">Más Información</Button>
            </Card>

            <Card
              className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-100 to-lime-100"
              onClick={() => onSelectReservationType("corporate_events")}
            >
              <Briefcase className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-lg text-emerald-800">Eventos Corporativos</h3>
              <p className="text-sm text-emerald-600">Para empresas, eventos especiales o grupos muy grandes.</p>
              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">Más Información</Button>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full mt-6 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
          >
            Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
