import { experimental_streamTool } from "ai" // Importar experimental_streamTool
import { createOpenAI } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js" // Importar Supabase

export const maxDuration = 30 // streaming hasta 30 s

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  // Si no hay clave, detenemos la petición con un mensaje claro
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Falta la clave OPENAI_API_KEY. Añádela en los Environment Variables del proyecto antes de usar el asistente.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  // Obtener las variables de entorno de Supabase
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY // Usar SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({
        error: "Faltan las variables de entorno de Supabase (SUPABASE_URL, SUPABASE_ANON_KEY).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  // Inicializar el cliente de Supabase (para uso en el servidor)
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("API Key length:", apiKey ? apiKey.length : "Not found")
  console.log("API Key starts with sk-proj-:", apiKey ? apiKey.startsWith("sk-proj-") : "N/A")

  const openai = createOpenAI({ apiKey })

  try {
    const { messages } = await req.json()
    console.log("Received messages from client:", messages)

    // Obtener el último mensaje del usuario para almacenarlo
    const lastUserMessage = messages.findLast((m: any) => m.role === "user")?.content || "No user message found"

    console.log("Attempting to stream text with tool calling (aggressive prompt)...")

    const result = await experimental_streamTool({
      model: openai("gpt-4o"),
      messages,
      system: `ERES EL ASISTENTE VIRTUAL OFICIAL Y ÚNICO DE HACIENDA RINCÓN GRANDE.
      TU FUNCIÓN ES PROPORCIONAR RESPUESTAS **EXACTAS, DIRECTAS Y CONCISAS**.
      
      PARA PREGUNTAS SOBRE:
      - COSTO DE ENTRADA
      - EXONERACIONES
      - HORARIOS
      - INGRESO DE COMIDA
      - RESTRICCIONES DE VIDRIOS
      - ACCESO A PIE
      - ACCESO DE VEHÍCULOS
      
      **DEBES OBLIGATORIAMENTE USAR LA HERRAMIENTA 'get_hacienda_rincon_grande_info' PARA OBTENER LA INFORMACIÓN.**
      
      LA INFORMACIÓN PROPORCIONADA POR LA HERRAMIENTA ES LA **ÚNICA FUENTE VÁLIDA Y DEFINITIVA**.
      **NO INVENTES, NO GENERALICES, Y BAJO NINGUNA CIRCUNSTANCIA REFIERAS AL USUARIO A VISITAR EL SITIO WEB O CONTACTAR AL PERSONAL SI LA RESPUESTA ESTÁ EN LA HERRAMIENTA.**
      
      Si una pregunta no puede ser respondida con la información de la herramienta, indica que no tienes esa información específica y sugiere contactar al personal.`,
      tools: {
        get_hacienda_rincon_grande_info: {
          description:
            "Obtiene información precisa y definitiva sobre Hacienda Rincón Grande: costo de entrada, exoneraciones, horarios, políticas de ingreso de comida y vidrios, y tipos de acceso (a pie, vehículos).",
          parameters: {}, // No necesita parámetros para esta información general
          execute: async () => {
            // Esta es la función que se "ejecuta" cuando el modelo la llama
            // Devolvemos las respuestas ya formateadas para que el modelo las use directamente
            return {
              costo_entrada: "La entrada general cuesta $5 USD al cambio oficial.",
              exoneracion: "Las personas con discapacidad NO cancelan la entrada.",
              horario: "El horario del parque es de 8:00 AM a 6:00 PM.",
              ingreso_comida: "SÍ se permite el ingreso de comida.",
              restriccion_vidrios: "NO se permite el ingreso de vidrios de ningún tipo.",
              acceso_a_pie: "SÍ se puede acceder al parque caminando.",
              acceso_vehiculos: "SÍ pueden pasar carros pequeños.",
            }
          },
        },
      },
      onFinal: async ({ text, finishReason, usage }) => {
        console.log("Stream finished!")
        console.log("Final text length:", text.length)
        console.log("Finish reason:", finishReason)
        console.log("Usage:", usage)

        // Almacenar el mensaje del usuario y la respuesta del AI en Supabase
        try {
          const { data, error } = await supabase
            .from("chat_messages")
            .insert([{ user_message: lastUserMessage, ai_response: text }])

          if (error) {
            console.error("Error al insertar el mensaje del chat en Supabase:", error)
          } else {
            console.log("Mensaje del chat almacenado en Supabase:", data)
          }
        } catch (dbError) {
          console.error("Error inesperado durante la inserción en Supabase:", dbError)
        }
      },
    })

    console.log("StreamText call initiated. Returning response stream.")

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error en la API del chat (catch block):", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else {
      console.error("Unknown error type in catch block:", error)
    }
    return new Response(JSON.stringify({ error: "Error interno del servidor al procesar la solicitud." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
