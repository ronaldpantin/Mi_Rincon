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
    console.log("📧 Email:", data.email)
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

    // Añadir fila a la hoja
    console.log("📝 Añadiendo fila a la hoja...")
    const newRow = [
      new Date(),
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
      "PENDIENTE",
      "",
      "",
    ]

    sheet.appendRow(newRow)
    console.log("✅ Fila añadida exitosamente")

    // Enviar email de notificación
    console.log("📧 Enviando email de notificación...")
    try {
      enviarNotificacionAdmin(data, comprobanteUrl)
      console.log("✅ Email enviado exitosamente")
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError)
    }

    console.log("=== FIN EXITOSO DE doPost ===")
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Reserva procesada correctamente",
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

function enviarNotificacionAdmin(data, comprobanteUrl) {
  try {
    // *** REEMPLAZA CON TU EMAIL REAL ***
    const destinatario = "TU_EMAIL_AQUI@gmail.com"

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

---
📧 Sistema de Reservas Hacienda Rincón Grande
🕐 ${new Date().toLocaleString("es-VE")}
`

    GmailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("📧 Email enviado a:", destinatario)
  } catch (error) {
    console.error("❌ Error enviando email:", error)
    throw error
  }
}

// Función de prueba simple
function testBasico() {
  console.log("🧪 Iniciando prueba básica...")

  try {
    const sheet = SpreadsheetApp.getActiveSheet()
    console.log("✅ Acceso a hoja:", sheet.getName())

    const testData = {
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      telefono: "123456789",
      fechaVisita: "2024-01-15",
      adultos: 2,
      ninos: 1,
      totalUSD: 15,
      totalVEF: 1500,
      referenciaPago: "TEST123",
    }

    enviarNotificacionAdmin(testData, "https://test.com")
    console.log("✅ Prueba completada exitosamente")
  } catch (error) {
    console.error("❌ Error en prueba:", error)
  }
}
