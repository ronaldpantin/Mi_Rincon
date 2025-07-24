"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Loader2, MessageCircleQuestion } from "lucide-react"
import { useChat, type Message } from "ai/react" // Importar 'type Message'

export default function AIAssistant() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, setInput } = useChat({
    api: "/api/chat", // Example API route for AI chat
  })

  // Respuestas exactas para preguntas frecuentes
  const exactResponses: { [key: string]: string } = {
    "cuanto cuesta la entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "precio de la entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "costo de la entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "cuanto cuesta": "La entrada general cuesta $5 USD al cambio oficial.",
    "cual es el precio": "La entrada general cuesta $5 USD al cambio oficial.",
    "cual es el costo": "La entrada general cuesta $5 USD al cambio oficial.",
    "valor de la entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    precio: "La entrada general cuesta $5 USD al cambio oficial.",
    costo: "La entrada general cuesta $5 USD al cambio oficial.",
    "cuanto es la entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "valor entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "precio entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "costo entrada": "La entrada general cuesta $5 USD al cambio oficial.",
    "quienes estan exonerados": "Las personas con discapacidad NO cancelan la entrada.",
    "quien no paga entrada": "Las personas con discapacidad NO cancelan la entrada.",
    "hay exoneracion": "Las personas con discapacidad NO cancelan la entrada.",
    "horario del parque": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "a que hora abren": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "a que hora cierran": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "cual es el horario": "El horario del parque es de 8:00 AM a 6:00 PM.",
    horario: "El horario del parque es de 8:00 AM a 6:00 PM.",
    "se puede ingresar comida": "SÍ se permite el ingreso de comida.",
    "puedo llevar comida": "SÍ se permite el ingreso de comida.",
    "se permite comida": "SÍ se permite el ingreso de comida.",
    "ingreso comida": "SÍ se permite el ingreso de comida.",
    "se permiten vidrios": "NO se permite el ingreso de vidrios de ningún tipo.",
    "puedo llevar botellas de vidrio": "NO se permite el ingreso de vidrios de ningún tipo.",
    "se permite el ingreso de vidrios": "NO se permite el ingreso de vidrios de ningún tipo.",
    vidrios: "NO se permite el ingreso de vidrios de ningún tipo.",
    "acceso a pie": "SÍ se puede acceder al parque caminando.",
    "puedo ir caminando": "SÍ se puede acceder al parque caminando.",
    "se puede entrar caminando": "SÍ se puede acceder al parque caminando.",
    "acceso caminando": "SÍ se puede acceder al parque caminando.",
    "pasan carros pequeños": "SÍ pueden pasar carros pequeños.",
    "puedo ir en mi carro": "SÍ pueden pasar carros pequeños.",
    "se permite el acceso de carros pequeños": "SÍ pueden pasar carros pequeños.",
    "acceso carros": "SÍ pueden pasar carros pequeños.",
    test: "Esta es una respuesta de prueba para verificar la coincidencia exacta.", // Entrada de prueba
  }

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevenir el envío por defecto del formulario

    const userQuestion = input.toLowerCase().trim()
    console.log("User input (trimmed, lowercase):", userQuestion) // Debugging log
    const exactAnswer = exactResponses[userQuestion]
    console.log("Exact answer found for '" + userQuestion + "':", exactAnswer) // Debugging log

    if (exactAnswer) {
      // Si encontramos una respuesta exacta, la mostramos directamente
      const newUserMessage: Message = {
        id: Date.now().toString() + "-user",
        role: "user",
        content: input,
      }
      const newAIMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: exactAnswer,
      }

      setMessages((prevMessages) => [...prevMessages, newUserMessage, newAIMessage])
      setInput("") // Limpiar el input

      // Opcional: Loggear esta interacción en Supabase
      try {
        await fetch("/api/log-chat-interaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: input, aiResponse: exactAnswer }),
        })
      } catch (logError) {
        console.error("Error logging exact response to Supabase:", logError)
      }
    } else {
      // Si no hay una respuesta exacta, dejamos que useChat maneje la solicitud al AI
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <MessageCircleQuestion className="w-5 h-5 text-emerald-600" />
            <span>Asistente Virtual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-emerald-50">
            {messages.length === 0 ? (
              <p className="text-sm text-emerald-600 text-center italic">¡Hola! ¿En qué puedo ayudarte hoy?</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 p-2 rounded-lg ${
                    m.role === "user" ? "bg-emerald-100 text-emerald-900 ml-auto" : "bg-lime-100 text-lime-900 mr-auto"
                  } max-w-[80%]`}
                >
                  <p className="font-semibold text-xs">{m.role === "user" ? "Tú" : "Asistente"}</p>
                  <p className="text-sm">{m.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <span className="sr-only">Cargando respuesta...</span>
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center mt-4">Error: {error.message}</p>}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex space-x-2">
            <Input
              className="flex-1 bg-white border-emerald-300 focus-visible:ring-emerald-500"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
