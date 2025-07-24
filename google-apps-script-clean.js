// ========================================
// GOOGLE APPS SCRIPT - SISTEMA LIMPIO
// Hacienda Rincón Grande - Reservas
// ========================================

// Declaración de variables
var SpreadsheetApp = SpreadsheetApp
var ContentService = ContentService
var GmailApp = GmailApp
var Utilities = Utilities // Declare Utilities variable

// CONFIGURACIÓN
const ADMIN_EMAIL = "haciendarincongrande@gmail.com"
const SHEET_NAME = "Reservas" // Cambia por el nombre de tu hoja
const EMAIL_ADMIN = "haciendarincongrande@gmail.com"
const WHATSAPP_NUMBER = "+584122328332"

// Función principal
function doPost(e) {
  try {
    console.log("=== NUEVA RESERVA ===")

    const data = JSON.parse(e.postData.contents)
    const { reservationDetails, transactionReference, solicitudId } = data

    console.log("Datos recibidos:", reservationDetails)

    // Procesar reserva
    const result = processReservation(reservationDetails)
    if (!result.success) {
      throw new Error(result.error)
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        solicitudId: solicitudId,
        message: "Reserva procesada exitosamente",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ Error:", error)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// Función principal para procesar reservas
function processReservation(data) {
  try {
    console.log("Procesando reserva:", JSON.stringify(data))

    const sheet = getOrCreateSheet()
    const timestamp = new Date()
    const solicitudId = data.solicitudId || `SOL-${timestamp.getTime()}`

    // Preparar datos para la hoja
    const rowData = [
      timestamp, // A: Fecha/Hora
      `${data.bookerFirstName} ${data.bookerLastName}`, // B: Nombre Completo
      data.bookerIdNumber, // C: Cédula
      data.bookerEmail, // D: Email
      data.bookerPhone, // E: Teléfono
      data.visitDate, // F: Fecha Visita
      data.adults, // G: Adultos
      data.children, // H: Niños
      data.exonerated, // I: Exonerados
      data.totalPeople, // J: Total Personas
      data.payingPeople, // K: Personas que Pagan
      data.entriesSubtotalUSD, // L: Entradas USD
      data.areasSubtotalUSD, // M: Áreas USD
      data.totalUSD, // N: Total USD
      data.bcvRate, // O: Tasa BCV
      data.finalTotalVEF, // P: Total VEF
      "PENDIENTE", // Q: Estado
      solicitudId, // R: Número Reserva
      data.selectedAreasDetails ? data.selectedAreasDetails.map((a) => a.name).join(", ") : "", // S: Áreas Seleccionadas
      data.transactionReference, // T: Referencia Pago
      solicitudId, // U: ID Solicitud
    ]

    // Agregar fila a la hoja
    sheet.appendRow(rowData)

    // Enviar email de confirmación al cliente
    sendCustomerConfirmationEmail(data, solicitudId)

    // Enviar notificación al admin
    sendAdminNotificationEmail(data, solicitudId)

    console.log("Reserva procesada exitosamente:", solicitudId)
    return { success: true, solicitudId: solicitudId }
  } catch (error) {
    console.error("Error procesando reserva:", error)
    return { success: false, error: error.toString() }
  }
}

// Función para obtener o crear la hoja
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)

    // Crear encabezados
    const headers = [
      "Fecha/Hora",
      "Nombre Completo",
      "Cédula",
      "Email",
      "Teléfono",
      "Fecha Visita",
      "Adultos",
      "Niños",
      "Exonerados",
      "Total Personas",
      "Personas que Pagan",
      "Entradas USD",
      "Áreas USD",
      "Total USD",
      "Tasa BCV",
      "Total VEF",
      "Estado",
      "Número Reserva",
      "Áreas Seleccionadas",
      "Referencia Pago",
      "ID Solicitud",
    ]

    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
    sheet.setFrozenRows(1)
  }

  return sheet
}

// Email de confirmación al cliente
function sendCustomerConfirmationEmail(data, solicitudId) {
  try {
    const subject = `Solicitud de Reserva Recibida - ${solicitudId}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">¡Solicitud Recibida!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0;">ID de Solicitud</h2>
            <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0; font-family: monospace;">${solicitudId}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Detalles de tu Reserva</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Cliente:</strong></td><td style="padding: 8px 0;">${data.bookerFirstName} ${data.bookerLastName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Cédula:</strong></td><td style="padding: 8px 0;">${data.bookerIdNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Fecha de Visita:</strong></td><td style="padding: 8px 0;">${data.visitDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Personas:</strong></td><td style="padding: 8px 0;">${data.totalPeople} (${data.adults} adultos, ${data.children} niños, ${data.exonerated} exonerados)</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Total a Pagar:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #10b981;">$${data.totalUSD} USD (Bs. ${data.finalTotalVEF.toFixed(2)})</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Referencia:</strong></td><td style="padding: 8px 0; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${data.transactionReference}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">⏳ Estado: PENDIENTE</h3>
            <p style="color: #92400e; margin: 0; font-size: 14px;">Estamos verificando tu pago. Te contactaremos pronto por WhatsApp para confirmar la disponibilidad.</p>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">📞 Próximos Pasos</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Verificaremos tu pago</li>
              <li>Te contactaremos por WhatsApp</li>
              <li>Recibirás tu código QR de entrada</li>
              <li>¡Disfruta tu visita!</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              📱 WhatsApp: ${WHATSAPP_NUMBER}<br>
              📧 Email: ${EMAIL_ADMIN}
            </p>
          </div>
        </div>
      </div>
    `

    GmailApp.sendEmail(
      data.bookerEmail,
      subject,
      "", // texto plano vacío
      {
        htmlBody: htmlBody,
        name: "Hacienda Rincón Grande",
      },
    )

    console.log("Email de confirmación enviado al cliente:", data.bookerEmail)
  } catch (error) {
    console.error("Error enviando email al cliente:", error)
  }
}

// Email de notificación al admin
function sendAdminNotificationEmail(data, solicitudId) {
  try {
    const subject = `Nueva Reserva - ${solicitudId}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Nueva Solicitud de Reserva</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">${solicitudId}</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${data.bookerFirstName} ${data.bookerLastName}</p>
            <p><strong>Cédula:</strong> ${data.bookerIdNumber}</p>
            <p><strong>Email:</strong> ${data.bookerEmail}</p>
            <p><strong>Teléfono:</strong> ${data.bookerPhone}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Detalles de la Reserva</h3>
            <p><strong>Fecha de Visita:</strong> ${data.visitDate}</p>
            <p><strong>Personas:</strong> ${data.totalPeople} (${data.adults} adultos, ${data.children} niños, ${data.exonerated} exonerados)</p>
            <p><strong>Total:</strong> $${data.totalUSD} USD (Bs. ${data.finalTotalVEF.toFixed(2)})</p>
            <p><strong>Referencia de Pago:</strong> ${data.transactionReference}</p>
            ${
              data.selectedAreasDetails && data.selectedAreasDetails.length > 0
                ? `<p><strong>Áreas Seleccionadas:</strong> ${data.selectedAreasDetails.map((a) => a.name).join(", ")}</p>`
                : ""
            }
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;"><strong>Acción Requerida:</strong> Verificar pago y contactar al cliente por WhatsApp</p>
          </div>
        </div>
      </div>
    `

    GmailApp.sendEmail(
      EMAIL_ADMIN,
      subject,
      "", // texto plano vacío
      {
        htmlBody: htmlBody,
        name: "Sistema de Reservas",
      },
    )

    console.log("Email de notificación enviado al admin")
  } catch (error) {
    console.error("Error enviando email al admin:", error)
  }
}

// Función para autorizar reserva (cambiar estado a AUTORIZADO)
function authorizeReservation(solicitudId) {
  try {
    const sheet = getOrCreateSheet()
    const data = sheet.getDataRange().getValues()

    // Buscar la fila con el solicitudId
    for (let i = 1; i < data.length; i++) {
      if (data[i][20] === solicitudId) {
        // Columna U (ID Solicitud)
        // Cambiar estado a AUTORIZADO (columna Q)
        sheet.getRange(i + 1, 17).setValue("AUTORIZADO")

        // Enviar email con QR al cliente
        const customerData = {
          bookerEmail: data[i][3],
          bookerFirstName: data[i][1].split(" ")[0],
          visitDate: data[i][5],
          totalPeople: data[i][9],
          solicitudId: solicitudId,
        }

        sendQRCodeEmail(customerData)

        console.log("Reserva autorizada:", solicitudId)
        return { success: true }
      }
    }

    return { success: false, error: "Solicitud no encontrada" }
  } catch (error) {
    console.error("Error autorizando reserva:", error)
    return { success: false, error: error.toString() }
  }
}

// Email con código QR
function sendQRCodeEmail(data) {
  try {
    const subject = `¡Reserva Confirmada! - ${data.solicitudId}`

    // Generar URL del QR
    const qrData = `RESERVA:${data.solicitudId}|FECHA:${data.visitDate}|PERSONAS:${data.totalPeople}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">¡Reserva Confirmada!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hacienda Rincón Grande</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: white; padding: 25px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Tu Código QR de Entrada</h2>
              <img src="${qrUrl}" alt="Código QR" style="width: 200px; height: 200px; border: 2px solid #10b981; border-radius: 8px;">
              <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; color: #6b7280;">${data.solicitudId}</p>
            </div>
          </div>
          
          <div style="background: #dcfce7; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0 0 10px 0;">✅ ¡Tu reserva está confirmada!</h3>
            <p style="color: #166534; margin: 0; font-size: 14px;">Presenta este código QR en la entrada de la hacienda.</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Detalles de tu Visita</h3>
            <p><strong>Fecha:</strong> ${data.visitDate}</p>
            <p><strong>Personas:</strong> ${data.totalPeople}</p>
            <p><strong>Código:</strong> ${data.solicitudId}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">📋 Instrucciones Importantes</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Llega 15 minutos antes de tu hora programada</li>
              <li>Presenta este código QR en la entrada</li>
              <li>Trae identificación oficial</li>
              <li>Disfruta tu experiencia en la hacienda</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              ¡Te esperamos en Hacienda Rincón Grande!<br>
              📱 WhatsApp: +58 412-232-8332
            </p>
          </div>
        </div>
      </div>
    `

    GmailApp.sendEmail(
      data.bookerEmail,
      subject,
      "", // texto plano vacío
      {
        htmlBody: htmlBody,
        name: "Hacienda Rincón Grande",
      },
    )

    console.log("Email con QR enviado al cliente:", data.bookerEmail)
  } catch (error) {
    console.error("Error enviando email con QR:", error)
  }
}

// Función de prueba
function testReserva() {
  const testData = {
    bookerFirstName: "Juan",
    bookerLastName: "Pérez",
    bookerIdNumber: "V-12345678",
    bookerEmail: "juan@example.com",
    bookerPhone: "+58 412-123-4567",
    visitDate: "2024-01-15",
    adults: 2,
    children: 1,
    exonerated: 0,
    totalPeople: 3,
    payingPeople: 3,
    entriesSubtotalUSD: 15,
    areasSubtotalUSD: 0,
    totalUSD: 15,
    bcvRate: 36.5,
    finalTotalVEF: 547.5,
    transactionReference: "TEST123456",
    selectedAreasDetails: [],
  }

  const result = processReservation(testData)
  console.log("Resultado de prueba:", result)

  if (result.success) {
    console.log("Probando autorización...")
    Utilities.sleep(2000) // Esperar 2 segundos
    const authResult = authorizeReservation(result.solicitudId)
    console.log("Resultado de autorización:", authResult)
  }
}

// Función para configurar permisos (ejecutar una vez)
function setupPermissions() {
  try {
    // Probar acceso a Gmail
    const drafts = GmailApp.getDrafts()
    console.log("Acceso a Gmail configurado correctamente")

    // Probar acceso a Sheets
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    console.log("Acceso a Sheets configurado correctamente")

    return { success: true, message: "Permisos configurados correctamente" }
  } catch (error) {
    console.error("Error configurando permisos:", error)
    return { success: false, error: error.toString() }
  }
}
