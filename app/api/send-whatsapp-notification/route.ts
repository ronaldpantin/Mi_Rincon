import { NextResponse } from "next/server"

// Define el número de WhatsApp al que se enviará la notificación
// Es buena práctica usar variables de entorno para números sensibles o configurables
const WHATSAPP_DESTINATION_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER || "+5804122328332"

export async function POST(request: Request) {
  try {
    const { reservationNumber, qrCodeImage } = await request.json()

    if (!reservationNumber || !qrCodeImage) {
      return NextResponse.json({ error: "Faltan datos de la reserva o la imagen del QR." }, { status: 400 })
    }

    console.log(`Recibida solicitud para enviar WhatsApp: Reserva ${reservationNumber}`)
    // console.log('QR Code Image (Base64):', qrCodeImage.substring(0, 50) + '...'); // Para depuración, no mostrar todo el Base64

    // --- LÓGICA DE INTEGRACIÓN CON LA API DE WHATSAPP BUSINESS AQUÍ ---
    // Aquí es donde usarías el SDK o harías una solicitud HTTP a la API de tu proveedor de WhatsApp.
    // Ejemplos de proveedores populares: Meta (WhatsApp Business Platform), Twilio, MessageBird, Vonage.

    // PASO 1: Autenticación con tu proveedor de WhatsApp
    // Esto generalmente implica usar una clave de API o un token de acceso.
    // const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY; // Asegúrate de definir esta variable de entorno

    // PASO 2: Preparar el mensaje y la imagen
    // La forma de enviar imágenes varía según el proveedor:
    // a) Algunos aceptan Data URLs (Base64) directamente.
    // b) Otros requieren que la imagen esté alojada públicamente y les pases la URL.
    //    Si tu proveedor requiere una URL, primero tendrías que subir el `qrCodeImage`
    //    a un servicio de almacenamiento de blobs (ej. Vercel Blob, AWS S3) desde aquí.

    // Ejemplo conceptual de cómo se vería una llamada a una API de WhatsApp (NO ES CÓDIGO REAL DE UN PROVEEDOR ESPECÍFICO):
    // const whatsappApiUrl = 'https://api.whatsapp.com/v1/messages'; // URL ficticia
    // const messagePayload = {
    //   to: WHATSAPP_DESTINATION_NUMBER,
    //   type: 'image',
    //   image: {
    //     link: 'URL_PUBLICA_DEL_QR_SI_ES_NECESARIO', // O el Base64 si el proveedor lo soporta
    //     caption: `¡Reserva Confirmada! Número: ${reservationNumber}\nPresenta este QR al llegar.`,
    //   },
    //   // O si es solo texto:
    //   // type: 'text',
    //   // text: {
    //   //   body: `¡Reserva Confirmada! Número: ${reservationNumber}\nPresenta este QR al llegar.`,
    //   // },
    // };

    // const whatsappResponse = await fetch(whatsappApiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${WHATSAPP_API_KEY}`, // Tu token de autenticación
    //   },
    //   body: JSON.stringify(messagePayload),
    // });

    // if (!whatsappResponse.ok) {
    //   const errorData = await whatsappResponse.json();
    //   console.error('Error al enviar WhatsApp:', errorData);
    //   // Podrías loggear el error en un servicio de monitoreo
    //   return NextResponse.json({ error: 'Fallo al enviar la notificación de WhatsApp.' }, { status: 500 });
    // }

    console.log("Simulación: Notificación de WhatsApp enviada con éxito.")

    return NextResponse.json({ message: "Notificación de WhatsApp enviada con éxito." }, { status: 200 })
  } catch (error) {
    console.error("Error en la API de WhatsApp:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
