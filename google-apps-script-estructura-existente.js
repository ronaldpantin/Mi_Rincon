// ========================================
// GOOGLE APPS SCRIPT - HACIENDA RINCÓN GRANDE
// Sistema de Reservas - ADAPTADO A ESTRUCTURA EXISTENTE
// ========================================

// CONFIGURACIÓN
const ADMIN_EMAIL = "My_Real_email@gmail.com" // ⚠️ CAMBIA ESTE EMAIL POR TU EMAIL PERSONAL
const SHEET_NAME = "Sheet1" // Nombre de tu hoja de Google Sheets
const STATUS_COLUMN = 12 // Columna L (Estado) - índice 12 (base 1)
const EMAIL_COLUMN = 3 // Columna C (Email) - índice 3 (base 1)
const RESERVATION_NUMBER_COLUMN = 13 // Columna M (Número Reserva) - índice 13 (base 1)

// Importaciones necesarias
const SpreadsheetApp = SpreadsheetApp
const Utilities = Utilities
const Session = Session
const ContentService = ContentService
const GmailApp = GmailApp

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

    // Formatear fecha de visita
    const visitDate = new Date(reservationDetails.visitDate)
    const formattedVisitDate = Utilities.formatDate(visitDate, Session.getScriptTimeZone(), "dd/MM/yyyy")

    // Preparar datos para insertar según la estructura existente
    const rowData = [
      new Date(), // A: FechaHora
      `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`, // B: Nombre Completo
      reservationDetails.bookerEmail, // C: Email
      reservationDetails.bookerPhone, // D: Teléfono
      formattedVisitDate, // E: Fecha Visita
      reservationDetails.adults || 1, // F: Adultos
      reservationDetails.children || 0, // G: Niños
      reservationDetails.totalUSD, // H: Total USD
      reservationDetails.finalTotalVEF, // I: Total VEF
      transactionReference, // J: Referencia Pago
      "PROCESO SIMPLIFICADO", // K: Comprobante
      "PENDIENTE", // L: Estado
      "", // M: Número Reserva
      `ID: ${solicitudId} - Total: ${reservationDetails.totalPeople || reservationDetails.adults + reservationDetails.children} personas (${reservationDetails.payingPeople || reservationDetails.adults + reservationDetails.children} pagan, ${reservationDetails.exonerated || 0} exonerados)`, // N: Notas
    ]

    // Insertar fila
    sheet.appendRow(rowData)
    console.log("✅ Fila insertada exitosamente")

    // Enviar email de confirmación al cliente
    enviarEmailConfirmacionCliente(reservationDetails, transactionReference, solicitudId, formattedVisitDate)

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

// Función que se ejecuta cuando se edita la hoja (TRIGGER AUTOMÁTICO)
function onEdit(e) {
  try {
    console.log("=== INICIO onEdit ===")

    const sheet = e.source.getActiveSheet()
    const range = e.range
    const row = range.getRow()
    const column = range.getColumn()

    console.log(`Editado: Fila ${row}, Columna ${column}`)
    console.log(`Valor nuevo: ${e.value}`)

    // Verificar si es la hoja correcta
    if (sheet.getName() !== SHEET_NAME) {
      console.log("No es la hoja correcta, saliendo...")
      return
    }

    // Verificar si es la columna de Estado (L = columna 12)
    if (column !== STATUS_COLUMN) {
      console.log("No es la columna de Estado, saliendo...")
      return
    }

    // Verificar si el nuevo valor es "AUTORIZADO"
    if (e.value !== "AUTORIZADO") {
      console.log("El estado no es AUTORIZADO, saliendo...")
      return
    }

    console.log("🎉 ¡Reserva AUTORIZADA! Enviando email de confirmación...")

    // Obtener datos de la fila (14 columnas según tu estructura)
    const rowData = sheet.getRange(row, 1, 1, 14).getValues()[0]

    const reservationData = {
      fechaHora: rowData[0], // A: FechaHora
      nombreCompleto: rowData[1], // B: Nombre Completo
      email: rowData[2], // C: Email
      telefono: rowData[3], // D: Teléfono
      fechaVisita: rowData[4], // E: Fecha Visita
      adultos: rowData[5], // F: Adultos
      ninos: rowData[6], // G: Niños
      totalUSD: rowData[7], // H: Total USD
      totalVEF: rowData[8], // I: Total VEF
      referenciaPago: rowData[9], // J: Referencia Pago
      comprobante: rowData[10], // K: Comprobante
      estado: rowData[11], // L: Estado
      numeroReserva: rowData[12], // M: Número Reserva
      notas: rowData[13], // N: Notas
    }

    console.log("Datos de la reserva:", reservationData)

    // Generar número de reserva si no existe
    let numeroReserva = reservationData.numeroReserva
    if (!numeroReserva || numeroReserva === "") {
      numeroReserva = "RES-" + new Date().getTime()
      sheet.getRange(row, RESERVATION_NUMBER_COLUMN).setValue(numeroReserva)
      console.log("Número de reserva generado:", numeroReserva)
    }

    // Enviar email de confirmación con QR
    enviarEmailConfirmacionConQR(reservationData, numeroReserva, row)
  } catch (error) {
    console.error("❌ Error en onEdit:", error)
  }
}

// Función para enviar email de confirmación al cliente (solicitud inicial)
function enviarEmailConfirmacionCliente(reservationDetails, transactionReference, solicitudId, fechaVisita) {
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
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold; font-size: 18px;">${fechaVisita}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationDetails.adults || 1}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños (5-12 años):</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationDetails.children || 0}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Exonerados:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationDetails.exonerated || 0}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationDetails.totalPeople || (reservationDetails.adults || 1) + (reservationDetails.children || 0) + (reservationDetails.exonerated || 0)}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Personas que Pagan:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationDetails.payingPeople || (reservationDetails.adults || 1) + (reservationDetails.children || 0)}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Nombre:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerEmail}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Teléfono:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerPhone}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total USD:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationDetails.totalUSD}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total VEF:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">Bs. ${reservationDetails.finalTotalVEF}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Referencia de Pago:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${transactionReference}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin-top: 0;">⏳ Estado: PENDIENTE</h3>
            <p style="color: #92400e; margin: 0;">
              Tu solicitud está siendo procesada. Verificaremos tu pago y te contactaremos 
              por WhatsApp en las próximas horas para confirmar la disponibilidad para el <strong>${fechaVisita}</strong> y finalizar tu reserva.
            </p>
          </div>

          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📞 Información de Contacto</h2>
            <div style="space-y: 10px;">
              <p style="margin: 8px 0; color: #374151;"><strong>📱 WhatsApp:</strong> +58 412-232-8332</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📧 Email:</strong> My_Real_email@gmail.com</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📍 Ubicación:</strong> Hacienda Paya, Turmero 2115, Aragua, Venezuela</p>
              <p style="margin: 8px 0; color: #374151;"><strong>🕒 Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div style="background: #10b981; color: white; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🌿 ¡Te esperamos el ${fechaVisita}!</h3>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">
              Prepárate para disfrutar de un día lleno de naturaleza, aventura y tranquilidad en nuestro hermoso espacio natural.
            </p>
          </div>
        </div>
      </div>
    `

    // Enviar email al cliente
    GmailApp.sendEmail(reservationDetails.bookerEmail, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("✅ Email de confirmación enviado exitosamente a:", reservationDetails.bookerEmail)
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error)
  }
}

// Función para enviar email de confirmación con QR (cuando se autoriza)
function enviarEmailConfirmacionConQR(reservationData, numeroReserva, row) {
  try {
    console.log("Enviando email de confirmación con QR a:", reservationData.email)

    // Formatear fecha de visita para mostrar
    const fechaVisitaFormatted =
      typeof reservationData.fechaVisita === "string"
        ? reservationData.fechaVisita
        : Utilities.formatDate(reservationData.fechaVisita, Session.getScriptTimeZone(), "dd/MM/yyyy")

    // Calcular total de personas
    const totalPersonas = (reservationData.adultos || 0) + (reservationData.ninos || 0)
    const personasQuePagan = totalPersonas

    // Generar URL del QR con los datos de la reserva
    const qrData = `RESERVA: ${numeroReserva}
FECHA: ${fechaVisitaFormatted}
NOMBRE: ${reservationData.nombreCompleto}
ADULTOS: ${reservationData.adultos || 0}
NIÑOS: ${reservationData.ninos || 0}
TOTAL PERSONAS: ${totalPersonas}
TOTAL: $${reservationData.totalUSD} USD
HACIENDA RINCÓN GRANDE
Presenta este código en la entrada`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    const subject = `🎉 ¡Reserva CONFIRMADA para el ${fechaVisitaFormatted}! - ${numeroReserva} | Hacienda Rincón Grande`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 ¡Reserva CONFIRMADA!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0; font-size: 24px;">✅ Tu Reserva está CONFIRMADA</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0; font-size: 32px; font-family: monospace;">${numeroReserva}</h3>
              <p style="color: #059669; margin: 5px 0 0 0;">Número de Reserva</p>
              <div style="background: #10b981; color: white; padding: 10px; border-radius: 8px; margin-top: 15px;">
                <h4 style="margin: 0; font-size: 20px;">📅 ${fechaVisitaFormatted}</h4>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Fecha de tu Visita</p>
              </div>
            </div>
            <p style="color: #374151; margin: 0;">
              Hola <strong>${reservationData.nombreCompleto}</strong>,
              <br><br>
              ¡Excelentes noticias! Tu reserva ha sido confirmada y autorizada para el <strong>${fechaVisitaFormatted}</strong>. 
              Ya puedes visitarnos en la fecha seleccionada.
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
            <h2 style="color: #059669; margin-top: 0;">📱 Tu Código QR de Entrada</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <img src="${qrUrl}" alt="Código QR de Reserva" style="max-width: 250px; height: auto; border: 3px solid #10b981; border-radius: 12px;" />
            </div>
            <p style="color: #374151; margin: 0; font-size: 16px;">
              <strong>¡IMPORTANTE!</strong> Presenta este código QR en la entrada de la hacienda el <strong>${fechaVisitaFormatted}</strong>.
              <br>También puedes mostrar este email desde tu teléfono.
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📅 Detalles de tu Reserva</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Número de Reserva:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${numeroReserva}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold; font-size: 18px;">${fechaVisitaFormatted}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cliente:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.nombreCompleto}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationData.adultos || 0}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños (5-12 años):</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${reservationData.ninos || 0}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${totalPersonas}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Pagado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationData.totalUSD} USD (Bs. ${reservationData.totalVEF})</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Estado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">✅ CONFIRMADA</td></tr>
            </table>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">📋 Instrucciones para tu Visita del ${fechaVisitaFormatted}</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Presenta tu código QR en la entrada el día ${fechaVisitaFormatted}</li>
              <li style="margin-bottom: 8px;">Trae ropa cómoda y protector solar</li>
              <li style="margin-bottom: 8px;">No olvides tu cámara para capturar los mejores momentos</li>
              <li style="margin-bottom: 8px;">Si tienes alguna pregunta, contáctanos por WhatsApp</li>
              <li style="margin-bottom: 8px;">Horarios: Lunes a Domingo, 8:00 AM - 6:00 PM</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📞 Información de Contacto</h2>
            <div style="space-y: 10px;">
              <p style="margin: 8px 0; color: #374151;"><strong>📱 WhatsApp:</strong> +58 412-232-8332</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📧 Email:</strong> My_Real_email@gmail.com</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📍 Ubicación:</strong> Hacienda Paya, Turmero 2115, Aragua, Venezuela</p>
              <p style="margin: 8px 0; color: #374151;"><strong>🕒 Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div style="background: #10b981; color: white; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🌿 ¡Te esperamos el ${fechaVisitaFormatted}!</h3>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">
              Prepárate para disfrutar de un día lleno de naturaleza, aventura y tranquilidad en nuestro hermoso espacio natural.
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Reserva confirmada: ${numeroReserva} - Fecha: ${fechaVisitaFormatted}<br>
            Hacienda Rincón Grande - Sistema de Reservas Automático
          </p>
        </div>
      </div>
    `

    // Enviar email al cliente
    GmailApp.sendEmail(reservationData.email, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("✅ Email de confirmación con QR enviado exitosamente a:", reservationData.email)

    // Opcional: Enviar notificación al administrador
    try {
      const adminSubject = `✅ Reserva Autorizada - ${numeroReserva} - ${fechaVisitaFormatted}`
      const adminBody = `
        Reserva autorizada automáticamente:
        
        Número: ${numeroReserva}
        Fecha de Visita: ${fechaVisitaFormatted}
        Cliente: ${reservationData.nombreCompleto}
        Email: ${reservationData.email}
        Adultos: ${reservationData.adultos || 0}
        Niños: ${reservationData.ninos || 0}
        Total Personas: ${totalPersonas}
        Total: $${reservationData.totalUSD} USD
        
        El cliente ya recibió su email de confirmación con código QR.
      `

      GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody)
      console.log("✅ Notificación enviada al administrador")
    } catch (adminError) {
      console.error("⚠️ Error enviando notificación al admin:", adminError)
    }
  } catch (error) {
    console.error("❌ Error enviando email de confirmación con QR:", error)
  }
}

// Función de prueba
function testFunction() {
  console.log("=== PRUEBA GENERAL DEL SISTEMA - ESTRUCTURA EXISTENTE ===")

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  sheet.appendRow([
    new Date(), // A: FechaHora
    "Juan Pérez", // B: Nombre Completo
    "juan@example.com", // C: Email
    "+58 412-123-4567", // D: Teléfono
    "25/01/2025", // E: Fecha Visita
    2, // F: Adultos
    1, // G: Niños
    15, // H: Total USD (3 personas × $5)
    547.5, // I: Total VEF
    "TEST123456", // J: Referencia Pago
    "PRUEBA", // K: Comprobante
    "PENDIENTE", // L: Estado
    "", // M: Número Reserva
    "Prueba del sistema - 2 adultos, 1 niño, 0 exonerados", // N: Notas
  ])

  console.log("✅ Prueba completada - Revisa tu Google Sheet")
}

// Función de prueba para email de autorización
function testEmailAutorizacion() {
  console.log("=== PRUEBA EMAIL AUTORIZACIÓN - ESTRUCTURA EXISTENTE ===")

  const reservationData = {
    fechaVisita: "25/01/2025",
    nombreCompleto: "Juan Pérez",
    email: "juan@example.com",
    telefono: "+58 412-123-4567",
    adultos: 2,
    ninos: 1,
    totalUSD: 15,
    totalVEF: 547.5,
    referenciaPago: "TEST123456",
  }

  const numeroReserva = "RES-TEST-" + new Date().getTime()

  enviarEmailConfirmacionConQR(reservationData, numeroReserva, 2)

  console.log("✅ Prueba de email de autorización completada")
}
