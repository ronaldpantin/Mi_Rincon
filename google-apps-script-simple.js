function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet()
    const data = JSON.parse(e.postData.contents)

    // Añadir fila con los datos (SIN imagen por ahora)
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
      "Imagen recibida", // Placeholder para la imagen
      "PENDIENTE", // Estado inicial
      "", // Número de reserva (vacío inicialmente)
      "", // Notas
    ])

    // Enviar email de notificación simple
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
      
      Por favor, revisa y autoriza la reserva.
      `

      MailApp.sendEmail(destinatario, asunto, cuerpoEmail)
      console.log("Email de notificación enviado")
    } catch (emailError) {
      console.error("Error enviando email:", emailError)
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
  } catch (error) {
    console.error("Error en doPost:", error)
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
  }
}

// Función de prueba para verificar permisos
function testFunction() {
  console.log("Función de prueba ejecutada correctamente")
  return "OK"
}
