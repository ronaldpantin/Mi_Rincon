// Función para probar el envío de emails
function testEmail() {
  try {
    const destinatario = "haciendarincongrande@gmail.com" // CAMBIA POR TU EMAIL REAL
    const asunto = "Prueba de Email - Google Apps Script"
    const mensaje = "Si recibes este email, el sistema de correos está funcionando correctamente."

    GmailApp.sendEmail(destinatario, asunto, mensaje)
    console.log("Email de prueba enviado exitosamente")
    return "Email enviado"
  } catch (error) {
    console.error("Error enviando email:", error)
    return "Error: " + error.toString()
  }
}

// Función mejorada para enviar notificación con mejor manejo de errores
function enviarNotificacionEmailMejorada(data, comprobanteUrl) {
  try {
    const destinatario = "haciendarincongrande@gmail.com" // CAMBIA POR TU EMAIL REAL
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

---
Enviado desde el sistema de reservas de Hacienda Rincón Grande
Fecha: ${new Date().toLocaleString("es-VE")}
`

    GmailApp.sendEmail(destinatario, asunto, cuerpoEmail)
    console.log("Email de notificación enviado exitosamente a:", destinatario)
    return true
  } catch (emailError) {
    console.error("Error enviando email:", emailError)
    console.error("Detalles del error:", emailError.message)
    return false
  }
}

// Declare GmailApp variable
var GmailApp
