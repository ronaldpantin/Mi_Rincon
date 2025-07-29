"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, MessageCircle, RotateCcw } from "lucide-react"

interface PaymentPendingProps {
  solicitudId: string
  customerEmail: string
  customerPhone: string
  onStartOver: () => void
}

export function PaymentPending({ solicitudId, customerEmail, customerPhone, onStartOver }: PaymentPendingProps) {
  const whatsappNumber = "584122328332"
  const whatsappMessage = `Hola! Acabo de hacer una reserva con ID: ${solicitudId}. ¿Podrían confirmar el estado de mi pago?`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-emerald-800 text-2xl">¡Solicitud Enviada!</CardTitle>
          <p className="text-emerald-600">Tu solicitud de reserva ha sido procesada exitosamente</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ID de Solicitud */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <h3 className="font-bold text-emerald-800 text-lg mb-2">Tu ID de Solicitud</h3>
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-3 font-mono text-2xl text-emerald-900 font-bold">
              {solicitudId}
            </div>
            <p className="text-sm text-emerald-600 mt-2">Guarda este número para hacer seguimiento</p>
          </div>

          {/* Estado Actual */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <h3 className="font-bold text-yellow-800 text-lg">Estado: PENDIENTE</h3>
            </div>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>• Tu solicitud está siendo procesada</p>
              <p>• Verificaremos tu pago en las próximas horas</p>
              <p>• Te contactaremos por WhatsApp para confirmar</p>
              <p>• Una vez autorizada, recibirás tu código QR por email</p>
            </div>
          </div>

          {/* Información de Confirmación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 text-lg mb-3">📧 Confirmación Enviada</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>
                <strong>Email:</strong> {customerEmail}
              </p>
              <p>
                <strong>Teléfono:</strong> {customerPhone}
              </p>
              <p className="mt-3">
                Hemos enviado un email de confirmación con todos los detalles de tu solicitud. Revisa tu bandeja de
                entrada y spam.
              </p>
            </div>
          </div>

          {/* Próximos Pasos */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-bold text-emerald-800 text-lg mb-3">📋 Próximos Pasos</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p className="text-sm text-emerald-700">
                  <strong>Verificación:</strong> Nuestro equipo verificará tu pago
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p className="text-sm text-emerald-700">
                  <strong>Contacto:</strong> Te contactaremos por WhatsApp
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p className="text-sm text-emerald-700">
                  <strong>Confirmación:</strong> Recibirás tu código QR por email
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white border border-emerald-200 rounded-lg p-4">
            <h3 className="font-bold text-emerald-800 text-lg mb-3">📞 ¿Necesitas Ayuda?</h3>
            <div className="space-y-3">
              <Button
                onClick={() => window.open(whatsappUrl, "_blank")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar por WhatsApp
              </Button>
              <div className="text-center space-y-1 text-sm text-emerald-600">
                <p>📱 WhatsApp: +58 412-232-8332</p>
                <p>📧 Email: haciendarincongrande@gmail.com</p>
                <p>🕒 Horarios: Lun-Dom, 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Botón para Nueva Reserva */}
          <div className="pt-4 border-t border-emerald-200">
            <Button
              onClick={onStartOver}
              variant="outline"
              className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Hacer Nueva Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
