// ===== CONFIGURACIÓN =====
const SPREADSHEET_ID = "1BcJl2pzQFGHI3jKlMnOpQrStUvWxYzAbCdEfGhIjKlM"
const ADMIN_EMAIL = "haciendarincongrande@gmail.com"
const BCV_RATE = 120.4239

// ===== FUNCIONES AUXILIARES =====
function getOrCreateSheet() {
  try {
    let spreadsheet

    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    } catch (error) {
      console.log("Creando nueva hoja de cálculo...")
      spreadsheet = SpreadsheetApp.create("Reservas Hacienda Rincón Grande")
      console.log("Nueva hoja creada con ID:", spreadsheet.getId())
    }

    let sheet = spreadsheet.getSheetByName("Reservas")

    if (!sheet) {
      sheet = spreadsheet.insertSheet("Reservas")

      // Crear encabezados
      const headers = [
        "Fecha Solicitud",
        "ID Solicitud",
        "Estado",
        "Nombre",
        "Apellido",
        "Cédula",
        "Email",
        "Teléfono",
        "Fecha Visita",
        "Adultos",
        "Niños",
        "Exonerados",
        "Total Personas",
        "Áreas Seleccionadas",
        "Total USD",
        "Total VEF",
        "Referencia Pago",
        "Observaciones",
      ]

      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
      sheet.setFrozenRows(1)

      console.log("Encabezados creados")
    }

    return sheet
  } catch (error) {
    console.error("Error en getOrCreateSheet:", error)
    throw error
  }
}

function prepareRowData(data, solicitudId) {
  const reservation = data.reservationDetails
  const currentDate = new Date().toLocaleString("es-VE")

  const areasText =
    reservation.selectedAreasDetails && reservation.selectedAreasDetails.length > 0
      ? reservation.selectedAreasDetails.map((area) => `${area.name} ($${area.price})`).join(", ")
      : "Entrada General"

  return [
    currentDate,
    solicitudId,
    "PENDIENTE",
    reservation.bookerFirstName,
    reservation.bookerLastName,
    reservation.bookerIdNumber,
    reservation.bookerEmail,
    reservation.bookerPhone,
    reservation.visitDate,
    reservation.adults,
    reservation.children,
    reservation.exonerated,
    reservation.totalPeople,
    areasText,
    reservation.totalUSD,
    reservation.finalTotalVEF,
    data.transactionReference,
    "Solicitud recibida automáticamente",
  ]
}

function sendConfirmationEmails(data, solicitudId) {
  try {
    const reservation = data.reservationDetails

    // Email al cliente
    const clientSubject = `Confirmación de Reserva - Hacienda Rincón Grande (${solicitudId})`
    const clientBody = `
Estimado/a ${reservation.bookerFirstName} ${reservation.bookerLastName},

¡Gracias por tu solicitud de reserva!

DETALLES DE TU RESERVA:
• Número de Solicitud: ${solicitudId}
• Fecha de Visita: ${reservation.visitDate}
• Personas: ${reservation.totalPeople} (${reservation.adults} adultos, ${reservation.children} niños, ${reservation.exonerated} exonerados)
• Total a Pagar: $${reservation.totalUSD} USD (Bs. ${reservation.finalTotalVEF.toLocaleString("es-VE")})
• Referencia de Pago: ${data.transactionReference}

PRÓXIMOS PASOS:
1. Verificaremos tu pago en las próximas 24 horas
2. Te contactaremos por WhatsApp para confirmar disponibilidad
3. Una vez autorizada, recibirás tu código QR de entrada

CONTACTO:
• WhatsApp: +58 412-232-8332
• Email: haciendarincongrande@gmail.com

¡Esperamos verte pronto en Hacienda Rincón Grande!

Saludos cordiales,
Equipo Hacienda Rincón Grande
    `

    GmailApp.sendEmail(reservation.bookerEmail, clientSubject, clientBody)
    console.log("Email enviado al cliente:", reservation.bookerEmail)

    // Email al administrador
    const adminSubject = `Nueva Reserva Recibida - ${solicitudId}`
    const adminBody = `
NUEVA SOLICITUD DE RESERVA RECIBIDA

ID: ${solicitudId}
Cliente: ${reservation.bookerFirstName} ${reservation.bookerLastName}
Cédula: ${reservation.bookerIdNumber}
Email: ${reservation.bookerEmail}
Teléfono: ${reservation.bookerPhone}
Fecha Visita: ${reservation.visitDate}
Personas: ${reservation.totalPeople} total
Total: $${reservation.totalUSD} USD (Bs. ${reservation.finalTotalVEF.toLocaleString("es-VE")})
Referencia: ${data.transactionReference}

Revisa Google Sheets para más detalles y autorizar la reserva.
    `

    GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody)
    console.log("Email enviado al administrador")
  } catch (error) {
    console.error("Error enviando emails:", error)
    // No lanzar error para que la reserva se procese aunque falle el email
  }
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `RES-${timestamp}-${random}`.toUpperCase()
}

function createResponse(success, message, solicitudId = null) {
  const response = {
    success: success,
    message: message,
  }

  if (solicitudId) {
    response.solicitudId = solicitudId
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)
}

// ===== FUNCIONES DE PRUEBA =====
function testCreateSheet() {
  try {
    console.log("Probando creación de hoja...")
    const sheet = getOrCreateSheet()
    console.log("✅ Hoja creada/obtenida exitosamente")
    console.log("Nombre de la hoja:", sheet.getName())
    console.log("ID del spreadsheet:", sheet.getParent().getId())
    return true
  } catch (error) {
    console.error("❌ Error en test:", error)
    return false
  }
}

function testCompleteSystem() {
  try {
    console.log("Probando sistema completo...")

    const testData = {
      reservationDetails: {
        bookerFirstName: "Juan",
        bookerLastName: "Pérez",
        bookerIdNumber: "V-12345678",
        bookerEmail: "test@example.com",
        bookerPhone: "04121234567",
        visitDate: "2024-02-15",
        adults: 2,
        children: 1,
        exonerated: 0,
        totalPeople: 3,
        totalUSD: 45,
        finalTotalVEF: 5419.07,
        selectedAreasDetails: [],
      },
      transactionReference: "TEST-123456",
    }

    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData),
      },
    }

    const result = doPost(mockEvent)
    console.log("✅ Sistema probado exitosamente")
    console.log("Resultado:", result.getContent())
    return true
  } catch (error) {
    console.error("❌ Error en test completo:", error)
    return false
  }
}

// ===== FUNCIÓN PRINCIPAL =====
function doPost(e) {
  try {
    console.log("=== INICIO doPost ===")

    if (!e || !e.postData) {
      console.log("Error: No hay datos POST")
      return createResponse(false, "No se recibieron datos")
    }

    const data = JSON.parse(e.postData.contents)
    console.log("Datos recibidos:", JSON.stringify(data, null, 2))

    // Crear o obtener la hoja
    const sheet = getOrCreateSheet()

    // Generar ID único
    const solicitudId = generateUniqueId()

    // Preparar datos para insertar
    const rowData = prepareRowData(data, solicitudId)

    // Insertar en Google Sheets
    sheet.appendRow(rowData)
    console.log("Datos insertados en Google Sheets")

    // Enviar emails
    sendConfirmationEmails(data, solicitudId)

    return createResponse(true, "Reserva procesada exitosamente", solicitudId)
  } catch (error) {
    console.error("Error en doPost:", error)
    return createResponse(false, "Error interno del servidor: " + error.message)
  }
}

// Declare the variables before using them
var SpreadsheetApp
var GmailApp
var ContentService
