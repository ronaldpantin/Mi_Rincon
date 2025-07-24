// ========================================
// GOOGLE APPS SCRIPT - HACIENDA RINCÓN GRANDE
// Sistema de Reservas - Email al Cliente
// ========================================

// CONFIGURACIÓN
const ADMIN_EMAIL = "haciendarincongrande@gmail.com" // Email del administrador (para copia)
const SHEET_NAME = "Sheet1" // Nombre de tu hoja de Google Sheets

// Función principal que recibe datos del frontend
function doPost(e) {
  try {
    console.log("=== INICIO doPost ===")
    console.log("Datos recibidos:", e.postData.contents)

    const data = JSON.parse(e.postData.contents)
    const reservationDetails = data.reservationDetails
    const transactionReference = data.transactionReference

    // Generar ID único
    const solicitudId = "SOL-" + new Date().getTime()
    console.log("ID generado:", solicitudId)

    // Obtener la hoja de cálculo
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    if (!sheet) {
      throw new Error(`No se encontró la hoja: ${SHEET_NAME}`)
    }

    // Preparar datos para insertar
    const rowData = [
      new Date(), // A: FechaHora
      `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`, // B: Nombre
      reservationDetails.bookerEmail, // C: Email
      reservationDetails.bookerPhone, // D: Teléfono
      reservationDetails.date, // E: Fecha Visita
      reservationDetails.adults, // F: Adultos
      reservationDetails.children, // G: Niños
      reservationDetails.totalUSD, // H: Total USD
      reservationDetails.finalTotalVEF, // I: Total VEF
      transactionReference, // J: Referencia Pago
      "PROCESO SIMPLIFICADO", // K: Comprobante
      "PENDIENTE", // L: Estado
      "", // M: Número Reserva
      `ID: ${solicitudId}`, // N: Notas
    ]

    // Insertar fila
    sheet.appendRow(rowData)
    console.log("✅ Fila insertada exitosamente")

    // Enviar email de confirmación al cliente
    enviarEmailConfirmacionCliente(reservationDetails, transactionReference, solicitudId)

    // Respuesta exitosa
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        solicitudId: solicitudId,
        message: "Solicitud registrada exitosamente",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ Error en doPost:", error)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// Función para enviar email de confirmación al cliente
function enviarEmailConfirmacionCliente(reservationDetails, transactionReference, solicitudId) {
  try {
    console.log("Enviando email de confirmación a:", reservationDetails.bookerEmail)

    const subject = `✅ Solicitud de Reserva Recibida - ${solicitudId} | Hacienda Rincón Grande`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🌿 ¡Gracias por tu Solicitud!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0; font-size: 24px;">📋 Tu Solicitud de Reserva</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0; font-size: 32px; font-family: monospace;">${solicitudId}</h3>
              <p style="color: #059669; margin: 5px 0 0 0;">ID de Solicitud</p>
            </div>
            <p style="color: #374151; margin: 0;">
              Hola <strong>${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}</strong>,
              <br><br>
              Hemos recibido tu solicitud de reserva para Hacienda Rincón Grande. 
              Estamos procesando tu información y te contactaremos pronto.
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📅 Detalles de tu Solicitud</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.date}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.adults}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.children}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total USD:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationDetails.totalUSD}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total VEF:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">Bs. ${reservationDetails.finalTotalVEF}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Referencia de Pago:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${transactionReference}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin-top: 0;">⏳ Estado: PENDIENTE</h3>
            <p style="color: #92400e; margin: 0;">
              Tu solicitud está siendo procesada. Verificaremos tu pago y te contactaremos 
              por WhatsApp en las próximas horas para confirmar la disponibilidad y finalizar tu reserva.
            </p>
          </div>

          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📋 Próximos Pasos</h2>
            <div style="space-y: 15px;">
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <div style="width: 30px; height: 30px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</div>
                <div>
                  <h4 style="color: #1e40af; margin: 0 0 5px 0;">Verificación de Pago</h4>
                  <p style="color: #374151; margin: 0; font-size: 14px;">Verificaremos tu pago con la referencia: <strong>${transactionReference}</strong></p>
                </div>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <div style="width: 30px; height: 30px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</div>
                <div>
                  <h4 style="color: #059669; margin: 0 0 5px 0;">Contacto por WhatsApp</h4>
                  <p style="color: #374151; margin: 0; font-size: 14px;">Te contactaremos al <strong>${reservationDetails.bookerPhone}</strong> para confirmar detalles</p>
                </div>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <div style="width: 30px; height: 30px; background: #8b5cf6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</div>
                <div>
                  <h4 style="color: #7c3aed; margin: 0 0 5px 0;">Confirmación Final</h4>
                  <p style="color: #374151; margin: 0; font-size: 14px;">Recibirás un email con tu número de reserva y código QR</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📞 Información de Contacto</h2>
            <div style="space-y: 10px;">
              <p style="margin: 8px 0; color: #374151;"><strong>📱 WhatsApp:</strong> +58 412-232-8332</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📧 Email:</strong> haciendarincongrande@gmail.com</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📍 Ubicación:</strong> Hacienda Paya, Turmero 2115, Aragua, Venezuela</p>
              <p style="margin: 8px 0; color: #374151;"><strong>🕒 Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">💡 Consejos Importantes</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Mantén tu teléfono disponible para recibir nuestra llamada</li>
              <li style="margin-bottom: 8px;">Revisa tu email (incluyendo la carpeta de spam)</li>
              <li style="margin-bottom: 8px;">Guarda tu ID de solicitud: <strong>${solicitudId}</strong></li>
              <li style="margin-bottom: 8px;">Si tienes dudas, contáctanos por WhatsApp</li>
            </ul>
          </div>
          
          <div style="background: #10b981; color: white; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🌿 ¡Te esperamos en Hacienda Rincón Grande!</h3>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">
              Prepárate para disfrutar de un día lleno de naturaleza, aventura y tranquilidad en nuestro hermoso espacio natural.
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Este email fue generado automáticamente por el sistema de reservas de Hacienda Rincón Grande<br>
            Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp: +58 412-232-8332
          </p>
        </div>
      </div>
    `

    // Enviar email al cliente
    GmailApp.sendEmail(reservationDetails.bookerEmail, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("✅ Email de confirmación enviado exitosamente a:", reservationDetails.bookerEmail)

    // Opcional: Enviar copia al administrador
    try {
      const adminSubject = `📋 Nueva Solicitud de Reserva - ${solicitudId}`
      const adminBody = `
        Nueva solicitud de reserva recibida:
        
        ID: ${solicitudId}
        Cliente: ${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}
        Email: ${reservationDetails.bookerEmail}
        Teléfono: ${reservationDetails.bookerPhone}
        Fecha: ${reservationDetails.date}
        Adultos: ${reservationDetails.adults}
        Niños: ${reservationDetails.children}
        Total: $${reservationDetails.totalUSD} USD (Bs. ${reservationDetails.finalTotalVEF})
        Referencia: ${transactionReference}
        
        El cliente ya recibió email de confirmación.
      `

      GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody)
      console.log("✅ Copia enviada al administrador")
    } catch (adminError) {
      console.error("⚠️ Error enviando copia al admin:", adminError)
    }
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error)
  }
}

// Función de prueba
function testEmailCliente() {
  console.log("=== PRUEBA DE EMAIL AL CLIENTE ===")

  const testReservationDetails = {
    bookerFirstName: "María",
    bookerLastName: "González",
    bookerEmail: "maria.gonzalez@example.com", // CAMBIA ESTE EMAIL POR UNO REAL PARA PROBAR
    bookerPhone: "+58 414-987-6543",
    date: "2024-01-20",
    adults: 2,
    children: 1,
    totalUSD: 35,
    finalTotalVEF: 1277.5,
  }

  const testTransactionReference = "987654321"
  const testSolicitudId = "SOL-TEST-" + new Date().getTime()

  enviarEmailConfirmacionCliente(testReservationDetails, testTransactionReference, testSolicitudId)
  console.log("✅ Prueba de email completada")
}

// Función de prueba general
function testFunction() {
  console.log("=== PRUEBA GENERAL DEL SISTEMA ===")

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  sheet.appendRow([
    new Date(),
    "Juan Pérez",
    "juan@example.com",
    "+58 412-123-4567",
    "2024-01-15",
    2,
    1,
    50,
    1825,
    "TEST123456",
    "PRUEBA",
    "PENDIENTE",
    "",
    "Prueba del sistema",
  ])

  console.log("✅ Prueba completada - Revisa tu Google Sheet")
}
