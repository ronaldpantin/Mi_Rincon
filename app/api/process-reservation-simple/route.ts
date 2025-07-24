import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO API process-reservation-simple ===")

    const body = await request.json()
    console.log("Datos recibidos:", body)

    const { reservationDetails, transactionReference } = body

    // Validaciones básicas
    if (!reservationDetails || !transactionReference) {
      console.error("❌ Faltan datos requeridos")
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Preparar datos para Google Apps Script (con todas las categorías de personas y áreas)
    const dataToSend = {
      reservationDetails: {
        bookerFirstName: reservationDetails.bookerFirstName,
        bookerLastName: reservationDetails.bookerLastName,
        bookerIdNumber: reservationDetails.bookerIdNumber, // Campo de cédula
        bookerEmail: reservationDetails.bookerEmail,
        bookerPhone: reservationDetails.bookerPhone,
        visitDate: reservationDetails.visitDate,
        adults: reservationDetails.adults,
        children: reservationDetails.children,
        exonerated: reservationDetails.exonerated,
        totalPeople: reservationDetails.totalPeople,
        payingPeople: reservationDetails.payingPeople,
        entriesSubtotalUSD: reservationDetails.entriesSubtotalUSD,
        areasSubtotalUSD: reservationDetails.areasSubtotalUSD,
        totalUSD: reservationDetails.totalUSD,
        finalTotalVEF: reservationDetails.finalTotalVEF,
        subtotalVEF: reservationDetails.subtotalVEF,
        ivaAmountVEF: reservationDetails.ivaAmountVEF,
        bcvRate: 120.4239, // Tasa BCV actualizada
        selectedAreas: reservationDetails.selectedAreas || [],
        selectedAreasDetails: reservationDetails.selectedAreasDetails || [],
      },
      transactionReference,
    }

    console.log("Enviando datos:", dataToSend)

    // 🔥 URL ACTUALIZADA DE GOOGLE APPS SCRIPT
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwymlMnSEK-sYz7B6p7kRkdVLkQz-UMBi8uXUiifj04FGIxVKuZ756mauu16eIWZQeu9w/exec"

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })

    console.log("Status de respuesta de Google Apps Script:", response.status)

    if (!response.ok) {
      console.error("❌ Error HTTP:", response.status, response.statusText)
      return NextResponse.json(
        {
          success: false,
          error: `Error del servidor de Google Apps Script: ${response.status}`,
        },
        { status: 500 },
      )
    }

    // Analizar la respuesta según el Content-Type que envía GAS
    const contentType = response.headers.get("content-type") ?? ""
    let result: any

    if (contentType.includes("application/json")) {
      // El script devolvió JSON correctamente
      result = await response.json()
      console.log("Respuesta (JSON) parseada:", result)
    } else {
      // GAS devolvió texto / HTML ⇒ registramos y devolvemos error legible
      const responseText = await response.text()
      console.error("❌ GAS devolvió un texto/HTML inesperado:")
      console.error(responseText.slice(0, 300)) // log solo los primeros 300 caracteres

      return NextResponse.json(
        {
          success: false,
          error: "Respuesta no-JSON desde Google Apps Script",
          rawResponse: responseText,
        },
        { status: 502 },
      )
    }

    if (result.success) {
      console.log("✅ Solicitud procesada exitosamente:", result.solicitudId)
      return NextResponse.json({
        success: true,
        solicitudId: result.solicitudId,
        message: result.message || "Solicitud procesada exitosamente",
      })
    } else {
      console.error("❌ Error reportado por Google Apps Script:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Error desconocido en Google Apps Script",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error en API process-reservation-simple:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
