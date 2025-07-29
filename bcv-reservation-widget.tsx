"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Calendar, Building2 } from "lucide-react"

interface BCVRate {
  rate: number
  lastUpdated: string
  date: string
}

interface BCVReservationWidgetProps {
  onRateFetched?: (rate: number) => void
}

export function BCVReservationWidget({ onRateFetched }: BCVReservationWidgetProps) {
  const [bcvData, setBcvData] = useState<BCVRate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBCVRate = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate current BCV rate (as of today)
      const currentRate: BCVRate = {
        rate: 122.17,
        lastUpdated: "14:30",
        date: new Date().toLocaleDateString("es-VE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }

      setBcvData(currentRate)
      setIsLoading(false)

      // Call the callback with the fetched rate
      if (onRateFetched) {
        onRateFetched(currentRate.rate)
      }
    }

    fetchBCVRate()

    // Update every 30 minutes
    const interval = setInterval(fetchBCVRate, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [onRateFetched])

  const formatBCVRate = (rate: number) => {
    return rate.toFixed(8).replace(".", ",")
  }

  if (isLoading) {
    return (
      <Card className="rounded-xl border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-blue-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-blue-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!bcvData) {
    return (
      <Card className="rounded-xl border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="text-sm">Error al cargar la tasa BCV</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>BCV - Tasa Oficial</span>
          </div>
          <Badge variant="secondary" className="bg-blue-500 text-white border-blue-400">
            <TrendingUp className="w-3 h-3 mr-1" />
            Oficial
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs opacity-90 mb-1">USD/VEF</p>
            <p className="text-2xl font-bold tracking-tight">Bs. {formatBCVRate(bcvData.rate)}</p>
          </div>

          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Actualizado: {bcvData.lastUpdated}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Hoy</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs opacity-75 capitalize">{bcvData.date}</p>
            <p className="text-xs opacity-75 mt-1">Fuente: Banco Central de Venezuela</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BCVReservationWidget
