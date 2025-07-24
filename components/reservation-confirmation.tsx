"use client"
import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Printer, Clock, Mail } from "lucide-react"

interface ReservationConfirmationProps {
  reservationNumber: string | null
  qrCodeImage?: string | null
  totalUSD: number
  finalTotalVEF: number
  countdown: number
  onResetReservation: () => void
}

export function ReservationConfirmation({
  reservationNumber,
  qrCodeImage,
  totalUSD,
  finalTotalVEF,
  countdown,
  onResetReservation,
}: ReservationConfirmationProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null)

  const handleDownloadQR = () => {
    if (reservationNumber) {
      // Generar URL del QR si no se proporcionó
      const qrUrl =
        qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=Reserva: ${reservationNumber}`

      const downloadLink = document.createElement("a")
      downloadLink.href = qrUrl
      downloadLink.download = `reserva-${reservationNumber}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handlePrintReservation = () => {
    window.print()
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>¡Reserva Confirmada!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto animate-bounce" />

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-emerald-800">¡Tu reserva ha sido confirmada exitosamente!</h3>
            <p className="text-sm text-emerald-700">
              Tu número de reserva es: <span className="font-bold text-emerald-900">{reservationNumber}</span>
            </p>
            <p className="text-sm text-emerald-700">
              Total pagado: <span className="font-bold text-emerald-900">${totalUSD.toFixed(2)}</span> (Bs.{" "}
              <span className="font-bold text-emerald-900">{finalTotalVEF.toFixed(2)}</span>)
            </p>
          </div>

          <Card className="p-4 bg-lime-50 rounded-lg border border-lime-100">
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-800">¡Revisa tu Email!</h4>
              </div>
              <p className="text-sm text-emerald-700">
                Hemos enviado los detalles de tu reserva y el código QR a tu correo electrónico.
              </p>
              <p className="text-xs text-emerald-600">
                Si no ves el email, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
          </Card>

          <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="font-bold text-emerald-800">Instrucciones Importantes:</h4>
            <div className="text-sm text-emerald-700 space-y-2 text-left">
              <p>• ✅ Presenta el código QR (del email) al llegar al parque</p>
              <p>• ✅ Horario: 8:00 AM - 6:00 PM (Lun-Dom)</p>
              <p>• ✅ Ubicación: Hacienda Paya, Turmero, Aragua</p>
              <p>• ✅ Contacto: +58 0412 232 8332</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleDownloadQR} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Descargar QR de Respaldo
            </Button>
            <Button
              onClick={handlePrintReservation}
              variant="outline"
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Confirmación
            </Button>
          </div>

          <div className="text-sm text-gray-600 mt-6 flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Esta página se actualizará en <span className="font-bold">{countdown}</span> segundos.
            </span>
          </div>

          <Button onClick={onResetReservation} variant="link" className="text-emerald-600 hover:text-emerald-800 mt-2">
            Hacer otra reserva
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
