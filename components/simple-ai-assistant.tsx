"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, MessageCircleQuestion, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function SimpleAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  // Base de conocimiento con respuestas exactas
  const knowledgeBase: { [key: string]: string } = {
    // Preguntas sobre costo/precio
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

    // Preguntas sobre exoneraciones
    "quienes estan exonerados": "Las personas con discapacidad NO cancelan la entrada.",
    "quien no paga entrada": "Las personas con discapacidad NO cancelan la entrada.",
    "hay exoneracion": "Las personas con discapacidad NO cancelan la entrada.",
    exonerados: "Las personas con discapacidad NO cancelan la entrada.",
    discapacitados: "Las personas con discapacidad NO cancelan la entrada.",

    // Preguntas sobre horarios
    "horario del parque": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "a que hora abren": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "a que hora cierran": "El horario del parque es de 8:00 AM a 6:00 PM.",
    "cual es el horario": "El horario del parque es de 8:00 AM a 6:00 PM.",
    horario: "El horario del parque es de 8:00 AM a 6:00 PM.",
    horarios: "El horario del parque es de 8:00 AM a 6:00 PM.",

    // Preguntas sobre comida
    "se puede ingresar comida": "SÍ se permite el ingreso de comida.",
    "puedo llevar comida": "SÍ se permite el ingreso de comida.",
    "se permite comida": "SÍ se permite el ingreso de comida.",
    "ingreso comida": "SÍ se permite el ingreso de comida.",
    comida: "SÍ se permite el ingreso de comida.",

    // Preguntas sobre vidrios
    "se permiten vidrios": "NO se permite el ingreso de vidrios de ningún tipo.",
    "puedo llevar botellas de vidrio": "NO se permite el ingreso de vidrios de ningún tipo.",
    "se permite el ingreso de vidrios": "NO se permite el ingreso de vidrios de ningún tipo.",
    vidrios: "NO se permite el ingreso de vidrios de ningún tipo.",
    "botellas de vidrio": "NO se permite el ingreso de vidrios de ningún tipo.",

    // Preguntas sobre acceso a pie
    "acceso a pie": "SÍ se puede acceder al parque caminando.",
    "puedo ir caminando": "SÍ se puede acceder al parque caminando.",
    "se puede entrar caminando": "SÍ se puede acceder al parque caminando.",
    "acceso caminando": "SÍ se puede acceder al parque caminando.",
    caminar: "SÍ se puede acceder al parque caminando.",

    // Preguntas sobre acceso de vehículos
    "pasan carros pequeños": "SÍ pueden pasar carros pequeños.",
    "puedo ir en mi carro": "SÍ pueden pasar carros pequeños.",
    "se permite el acceso de carros pequeños": "SÍ pueden pasar carros pequeños.",
    "acceso carros": "SÍ pueden pasar carros pequeños.",
    carros: "SÍ pueden pasar carros pequeños.",
    vehiculos: "SÍ pueden pasar carros pequeños.",

    // Preguntas generales
    ubicacion: "Estamos ubicados en Hacienda Paya, Turmero 2115, Aragua, Venezuela.",
    "donde estan": "Estamos ubicados en Hacienda Paya, Turmero 2115, Aragua, Venezuela.",
    direccion: "Estamos ubicados en Hacienda Paya, Turmero 2115, Aragua, Venezuela.",
    telefono: "Puedes contactarnos al +58 0412 232 8332.",
    contacto: "Puedes contactarnos al +58 0412 232 8332 o por WhatsApp al mismo número.",
    whatsapp: "Nuestro WhatsApp es +58 0412 232 8332.",

    // Pregunta de prueba
    test: "Esta es una respuesta de prueba para verificar que el asistente funciona correctamente.",
  }

  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim()

    // Buscar coincidencia exacta
    if (knowledgeBase[normalizedQuestion]) {
      return knowledgeBase[normalizedQuestion]
    }

    // Buscar coincidencias parciales
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (normalizedQuestion.includes(key) || key.includes(normalizedQuestion)) {
        return value
      }
    }

    // Respuesta por defecto
    return "Lo siento, no tengo información específica sobre esa pregunta. Te recomiendo contactar directamente al parque al +58 0412 232 8332 o por WhatsApp para obtener información más detallada."
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: input,
    }

    const answer = findAnswer(input)
    const assistantMessage: Message = {
      id: Date.now().toString() + "-assistant",
      role: "assistant",
      content: answer,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-emerald-800">
            <div className="flex items-center space-x-2">
              <MessageCircleQuestion className="w-5 h-5 text-emerald-600" />
              <span>Asistente Virtual</span>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                Limpiar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-emerald-50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-emerald-600 font-medium">¡Hola! Soy tu asistente virtual</p>
                <p className="text-xs text-emerald-500 mt-1">Pregúntame sobre precios, horarios, servicios y más</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              className="flex-1 bg-white border-emerald-300 focus-visible:ring-emerald-500"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>

          <div className="text-xs text-emerald-600 text-center">
            <p className="font-medium mb-1">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {["costo", "horario", "comida", "vidrios", "ubicación"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs hover:bg-emerald-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
