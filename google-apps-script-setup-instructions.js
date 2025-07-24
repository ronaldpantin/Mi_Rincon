/*
═══════════════════════════════════════════════════════════════
📋 INSTRUCCIONES PARA CONFIGURAR GOOGLE APPS SCRIPT
═══════════════════════════════════════════════════════════════

🚀 PASOS PARA CONFIGURAR:

1. 📊 CREAR/ABRIR GOOGLE SHEETS:
   - Ve a https://sheets.google.com
   - Crea una nueva hoja o abre la existente
   - Asegúrate de que tenga estas columnas (fila 1):
     A: Fecha/Hora | B: ID Solicitud | C: Nombre | D: Email | E: Teléfono
     F: Fecha Visita | G: Adultos | H: Niños | I: Total USD | J: Total VEF
     K: Referencia | L: Comprobante | M: Estado | N: Nº Reserva | O: Notas | P: Tipo

2. 🔧 CONFIGURAR APPS SCRIPT:
   - En tu Google Sheet, ve a: Extensiones > Apps Script
   - Borra el código por defecto
   - Copia y pega el código de "google-apps-script-simple-sheets.js"
   - Cambia el email en la línea 45: "haciendarincongrande@gmail.com"

3. 🌐 DESPLEGAR COMO WEB APP:
   - Haz clic en "Desplegar" > "Nueva implementación"
   - Tipo: "Aplicación web"
   - Ejecutar como: "Yo"
   - Acceso: "Cualquier persona"
   - Haz clic en "Desplegar"
   - COPIA LA URL que te da (algo como: https://script.google.com/macros/s/ABC123.../exec)

4. 🔗 ACTUALIZAR LA URL EN EL CÓDIGO:
   - Ve al archivo "app/api/process-reservation-simple/route.ts"
   - En la línea 47, reemplaza "Your_Script_ID_Here" con tu URL completa
   - Ejemplo: const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_ID_AQUI/exec"

5. ✅ PROBAR EL SISTEMA:
   - Ejecuta la función "testFunction" en Apps Script
   - Haz una reserva de prueba en tu aplicación
   - Verifica que aparezca en Google Sheets
   - Revisa que llegue el email de notificación

6. 🎯 AUTORIZAR RESERVAS:
   - Para autorizar una reserva, cambia el estado de "PENDIENTE" a "AUTORIZADA" en la columna M
   - O usa la función autorizarReserva("ID_DE_SOLICITUD") en Apps Script

═══════════════════════════════════════════════════════════════
🔒 PERMISOS NECESARIOS:
- Gmail (para enviar emails)
- Google Sheets (para guardar datos)
- Google Drive (para acceso a archivos)

💡 CONSEJOS:
- Mantén una copia de seguridad de tu hoja
- Revisa los logs en Apps Script si hay errores
- El sistema funciona sin imágenes, solo con referencia de pago
═══════════════════════════════════════════════════════════════
*/

// Este archivo es solo informativo, no necesitas copiarlo a Apps Script
