// ========================================
// GOOGLE APPS SCRIPT - HACIENDA RINCÓN GRANDE
// Sistema de Reservas con Hoja Ordenada y Autorización Automática
// ========================================

// CONFIGURACIÓN
const ADMIN_EMAIL = "haciendarincongrande@gmail.com" // Cambia por tu email
const SHEET_NAME = "Reservas" // Nombre de tu hoja de Google Sheets
const STATUS_COLUMN = 20 // Columna T (Estado) - índice 20 (base 1)
const EMAIL_COLUMN = 4 // Columna D (Email) - índice 4 (base 1)
const RESERVATION_NUMBER_COLUMN = 18 // Columna R (Número Reserva) - índice 18 (base 1)

// Función principal que recibe datos del frontend
function doPost(e) {
  try {
    console.log("=== INICIO doPost ===")
    console.log("Datos recibidos:", e.postData.contents)

    const data = JSON.parse(e.postData.contents)
    const reservationDetails = data.reservationDetails
    const transactionReference = data.transactionReference

    // Generar ID único para la reserva
    const timestamp = new Date().getTime()
    const numeroReserva = `HRG-${timestamp.toString().slice(-6)}`
    console.log("Número de reserva generado:", numeroReserva)

    // Obtener la hoja de cálculo
    const sheet = getOrCreateSheet()

    // Calcular valores
    const subtotalBolivares = reservationDetails.totalUSD * reservationDetails.bcvRate
    const iva = subtotalBolivares * 0.16
    const totalBolivares = subtotalBolivares + iva

    // Preparar áreas seleccionadas como texto
    const areasSeleccionadas =
      reservationDetails.selectedAreasDetails && reservationDetails.selectedAreasDetails.length > 0
        ? reservationDetails.selectedAreasDetails.map((area) => `${area.name} ($${area.price})`).join(", ")
        : "Entrada General"

    // Preparar datos para insertar según el orden solicitado
    const rowData = [
      reservationDetails.bookerFirstName, // A: Nombre
      reservationDetails.bookerLastName, // B: Apellido
      reservationDetails.bookerIdNumber, // C: Cédula de Identidad
      reservationDetails.bookerEmail, // D: Email
      reservationDetails.bookerPhone, // E: Teléfono
      reservationDetails.visitDate, // F: Fecha de Visita
      reservationDetails.adults, // G: Adultos
      reservationDetails.children, // H: Niños
      reservationDetails.exonerated, // I: Exonerados
      reservationDetails.totalPeople, // J: Total de Personas
      reservationDetails.payingPeople, // K: Total de Personas que Pagan
      areasSeleccionadas, // L: Area Seleccionada
      reservationDetails.totalUSD, // M: Total en USD
      reservationDetails.bcvRate, // N: Tasa BCV del día
      subtotalBolivares.toFixed(2), // O: Subtotal en Bolívares
      iva.toFixed(2), // P: IVA
      totalBolivares.toFixed(2), // Q: Total en Bolívares
      numeroReserva, // R: Número de reserva
      transactionReference, // S: Referencia Pago
      "PENDIENTE", // T: Estado
    ]

    // Insertar fila
    sheet.appendRow(rowData)
    console.log("✅ Fila insertada exitosamente")

    // Enviar email de confirmación al cliente
    enviarEmailConfirmacionCliente(reservationDetails, transactionReference, numeroReserva)

    // Enviar notificación al administrador
    enviarNotificacionAdmin(reservationDetails, numeroReserva)

    // Respuesta exitosa
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        numeroReserva: numeroReserva,
        message: "Reserva registrada exitosamente",
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

// Función para obtener o crear la hoja con los encabezados correctos
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)

    // Crear encabezados en el orden solicitado
    const headers = [
      "Nombre", // A
      "Apellido", // B
      "Cédula de Identidad", // C
      "Email", // D
      "Teléfono", // E
      "Fecha de Visita", // F
      "Adultos", // G
      "Niños", // H
      "Exonerados", // I
      "Total de Personas", // J
      "Total de Personas que Pagan", // K
      "Area Seleccionada", // L
      "Total en USD", // M
      "Tasa BCV del día", // N
      "Subtotal en Bolívares", // O
      "IVA", // P
      "Total en Bolívares", // Q
      "Número de reserva", // R
      "Referencia Pago", // S
      "Estado", // T
    ]

    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
    sheet.getRange(1, 1, 1, headers.length).setBackground("#4CAF50")
    sheet.getRange(1, 1, 1, headers.length).setFontColor("white")
    sheet.setFrozenRows(1)

    // Ajustar ancho de columnas
    sheet.autoResizeColumns(1, headers.length)
  }

  return sheet
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

    // Verificar si es la columna de Estado (T = columna 20)
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
    const rowData = sheet.getRange(row, 1, 1, 20).getValues()[0]

    const reservationData = {
      nombre: rowData[0], // A
      apellido: rowData[1], // B
      cedula: rowData[2], // C
      email: rowData[3], // D
      telefono: rowData[4], // E
      fechaVisita: rowData[5], // F
      adultos: rowData[6], // G
      ninos: rowData[7], // H
      exonerados: rowData[8], // I
      totalPersonas: rowData[9], // J
      personasQuePagan: rowData[10], // K
      areaSeleccionada: rowData[11], // L
      totalUSD: rowData[12], // M
      tasaBCV: rowData[13], // N
      subtotalBolivares: rowData[14], // O
      iva: rowData[15], // P
      totalBolivares: rowData[16], // Q
      numeroReserva: rowData[17], // R
      referenciaPago: rowData[18], // S
      estado: rowData[19], // T
    }

    console.log("Datos de la reserva:", reservationData)

    // Enviar email de confirmación con QR
    enviarEmailAutorizacionConQR(reservationData)
  } catch (error) {
    console.error("❌ Error en onEdit:", error)
  }
}

// Función para enviar email de confirmación al cliente (solicitud inicial)
function enviarEmailConfirmacionCliente(reservationDetails, transactionReference, numeroReserva) {
  try {
    console.log("Enviando email de confirmación a:", reservationDetails.bookerEmail)

    const subject = `✅ Solicitud de Reserva Recibida - ${numeroReserva} | Hacienda Rincón Grande`

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
              <h3 style="color: #065f46; margin: 0; font-size: 32px; font-family: monospace;">${numeroReserva}</h3>
              <p style="color: #059669; margin: 5px 0 0 0;">Número de Reserva</p>
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
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cédula:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerIdNumber}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.visitDate}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.totalPeople} (${reservationDetails.adults} adultos, ${reservationDetails.children} niños, ${reservationDetails.exonerated} exonerados)</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total USD:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationDetails.totalUSD}</td></tr>
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

// Función para enviar notificación al administrador
function enviarNotificacionAdmin(reservationDetails, numeroReserva) {
  try {
    const subject = `🔔 Nueva Reserva Pendiente - ${numeroReserva}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🔔 Nueva Solicitud de Reserva</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">${numeroReserva}</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">👤 Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}</p>
            <p><strong>Cédula:</strong> ${reservationDetails.bookerIdNumber}</p>
            <p><strong>Email:</strong> ${reservationDetails.bookerEmail}</p>
            <p><strong>Teléfono:</strong> ${reservationDetails.bookerPhone}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">📅 Detalles de la Reserva</h3>
            <p><strong>Fecha de Visita:</strong> ${reservationDetails.visitDate}</p>
            <p><strong>Personas:</strong> ${reservationDetails.totalPeople} (${reservationDetails.adults} adultos, ${reservationDetails.children} niños, ${reservationDetails.exonerated} exonerados)</p>
            <p><strong>Total:</strong> $${reservationDetails.totalUSD} USD</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;"><strong>⚡ PARA AUTORIZAR:</strong> Ve a Google Sheets y cambia el estado de "PENDIENTE" a "AUTORIZADO"</p>
          </div>
        </div>
      </div>
    `

    GmailApp.sendEmail(ADMIN_EMAIL, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("✅ Email de notificación enviado al admin")
  } catch (error) {
    console.error("❌ Error enviando notificación admin:", error)
  }
}

// Función para enviar email de autorización con QR (cuando se cambia a AUTORIZADO)
function enviarEmailAutorizacionConQR(reservationData) {
  try {
    console.log("Enviando email de autorización con QR a:", reservationData.email)

    // Generar URL del QR con los datos de la reserva
    const qrData = `RESERVA: ${reservationData.numeroReserva}
NOMBRE: ${reservationData.nombre} ${reservationData.apellido}
CEDULA: ${reservationData.cedula}
FECHA: ${reservationData.fechaVisita}
PERSONAS: ${reservationData.totalPersonas}
TOTAL: $${reservationData.totalUSD} USD
HACIENDA RINCÓN GRANDE
Presenta este código en la entrada`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    const subject = `🎉 ¡Reserva AUTORIZADA! - ${reservationData.numeroReserva} | Hacienda Rincón Grande`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 ¡Reserva AUTORIZADA!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0; font-size: 24px;">✅ Tu Reserva está CONFIRMADA</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0; font-size: 32px; font-family: monospace;">${reservationData.numeroReserva}</h3>
              <p style="color: #059669; margin: 5px 0 0 0;">Número de Reserva</p>
            </div>
            <p style="color: #374151; margin: 0;">
              Hola <strong>${reservationData.nombre} ${reservationData.apellido}</strong>,
              <br><br>
              ¡Excelentes noticias! Tu reserva ha sido confirmada y autorizada. 
              Ya puedes visitarnos en la fecha programada.
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
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Número de Reserva:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${reservationData.numeroReserva}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cliente:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.nombre} ${reservationData.apellido}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cédula:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.cedula}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.fechaVisita}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.adultos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.ninos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Exonerados:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.exonerados}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Personas:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.totalPersonas}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Área Seleccionada:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservationData.areaSeleccionada}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total USD:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservationData.totalUSD}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Bolívares:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">Bs. ${reservationData.totalBolivares}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Estado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">✅ AUTORIZADA</td></tr>
            </table>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-top: 0;">📋 Instrucciones para tu Visita</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Presenta tu código QR en la entrada</li>
              <li style="margin-bottom: 8px;">Trae tu cédula de identidad original</li>
              <li style="margin-bottom: 8px;">Llega 15 minutos antes de tu hora programada</li>
              <li style="margin-bottom: 8px;">Trae ropa cómoda y protector solar</li>
              <li style="margin-bottom: 8px;">No olvides tu cámara para capturar los mejores momentos</li>
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
            Reserva autorizada: ${reservationData.numeroReserva}<br>
            Hacienda Rincón Grande - Sistema de Reservas Automático
          </p>
        </div>
      </div>
    `

    // Enviar email al cliente
    GmailApp.sendEmail(reservationData.email, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("✅ Email de autorización con QR enviado exitosamente a:", reservationData.email)

    // Enviar notificación al administrador
    try {
      const adminSubject = `✅ Reserva Autorizada - ${reservationData.numeroReserva}`
      const adminBody = `
        Reserva autorizada automáticamente:
        
        Número: ${reservationData.numeroReserva}
        Cliente: ${reservationData.nombre} ${reservationData.apellido}
        Cédula: ${reservationData.cedula}
        Email: ${reservationData.email}
        Fecha: ${reservationData.fechaVisita}
        Total: $${reservationData.totalUSD} USD
        
        El cliente ya recibió su email de confirmación con código QR.
      `

      GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody)
      console.log("✅ Notificación enviada al administrador")
    } catch (adminError) {
      console.error("⚠️ Error enviando notificación al admin:", adminError)
    }
  } catch (error) {
    console.error("❌ Error enviando email de autorización con QR:", error)
  }
}

// Función de prueba
function testFunction() {
  console.log("=== PRUEBA DEL SISTEMA ORDENADO ===")

  const sheet = getOrCreateSheet()

  // Datos de prueba
  sheet.appendRow([
    "Juan", // Nombre
    "Pérez", // Apellido
    "V-12345678", // Cédula
    "juan@example.com", // Email
    "+58 412-123-4567", // Teléfono
    "2024-01-15", // Fecha de Visita
    2, // Adultos
    1, // Niños
    0, // Exonerados
    3, // Total Personas
    3, // Personas que Pagan
    "Entrada General", // Área Seleccionada
    15, // Total USD
    120.4239, // Tasa BCV
    1806.36, // Subtotal Bolívares
    289.02, // IVA
    2095.38, // Total Bolívares
    "HRG-123456", // Número de Reserva
    "TEST123456", // Referencia Pago
    "PENDIENTE", // Estado
  ])

  console.log("✅ Prueba completada - Revisa tu Google Sheet")
}

// Función de prueba para email de autorización
function testEmailAutorizacion() {
  console.log("=== PRUEBA EMAIL AUTORIZACIÓN ===")

  const reservationData = {
    nombre: "Juan",
    apellido: "Pérez",
    cedula: "V-12345678",
    email: "juan@example.com", // CAMBIA ESTE EMAIL POR UNO REAL PARA PROBAR
    telefono: "+58 412-123-4567",
    fechaVisita: "2024-01-15",
    adultos: 2,
    ninos: 1,
    exonerados: 0,
    totalPersonas: 3,
    areaSeleccionada: "Entrada General",
    totalUSD: 15,
    totalBolivares: 2095.38,
    numeroReserva: "HRG-TEST-" + new Date().getTime(),
  }

  enviarEmailAutorizacionConQR(reservationData)
  console.log("✅ Prueba de email de autorización completada")
}
