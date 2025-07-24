"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MessageCircle } from "lucide-react"

interface BcvReservationWidgetProps {
  onRateFetched: (rate: number) => void
}

export default function BcvReservationWidget({ onRateFetched }: BcvReservationWidgetProps) {
  const [rates, setRates] = useState<{
    bcv: { value: number | null; time: string }
  }>({
    bcv: { value: null, time: "" },
  })
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Simulate fetching rates
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const now = new Date()
        const currentTime = now.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
        const today = now.toLocaleDateString("es-VE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        // Tasa actualizada del BCV
        const currentBcvRate = 120.4239

        const simulatedRates = {
          bcv: { value: currentBcvRate, time: currentTime },
        }

        setRates(simulatedRates)
        setLastUpdated(today)
        onRateFetched(currentBcvRate)
      } catch (err) {
        console.error("Error fetching rates:", err)
        setError("No se pudieron cargar las tasas de cambio.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRates()
  }, [onRateFetched])

  return (
    <Card className="rounded-xl border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-emerald-800">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Dólar BCV (Oficial)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-emerald-700">Cargando tasa...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <>
            {rates.bcv.value && (
              <Card className="p-3 text-center border-emerald-100 bg-emerald-50">
                <h4 className="font-semibold text-sm text-emerald-800">Tasa Oficial BCV</h4>
                <p className="text-2xl font-bold text-emerald-900">Bs. {rates.bcv.value.toFixed(4)}</p>
                <p className="text-xs text-gray-500">Última actualización: {rates.bcv.time}</p>
              </Card>
            )}
            <p className="text-xs text-emerald-700 flex items-center justify-center">
              <CalendarDays className="w-3 h-3 mr-1" />
              Fecha: {lastUpdated}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
