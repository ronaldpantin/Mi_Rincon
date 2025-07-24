function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet()
    const data = JSON.parse(e.postData.contents)

    // Crear carpeta en Google Drive si no existe
    const folderName = "Comprobantes Hacienda Rincon Grande"
    let folder
    const folders = DriveApp.getFoldersByName(folderName)
    if (folders.hasNext()) {
      folder = folders.next()
    } else {
      folder = DriveApp.createFolder(folderName)
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
    }

    let comprobanteUrl = "Sin comprobante"

    // Si hay imagen, subirla a Google Drive
    if (data.comprobanteBase64) {
      try {
        const base64Data = data.comprobanteBase64.split(",")[1]
        const mimeType = data.comprobanteBase64.split(",")[0].split(":")[1].split(";")[0]
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const fileName = `comprobante-${data.referenciaPago}-${timestamp}`

        let extension = ".jpg"
        if (mimeType.includes("png")) extension = ".png"
        if (mimeType.includes("jpeg")) extension = ".jpg"
        if (mimeType.includes("gif")) extension = ".gif"

        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName + extension)
        const file = folder.createFile(blob)
        comprobanteUrl = `https://drive.google.com/file/d/${file.getId()}/view`

        console.log("Imagen subida exitosamente:", comprobanteUrl)
      } catch (imageError) {
        console.error("Error subiendo imagen:", imageError)
        comprobanteUrl = "Error al subir imagen"
      }
    }

    // Añadir fila con los datos
    sheet.appendRow([
      new Date(), // Fecha/Hora
      data.nombre + " " + data.apellido,
      data.email,
      data.telefono,
      data.fechaVisita,
      data.adultos,
      data.ninos,
      data.totalUSD,
      data.totalVEF,
      data.referenciaPago,
      comprobanteUrl,
      "PENDIENTE", // Estado inicial
      "", // Número de reserva (vacío inicialmente)
      "", // Notas
    ])

    // Enviar email de notificación
    enviarNotificacionEmail(data, comprobanteUrl)

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
  } catch (error) {
    console.error("Error en doPost:", error)
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
  }
}

function enviarNotificacionEmail(data, comprobanteUrl) {
  try {
    const destinatario = "haciendarincongrande@gmail.com"
    const asunto = `Nueva Reserva Pendiente - ${data.nombre} ${data.apellido}`

    const cuerpoEmail = `
    Nueva solicitud de reserva recibida:
    
    DATOS DEL CLIENTE:
    • Nombre: ${data.nombre} ${data.apellido}
    • Email: ${data.email}
    • Teléfono: ${data.telefono}
    
    DETALLES DE LA RESERVA:
    • Fecha de visita: ${data.fechaVisita}
    • Adultos: ${data.adultos}
    • Niños: ${data.ninos}
    • Total USD: $${data.totalUSD}
    • Total VEF: Bs. ${data.totalVEF}
    
    PAGO:
    • Referencia: ${data.referenciaPago}
    • Comprobante: ${comprobanteUrl}
    
    Para AUTORIZAR esta reserva:
    1. Ve a Google Sheets
    2. Cambia el estado de "PENDIENTE" a "AUTORIZADO"
    3. El sistema enviará automáticamente el QR al cliente
    `

    MailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("Email de notificación enviado")
  } catch (emailError) {
    console.error("Error enviando email:", emailError)
  }
}

// NUEVA FUNCIÓN: Detectar cambios en el estado
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet()
    const range = e.range
    const row = range.getRow()
    const col = range.getColumn()

    // Verificar si se editó la columna de Estado (columna 12)
    if (col === 12 && row > 1) {
      // row > 1 para excluir headers
      const nuevoEstado = range.getValue()

      if (nuevoEstado === "AUTORIZADO") {
        console.log(`Reserva en fila ${row} fue AUTORIZADA`)
        procesarAutorizacion(sheet, row)
      }
    }
  } catch (error) {
    console.error("Error en onEdit:", error)
  }
}

function procesarAutorizacion(sheet, row) {
  try {
    // Obtener datos de la fila
    const datos = sheet.getRange(row, 1, 1, 14).getValues()[0]

    const fechaHora = datos[0]
    const nombreCompleto = datos[1]
    const email = datos[2]
    const telefono = datos[3]
    const fechaVisita = datos[4]
    const adultos = datos[5]
    const ninos = datos[6]
    const totalUSD = datos[7]
    const totalVEF = datos[8]
    const referenciaPago = datos[9]
    const comprobanteUrl = datos[10]
    const estado = datos[11]
    let numeroReserva = datos[12]
    const notas = datos[13]

    // Generar número de reserva si no existe
    if (!numeroReserva) {
      numeroReserva = `HRG-${Date.now().toString().slice(-6)}`
      sheet.getRange(row, 13).setValue(numeroReserva) // Columna 13 = Número Reserva
    }

    // Generar QR Code
    const qrData = `Reserva: ${numeroReserva}\nNombre: ${nombreCompleto}\nFecha: ${fechaVisita}\nPersonas: ${adultos} adultos, ${ninos} niños\nTotal: $${totalUSD}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    // Enviar confirmación por email
    enviarConfirmacionEmail(email, nombreCompleto, numeroReserva, fechaVisita, adultos, ninos, totalUSD, qrUrl)

    // Enviar WhatsApp (simulado por ahora)
    console.log(`WhatsApp a ${telefono}: Tu reserva ${numeroReserva} ha sido confirmada. QR: ${qrUrl}`)

    // Actualizar notas
    const nuevasNotas = `${notas ? notas + " | " : ""}Autorizado el ${new Date().toLocaleString("es-VE")} - QR enviado`
    sheet.getRange(row, 14).setValue(nuevasNotas) // Columna 14 = Notas

    console.log(`Reserva ${numeroReserva} procesada exitosamente`)
  } catch (error) {
    console.error("Error procesando autorización:", error)
  }
}

function enviarConfirmacionEmail(email, nombre, numeroReserva, fechaVisita, adultos, ninos, totalUSD, qrUrl) {
  try {
    const asunto = `¡Reserva Confirmada! ${numeroReserva} - Hacienda Rincón Grande`

    const cuerpoEmail = `
    ¡Hola ${nombre}!
    
    ¡Tu reserva ha sido CONFIRMADA! 🎉
    
    DETALLES DE TU RESERVA:
    • Número de Reserva: ${numeroReserva}
    • Fecha de Visita: ${fechaVisita}
    • Personas: ${adultos} adultos, ${ninos} niños
    • Total Pagado: $${totalUSD}
    
    IMPORTANTE:
    • Presenta este código QR al llegar al parque
    • Horario: 8:00 AM - 6:00 PM
    • Ubicación: Hacienda Paya, Turmero, Aragua
    
    Tu código QR: ${qrUrl}
    
    ¡Te esperamos en Hacienda Rincón Grande!
    
    Contacto: +58 0412 232 8332
    `

    MailApp.sendEmail(email, asunto, cuerpoEmail)
    console.log(`Email de confirmación enviado a ${email}`)
  } catch (error) {
    console.error("Error enviando confirmación:", error)
  }
}

// Función para probar el sistema
function testAutorizacion() {
  const sheet = SpreadsheetApp.getActiveSheet()
  // Simular autorización de la fila 2
  procesarAutorizacion(sheet, 2)
}
