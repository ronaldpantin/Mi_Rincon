// ========================================
// GOOGLE APPS SCRIPT - HACIENDA RINCÓN GRANDE
// Sistema de Reservas Ultra Simplificado
// ========================================

// CONFIGURACIÓN
const ADMIN_EMAIL = "haciendarincongrande@gmail.com" // Email del administrador
const SHEET_NAME = "Sheet1" // Nombre de tu hoja de Google Sheets
const STATUS_COLUMN = 13 // Columna M (Estado) - índice 13 (base 1)
const EMAIL_COLUMN = 3 // Columna C (Email) - índice 3 (base 1)
const RESERVATION_NUMBER_COLUMN = 14 // Columna N (Número Reserva) - índice 14 (base 1)

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

    // Preparar datos para insertar (con categorías de personas)
    const rowData = [
      new Date(), // A: FechaHora
      `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`, // B: Nombre
      reservationDetails.bookerEmail, // C: Email
      reservationDetails.bookerPhone, // D: Teléfono
      reservationDetails.visitDate, // E: Fecha Visita
      reservationDetails.adults, // F: Adultos
      reservationDetails.children, // G: Niños
      reservationDetails.exonerated, // H: Exonerados
      reservationDetails.totalPeople, // I: Total Personas
      reservationDetails.payingPeople, // J: Personas que Pagan
      reservationDetails.totalUSD, // K: Total USD
      reservationDetails.finalTotalVEF, // L: Total VEF
      transactionReference, // M: Referencia Pago
      "PENDIENTE", // N: Estado
      "", // O: Número Reserva
      `ID: ${solicitudId}`, // P: Notas
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

    // Verificar si es la columna de Estado (N = columna 14)
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

    // Obtener datos de la fila
    const rowData = sheet.getRange(row, 1, 1, 16).getValues()[0]

    const reservationData = {
      fechaHora: rowData[0],
      nombreCompleto: rowData[1],
      email: rowData[2],
      telefono: rowData[3],
      fechaVisita: rowData[4],
      adultos: rowData[5],
      ninos: rowData[6],
      exonerados: rowData[7],
      totalPersonas: rowData[8],
      personasQuePagan: rowData[9],
      totalUSD: rowData[10],
      totalVEF: rowData[11],
      referenciaPago: rowData[12],
      estado: rowData[13],
      numeroReserva: rowData[14],
      notas: rowData[15],
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
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Nombre:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerEmail}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Teléfono:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerPhone}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.visitDate}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.adults}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños (5-12 años):</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.children}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Exonerados:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.exonerated}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.totalPeople}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Personas que Pagan:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.payingPeople}</td></tr>
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
            <h2 style="color: #059669; margin-top: 0;">📞 Información de Contacto</h2>
            <div style="space-y: 10px;">
              <p style="margin: 8px 0; color: #374151;"><strong>📱 WhatsApp:</strong> +58 412-232-8332</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📧 Email:</strong> haciendarincongrande@gmail.com</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📍 Ubicación:</strong> Hacienda Paya, Turmero 2115, Aragua, Venezuela</p>
              <p style="margin: 8px 0; color: #374151;"><strong>🕒 Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div style="background: #10b981; color: white; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🌿 ¡Te esperamos en Hacienda Rincón Grande!</h3>
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

    // Generar URL del QR con los datos de la reserva
    const qrData = `RESERVA: ${numeroReserva}
NOMBRE: ${reservationData.nombreCompleto}
ADULTOS: ${reservationData.adultos}
NIÑOS: ${reservationData.ninos}
EXONERADOS: ${reservationData.exonerados}
TOTAL PERSONAS: ${reservationData.totalPersonas}
TOTAL: $${reservationData.totalUSD} USD
HACIENDA RINCÓN GRANDE
Presenta este código en la entrada`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    const subject = `🎉 ¡Reserva CONFIRMADA! - ${numeroReserva} | Hacienda Rincón Grande`

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
            </div>
            <p style="color: #374151; margin: 0;">
              Hola <strong>${reservationData.nombreCompleto}</strong>,
              <br><br>
              ¡Excelentes noticias! Tu reserva ha sido confirmada y autorizada. 
              Ya puedes visitarnos cuando desees.
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
            <h2 style="color: #059669; margin-top: 0;">📱 Tu Código QR de Entrada</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <img src="${qrUrl}" alt="Código QR de Reserva" style="max-width: 250px; height: auto; border: 3px solid #10b981; border-radius: 12px;" />
            </div>
            <p style="color: #374151; margin: 0; font-size: 16px;">
              <strong>¡IMPORTANTE!</strong> Presenta este código QR en la entrada de la hacienda.
              <br>También puedes mostrar este email desde tu teléfono.
            </p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📅 Detalles de tu Reserva</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Número de Reserva:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${numeroReserva}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cliente:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.nombreCompleto}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.fechaVisita}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.adultos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños (5-12 años):</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.ninos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Exonerados:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.exonerados}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.totalPersonas}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Pagado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationData.totalUSD} USD (Bs. ${reservationData.totalVEF})</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Estado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">✅ CONFIRMADA</td></tr>
            </table>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">📋 Instrucciones para tu Visita</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Presenta tu código QR en la entrada</li>
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
              <p style="margin: 8px 0; color: #374151;"><strong>📧 Email:</strong> haciendarincongrande@gmail.com</p>
              <p style="margin: 8px 0; color: #374151;"><strong>📍 Ubicación:</strong> Hacienda Paya, Turmero 2115, Aragua, Venezuela</p>
              <p style="margin: 8px 0; color: #374151;"><strong>🕒 Horarios:</strong> Lunes a Domingo, 8:00 AM - 6:00 PM</p>
            </div>
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
            Reserva confirmada: ${numeroReserva}<br>
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
      const adminSubject = `✅ Reserva Autorizada - ${numeroReserva}`
      const adminBody = `
        Reserva autorizada automáticamente:
        
        Número: ${numeroReserva}
        Cliente: ${reservationData.nombreCompleto}
        Email: ${reservationData.email}
        Fecha: ${reservationData.fechaVisita}
        Adultos: ${reservationData.adultos}
        Niños: ${reservationData.ninos}
        Exonerados: ${reservationData.exonerados}
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
  console.log("=== PRUEBA GENERAL DEL SISTEMA ULTRA SIMPLE ===")

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  sheet.appendRow([
    new Date(),
    "Juan Pérez",
    "juan@example.com",
    "+58 412-123-4567",
    "2024-01-15",
    2, // adultos
    1, // niños
    1, // exonerados
    4, // total personas
    3, // personas que pagan
    15, // total USD
    547.5, // total VEF
    "TEST123456",
    "PENDIENTE",
    "",
    "Prueba del sistema ultra simplificado",
  ])

  console.log("✅ Prueba completada - Revisa tu Google Sheet")
}

// Función de prueba para email de autorización
function testEmailAutorizacion() {
  console.log("=== PRUEBA EMAIL AUTORIZACIÓN ULTRA SIMPLE ===")

  const reservationData = {
    nombreCompleto: "Juan Pérez",
    email: "juan@example.com",
    telefono: "+58 412-123-4567",
    fechaVisita: "2024-01-15",
    adultos: 2,
    ninos: 1,
    exonerados: 1,
    totalPersonas: 4,
    totalUSD: 15,
    totalVEF: 547.5,
    referenciaPago: "TEST123456",
  }

  const numeroReserva = "RES-TEST-" + new Date().getTime()

  enviarEmailConfirmacionConQR(reservationData, numeroReserva, 2)

  console.log("✅ Prueba de email de autorización completada")
}
