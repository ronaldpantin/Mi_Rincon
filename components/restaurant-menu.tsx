"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  UtensilsCrossed,
  Beef,
  Cake,
  PlusCircle,
  Pizza,
  Drumstick,
  Sandwich,
  Salad,
  Cookie,
  GlassWater,
  FishIcon as Shrimp,
  SpadeIcon as Spaghetti,
  Apple,
  Download,
} from "lucide-react"
import Image from "next/image"

export default function RestaurantMenu() {
  const menuCategories = [
    {
      name: "Aperitivos",
      icon: Shrimp,
      items: [
        {
          name: "Tequeños (6 unidades)",
          description: "Deliciosos palitos de queso fritos.",
          price: "$6",
          image: "/images/tequenos.jpeg", // Updated image path
        },
        {
          name: "Dedos de Yuca (6 unidades)",
          description: "Crujientes dedos de yuca frita.",
          price: "$3",
          image: "/images/dedos-de-yuca.jpeg", // Updated image path
        },
        {
          name: "Tostadas Mixtas",
          description: "Variedad de tostadas con diferentes toppings.",
          price: "$6",
          image: "/images/tostadas-mixtas.jpeg", // Updated image path
        },
        {
          name: "Bollitos",
          description: "Bollitos caseros, suaves y deliciosos.",
          price: "$6",
          image: "/placeholder.svg?height=80&width=80&text=Bollitos",
        },
        {
          name: "Pan Frito con Hummus",
          description: "Crujiente pan frito acompañado de nuestra cremosa salsa de garbanzos.",
          price: "$10", // Precio combinado
          image: "/images/hummus.jpeg", // Usar la nueva imagen
        },
        {
          name: "Rollos de Jamón y Queso (3 unidades)",
          description: "Rollos de jamón y queso, perfectos para picar.",
          price: "$5",
          image: "/placeholder.svg?height=80&width=80&text=Rollos",
        },
        {
          name: "Papas Fritas",
          description: "Porción de papas fritas clásicas.",
          price: "$3",
          image: "/images/papas-fritas.jpeg", // Updated image path
        },
      ],
    },
    {
      name: "Platos Principales",
      icon: Beef,
      items: [
        {
          name: "Bolitas de Carne",
          description: "Deliciosas bollitas de carne en salsa.",
          price: "$8",
          image: "/images/bolitas-de-carne.jpeg", // Usar la nueva imagen
        },
        {
          name: "Pizza",
          description: "Pizza individual con tus ingredientes favoritos.",
          price: "$6",
          icon: Pizza,
          image: "/placeholder.svg?height=80&width=80&text=Pizza",
        },
        {
          name: "Alitas de Pollo (med)",
          description: "Alitas de pollo crujientes y sabrosas.",
          price: "$8",
          icon: Drumstick,
          image: "/images/alitas-de-pollo.jpeg", // Updated image path
        },
        {
          name: "Carpaccio",
          description: "Finas láminas de carne con aderezo.",
          price: "$8",
          image: "/placeholder.svg?height=80&width=80&text=Carpaccio",
        },
        {
          name: "Tartar",
          description: "Tartar fresco de carne o pescado.",
          price: "$8",
          image: "/placeholder.svg?height=80&width=80&text=Tartar",
        },
        {
          name: "Tender de Pollo",
          description: "Tiernos trozos de pollo empanizado.",
          price: "$6",
          image: "/placeholder.svg?height=80&width=80&text=Tender",
        },
        {
          name: "Tabla de Jamón y Queso",
          description: "Selección de embutidos y quesos.",
          price: "$6",
          image: "/placeholder.svg?height=80&width=80&text=Tabla",
        },
        {
          name: "Brochettas Mixtas",
          description: "Brochetas de carne y vegetales.",
          price: "$9",
          image: "/images/brochettas.jpeg", // Usar la nueva imagen
        },
        {
          name: "Patacones",
          description: "Plátano verde frito con toppings.",
          price: "$7",
          image: "/placeholder.svg?height=80&width=80&text=Patacones",
        },
        {
          name: "Perros Polacos",
          description: "Hot dogs estilo polaco.",
          price: "$5",
          image: "/placeholder.svg?height=80&width=80&text=Perros",
        },
        {
          name: "Pastas (Boloñesa, Carbonara, 4 Quesos, Champiñón, Putanesca)",
          description: "Elige tu salsa favorita para tu pasta.",
          price: "$8",
          icon: Spaghetti,
          image: "/placeholder.svg?height=80&width=80&text=Pasta",
        },
        {
          name: "Pasticho",
          description: "Lasaña casera, capas de pasta, carne y bechamel.",
          price: "$10",
          image: "/placeholder.svg?height=80&width=80&text=Pasticho",
        },
        {
          name: "Arroz con Pollo",
          description: "Clásico arroz con pollo, sabroso y abundante.",
          price: "$8",
          image: "/placeholder.svg?height=80&width=80&text=Arroz+Pollo",
        },
        {
          name: "Lomito",
          description: "Jugoso lomito a la parrilla.",
          price: "$12",
          image: "/placeholder.svg?height=80&width=80&text=Lomito",
        },
        {
          name: "Churrasco",
          description: "Corte de churrasco a la parrilla.",
          price: "$12",
          image: "/placeholder.svg?height=80&width=80&text=Churrasco",
        },
        {
          name: "Pollo",
          description: "Pollo a la parrilla o al horno.",
          price: "$12",
          image: "/placeholder.svg?height=80&width=80&text=Pollo",
        },
      ],
    },
    {
      name: "Hamburguesas",
      icon: Sandwich,
      items: [
        {
          name: "Smash (2x)",
          description: "Doble carne smash, queso americano.",
          price: "$5",
          image: "/placeholder.svg?height=80&width=80&text=Smash",
        },
        {
          name: "Smash (2x) con papas",
          description: "Doble carne smash, queso americano, con papas fritas.",
          price: "$7",
          image: "/placeholder.svg?height=80&width=80&text=Smash+Papas",
        },
        {
          name: "Hamburguesa de 100 gr",
          description: "Carne de 100gr con queso americano y tocineta.",
          price: "$7",
          image: "/placeholder.svg?height=80&width=80&text=Hamburguesa",
        },
      ],
    },
    {
      name: "Guarniciones",
      icon: Salad,
      items: [
        {
          name: "Papas Fritas",
          description: "Porción extra de papas fritas.",
          price: "", // No price listed, assuming it's an add-on or included
          image: "/images/papas-fritas.jpeg", // Updated image path
        },
        {
          name: "Puré de Papa",
          description: "Suave y cremoso puré de papa.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Pure+Papa",
        },
        {
          name: "Plátano",
          description: "Plátano maduro frito o cocido.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Platano",
        },
        {
          name: "Vegetales Salteados",
          description: "Mix de vegetales frescos salteados.",
          price: "",
          icon: Apple,
          image: "/placeholder.svg?height=80&width=80&text=Vegetales",
        },
        {
          name: "Arroz Salvaje",
          description: "Arroz salvaje aromático.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Arroz+Salvaje",
        },
        {
          name: "Ensalada Mixta",
          description: "Ensalada fresca con lechuga, tomate y pepino.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Ensalada+Mixta",
        },
      ],
    },
    {
      name: "Postres",
      icon: Cake,
      items: [
        {
          name: "Rollos de Canela",
          description: "Tiernos rollos de canela con glaseado.",
          price: "$6",
          icon: Cookie,
          image: "/placeholder.svg?height=80&width=80&text=Rollos+Canela",
        },
        {
          name: "Tarta de Chocolate",
          description: "Deliciosa tarta de chocolate, rica y cremosa.",
          price: "$6",
          image: "/images/tarta-de-chocolate.jpeg", // Updated image path
        },
        {
          name: "Yogurt Griego con Frutas y Granola",
          description: "Yogurt griego cremoso con frutas frescas y granola.",
          price: "$5",
          image: "/images/yogurt-griego.jpeg", // New image path
        },
      ],
    },
    {
      name: "Bebidas",
      icon: GlassWater,
      items: [
        {
          name: "Papelón con Limón",
          description: "Refrescante bebida tradicional venezolana.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Papelon",
        },
        {
          name: "Jugos Naturales",
          description: "Variedad de jugos de frutas frescas del día.",
          price: "",
          image: "/images/jugos-naturales.jpeg", // Updated image path
        },
        {
          name: "Refrescos",
          description: "Variedad de bebidas gaseosas.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Refrescos",
        },
        {
          name: "Infusiones",
          description: "Selección de tés e infusiones calientes.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Infusiones",
        },
        {
          name: "Agua",
          description: "Botella de agua mineral.",
          price: "",
          image: "/placeholder.svg?height=80&width=80&text=Agua",
        },
      ],
    },
  ]

  const handleDownloadPdf = () => {
    // Reemplaza esta URL con la ruta a tu archivo PDF real
    const pdfUrl = "/menu.pdf" // Ejemplo: si tu PDF está en la carpeta public
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "menu-hacienda-rincon-grande.pdf" // Nombre del archivo al descargar
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-gray-800 bg-black text-white">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="/images/DUDEGRILLLOGO.png"
              alt="Dude Grill Logo"
              width={150}
              height={150}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=150&width=150&text=Logo"
              }}
            />
          </div>
          <CardTitle className="flex items-center space-x-2 text-white justify-center">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
            <span>Nuestro Menú</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {menuCategories.map((category, catIndex) => (
            <div key={catIndex} className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                {category.icon && <category.icon className="w-5 h-5 text-emerald-400" />}
                <span>{category.name}</span>
              </h3>
              <div className="grid gap-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center space-x-4 p-3 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Comida"
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base text-white">{item.name}</h4>
                      <p className="text-sm text-gray-300">{item.description}</p>
                      <p className="text-md font-bold text-emerald-400 mt-1">{item.price}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-emerald-400 hover:bg-gray-800">
                      <PlusCircle className="w-5 h-5" />
                      <span className="sr-only">Agregar</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            Ver Menú Completo (PDF)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
