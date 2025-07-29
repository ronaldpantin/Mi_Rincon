import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Email API called with:", body)

    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Configurar nodemailer
    const transporter = nodemailer.createTransporter({
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

    // Verificar configuración SMTP
    try {
      await transporter.verify()
      console.log("SMTP connection verified for email API")
    } catch (smtpError) {
      console.error("SMTP verification failed:", smtpError)
      return NextResponse.json({ error: "Error de configuración de email" }, { status: 500 })
    }

    let emailOptions: any = {}

    switch (type) {
      case "mobile-payment-confirmation":
        emailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@haciendarincongrande.com",
          to: data.customerEmail,
          subject: `🏞️ Confirmación de Pago Móvil - ${data.solicitudId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
              <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">¡Pago Confirmado!</h1>
                <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Hacienda Rincón Grande</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #065f46; margin-bottom: 20px;">¡Tu reserva está confirmada!</h2>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                  <h3 style="color: #065f46; margin: 0 0 15px 0;">Detalles Confirmados:</h3>
                  <p style="margin: 5px 0; color: #374151;"><strong>ID de Reserva:</strong> ${data.solicitudId}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Fecha de Visita:</strong> ${data.visitDate}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Total Pagado:</strong> Bs. ${data.totalAmount}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Estado:</strong> ✅ CONFIRMADO</p>
                </div>
                
                <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #0288d1; margin: 20px 0;">
                  <p style="margin: 0; color: #01579b; font-weight: 500;">
                    📍 <strong>Información Importante:</strong>
                  </p>
                  <ul style="color: #01579b; margin: 10px 0 0 20px;">
                    <li>Presenta este email al llegar al parque</li>
                    <li>Horario: 8:00 AM - 6:00 PM</li>
                    <li>Ubicación: Hacienda Paya, Turmero, Aragua</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0;">¡Te esperamos!</p>
                  <p style="color: #10b981; margin: 5px 0; font-weight: 500;">📞 +58 243 123 4567</p>
                </div>
              </div>
            </div>
          `,
        }
        break

      case "business-notification":
        emailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@haciendarincongrande.com",
          to: process.env.BUSINESS_EMAIL || "reservas@haciendarincongrande.com",
          subject: `📱 Pago Móvil Confirmado - ${data.solicitudId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Pago Móvil Confirmado</h2>
              <p><strong>ID:</strong> ${data.solicitudId}</p>
              <p><strong>Cliente:</strong> ${data.customerName}</p>
              <p><strong>Monto:</strong> Bs. ${data.totalAmount}</p>
              <p><strong>Referencia:</strong> ${data.reference}</p>
              <p><strong>Estado:</strong> CONFIRMADO</p>
            </div>
          `,
        }
        break

      default:
        return NextResponse.json({ error: "Tipo de email no válido" }, { status: 400 })
    }

    await transporter.sendMail(emailOptions)
    console.log("Email sent successfully")

    return NextResponse.json({ success: true, message: "Email enviado correctamente" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      {
        error: "Error al enviar el email",
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
