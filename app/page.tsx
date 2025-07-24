"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  UtensilsCrossed,
  MessageCircle,
  Phone,
  Instagram,
  Facebook,
  Clock,
  Users,
  TreePine,
  Camera,
  Wifi,
  Car,
  Utensils,
  Leaf,
  Mountain,
  PocketIcon as Pool,
  PawPrint,
  DogIcon as Horse,
  Flag,
  SkullIcon as Skateboard,
  BikeIcon as Motorcycle,
  Bike,
  Tent,
  ShieldCheck,
  TableIcon as Toilet,
  FlameIcon as Grill,
  DogIcon as Zoo,
  Home,
  AmbulanceIcon as FirstAid,
  Dumbbell,
  TableIcon as PicnicTable,
} from "lucide-react"
import Image from "next/image"
import { ParkMap } from "../park-map"
import RestaurantMenu from "../restaurant-menu"
import SimpleAIAssistant from "../simple-ai-assistant"
import { ContactSection } from "../contact-section"
import ReservationSelector from "../reservation-selector"
import ReservationGeneralEntryForm from "../reservation-general-entry-form"
import SmallGroupsForm from "../reservation-small-groups-form"
import CorporateEventsForm from "../reservation-corporate-events-form"
import { PaymentFormSimple } from "../payment-form-simple"
import { PaymentPending } from "../payment-pending"
import FaqSection from "../faq-section"

interface HomeProps {
  setActiveSection: (section: string) => void
}

export default function MiRinconApp() {
  const [activeSection, setActiveSection] = useState("home")
  const [selectedReservationType, setSelectedReservationType] = useState<string | null>(null)
  const [generalEntrySubStep, setGeneralEntrySubStep] = useState<"details" | "payment" | "pending">("details")
  const [currentReservationDetails, setCurrentReservationDetails] = useState<any>(null)
  const [solicitudId, setSolicitudId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeSection])

  const handleProceedToPayment = (details: any) => {
    console.log("Datos recibidos para pago:", details)
    setCurrentReservationDetails(details)
    setGeneralEntrySubStep("payment")
  }

  const handlePaymentSuccess = async (generatedSolicitudId: string) => {
    setSolicitudId(generatedSolicitudId)
    setGeneralEntrySubStep("pending")
  }

  const handleBackFromPayment = () => {
    setGeneralEntrySubStep("details")
    setCurrentReservationDetails(null)
  }

  const handleResetGeneralEntryReservation = () => {
    setGeneralEntrySubStep("details")
    setCurrentReservationDetails(null)
    setSolicitudId(null)
    setSelectedReservationType(null)
  }

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection setActiveSection={setActiveSection} />
      case "directions":
        return <DirectionsSection />
      case "reservations":
        if (selectedReservationType === "general") {
          if (generalEntrySubStep === "details") {
            return (
              <ReservationGeneralEntryForm
                onBackToSelector={() => setSelectedReservationType(null)}
                onProceedToPayment={handleProceedToPayment}
              />
            )
          } else if (generalEntrySubStep === "payment") {
            return (
              <PaymentFormSimple
                onPaymentSuccess={handlePaymentSuccess}
                onBack={handleBackFromPayment}
                reservationDetails={currentReservationDetails}
              />
            )
          } else if (generalEntrySubStep === "pending") {
            return (
              <PaymentPending
                solicitudId={solicitudId || ""}
                customerEmail={currentReservationDetails?.bookerEmail || ""}
                customerPhone={currentReservationDetails?.bookerPhone || ""}
                onStartOver={handleResetGeneralEntryReservation}
              />
            )
          }
        } else if (selectedReservationType === "small_groups") {
          return <SmallGroupsForm onBackToSelector={() => setSelectedReservationType(null)} />
        } else if (selectedReservationType === "corporate_events") {
          return <CorporateEventsForm onBackToSelector={() => setSelectedReservationType(null)} />
        } else {
          return (
            <ReservationSelector
              onSelectReservationType={setSelectedReservationType}
              onBack={() => setActiveSection("home")}
            />
          )
        }
        break
      case "map":
        return <ParkMap />
      case "menu":
        return <RestaurantMenu />
      case "assistant":
        return <SimpleAIAssistant />
      case "contact":
        return <ContactSection setActiveSection={setActiveSection} />
      case "faq":
        return <FaqSection onBack={() => setActiveSection("contact")} />
      default:
        return <HomeSection setActiveSection={setActiveSection} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-0.5 shadow-lg">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative">
                  <Image
                    src="/images/logo_verde.png"
                    alt="Logo Hacienda Rincón Grande"
                    width={44}
                    height={44}
                    className="object-contain rounded-full"
                    onError={(e) => {
                      const img = e.currentTarget
                      if (img.src.includes("logo_verde.png")) {
                        img.src = "/images/logo.png"
                      } else {
                        img.style.display = "none"
                        const fallback = img.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = "flex"
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full">
                    <div className="relative">
                      <Mountain className="w-5 h-5 text-emerald-600 absolute -top-1 left-1" />
                      <TreePine className="w-6 h-6 text-green-600" />
                      <Leaf className="w-3 h-3 text-green-500 absolute -bottom-1 right-0" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mi Rincón</h1>
                <p className="text-xs text-emerald-600 font-medium">Hacienda Rincón Grande</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 font-semibold border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Abierto
            </Badge>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto pb-20">{renderSection()}</main>
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          {[
            { id: "home", icon: TreePine, label: "Inicio" },
            { id: "directions", icon: MapPin, label: "Ubicación" },
            { id: "reservations", icon: Calendar, label: "Reservar" },
            { id: "map", icon: MapPin, label: "Mapa" },
            { id: "menu", icon: UtensilsCrossed, label: "Menú" },
            { id: "assistant", icon: MessageCircle, label: "Asistente" },
            { id: "contact", icon: Phone, label: "Contacto" },
            { id: "faq", icon: MessageCircle, label: "FAQ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setSelectedReservationType(null)
                setGeneralEntrySubStep("details")
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? "text-emerald-600 bg-emerald-50 transform scale-110"
                  : "text-gray-500 hover:text-gray-700"
              } hover:scale-105`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function HomeSection({ setActiveSection }: HomeProps) {
  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-emerald-200">
        <div className="relative h-64">
          <Image
            src="/images/hero-hacienda-rincon-grande.jpeg"
            alt="Hacienda Rincón Grande - Vista Panorámica"
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=256&width=400&text=Hacienda+Rincon+Grande"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h2 className="mb-1 tracking-wide font-bold text-3xl">Hacienda Rincón Grande</h2>
              <p className="opacity-90 text-lg">Naturaleza, aventura y tranquilidad</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card
          className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100"
          onClick={() => setActiveSection("reservations")}
        >
          <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-emerald-800">Reservar Ahora</h3>
          <p className="text-xs text-emerald-600">Asegura tu visita</p>
        </Card>
        <Card
          className="rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300 bg-gradient-to-br from-lime-50 to-emerald-100"
          onClick={() => setActiveSection("directions")}
        >
          <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-emerald-800">Cómo Llegar</h3>
          <p className="text-xs text-emerald-600">Direcciones GPS</p>
        </Card>
      </div>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Sobre el Parque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Hacienda Rincón Grande es un oasis natural donde puedes disfrutar de la tranquilidad del campo, actividades
            al aire libre y deliciosa gastronomía local.
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-emerald-50">
              <Clock className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Horarios</p>
                <p className="text-xs text-emerald-600">Lun-Dom: 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2 rounded-lg bg-lime-50">
              <Users className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Capacidad</p>
                <p className="text-xs text-emerald-600">Hasta 1000 visitantes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Comodidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Car, label: "Estacionamiento", color: "text-emerald-600" },
              { icon: Wifi, label: "WiFi Gratis", color: "text-emerald-600" },
              { icon: Utensils, label: "Restaurante", color: "text-emerald-600" },
              { icon: Camera, label: "Áreas Fotográficas", color: "text-emerald-600" },
              { icon: Pool, label: "Área de Piscinas", color: "text-emerald-600" },
              { icon: PawPrint, label: "Granja de Contacto", color: "text-emerald-600" },
              { icon: Horse, label: "Paseo a Caballos", color: "text-emerald-600" },
              { icon: Flag, label: "Mini Golf", color: "text-emerald-600" },
              { icon: Mountain, label: "Senderismo", color: "text-emerald-600" },
              { icon: Skateboard, label: "Skatepark", color: "text-emerald-600" },
              { icon: Motorcycle, label: "Pista de Motocross", color: "text-emerald-600" },
              { icon: Bike, label: "Trail de Enduro", color: "text-emerald-600" },
              { icon: Bike, label: "Trail de Bicicletas", color: "text-emerald-600" },
              { icon: Zoo, label: "Paseos al Zoológico Leslie Pantin", color: "text-emerald-600" },
              { icon: Home, label: "Alojamiento", color: "text-emerald-600" },
              { icon: Tent, label: "Área de Camping", color: "text-emerald-600" },
              { icon: Grill, label: "Parrilleras", color: "text-emerald-600" },
              { icon: ShieldCheck, label: "Seguridad", color: "text-emerald-600" },
              { icon: Toilet, label: "Baños Públicos", color: "text-emerald-600" },
              { icon: FirstAid, label: "Enfermería", color: "text-emerald-600" },
              { icon: Dumbbell, label: "Canchas Deportivas", color: "text-emerald-600" },
              { icon: PicnicTable, label: "Área de Picnic", color: "text-emerald-600" },
            ].map((amenity, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <amenity.icon className={`w-4 h-4 ${amenity.color}`} />
                <span className="text-sm font-medium text-emerald-800">{amenity.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800 flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Galería</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/horses-grazing.jpeg"
                alt="Dos caballos pastando en un campo verde"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Caballos"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Caballos</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/person-riding-horse.jpeg"
                alt="Persona montando un caballo blanco en un sendero"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Paseo+a+Caballo"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Paseo a Caballo</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/yellow-building-pool.jpeg"
                alt="Edificio amarillo con piscina en primer plano"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Piscina"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Piscina</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/green-fields-mountains.jpeg"
                alt="Amplios campos verdes con montañas al fondo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Paisaje"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Paisaje</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/large-tree-gazebo.jpeg"
                alt="Gran árbol y un gazebo en un campo"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Área+Verde"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Área Verde</div>
            </div>
            <div className="relative h-20 rounded-lg overflow-hidden group">
              <Image
                src="/images/gallery/group-tour.jpeg"
                alt="Grupo de personas en un tour o visita educativa"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Tour+Grupal"
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-1 left-1 text-white text-xs font-semibold">Tour Grupal</div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-3 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            onClick={() => window.open("https://www.instagram.com/HaciendaRinconGrande", "_blank")}
          >
            <Camera className="w-4 h-4 mr-2" />
            Ver más fotos
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-emerald-800">Síguenos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around">
            {[
              {
                icon: Facebook,
                color: "text-blue-600",
                bg: "bg-blue-50",
                label: "Facebook",
                type: "icon",
                url: "https://www.facebook.com/HaciendaRinconGrande",
              },
              {
                icon: Instagram,
                color: "text-pink-600",
                bg: "bg-pink-50",
                label: "Instagram",
                type: "icon",
                url: "https://www.instagram.com/HaciendaRinconGrande",
              },
              {
                icon: "/images/tiktok-icon.png",
                color: "text-black",
                bg: "bg-gray-100",
                label: "TikTok",
                type: "image",
                url: "https://www.tiktok.com/@HaciendaRinconGrande",
              },
            ].map((social, index) => (
              <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                <button className={`p-3 rounded-full ${social.bg} hover:scale-110 transition-all duration-200`}>
                  {social.type === "icon" ? (
                    <social.icon className={`w-6 h-6 ${social.color}`} />
                  ) : (
                    <Image
                      src={(social.icon as string) || "/placeholder.svg"}
                      alt={social.label}
                      width={24}
                      height={24}
                    />
                  )}
                  <span className="sr-only">{social.label}</span>
                </button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DirectionsSection() {
  const latitude = 10.240245
  const longitude = -67.459364
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=14&output=embed`
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-64 w-full rounded-lg overflow-hidden border border-emerald-300">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Hacienda Rincón Grande"
            ></iframe>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-1 text-emerald-800">Dirección</h3>
              <p className="text-sm text-emerald-700">
                Hacienda Paya
                <br />
                Turmero 2115, Aragua
                <br />
                Venezuela
              </p>
            </div>

            <div className="p-3 bg-lime-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-1 text-emerald-800">Coordenadas GPS</h3>
              <p className="text-sm text-emerald-700 font-mono">
                {latitude}° N, {Math.abs(longitude)}° W
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
              onClick={() => window.open(googleMapsDirectionsUrl, "_blank")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Abrir en Maps
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-emerald-800">Instrucciones de Llegada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p className="text-emerald-700">
                Utiliza el botón "Abrir en Maps" para obtener la ruta más precisa desde tu ubicación.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p className="text-emerald-700">Sigue las indicaciones de tu GPS hasta llegar a Hacienda Paya.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p className="text-emerald-700">
                Antes del puente de Paya cruza a mano derecha si vienes desde Turmero, busca el letrero de Hacienda
                Rincón Grande al llegar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
