"use client"

import { useState } from "react" // Importar useState
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, Mail, Send } from "lucide-react" // Importar Send para el botón
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // Importar Textarea
import { Label } from "@/components/ui/label" // Importar Label

interface FaqSectionProps {
  onBack: () => void
}

export default function FaqSection({ onBack }: FaqSectionProps) {
  const [otherQuestion, setOtherQuestion] = useState("") // Estado para la nueva pregunta

  const faqs = [
    {
      question: "¿Cuáles son los horarios de Hacienda Rincón Grande?",
      answer: "Estamos abiertos todos los días de la semana, de lunes a domingo, desde las 8:00 AM hasta las 6:00 PM.",
    },
    {
      question: "¿Cuál es el precio de la entrada general?",
      answer:
        "El precio de la entrada general es de $5 al cambio oficial. Los niños menores de 4 años y las personas con discapacidad están exonerados.",
    },
    {
      question: "¿Se permite la entrada de mascotas?",
      answer:
        "Sí, somos un parque pet-friendly. Tus mascotas son bienvenidas, siempre y cuando estén con correa y sus dueños se hagan responsables de limpiar sus desechos.",
    },
    {
      question: "¿Hay opciones de comida y bebida dentro del parque?",
      answer:
        "Sí, contamos con un restaurante que ofrece deliciosa gastronomía local y una variedad de bebidas. También tenemos áreas de picnic y parrilleras disponibles.",
    },
    {
      question: "¿Se pueden realizar eventos privados o corporativos?",
      answer:
        "Absolutamente. Ofrecemos paquetes especiales para grupos familiares, cumpleaños, bodas pequeñas y eventos corporativos. Puedes contactarnos a través del formulario de reserva para más información.",
    },
    {
      question: "¿Hay estacionamiento disponible?",
      answer: "Sí, disponemos de un amplio estacionamiento gratuito para todos nuestros visitantes.",
    },
    {
      question: "¿Qué actividades se pueden realizar en el parque?",
      answer:
        "Ofrecemos una variedad de actividades como paseos a caballo, senderismo, granja de contacto, área de piscinas, mini golf, skatepark, pista de motocross, trails de enduro y bicicletas, y paseos al Zoológico Leslie Pantin.",
    },
    {
      question: "¿Hay mesas y sillas disponibles en el parque?",
      answer:
        "Sí, contamos con mesas y sillas distribuidas en diferentes áreas del parque para tu comodidad. Algunas áreas exclusivas también incluyen mobiliario.",
    },
    {
      question: "¿Se pueden alquilar espacios exclusivos para grupos?",
      answer:
        "Sí, ofrecemos la posibilidad de alquilar espacios exclusivos como mesas en el Salón Colonial, caneyes junto a la piscina grande y bohíos privados. Puedes encontrar más detalles y reservar en la sección de 'Reserva de Entrada General'.",
    },
    {
      question: "¿Dónde se ubica Hacienda Rincón Grande?",
      answer:
        "Estamos ubicados en Hacienda Paya, Turmero 2115, Aragua, Venezuela. Puedes encontrar las direcciones exactas y un mapa interactivo en nuestra sección 'Ubicación'.",
    },
  ]

  const handleSendByWhatsApp = () => {
    const phoneNumber = "5804122328332" // Número de WhatsApp
    const message = `Hola, tengo una pregunta sobre Hacienda Rincón Grande: ${otherQuestion}`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSendByEmail = () => {
    const emailAddress = "haciendarincongrande@gmail.com"
    const subject = "Pregunta desde la sección de FAQ"
    const body = `Hola, tengo una pregunta sobre Hacienda Rincón Grande:\n\n${otherQuestion}`
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Preguntas Frecuentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-emerald-700 text-center">
            Encuentra respuestas a las preguntas más comunes sobre tu visita a Hacienda Rincón Grande.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-emerald-100">
                <AccordionTrigger className="text-left text-emerald-800 hover:no-underline hover:text-emerald-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-emerald-700 pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Nueva sección para otras preguntas */}
          <Card className="border-emerald-200 bg-emerald-50 mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-800 flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>¿Tienes otra pregunta?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-emerald-700">
                Si no encuentras la respuesta que buscas, escríbenos tu pregunta y te responderemos.
              </p>
              <div className="space-y-2">
                <Label htmlFor="otherQuestion" className="text-emerald-800">
                  Tu pregunta
                </Label>
                <Textarea
                  id="otherQuestion"
                  placeholder="Escribe tu pregunta aquí..."
                  value={otherQuestion}
                  onChange={(e) => setOtherQuestion(e.target.value)}
                  className="border-emerald-300 focus-visible:ring-emerald-500 bg-white text-emerald-900"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendByWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={otherQuestion.trim() === ""}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar por WhatsApp
                </Button>
                <Button
                  onClick={handleSendByEmail}
                  variant="outline"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                  disabled={otherQuestion.trim() === ""}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full mt-6 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
          >
            Volver a Contacto
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
