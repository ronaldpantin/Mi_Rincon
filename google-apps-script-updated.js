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
      // Hacer la carpeta accesible para cualquiera con el enlace
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
    }

    let comprobanteUrl = "Sin comprobante"

    // Si hay imagen, subirla a Google Drive
    if (data.comprobanteBase64) {
      try {
        // Extraer el tipo de archivo y los datos base64
        const base64Data = data.comprobanteBase64.split(",")[1] // Remover el prefijo data:image/...;base64,
        const mimeType = data.comprobanteBase64.split(",")[0].split(":")[1].split(";")[0]

        // Crear nombre único para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const fileName = `comprobante-${data.referenciaPago}-${timestamp}`

        // Determinar extensión del archivo
        let extension = ".jpg" // por defecto
        if (mimeType.includes("png")) extension = ".png"
        if (mimeType.includes("jpeg")) extension = ".jpg"
        if (mimeType.includes("gif")) extension = ".gif"

        // Convertir base64 a blob y crear archivo
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName + extension)
        const file = folder.createFile(blob)

        // Obtener URL pública del archivo
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
      comprobanteUrl, // URL del comprobante en Google Drive
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
    const destinatario = "haciendarincongrande@gmail.com" // Cambia por tu email
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
    
    Por favor, revisa el comprobante y autoriza la reserva.
    `

    MailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("Email de notificación enviado")
  } catch (emailError) {
    console.error("Error enviando email:", emailError)
  }
}
