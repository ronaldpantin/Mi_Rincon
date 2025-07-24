function doPost(e) {
  try {
    console.log("🚀 Iniciando procesamiento de reserva simplificada...")

    // Obtener la hoja de cálculo activa
    const sheet = SpreadsheetApp.getActiveSheet()

    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents)
    console.log("📥 Datos recibidos:", JSON.stringify(data, null, 2))

    // Verificar que tenemos los datos necesarios
    if (!data.nombre || !data.email || !data.referenciaPago) {
      throw new Error("Faltan datos obligatorios: nombre, email o referencia de pago")
    }

    // Preparar la fila de datos según la estructura de tu Google Sheet
    const nuevaFila = [
      new Date(), // A: FechaHora
      `${data.nombre} ${data.apellido}`, // B: Nombre Completo
      data.email, // C: Email
      data.telefono, // D: Teléfono
      data.fechaVisita, // E: Fecha Visita
      data.adultos || 0, // F: Adultos
      data.ninos || 0, // G: Niños
      data.totalUSD || 0, // H: Total USD
      data.totalVEF || 0, // I: Total VEF
      data.referenciaPago, // J: Referencia Pago
      "SIN IMAGEN - PROCESO SIMPLIFICADO", // K: Comprobante
      "PENDIENTE", // L: Estado
      "", // M: Número Reserva (se asigna al autorizar)
      `Solicitud ID: ${data.solicitudId} - Registrada automáticamente`, // N: Notas
    ]

    // Añadir la fila a la hoja
    sheet.appendRow(nuevaFila)
    console.log("✅ Fila añadida a la hoja de cálculo")

    // Enviar email de notificación al administrador
    try {
      const destinatario = "haciendarincongrande@gmail.com" // Cambia por tu email real
      const asunto = `🔔 Nueva Reserva Simplificada - ${data.nombre} ${data.apellido}`

      const cuerpoEmail = `
¡Nueva solicitud de reserva recibida!

═══════════════════════════════════════
📋 INFORMACIÓN DE LA SOLICITUD
═══════════════════════════════════════
• ID de Solicitud: ${data.solicitudId}
• Fecha de Registro: ${new Date().toLocaleString("es-VE")}
• Tipo: Proceso Simplificado (sin imagen)

👤 DATOS DEL CLIENTE:
• Nombre: ${data.nombre} ${data.apellido}
• Email: ${data.email}
• Teléfono: ${data.telefono}

📅 DETALLES DE LA RESERVA:
• Fecha de Visita: ${data.fechaVisita}
• Adultos: ${data.adultos}
• Niños: ${data.ninos}
• Total Personas: ${(data.adultos || 0) + (data.ninos || 0)}

💰 INFORMACIÓN DE PAGO:
• Total USD: $${data.totalUSD}
• Total VEF: Bs. ${data.totalVEF}
• Referencia de Pago: ${data.referenciaPago}

📞 PRÓXIMOS PASOS:
1. Ve a tu Google Sheet "Reservas Hacienda Rincón Grande"
2. Verifica el pago con la referencia: ${data.referenciaPago}
3. Contacta al cliente por WhatsApp: ${data.telefono}
4. Cambia el estado de "PENDIENTE" a "AUTORIZADA"
5. El sistema enviará automáticamente el email de confirmación

═══════════════════════════════════════
⚡ PARA AUTORIZAR LA RESERVA:
═══════════════════════════════════════
1. Abre tu Google Sheet
2. Busca la fila con ID: ${data.solicitudId}
3. Cambia la columna "Estado" de "PENDIENTE" a "AUTORIZADA"
4. El cliente recibirá automáticamente:
   - Email con número de reserva
   - Código QR para la visita
   - Detalles completos de la reserva

Link directo a tu Google Sheet:
https://docs.google.com/spreadsheets/d/1ZZ9Xj3T-DU4sQopWlFMVcCJslPcXj3FwOnstNOzUzo/edit
      `

      MailApp.sendEmail(destinatario, asunto, cuerpoEmail)
      console.log("📧 Email de notificación enviado exitosamente")
    } catch (emailError) {
      console.error("❌ Error enviando email de notificación:", emailError)
      // No lanzamos error aquí para que la reserva se procese aunque falle el email
    }

    // Respuesta exitosa
    const respuesta = {
      success: true,
      message: "Reserva procesada exitosamente",
      solicitudId: data.solicitudId,
      timestamp: new Date().toISOString(),
    }

    console.log("🎉 Procesamiento completado exitosamente")
    return ContentService.createTextOutput(JSON.stringify(respuesta)).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ Error en doPost:", error)

    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
    }

    return ContentService.createTextOutput(JSON.stringify(errorResponse)).setMimeType(ContentService.MimeType.JSON)
  }
}

// Función para autorizar una reserva manualmente desde Google Sheets
function autorizarReserva(fila) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet()

    // Generar número de reserva único
    const numeroReserva = `RES-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`

    // Actualizar la fila especificada
    sheet.getRange(fila, 12).setValue("AUTORIZADA") // Columna L: Estado
    sheet.getRange(fila, 13).setValue(numeroReserva) // Columna M: Número Reserva
    sheet.getRange(fila, 14).setValue(`Autorizada el ${new Date().toLocaleString("es-VE")} - Número: ${numeroReserva}`) // Columna N: Notas

    // Obtener datos del cliente para enviar confirmación
    const nombre = sheet.getRange(fila, 2).getValue() // Columna B: Nombre Completo
    const email = sheet.getRange(fila, 3).getValue() // Columna C: Email
    const telefono = sheet.getRange(fila, 4).getValue() // Columna D: Teléfono
    const fechaVisita = sheet.getRange(fila, 5).getValue() // Columna E: Fecha Visita
    const adultos = sheet.getRange(fila, 6).getValue() // Columna F: Adultos
    const ninos = sheet.getRange(fila, 7).getValue() // Columna G: Niños

    // Enviar email de confirmación al cliente
    enviarConfirmacionCliente(email, nombre, numeroReserva, fechaVisita, telefono, adultos, ninos)

    console.log(`✅ Reserva en fila ${fila} autorizada con número ${numeroReserva}`)
    return { success: true, numeroReserva: numeroReserva }
  } catch (error) {
    console.error("❌ Error autorizando reserva:", error)
    return { success: false, error: error.toString() }
  }
}

// Función para enviar confirmación al cliente con QR
function enviarConfirmacionCliente(email, nombre, numeroReserva, fechaVisita, telefono, adultos, ninos) {
  try {
    const asunto = `🎉 ¡RESERVA CONFIRMADA! - Hacienda Rincón Grande - ${numeroReserva}`

    // Generar código QR simple (texto que se puede convertir a QR)
    const qrData = `RESERVA:${numeroReserva}|FECHA:${fechaVisita}|NOMBRE:${nombre}|PERSONAS:${adultos + ninos}`

    const cuerpoEmail = `
¡Hola ${nombre}!

🎉 ¡EXCELENTES NOTICIAS! Tu reserva ha sido CONFIRMADA y AUTORIZADA.

═══════════════════════════════════════
🎫 TU RESERVA CONFIRMADA
═══════════════════════════════════════
• NÚMERO DE RESERVA: ${numeroReserva}
• FECHA DE VISITA: ${fechaVisita}
• ADULTOS: ${adultos}
• NIÑOS: ${ninos}
• TOTAL PERSONAS: ${adultos + ninos}
• ESTADO: ✅ CONFIRMADA Y AUTORIZADA

📱 CÓDIGO QR PARA TU VISITA:
${qrData}

(Presenta este código o el número de reserva en la entrada)

═══════════════════════════════════════
📍 INFORMACIÓN DE LA HACIENDA
═══════════════════════════════════════
🏡 Hacienda Rincón Grande
📍 Carretera Nacional Maracay-Choroní
   Estado Aragua, Venezuela

⏰ HORARIOS DE ATENCIÓN:
• Lunes a Domingo: 8:00 AM - 6:00 PM
• Te recomendamos llegar temprano para disfrutar al máximo

📞 INFORMACIÓN DE CONTACTO:
• WhatsApp: +58 412-232-8332
• Email: haciendarincongrande@gmail.com
• Instagram: @haciendarincongrande

═══════════════════════════════════════
🎒 PREPARATIVOS PARA TU VISITA
═══════════════════════════════════════
QUÉ TRAER:
✓ Ropa cómoda y zapatos cerrados
✓ Traje de baño (si planeas usar la piscina)
✓ Protector solar y repelente de insectos
✓ Cámara para capturar los mejores momentos
✓ Este email con tu número de reserva
✓ Documento de identidad

🌟 ACTIVIDADES DISPONIBLES:
• 🐎 Paseos a caballo
• 🥾 Senderismo por senderos naturales
• 🏊‍♀️ Piscina y áreas de recreación
• 🦋 Observación de la naturaleza
• 📸 Fotografía en paisajes únicos
• 🍽️ Restaurante con comida típica

═══════════════════════════════════════
⚠️ POLÍTICAS IMPORTANTES
═══════════════════════════════════════
• Llegada: A partir de las 8:00 AM
• Respeta la naturaleza y los animales
• Mantén limpio el ambiente
• Sigue las indicaciones del personal
• Presenta tu reserva en la entrada

═══════════════════════════════════════
🆘 ¿NECESITAS AYUDA?
═══════════════════════════════════════
Si tienes alguna pregunta o necesitas información adicional:

📱 WhatsApp: +58 412-232-8332
📧 Email: haciendarincongrande@gmail.com

Nuestro equipo está disponible de 8:00 AM a 6:00 PM
para ayudarte con cualquier consulta.

═══════════════════════════════════════
¡Te esperamos para vivir una experiencia inolvidable 
en contacto con la naturaleza! 🌿🐎

Gracias por elegir Hacienda Rincón Grande.
═══════════════════════════════════════

Equipo Hacienda Rincón Grande 🌿🐎
"Donde la naturaleza y la aventura se encuentran"

---
NÚMERO DE RESERVA: ${numeroReserva}
FECHA DE VISITA: ${fechaVisita}
ESTADO: CONFIRMADA ✅
    `

    MailApp.sendEmail(email, asunto, cuerpoEmail)
    console.log(`📧 Confirmación con QR enviada a ${email} para reserva ${numeroReserva}`)

    // También enviar notificación al administrador
    const asuntoAdmin = `✅ Reserva ${numeroReserva} AUTORIZADA - Cliente notificado`
    const cuerpoAdmin = `
La reserva ${numeroReserva} ha sido autorizada exitosamente.

Cliente: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Fecha: ${fechaVisita}

✅ Email de confirmación enviado al cliente
✅ Código QR generado: ${qrData}

El cliente ya tiene toda la información necesaria para su visita.
    `

    MailApp.sendEmail("haciendarincongrande@gmail.com", asuntoAdmin, cuerpoAdmin)
  } catch (error) {
    console.error("❌ Error enviando confirmación al cliente:", error)
  }
}

// Función de prueba para verificar que todo funciona
function testFunction() {
  console.log("🧪 Función de prueba ejecutada correctamente")
  console.log("📊 Acceso a hoja:", SpreadsheetApp.getActiveSheet().getName())
  console.log("📋 Número de filas:", SpreadsheetApp.getActiveSheet().getLastRow())
  return "OK - Sistema simplificado funcionando con tu estructura de Google Sheet"
}

// Función para probar autorización (cambia el número de fila por uno real)
function testAutorizacion() {
  // IMPORTANTE: Cambia el número 2 por la fila que quieras autorizar
  // La fila 2 sería la primera reserva (después del header)
  return autorizarReserva(2)
}

// Función para probar envío de email
function testEmail() {
  try {
    const testEmail = "tu-email-de-prueba@gmail.com" // Cambia por tu email
    enviarConfirmacionCliente(testEmail, "Juan Pérez", "RES-123456-AB", "2024-01-15", "+58 412-123-4567", 2, 1)
    return "Email de prueba enviado exitosamente"
  } catch (error) {
    return `Error enviando email de prueba: ${error.toString()}`
  }
}

// Función para autorizar automáticamente cuando se cambia el estado en la hoja
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet()
    const range = e.range
    const row = range.getRow()
    const col = range.getColumn()

    // Verificar si se editó la columna L (Estado) - columna 12
    if (col === 12 && row > 1) {
      const nuevoValor = range.getValue().toString().toUpperCase()

      // Si se cambió a "AUTORIZADA", procesar automáticamente
      if (nuevoValor === "AUTORIZADA") {
        console.log(`🔄 Detectado cambio a AUTORIZADA en fila ${row}`)

        // Verificar si ya tiene número de reserva
        const numeroReservaActual = sheet.getRange(row, 13).getValue()
        if (!numeroReservaActual) {
          // Autorizar automáticamente
          const resultado = autorizarReserva(row)
          console.log(`✅ Autorización automática completada:`, resultado)
        }
      }
    }
  } catch (error) {
    console.error("❌ Error en onEdit:", error)
  }
}
