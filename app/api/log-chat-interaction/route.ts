import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY // O SUPABASE_SERVICE_ROLE_KEY para mayor seguridad en el servidor

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase environment variables missing." }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { userMessage, aiResponse } = await req.json()

    if (!userMessage || !aiResponse) {
      return NextResponse.json({ error: "Missing userMessage or aiResponse." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{ user_message: userMessage, ai_response: aiResponse }])

    if (error) {
      console.error("Error logging chat message to Supabase:", error)
      return NextResponse.json({ error: "Failed to log chat message." }, { status: 500 })
    }

    console.log("Chat message logged to Supabase:", data)
    return NextResponse.json({ message: "Chat message logged successfully." }, { status: 200 })
  } catch (error) {
    console.error("Error in log-chat-interaction API:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
