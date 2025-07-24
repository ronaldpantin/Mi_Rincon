"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ZoomIn, ZoomOut, LocateFixed } from "lucide-react"
import Image from "next/image"

export default function ParkMap() {
  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Mapa del Parque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-64 w-full rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50 flex items-center justify-center">
            <Image
              src="/images/park-map-placeholder.png" // Placeholder for the park map image
              alt="Mapa de Hacienda Rincón Grande"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=256&width=400&text=Mapa+del+Parque"
              }}
            />
            <div className="absolute bottom-2 right-2 flex flex-col space-y-2">
              <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ZoomIn className="w-4 h-4" />
                <span className="sr-only">Acercar</span>
              </Button>
              <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ZoomOut className="w-4 h-4" />
                <span className="sr-only">Alejar</span>
              </Button>
              <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <LocateFixed className="w-4 h-4" />
                <span className="sr-only">Mi ubicación</span>
              </Button>
            </div>
          </div>

          <p className="text-sm text-emerald-700 text-center">
            Explora las diferentes áreas y atracciones de Hacienda Rincón Grande.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span>Entrada Principal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full" />
              <span>Restaurante</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-600 rounded-full" />
              <span>Senderos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Mirador</span>
            </div>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            <MapPin className="w-4 h-4 mr-2" />
            Ver en Google Maps
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { ParkMap }
