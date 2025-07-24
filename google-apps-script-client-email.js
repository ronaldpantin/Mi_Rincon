function doPost(e) {
  console.log("=== INICIO DE doPost ===")

  try {
    // Verificar que lleguen datos
    if (!e || !e.postData || !e.postData.contents) {
      console.error("❌ No se recibieron datos en la petición")
      return ContentService.createTextOutput(
        JSON.stringify({
          error: "No se recibieron datos",
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    console.log("📥 Datos recibidos (primeros 200 caracteres):", e.postData.contents.substring(0, 200))

    const data = JSON.parse(e.postData.contents)
    console.log("✅ JSON parseado correctamente")
    console.log("👤 Cliente:", data.nombre, data.apellido)
    console.log("📧 Email del cliente:", data.email)
    console.log("💰 Total USD:", data.totalUSD)

    const sheet = SpreadsheetApp.getActiveSheet()
    console.log("📊 Hoja de cálculo obtenida:", sheet.getName())

    // Crear carpeta en Google Drive si no existe
    const folderName = "Comprobantes Hacienda Rincon Grande"
    let folder
    const folders = DriveApp.getFoldersByName(folderName)
    if (folders.hasNext()) {
      folder = folders.next()
      console.log("📁 Carpeta existente encontrada")
    } else {
      folder = DriveApp.createFolder(folderName)
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
      console.log("📁 Nueva carpeta creada")
    }

    let comprobanteUrl = "Sin comprobante"

    // Procesar imagen si existe
    if (data.comprobanteBase64) {
      console.log("🖼️ Procesando imagen...")
      console.log("Tamaño de imagen:", data.comprobanteBase64.length, "caracteres")

      try {
        if (!data.comprobanteBase64.includes("data:image")) {
          console.log("⚠️ Formato de imagen incorrecto")
          comprobanteUrl = "Error: Formato de imagen incorrecto"
        } else {
          const parts = data.comprobanteBase64.split(",")
          const base64Data = parts.length > 1 ? parts[1] : parts[0]
          let mimeType = "image/jpeg"

          if (data.comprobanteBase64.includes("data:image/")) {
            mimeType = data.comprobanteBase64.split(";")[0].split(":")[1]
          }

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          const fileName = `comprobante-${data.referenciaPago}-${timestamp}`

          let extension = ".jpg"
          if (mimeType.includes("png")) extension = ".png"
          if (mimeType.includes("jpeg")) extension = ".jpg"
          if (mimeType.includes("gif")) extension = ".gif"

          const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName + extension)
          const file = folder.createFile(blob)
          comprobanteUrl = `https://drive.google.com/file/d/${file.getId()}/view`

          console.log("✅ Imagen subida exitosamente:", comprobanteUrl)
        }
      } catch (imageError) {
        console.error("❌ Error subiendo imagen:", imageError)
        comprobanteUrl = `Error al subir imagen: ${imageError.message}`
      }
    } else {
      console.log("ℹ️ No se recibió imagen")
    }

    // Generar número de reserva único INMEDIATAMENTE
    const numeroReserva = `HRG-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`
    console.log("🎫 Número de reserva generado:", numeroReserva)

    // Añadir fila a la hoja CON el número de reserva ya incluido
    console.log("📝 Añadiendo fila a la hoja...")
    const newRow = [
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
      "CONFIRMADO", // L: Estado (DIRECTAMENTE CONFIRMADO)
      numeroReserva, // M: Número de Reserva
      `Reserva confirmada automáticamente el ${new Date().toLocaleString("es-VE")}`, // N: Notas
    ]

    sheet.appendRow(newRow)
    console.log("✅ Fila añadida exitosamente con estado CONFIRMADO")

    // Generar QR Code con información completa
    const qrData = `HACIENDA RINCON GRANDE
Reserva: ${numeroReserva}
Cliente: ${data.nombre} ${data.apellido}
Fecha: ${data.fechaVisita}
Personas: ${data.adultos} adultos, ${data.ninos} niños
Total: $${data.totalUSD}
Ref: ${data.referenciaPago}
Estado: CONFIRMADO`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrData)}`
    console.log("📱 QR generado:", qrUrl)

    // Enviar email de confirmación DIRECTAMENTE AL CLIENTE
    console.log("📧 Enviando email de confirmación al cliente...")
    try {
      enviarConfirmacionCliente(
        data.email, // Email del cliente
        data.nombre,
        numeroReserva,
        data.fechaVisita,
        data.adultos,
        data.ninos,
        data.totalUSD,
        qrUrl,
        data.telefono,
      )
      console.log("✅ Email de confirmación enviado al cliente")
    } catch (emailError) {
      console.error("❌ Error enviando email al cliente:", emailError)
    }

    // OPCIONAL: También enviar notificación al admin (puedes comentar esto si no lo quieres)
    console.log("📧 Enviando notificación al admin...")
    try {
      enviarNotificacionAdmin(data, comprobanteUrl, numeroReserva)
      console.log("✅ Notificación enviada al admin")
    } catch (adminEmailError) {
      console.error("❌ Error enviando notificación al admin:", adminEmailError)
    }

    console.log("=== FIN EXITOSO DE doPost ===")
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Reserva confirmada exitosamente",
        numeroReserva: numeroReserva,
        qrUrl: qrUrl,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ ERROR CRÍTICO en doPost:", error)
    console.error("Stack trace:", error.stack)

    return ContentService.createTextOutput(
      JSON.stringify({
        error: error.toString(),
        stack: error.stack,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// EMAIL AL CLIENTE (confirmación con QR) - FUNCIÓN PRINCIPAL
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

    GmailApp.sendEmail(email, asunto, cuerpoEmail)
    console.log(`✅ Email de confirmación enviado al cliente: ${email}`)
  } catch (error) {
    console.error("❌ Error enviando confirmación al cliente:", error)
    throw error
  }
}

// EMAIL AL ADMIN (notificación opcional)
function enviarNotificacionAdmin(data, comprobanteUrl, numeroReserva) {
  try {
    // *** REEMPLAZA CON TU EMAIL REAL SI QUIERES RECIBIR NOTIFICACIONES ***
    const destinatario = "haciendarincongrande@gmail.com" // Cambia por tu email

    const asunto = `✅ Nueva Reserva Confirmada - ${data.nombre} ${data.apellido} - ${numeroReserva}`

    const cuerpoEmail = `
🏞️ NUEVA RESERVA CONFIRMADA AUTOMÁTICAMENTE

👤 DATOS DEL CLIENTE:
• Nombre: ${data.nombre} ${data.apellido}
• Email: ${data.email}
• Teléfono: ${data.telefono}

📅 DETALLES DE LA RESERVA:
• Número de Reserva: ${numeroReserva}
• Fecha de visita: ${data.fechaVisita}
• Adultos: ${data.adultos}
• Niños: ${data.ninos}
• Total USD: $${data.totalUSD}
• Total VEF: Bs. ${data.totalVEF}

💳 INFORMACIÓN DE PAGO:
• Referencia: ${data.referenciaPago}
• Comprobante: ${comprobanteUrl}

✅ ESTADO: CONFIRMADO AUTOMÁTICAMENTE
📧 El cliente ya recibió su email de confirmación con el QR

---
📧 Sistema de Reservas Hacienda Rincón Grande
🕐 ${new Date().toLocaleString("es-VE")}
`

    GmailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("📧 Notificación enviada al admin:", destinatario)
  } catch (error) {
    console.error("❌ Error enviando notificación admin:", error)
    throw error
  }
}

// Función de prueba
function testEmailCliente() {
  console.log("🧪 Probando email al cliente...")

  try {
    const testData = {
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com", // CAMBIA POR UN EMAIL REAL PARA PROBAR
      telefono: "123456789",
      fechaVisita: "2024-01-15",
      adultos: 2,
      ninos: 1,
      totalUSD: 15,
      totalVEF: 1500,
      referenciaPago: "TEST123",
    }

    const numeroReserva = "HRG-TEST-001"
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=TEST"

    enviarConfirmacionCliente(
      testData.email,
      testData.nombre,
      numeroReserva,
      testData.fechaVisita,
      testData.adultos,
      testData.ninos,
      testData.totalUSD,
      qrUrl,
      testData.telefono,
    )

    console.log("✅ Prueba de email al cliente completada")
  } catch (error) {
    console.error("❌ Error en prueba:", error)
  }
}
