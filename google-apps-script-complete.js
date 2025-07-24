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
      new Date(), // A: Fecha/Hora
      data.nombre + " " + data.apellido, // B: Nombre Completo
      data.email, // C: Email
      data.telefono, // D: Teléfono
      data.fechaVisita, // E: Fecha Visita
      data.adultos, // F: Adultos
      data.ninos, // G: Niños
      data.totalUSD, // H: Total USD
      data.totalVEF, // I: Total VEF
      data.referenciaPago, // J: Referencia Pago
      comprobanteUrl, // K: Comprobante URL
      "PENDIENTE", // L: Estado
      "", // M: Número de Reserva
      "", // N: Notas
    ])

    // Enviar email de notificación al admin
    enviarNotificacionAdmin(data, comprobanteUrl)

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
  } catch (error) {
    console.error("Error en doPost:", error)
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
  }
}

// NUEVA FUNCIÓN: Detectar cambios en el estado (AUTORIZACIÓN AUTOMÁTICA)
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet()
    const range = e.range
    const row = range.getRow()
    const col = range.getColumn()

    // Verificar si se editó la columna de Estado (columna L = 12)
    if (col === 12 && row > 1) {
      const nuevoEstado = range.getValue()

      if (nuevoEstado === "AUTORIZADO") {
        console.log(`🎉 Reserva en fila ${row} fue AUTORIZADA`)
        procesarAutorizacion(sheet, row)
      }
    }
  } catch (error) {
    console.error("Error en onEdit:", error)
  }
}

// FUNCIÓN PRINCIPAL: Procesar autorización y enviar confirmación al cliente
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

    // Generar número de reserva único
    if (!numeroReserva) {
      numeroReserva = `HRG-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`
      sheet.getRange(row, 13).setValue(numeroReserva) // Columna M
    }

    // Generar QR Code con información completa
    const qrData = `HACIENDA RINCON GRANDE
Reserva: ${numeroReserva}
Cliente: ${nombreCompleto}
Fecha: ${fechaVisita}
Personas: ${adultos} adultos, ${ninos} niños
Total: $${totalUSD}
Ref: ${referenciaPago}
Estado: CONFIRMADO`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrData)}`

    // Enviar email de confirmación al CLIENTE
    enviarConfirmacionCliente(
      email,
      nombreCompleto,
      numeroReserva,
      fechaVisita,
      adultos,
      ninos,
      totalUSD,
      qrUrl,
      telefono,
    )

    // Actualizar notas en la hoja
    const nuevasNotas = `${notas ? notas + " | " : ""}✅ AUTORIZADO ${new Date().toLocaleString("es-VE")} - Email y QR enviados al cliente`
    sheet.getRange(row, 14).setValue(nuevasNotas) // Columna N

    console.log(`✅ Reserva ${numeroReserva} procesada y confirmada al cliente`)
  } catch (error) {
    console.error("❌ Error procesando autorización:", error)

    // Actualizar notas con el error
    const errorNote = `❌ ERROR ${new Date().toLocaleString("es-VE")}: ${error.toString()}`
    sheet.getRange(row, 14).setValue(errorNote)
  }
}

// EMAIL AL ADMIN (notificación de nueva reserva)
function enviarNotificacionAdmin(data, comprobanteUrl) {
  try {
    const destinatario = "haciendarincongrande@gmail.com" // CAMBIA POR TU EMAIL
    const asunto = `🔔 Nueva Reserva Pendiente - ${data.nombre} ${data.apellido}`

    const cuerpoEmail = `
🏞️ NUEVA SOLICITUD DE RESERVA RECIBIDA

👤 DATOS DEL CLIENTE:
• Nombre: ${data.nombre} ${data.apellido}
• Email: ${data.email}
• Teléfono: ${data.telefono}

📅 DETALLES DE LA RESERVA:
• Fecha de visita: ${data.fechaVisita}
• Adultos: ${data.adultos}
• Niños: ${data.ninos}
• Total USD: $${data.totalUSD}
• Total VEF: Bs. ${data.totalVEF}

💳 INFORMACIÓN DE PAGO:
• Referencia: ${data.referenciaPago}
• Comprobante: ${comprobanteUrl}

⚡ PARA AUTORIZAR ESTA RESERVA:
1. Ve a Google Sheets
2. Busca esta fila en la hoja
3. Cambia el estado de "PENDIENTE" a "AUTORIZADO"
4. El sistema enviará automáticamente el email de confirmación y QR al cliente

---
📧 Sistema de Reservas Hacienda Rincón Grande
🕐 ${new Date().toLocaleString("es-VE")}
`

    MailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("📧 Email de notificación enviado al admin")
  } catch (error) {
    console.error("❌ Error enviando notificación admin:", error)
  }
}

// EMAIL AL CLIENTE (confirmación con QR)
function enviarConfirmacionCliente(
  email,
  nombre,
  numeroReserva,
  fechaVisita,
  adultos,
  ninos,
  totalUSD,
  qrUrl,
  telefono,
) {
  try {
    const asunto = `🎉 ¡Reserva Confirmada! ${numeroReserva} - Hacienda Rincón Grande`

    const cuerpoEmail = `
🏞️ ¡Hola ${nombre}!

🎉 ¡Tu reserva ha sido CONFIRMADA exitosamente!

📋 DETALLES DE TU RESERVA:
• 🎫 Número de Reserva: ${numeroReserva}
• 📅 Fecha de Visita: ${fechaVisita}
• 👥 Personas: ${adultos} adultos, ${ninos} niños
• 💰 Total Pagado: $${totalUSD}

📱 CÓDIGO QR DE ENTRADA:
${qrUrl}

⚠️ IMPORTANTE - INSTRUCCIONES:
• ✅ GUARDA este email y el código QR
• ✅ PRESENTA el QR al llegar al parque
• ✅ Horario: 8:00 AM - 6:00 PM (Lun-Dom)
• ✅ Ubicación: Hacienda Paya, Turmero, Aragua

🚗 CÓMO LLEGAR:
• Usa GPS: Hacienda Paya, Turmero, Aragua
• Antes del puente de Paya, cruza a mano derecha
• Busca el letrero "Hacienda Rincón Grande"

📞 CONTACTO:
• WhatsApp: +58 0412 232 8332
• Email: haciendarincongrande@gmail.com

¡Te esperamos en Hacienda Rincón Grande para que disfrutes de un día increíble en la naturaleza!

---
🌿 Hacienda Rincón Grande
📧 Sistema de Reservas Automático
🕐 ${new Date().toLocaleString("es-VE")}
`

    MailApp.sendEmail(email, asunto, cuerpoEmail)
    console.log(`✅ Email de confirmación enviado al cliente: ${email}`)
  } catch (error) {
    console.error("❌ Error enviando confirmación al cliente:", error)
    throw error // Re-lanzar el error para que se registre en las notas
  }
}

// FUNCIÓN DE PRUEBA: Simular autorización
function testAutorizacion() {
  const sheet = SpreadsheetApp.getActiveSheet()
  console.log("🧪 Probando autorización en fila 2...")
  procesarAutorizacion(sheet, 2)
}

// FUNCIÓN DE PRUEBA: Email simple
function testEmailSimple() {
  try {
    const destinatario = "haciendarincongrande@gmail.com" // CAMBIA POR TU EMAIL
    const asunto = "✅ PRUEBA - Sistema Funcionando"
    const mensaje = "Si recibes este email, el sistema está funcionando correctamente."

    MailApp.sendEmail(destinatario, asunto, mensaje)
    console.log("✅ Email de prueba enviado")
    return "SUCCESS"
  } catch (error) {
    console.error("❌ Error:", error)
    return "ERROR: " + error.toString()
  }
}
