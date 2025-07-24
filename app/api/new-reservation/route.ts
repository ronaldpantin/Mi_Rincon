import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationDetails, transactionReference, solicitudId } = body

    // Validar datos requeridos
    if (!reservationDetails || !transactionReference) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Preparar datos para Google Apps Script
    const dataToSend = {
      ...reservationDetails,
      transactionReference,
      solicitudId: solicitudId || `SOL-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    // URL del Google Apps Script (debe ser configurada como variable de entorno)
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL

    if (!scriptUrl) {
      console.error("GOOGLE_APPS_SCRIPT_URL no configurada")
      return NextResponse.json({ success: false, error: "Configuración del servidor incompleta" }, { status: 500 })
    }

    // Enviar datos a Google Apps Script
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "processReservation",
        data: dataToSend,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error del script: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        solicitudId: result.solicitudId,
        message: "Reserva procesada exitosamente",
      })
    } else {
      return NextResponse.json({ success: false, error: result.error || "Error procesando reserva" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en API de reservas:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para manejar solicitudes GET (opcional, para testing)
export async function GET() {
  return NextResponse.json({
    message: "API de reservas funcionando",
    timestamp: new Date().toISOString(),
  })
}
