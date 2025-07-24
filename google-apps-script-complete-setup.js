// ========================================
// GOOGLE APPS SCRIPT COMPLETO
// Hacienda Rincón Grande - Sistema de Reservas
// ========================================

// Google Apps Script para Hacienda Rincón Grande - Sistema de Reservas Simplificado
// Versión: 2.0 - Sin imágenes, solo referencia bancaria

// ==========================================
// CONFIGURACIÓN PRINCIPAL
// ==========================================

// Declaración de variables necesarias
const SpreadsheetApp = SpreadsheetApp
const ContentService = ContentService
const GmailApp = GmailApp

// Cambia este email por el tuyo
const ADMIN_EMAIL = "haciendarincongrande@gmail.com" // CAMBIA ESTE EMAIL POR EL TUYO
const SHEET_NAME = "Sheet1" // Nombre de tu hoja de Google Sheets

// ==========================================
// FUNCIÓN PRINCIPAL PARA RECIBIR DATOS DEL FRONTEND
// ==========================================

function doPost(e) {
  try {
    console.log("=== INICIO doPost ===")
    console.log("Datos recibidos:", e.postData.contents)

    const data = JSON.parse(e.postData.contents)
    console.log("Datos parseados:", data)

    const reservationDetails = data.reservationDetails
    const transactionReference = data.transactionReference

    // Generar ID único para la solicitud
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
      `${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}`, // B: Nombre Completo
      reservationDetails.bookerEmail, // C: Email
      reservationDetails.bookerPhone, // D: Teléfono
      reservationDetails.date, // E: Fecha Visita
      reservationDetails.adults, // F: Adultos
      reservationDetails.children, // G: Niños
      reservationDetails.totalUSD, // H: Total USD
      reservationDetails.finalTotalVEF, // I: Total VEF
      transactionReference, // J: Referencia Pago
      "SIN IMAGEN - PROCESO SIMPLIFICADO", // K: Comprobante
      "PENDIENTE", // L: Estado
      "", // M: Número Reserva (se llena al autorizar)
      `ID: ${solicitudId} | Proceso simplificado sin imagen`, // N: Notas
    ]

    console.log("Datos a insertar:", rowData)

    // Insertar fila
    sheet.appendRow(rowData)
    console.log("Fila insertada exitosamente")

    // Enviar email de notificación al administrador
    enviarEmailNotificacionAdmin(reservationDetails, transactionReference, solicitudId)

    // Respuesta exitosa
    const response = {
      success: true,
      solicitudId: solicitudId,
      message: "Solicitud registrada exitosamente",
      status: "PENDIENTE",
    }

    console.log("Respuesta:", response)
    console.log("=== FIN doPost ===")

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("Error en doPost:", error)

    const errorResponse = {
      success: false,
      error: error.toString(),
      message: "Error procesando la solicitud",
    }

    return ContentService.createTextOutput(JSON.stringify(errorResponse)).setMimeType(ContentService.MimeType.JSON)
  }
}

// ==========================================
// FUNCIÓN PARA ENVIAR EMAIL DE NOTIFICACIÓN AL ADMIN
// ==========================================

function enviarEmailNotificacionAdmin(reservationDetails, transactionReference, solicitudId) {
  try {
    const subject = `🔔 Nueva Solicitud de Reserva - ${solicitudId}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏞️ Nueva Solicitud de Reserva</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin-top: 0;">📋 Detalles de la Solicitud</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>ID de Solicitud:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${solicitudId}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Estado:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="background: #fbbf24; color: white; padding: 4px 8px; border-radius: 4px;">PENDIENTE</span></td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Fecha de Solicitud:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString("es-ES")}</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin-top: 0;">👤 Información del Cliente</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerFirstName} ${reservationDetails.bookerLastName}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerEmail}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Teléfono:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.bookerPhone}</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin-top: 0;">📅 Detalles de la Reserva</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Fecha de Visita:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.date}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Adultos:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.adults}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Niños:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${reservationDetails.children}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total USD:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">$${reservationDetails.totalUSD}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total VEF:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Bs. ${reservationDetails.finalTotalVEF}</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin-top: 0;">💳 Información de Pago</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Referencia de Pago:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${transactionReference}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Comprobante:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Proceso simplificado - Sin imagen</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">⚡ Acción Requerida</h3>
            <p style="color: #92400e; margin: 0;">Para autorizar esta reserva:</p>
            <ol style="color: #92400e; margin: 10px 0 0 0;">
              <li>Ve a tu Google Sheet</li>
              <li>Busca la fila con ID: <strong>${solicitudId}</strong></li>
              <li>Verifica el pago con la referencia: <strong>${transactionReference}</strong></li>
              <li>Cambia el estado de "PENDIENTE" a "AUTORIZADA"</li>
              <li>El cliente recibirá automáticamente el email de confirmación</li>
            </ol>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">Hacienda Rincón Grande - Sistema de Reservas</p>
        </div>
      </div>
    `

    GmailApp.sendEmail(ADMIN_EMAIL, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("Email de notificación enviado al administrador")
  } catch (error) {
    console.error("Error enviando email de notificación:", error)
  }
}

// ==========================================
// FUNCIÓN QUE SE EJECUTA AUTOMÁTICAMENTE AL EDITAR LA HOJA
// ==========================================

function onEdit(e) {
  try {
    console.log("=== INICIO onEdit ===")

    const sheet = e.source.getActiveSheet()
    const range = e.range
    const row = range.getRow()
    const col = range.getColumn()

    // Verificar si es la hoja correcta y la columna de Estado (columna L = 12)
    if (sheet.getName() !== SHEET_NAME || col !== 12 || row === 1) {
      console.log("Edición no relevante, saliendo...")
      return
    }

    const newValue = range.getValue()
    console.log(`Cambio detectado en fila ${row}, columna ${col}: ${newValue}`)

    // Si el estado cambió a "AUTORIZADA"
    if (newValue === "AUTORIZADA") {
      console.log("Estado cambiado a AUTORIZADA, procesando...")

      // Obtener datos de la fila
      const rowData = sheet.getRange(row, 1, 1, 14).getValues()[0]

      const reservaData = {
        fechaHora: rowData[0],
        nombreCompleto: rowData[1],
        email: rowData[2],
        telefono: rowData[3],
        fechaVisita: rowData[4],
        adultos: rowData[5],
        ninos: rowData[6],
        totalUSD: rowData[7],
        totalVEF: rowData[8],
        referenciaPago: rowData[9],
        comprobante: rowData[10],
        estado: rowData[11],
        numeroReserva: rowData[12],
        notas: rowData[13],
      }

      // Generar número de reserva si no existe
      if (!reservaData.numeroReserva) {
        const numeroReserva = "RES-" + new Date().getTime()
        sheet.getRange(row, 13).setValue(numeroReserva)
        reservaData.numeroReserva = numeroReserva
        console.log("Número de reserva generado:", numeroReserva)
      }

      // Enviar email de confirmación al cliente
      enviarEmailConfirmacionCliente(reservaData)

      console.log("Proceso de autorización completado")
    }

    console.log("=== FIN onEdit ===")
  } catch (error) {
    console.error("Error en onEdit:", error)
  }
}

// ==========================================
// FUNCIÓN PARA ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE
// ==========================================

function enviarEmailConfirmacionCliente(reservaData) {
  try {
    console.log("Enviando email de confirmación a:", reservaData.email)

    const subject = `✅ Reserva Confirmada - ${reservaData.numeroReserva} | Hacienda Rincón Grande`

    // Generar código QR simple (texto)
    const qrData = `RESERVA: ${reservaData.numeroReserva}\nNOMBRE: ${reservaData.nombreCompleto}\nFECHA: ${reservaData.fechaVisita}\nADULTOS: ${reservaData.adultos}\nNIÑOS: ${reservaData.ninos}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 ¡Reserva Confirmada!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #10b981;">
            <h2 style="color: #059669; margin-top: 0; font-size: 24px;">🎫 Tu Reserva</h2>
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0; font-size: 32px; font-family: monospace;">${reservaData.numeroReserva}</h3>
              <p style="color: #059669; margin: 5px 0 0 0;">Número de Reserva</p>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📅 Detalles de tu Visita</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha de Visita:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservaData.fechaVisita}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Adultos:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservaData.adultos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Niños:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${reservaData.ninos}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Pagado:</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">$${reservaData.totalUSD} USD (Bs. ${reservaData.totalVEF})</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📱 Código QR de tu Reserva</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px dashed #10b981;">
                <p style="margin: 0; font-family: monospace; font-size: 14px; line-height: 1.6; color: #374151;">${qrData}</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">Presenta este código en la entrada de la hacienda</p>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #059669; margin-top: 0;">📍 Información Importante</h2>
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="color: #92400e; margin-top: 0;">⏰ Horarios de Atención</h4>
              <p style="color: #92400e; margin: 0;">Lunes a Domingo: 8:00 AM - 6:00 PM</p>
            </div>
            
            <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="color: #1e40af; margin-top: 0;">📞 Contacto</h4>
              <p style="color: #1e40af; margin: 0;">
                WhatsApp: +58 412-232-8332<br>
                Email: haciendarincongrande@gmail.com
              </p>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px;">
              <h4 style="color: #065f46; margin-top: 0;">🗺️ Ubicación</h4>
              <p style="color: #065f46; margin: 0;">
                Hacienda Paya, Turmero 2115, Aragua, Venezuela<br>
                <a href="https://maps.google.com/?q=10.240245,-67.459364" style="color: #059669;">Ver en Google Maps</a>
              </p>
            </div>
          </div>
          
          <div style="background: #10b981; color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">¡Te esperamos en Hacienda Rincón Grande!</h3>
            <p style="margin: 0; opacity: 0.9;">Disfruta de un día lleno de naturaleza, aventura y tranquilidad</p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Este email fue generado automáticamente por el sistema de reservas de Hacienda Rincón Grande<br>
            Si tienes alguna pregunta, no dudes en contactarnos
          </p>
        </div>
      </div>
    `

    GmailApp.sendEmail(reservaData.email, subject, "", {
      htmlBody: htmlBody,
    })

    console.log("Email de confirmación enviado exitosamente a:", reservaData.email)
  } catch (error) {
    console.error("Error enviando email de confirmación:", error)
  }
}

// ===== FUNCIONES DE PRUEBA =====
function testFunction() {
  console.log("=== PRUEBA GENERAL DEL SISTEMA ===")

  try {
    // Datos de prueba
    const testData = {
      reservationDetails: {
        bookerFirstName: "Juan",
        bookerLastName: "Pérez",
        bookerEmail: "juan.perez@example.com",
        bookerPhone: "+58 412-123-4567",
        date: "2024-01-15",
        adults: 2,
        children: 1,
        totalUSD: 50,
        finalTotalVEF: 1825.0,
      },
      transactionReference: "123456789",
    }

    console.log("Datos de prueba:", testData)

    // Simular doPost
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData),
      },
    }

    const result = doPost(mockEvent)
    console.log("Resultado de la prueba:", result.getContent())

    console.log("✅ Prueba completada exitosamente")
  } catch (error) {
    console.error("❌ Error en la prueba:", error)
  }
}

function testAutorizacion() {
  console.log("=== PRUEBA DE AUTORIZACIÓN ===")

  try {
    const testReservaData = {
      fechaHora: new Date(),
      nombreCompleto: "María González",
      email: "maria.gonzalez@example.com",
      telefono: "+58 414-987-6543",
      fechaVisita: "2024-01-20",
      adultos: 3,
      ninos: 2,
      totalUSD: 75,
      totalVEF: 2737.5,
      referenciaPago: "987654321",
      comprobante: "SIN IMAGEN - PROCESO SIMPLIFICADO",
      estado: "AUTORIZADA",
      numeroReserva: "RES-" + new Date().getTime(),
      notas: "Prueba de autorización",
    }

    enviarEmailConfirmacionCliente(testReservaData)
    console.log("✅ Prueba de autorización completada")
  } catch (error) {
    console.error("❌ Error en prueba de autorización:", error)
  }
}

function obtenerEstadisticas() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    const data = sheet.getDataRange().getValues()

    let pendientes = 0
    let autorizadas = 0
    const total = data.length - 1 // Excluir header

    for (let i = 1; i < data.length; i++) {
      const estado = data[i][11] // Columna L (Estado)
      if (estado === "PENDIENTE") pendientes++
      if (estado === "AUTORIZADA") autorizadas++
    }

    console.log("=== ESTADÍSTICAS ===")
    console.log(`Total de reservas: ${total}`)
    console.log(`Pendientes: ${pendientes}`)
    console.log(`Autorizadas: ${autorizadas}`)

    return { total, pendientes, autorizadas }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
  }
}
