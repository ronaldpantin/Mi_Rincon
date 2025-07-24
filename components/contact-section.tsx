"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, MessageCircle, Send, Facebook, Instagram, PhoneIcon as WhatsappIcon } from "lucide-react"
import Image from "next/image" // Importar Image para usar la imagen de TikTok

interface ContactSectionProps {
  setActiveSection: (section: string) => void // Añadir prop para cambiar la sección
}

export function ContactSection({ setActiveSection }: ContactSectionProps) {
  const handleWhatsAppContact = () => {
    const phoneNumber = "5804122328332" // Número de WhatsApp actualizado
    const message = "Hola! Me gustaría obtener más información sobre Hacienda Rincón Grande."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contact form submitted")
  }

  const socialMediaLinks = [
    {
      icon: Facebook,
      name: "Facebook",
      url: "https://www.facebook.com/HaciendaRinconGrande",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      type: "icon",
    },
    {
      icon: Instagram,
      name: "Instagram",
      url: "https://www.instagram.com/HaciendaRinconGrande",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      type: "icon",
    },
    {
      icon: "/images/tiktok-icon.png", // Ruta de la imagen de TikTok
      name: "TikTok",
      url: "https://www.tiktok.com/@HaciendaRinconGrande",
      color: "text-black", // Color para TikTok (no se usará directamente para la imagen, pero se mantiene por consistencia)
      bgColor: "bg-gray-100", // Fondo para TikTok
      type: "image", // Nuevo tipo para indicar que es una imagen
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Contact Header */}
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>Contacto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg flex items-center space-x-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Teléfono</p>
                <a href="tel:+5804122328332" className="text-sm text-emerald-700 hover:underline">
                  +58 0412 232 8332
                </a>
              </div>
            </div>
            <div className="p-3 bg-lime-50 rounded-lg flex items-center space-x-3">
              <WhatsappIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">WhatsApp</p>
                <a
                  href="https://wa.me/5804122328332" // Número de WhatsApp actualizado
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-700 hover:underline"
                >
                  +58 0412 232 8332
                </a>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg flex items-center space-x-3">
              <Mail className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Correo Electrónico</p>
                <a href="mailto:haciendarincongrande@gmail.com" className="text-sm text-emerald-700 hover:underline">
                  haciendarincongrande@gmail.com
                </a>
              </div>
            </div>
            <div className="p-3 bg-lime-50 rounded-lg flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Dirección</p>
                <p className="text-sm text-emerald-700">Hacienda Paya, Turmero 2115, Aragua</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleWhatsAppContact} className="h-auto p-4 bg-emerald-600 hover:bg-emerald-700">
              <div className="text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-medium">WhatsApp</span>
                <p className="text-xs opacity-90">Respuesta inmediata</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 bg-transparent border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              onClick={() => (window.location.href = "tel:+5804122328332")} // Número de teléfono actualizado
            >
              <div className="text-center">
                <Phone className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Llamar</span>
                <p className="text-xs text-gray-500">Lun-Dom 8AM-6PM</p>
              </div>
            </Button>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-emerald-800">Envíanos un Mensaje</h3>
            <Input
              placeholder="Tu Nombre"
              className="bg-white border-emerald-300 focus-visible:ring-emerald-500 text-emerald-900"
            />
            <Input
              type="email"
              placeholder="Tu Correo Electrónico"
              className="bg-white border-emerald-300 focus-visible:ring-emerald-500 text-emerald-900"
            />
            <Textarea
              placeholder="Tu Mensaje"
              rows={4}
              className="bg-white border-emerald-300 focus-visible:ring-emerald-500 text-emerald-900"
            />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensaje
            </Button>
          </form>

          {/* Social Media */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-800">Síguenos en Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                {socialMediaLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="icon"
                      className={`rounded-full ${social.bgColor} hover:scale-110 transition-all duration-200`}
                    >
                      {social.type === "icon" ? (
                        <social.icon className={`w-6 h-6 ${social.color}`} />
                      ) : (
                        <Image
                          src={(social.icon as string) || "/placeholder.svg"}
                          alt={social.name}
                          width={24}
                          height={24}
                        />
                      )}
                      <span className="sr-only">{social.name}</span>
                    </Button>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm text-red-800">Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-red-700">
              <p>En caso de Emergencias llamar 0424-3476213/0800 ALERTA1(2537821) </p>
              <p>• Seguridad del parque: +58 0412 232 8332</p>
              <p>• Nuestro personal está capacitado en primeros auxilios</p>
              <p>• Botiquín de primeros auxilios disponible en recepción</p>
            </CardContent>
          </Card>

          {/* FAQ Link */}
          <Card className="border-emerald-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">¿No encuentras lo que buscas?</p>
              <Button
                variant="outline"
                className="w-full bg-transparent border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                onClick={() => setActiveSection("faq")} // Cambiar a la sección FAQ
              >
                Ver Preguntas Frecuentes
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* View on Map Button */}
      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
        <MapPin className="w-4 h-4 mr-2" />
        Ver en el mapa
      </Button>
    </div>
  )
}
