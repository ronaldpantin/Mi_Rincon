// Reemplazar todas las instancias de MailApp.sendEmail con GmailApp.sendEmail

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

    // Usar GmailApp en lugar de MailApp
    GmailApp.sendEmail(destinatario, asunto, cuerpoEmail)
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

    // Usar GmailApp en lugar de MailApp
    GmailApp.sendEmail(email, asunto, cuerpoEmail)
    console.log(`✅ Email de confirmación enviado al cliente: ${email}`)
  } catch (error) {
    console.error("❌ Error enviando confirmación al cliente:", error)
    throw error // Re-lanzar el error para que se registre en las notas
  }
}

// FUNCIÓN DE PRUEBA: Email simple con GmailApp
function testEmailSimpleGmail() {
  try {
    const destinatario = "haciendarincongrande@gmail.com" // CAMBIA POR TU EMAIL
    const asunto = "✅ PRUEBA Gmail - Sistema Funcionando"
    const mensaje = "Si recibes este email, el sistema con GmailApp está funcionando correctamente."

    GmailApp.sendEmail(destinatario, asunto, mensaje)
    console.log("✅ Email de prueba enviado con GmailApp")
    return "SUCCESS"
  } catch (error) {
    console.error("❌ Error:", error)
    return "ERROR: " + error.toString()
  }
}
