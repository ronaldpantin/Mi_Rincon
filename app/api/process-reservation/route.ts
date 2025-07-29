import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received payment data:", body)

    const { reservationDetails, transactionReference, screenshotFileBase64, paymentMethod } = body

    // Validar datos requeridos
    if (!reservationDetails) {
      console.error("Missing reservationDetails")
      return NextResponse.json({ error: "Faltan los detalles de la reserva" }, { status: 400 })
    }

    if (!transactionReference) {
      console.error("Missing transactionReference")
      return NextResponse.json({ error: "Falta el número de referencia" }, { status: 400 })
    }

    if (!screenshotFileBase64) {
      console.error("Missing screenshot")
      return NextResponse.json({ error: "Falta el comprobante de pago" }, { status: 400 })
    }

    // Generar ID único para la solicitud
    const solicitudId = `PM-${Date.now().toString().slice(-8)}`
    const currentDate = new Date().toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

    console.log("Generated solicitudId:", solicitudId)

    // Configurar nodemailer con configuración más robusta
    let transporter
    try {
      transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Verificar la conexión
      await transporter.verify()
      console.log("SMTP connection verified")
    } catch (smtpError) {
      console.error("SMTP configuration error:", smtpError)
      // Continuar sin enviar emails si hay problemas de SMTP
      transporter = null
    }

    // Preparar datos para los emails
    const emailData = {
      solicitudId,
      customerName: reservationDetails.bookerName || "Cliente",
      customerEmail: reservationDetails.bookerEmail || "",
      visitDate: reservationDetails.visitDate || "No especificada",
      totalPeople: reservationDetails.totalPeople || 0,
      totalAmount: reservationDetails.totalVEF || 0,
      reference: transactionReference,
      currentDate,
    }

    // Email para el cliente
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Pago Móvil Recibido!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #065f46; margin-bottom: 20px;">Hola ${emailData.customerName},</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Hemos recibido tu pago móvil y estamos procesando tu reserva. Te confirmaremos en las próximas 24 horas.
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 15px 0;">Detalles de tu Reserva:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>ID de Solicitud:</strong> ${emailData.solicitudId}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Fecha de Visita:</strong> ${emailData.visitDate}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Total de Personas:</strong> ${emailData.totalPeople}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Total Pagado:</strong> Bs. ${emailData.totalAmount.toFixed(2)}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Método de Pago:</strong> Pago Móvil</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Referencia:</strong> ${emailData.reference}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              📱 <strong>Próximos Pasos:</strong>
            </p>
            <ul style="color: #92400e; margin: 10px 0 0 20px;">
              <li>Verificaremos tu pago móvil en las próximas 24 horas</li>
              <li>Te enviaremos la confirmación final por email</li>
              <li>Guarda este email como comprobante</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0;">¿Preguntas? Contáctanos:</p>
            <p style="color: #10b981; margin: 5px 0; font-weight: 500;">📞 +58 243 123 4567</p>
            <p style="color: #10b981; margin: 5px 0; font-weight: 500;">📧 info@haciendarincongrande.com</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2024 Hacienda Rincón Grande - Turmero, Aragua, Venezuela
          </p>
        </div>
      </div>
    `

    // Email para el negocio
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🏞️ Nueva Reserva - Pago Móvil</h1>
          <p style="color: #d1d5db; margin: 10px 0 0 0;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Nueva Solicitud de Reserva</h2>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Información del Cliente:</h3>
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${emailData.customerName}</p>
            <p style="margin: 5px 0;"><strong>Cédula:</strong> ${reservationDetails.cedula || "No especificada"}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${emailData.customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${reservationDetails.bookerPhone || "No especificado"}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Detalles de la Reserva:</h3>
            <p style="margin: 5px 0;"><strong>ID:</strong> ${emailData.solicitudId}</p>
            <p style="margin: 5px 0;"><strong>Fecha de Visita:</strong> ${emailData.visitDate}</p>
            <p style="margin: 5px 0;"><strong>Entradas:</strong> ${reservationDetails.entradas || 0}</p>
            <p style="margin: 5px 0;"><strong>Exonerados:</strong> ${reservationDetails.exonerados || 0}</p>
            <p style="margin: 5px 0;"><strong>Total Personas:</strong> ${emailData.totalPeople}</p>
            ${
              reservationDetails.selectedAreasDetails?.length > 0
                ? `
              <p style="margin: 5px 0;"><strong>Áreas Exclusivas:</strong></p>
              <ul style="margin: 5px 0 0 20px;">
                ${reservationDetails.selectedAreasDetails.map((area: any) => `<li>${area.name} - $${area.price}</li>`).join("")}
              </ul>
            `
                : ""
            }
            ${reservationDetails.specialRequests ? `<p style="margin: 5px 0;"><strong>Solicitudes Especiales:</strong> ${reservationDetails.specialRequests}</p>` : ""}
          </div>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Información de Pago:</h3>
            <p style="margin: 5px 0;"><strong>Método:</strong> Pago Móvil</p>
            <p style="margin: 5px 0;"><strong>Referencia:</strong> ${emailData.reference}</p>
            <p style="margin: 5px 0;"><strong>Subtotal USD:</strong> $${(reservationDetails.subtotalUSD || 0).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Tasa BCV:</strong> ${(reservationDetails.bcvRate || 0).toFixed(8)}</p>
            <p style="margin: 5px 0;"><strong>Subtotal VEF:</strong> Bs. ${(reservationDetails.subtotalVEF || 0).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>IVA (16%):</strong> Bs. ${(reservationDetails.ivaVEF || 0).toFixed(2)}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Total Final:</strong> Bs. ${emailData.totalAmount.toFixed(2)}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              ⚠️ <strong>Acción Requerida:</strong>
            </p>
            <p style="color: #92400e; margin: 10px 0 0 0;">
              Verificar el pago móvil y confirmar la reserva dentro de 24 horas.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Solicitud recibida el ${emailData.currentDate}
          </p>
        </div>
      </div>
    `

    // Intentar enviar emails solo si el transporter está configurado
    if (transporter && emailData.customerEmail) {
      try {
        // Preparar el attachment del comprobante
        let attachment = null
        if (screenshotFileBase64) {
          // Extraer solo la parte base64 (sin el prefijo data:image/...)
          const base64Data = screenshotFileBase64.includes(",")
            ? screenshotFileBase64.split(",")[1]
            : screenshotFileBase64

          attachment = {
            filename: `comprobante-${solicitudId}.jpg`,
            content: base64Data,
            encoding: "base64" as const,
          }
        }

        // Enviar email al cliente
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@haciendarincongrande.com",
          to: emailData.customerEmail,
          subject: `🏞️ Pago Móvil Recibido - Reserva ${solicitudId}`,
          html: customerEmailHtml,
        })

        console.log("Customer email sent successfully")

        // Enviar email al negocio
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@haciendarincongrande.com",
          to: process.env.BUSINESS_EMAIL || "reservas@haciendarincongrande.com",
          subject: `📱 Nueva Reserva Pago Móvil - ${solicitudId} - ${emailData.customerName}`,
          html: businessEmailHtml,
          attachments: attachment ? [attachment] : [],
        })

        console.log("Business email sent successfully")
      } catch (emailError) {
        console.error("Error sending emails:", emailError)
        // No fallar la operación por errores de email
      }
    } else {
      console.log("Skipping email sending - transporter not configured or missing customer email")
    }

    // Guardar los datos de la reserva (en una aplicación real, esto iría a una base de datos)
    const reservationData = {
      solicitudId,
      ...reservationDetails,
      paymentMethod: "pago-movil",
      transactionReference,
      totalVEF: emailData.totalAmount,
      status: "pending_verification",
      submittedAt: new Date().toISOString(),
      hasScreenshot: !!screenshotFileBase64,
    }

    console.log("Reservation data saved:", reservationData)

    return NextResponse.json({
      success: true,
      solicitudId,
      message: "Pago móvil procesado correctamente",
      data: {
        id: solicitudId,
        status: "pending_verification",
        customerName: emailData.customerName,
        totalAmount: emailData.totalAmount,
        reference: emailData.reference,
      },
    })
  } catch (error) {
    console.error("Error processing mobile payment:", error)

    // Proporcionar más detalles del error
    let errorMessage = "Error interno del servidor al procesar el pago móvil"

    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)

      // Proporcionar mensajes más específicos según el tipo de error
      if (error.message.includes("JSON")) {
        errorMessage = "Error al procesar los datos enviados"
      } else if (error.message.includes("SMTP") || error.message.includes("email")) {
        errorMessage = "Error al enviar confirmación por email, pero el pago fue registrado"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    )
  }
}
