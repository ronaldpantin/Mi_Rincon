function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet()
    const data = JSON.parse(e.postData.contents)

    // LOG: Verificar si llega la imagen
    console.log("=== DIAGNÓSTICO DE IMAGEN ===")
    console.log("¿Tiene comprobanteBase64?", !!data.comprobanteBase64)
    if (data.comprobanteBase64) {
      console.log("Tamaño de imagen (caracteres):", data.comprobanteBase64.length)
      console.log("Primeros 50 caracteres:", data.comprobanteBase64.substring(0, 50))
    }
    console.log("===============================")

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
        console.log("🖼️ Procesando imagen...")

        // Verificar formato de la imagen
        if (!data.comprobanteBase64.includes("data:image")) {
          console.log("⚠️ Formato de imagen incorrecto")
          comprobanteUrl = "Error: Formato de imagen incorrecto"
        } else {
          // Extraer la parte base64 (después de la coma)
          const parts = data.comprobanteBase64.split(",")
          const base64Data = parts.length > 1 ? parts[1] : parts[0]

          // Determinar el tipo MIME
          let mimeType = "image/jpeg" // Valor predeterminado
          if (data.comprobanteBase64.includes("data:image/")) {
            mimeType = data.comprobanteBase64.split(";")[0].split(":")[1]
          }

          console.log("MIME Type:", mimeType)
          console.log("Base64 data length:", base64Data.length)

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          const fileName = `comprobante-${data.referenciaPago}-${timestamp}`

          let extension = ".jpg"
          if (mimeType.includes("png")) extension = ".png"
          if (mimeType.includes("jpeg")) extension = ".jpg"
          if (mimeType.includes("gif")) extension = ".gif"

          // Crear blob y subir archivo
          const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName + extension)
          const file = folder.createFile(blob)
          comprobanteUrl = `https://drive.google.com/file/d/${file.getId()}/view`

          console.log("✅ Imagen subida exitosamente:", comprobanteUrl)
        }
      } catch (imageError) {
        console.error("❌ Error subiendo imagen:", imageError)
        console.error("Detalles del error:", imageError.message)
        comprobanteUrl = `Error al subir imagen: ${imageError.message}`
      }
    } else {
      console.log("⚠️ No se recibió imagen en la solicitud")
      comprobanteUrl = "No se recibió imagen"
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

// El resto del código permanece igual...

function enviarNotificacionAdmin(data, comprobanteUrl) {
  // Implementación de la función enviarNotificacionAdmin
}
