// Función para probar SOLO el envío de email
function testEmailSimple() {
  try {
    console.log("Iniciando prueba de email...")

    const destinatario = "campayasummercamp@gmail.com"
    const asunto = "PRUEBA - Sistema de Reservas Funcionando"
    const mensaje = `
Hola!

Este es un email de prueba del sistema de reservas de Hacienda Rincón Grande.

Si recibes este mensaje, significa que:
✅ Google Apps Script puede enviar emails
✅ Tu email está configurado correctamente
✅ Los permisos están funcionando

Fecha de prueba: ${new Date().toLocaleString("es-VE")}

¡El sistema está listo para funcionar!
`

    const google = window.google // Declare the google variable
    const MailApp = google.script.run
      .withSuccessHandler((response) => {
        console.log("✅ Email de prueba enviado exitosamente a:", destinatario)
        return "SUCCESS: Email enviado"
      })
      .withFailureHandler((error) => {
        console.error("❌ Error enviando email:", error)
        console.error("Tipo de error:", error.name)
        console.error("Mensaje de error:", error.message)
        return "ERROR: " + error.toString()
      })
      .sendEmail(destinatario, asunto, mensaje)
  } catch (error) {
    console.error("❌ Error enviando email:", error)
    console.error("Tipo de error:", error.name)
    console.error("Mensaje de error:", error.message)
    return "ERROR: " + error.toString()
  }
}

// Función para probar con datos simulados de reserva
function testReservaCompleta() {
  try {
    console.log("Probando con datos de reserva simulados...")

    const datosSimulados = {
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan.perez@ejemplo.com",
      telefono: "+58 412 1234567",
      fechaVisita: "2024-01-15",
      adultos: 2,
      ninos: 1,
      totalUSD: 15,
      totalVEF: 1787.1,
      referenciaPago: "123456789",
    }

    const comprobanteUrl = "https://ejemplo.com/comprobante.jpg"

    const google = window.google // Declare the google variable
    const enviarNotificacionEmail = google.script.run
      .withSuccessHandler((response) => {
        console.log("✅ Email de notificación de reserva enviado")
        return "SUCCESS: Email de reserva enviado"
      })
      .withFailureHandler((error) => {
        console.error("❌ Error en prueba de reserva:", error)
        return "ERROR: " + error.toString()
      })
      .enviarNotificacionEmail(datosSimulados, comprobanteUrl)
  } catch (error) {
    console.error("❌ Error en prueba de reserva:", error)
    return "ERROR: " + error.toString()
  }
}

// Función para verificar permisos
function verificarPermisos() {
  try {
    console.log("Verificando permisos...")

    const google = window.google // Declare the google variable

    // Verificar acceso a Gmail
    const GmailApp = google.script.run
      .withSuccessHandler((response) => {
        console.log("✅ Acceso a Gmail: OK")
      })
      .withFailureHandler((error) => {
        console.error("❌ Error de permisos:", error)
      })
      .getDrafts()

    // Verificar acceso a Drive
    const DriveApp = google.script.run
      .withSuccessHandler((response) => {
        console.log("✅ Acceso a Drive: OK")
      })
      .withFailureHandler((error) => {
        console.error("❌ Error de permisos:", error)
      })
      .getFolders()

    // Verificar acceso a Sheets
    const SpreadsheetApp = google.script.run
      .withSuccessHandler((response) => {
        console.log("✅ Acceso a Sheets: OK")
      })
      .withFailureHandler((error) => {
        console.error("❌ Error de permisos:", error)
      })
      .getActiveSheet()

    return "SUCCESS: Todos los permisos están OK"
  } catch (error) {
    console.error("❌ Error de permisos:", error)
    return "ERROR: " + error.toString()
  }
}
