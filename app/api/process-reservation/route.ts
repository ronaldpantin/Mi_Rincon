import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO API process-reservation ===")

    const body = await request.json()
    console.log("Datos recibidos:", body)

    const { reservationDetails, transactionReference, comprobantePago } = body

    // Validaciones básicas
    if (!reservationDetails || !transactionReference) {
      console.error("❌ Faltan datos requeridos")
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Preparar datos para Google Apps Script
    const dataToSend = {
      reservationDetails: {
        bookerFirstName: reservationDetails.bookerFirstName,
        bookerLastName: reservationDetails.bookerLastName,
        bookerIdNumber: reservationDetails.bookerIdNumber,
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
        bcvRate: 120.4239,
        selectedAreas: reservationDetails.selectedAreas || [],
        selectedAreasDetails: reservationDetails.selectedAreasDetails || [],
      },
      transactionReference,
      comprobantePago,
    }

    console.log("Enviando datos:", dataToSend)

    // URL de Google Apps Script
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

    const contentType = response.headers.get("content-type") ?? ""
    let result: any

    if (contentType.includes("application/json")) {
      result = await response.json()
      console.log("Respuesta (JSON) parseada:", result)
    } else {
      const responseText = await response.text()
      console.error("❌ GAS devolvió un texto/HTML inesperado:")
      console.error(responseText.slice(0, 300))

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
    console.error("❌ Error en API process-reservation:", error)
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
