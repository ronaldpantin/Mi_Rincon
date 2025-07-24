import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO API send-reservation-emails ===")

    const body = await request.json()
    console.log("Datos recibidos:", body)

    const { reservationDetails, transactionReference, solicitudId } = body

    // Validaciones básicas
    if (!reservationDetails || !transactionReference || !solicitudId) {
      console.error("❌ Faltan datos requeridos")
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
        },
        { status: 400 },
      )
    }

    // Configuración de EmailJS - TUS CREDENCIALES REALES
    const EMAILJS_SERVICE_ID = "service_outlook123"
    const EMAILJS_USER_ID = "klCawWC2iKTZK88h2"
    const TEMPLATE_CLIENTE = "template_pnmwtyf"
    const TEMPLATE_ADMIN = "template_uof3r4b"

    // Preparar datos para el email del cliente
    const clientEmailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: TEMPLATE_CLIENTE,
      user_id: EMAILJS_USER_ID,
      template_params: {
        to_email: reservationDetails.bookerEmail,
        to_name: `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`,
        solicitud_id: solicitudId,
        fecha_visita: reservationDetails.visitDate,
        cedula: reservationDetails.bookerIdNumber,
        cliente_email: reservationDetails.bookerEmail,
        telefono: reservationDetails.bookerPhone,
        total_personas: reservationDetails.totalPeople,
        adultos: reservationDetails.adults,
        ninos: reservationDetails.children,
        exonerados: reservationDetails.exonerated,
        areas_seleccionadas:
          reservationDetails.selectedAreasDetails?.map((area: any) => area.name).join(", ") || "Solo entrada general",
        total_usd: reservationDetails.totalUSD.toFixed(2),
        total_vef: reservationDetails.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 }),
        referencia_pago: transactionReference,
        tasa_bcv: reservationDetails.bcvRate.toFixed(4),
        timestamp: new Date().toLocaleString("es-VE"),
      },
    }

    // Preparar datos para el email del administrador
    const adminEmailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: TEMPLATE_ADMIN,
      user_id: EMAILJS_USER_ID,
      template_params: {
        solicitud_id: solicitudId,
        cliente_nombre: `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`,
        cedula: reservationDetails.bookerIdNumber,
        cliente_email: reservationDetails.bookerEmail,
        telefono: reservationDetails.bookerPhone,
        fecha_visita: reservationDetails.visitDate,
        total_personas: reservationDetails.totalPeople,
        adultos: reservationDetails.adults,
        ninos: reservationDetails.children,
        exonerados: reservationDetails.exonerated,
        areas_seleccionadas:
          reservationDetails.selectedAreasDetails?.map((area: any) => area.name).join(", ") || "Solo entrada general",
        total_usd: reservationDetails.totalUSD.toFixed(2),
        total_vef: reservationDetails.finalTotalVEF.toLocaleString("es-VE", { minimumFractionDigits: 2 }),
        tasa_bcv: reservationDetails.bcvRate.toFixed(4),
        referencia_pago: transactionReference,
        notas_pago: reservationDetails.paymentNotes || "Sin notas adicionales",
        timestamp: new Date().toLocaleString("es-VE"),
      },
    }

    console.log("Enviando email al cliente...")

    // Enviar email al cliente
    const clientResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientEmailData),
    })

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text()
      console.error("❌ Error enviando email al cliente:", errorText)
      throw new Error(`Error enviando email al cliente: ${clientResponse.status}`)
    }

    console.log("✅ Email enviado al cliente exitosamente")
    console.log("Enviando email al administrador...")

    // Enviar email al administrador
    const adminResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminEmailData),
    })

    if (!adminResponse.ok) {
      const errorText = await adminResponse.text()
      console.error("❌ Error enviando email al administrador:", errorText)
      console.log("⚠️ Continuando a pesar del error en email del admin")
    } else {
      console.log("✅ Email enviado al administrador exitosamente")
    }

    // Opcional: También guardar en Google Sheets
    try {
      console.log("Guardando en Google Sheets...")

      const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwymlMnSEK-sYz7B6p7kRkdVLkQz-UMBi8uXUiifj04FGIxVKuZ756mauu16eIWZQeu9w/exec"

      const sheetsData = {
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
          bcvRate: reservationDetails.bcvRate,
          selectedAreas: reservationDetails.selectedAreas || [],
          selectedAreasDetails: reservationDetails.selectedAreasDetails || [],
        },
        transactionReference,
        solicitudId,
      }

      const sheetsResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sheetsData),
      })

      if (sheetsResponse.ok) {
        console.log("✅ Datos guardados en Google Sheets")
      } else {
        console.log("⚠️ Error guardando en Google Sheets, pero emails enviados correctamente")
      }
    } catch (sheetsError) {
      console.error("⚠️ Error con Google Sheets:", sheetsError)
      // No fallar por esto, los emails son lo más importante
    }

    return NextResponse.json({
      success: true,
      message: "Emails enviados correctamente",
      solicitudId: solicitudId,
    })
  } catch (error) {
    console.error("❌ Error en API send-reservation-emails:", error)
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
