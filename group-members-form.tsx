"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

export interface Member {
  id: string
  firstName: string
  lastName: string
  age: number | ""
  idNumber: string
  phone: string
  email: string
  category: "adult" | "child" | "exonerated"
  exonerationReason?: string
}

interface GroupMembersFormProps {
  numAdults: number
  numChildren: number
  numExonerated: number
  onMembersSubmit: (members: Member[]) => void
  onBack: () => void
}

export function GroupMembersForm({
  numAdults,
  numChildren,
  numExonerated,
  onMembersSubmit,
  onBack,
}: GroupMembersFormProps) {
  const totalMembers = numAdults + numChildren + numExonerated
  const [members, setMembers] = useState<Member[]>(() => {
    const initialMembers: Member[] = []
    for (let i = 0; i < numAdults; i++) {
      initialMembers.push({
        id: `adult-${i}-${Date.now()}`,
        firstName: "",
        lastName: "",
        age: "",
        idNumber: "",
        phone: "",
        email: "",
        category: "adult",
      })
    }
    for (let i = 0; i < numChildren; i++) {
      initialMembers.push({
        id: `child-${i}-${Date.now()}`,
        firstName: "",
        lastName: "",
        age: "",
        idNumber: "",
        phone: "",
        email: "",
        category: "child",
      })
    }
    for (let i = 0; i < numExonerated; i++) {
      initialMembers.push({
        id: `exonerated-${i}-${Date.now()}`,
        firstName: "",
        lastName: "",
        age: "",
        idNumber: "",
        phone: "",
        email: "",
        category: "exonerated",
        exonerationReason: "",
      })
    }
    return initialMembers
  })

  useEffect(() => {
    setMembers((prevMembers) => {
      const newMembers: Member[] = []
      let currentAdults = 0
      let currentChildren = 0
      let currentExonerated = 0

      prevMembers.forEach((member) => {
        if (member.category === "adult" && currentAdults < numAdults) {
          newMembers.push(member)
          currentAdults++
        } else if (member.category === "child" && currentChildren < numChildren) {
          newMembers.push(member)
          currentChildren++
        } else if (member.category === "exonerated" && currentExonerated < numExonerated) {
          newMembers.push(member)
          currentExonerated++
        }
      })

      while (currentAdults < numAdults) {
        newMembers.push({
          id: `adult-${newMembers.length}-${Date.now()}`,
          firstName: "",
          lastName: "",
          age: "",
          idNumber: "",
          phone: "",
          email: "",
          category: "adult",
        })
        currentAdults++
      }
      while (currentChildren < numChildren) {
        newMembers.push({
          id: `child-${newMembers.length}-${Date.now()}`,
          firstName: "",
          lastName: "",
          age: "",
          idNumber: "",
          phone: "",
          email: "",
          category: "child",
        })
        currentChildren++
      }
      while (currentExonerated < numExonerated) {
        newMembers.push({
          id: `exonerated-${newMembers.length}-${Date.now()}`,
          firstName: "",
          lastName: "",
          age: "",
          idNumber: "",
          phone: "",
          email: "",
          category: "exonerated",
          exonerationReason: "",
        })
        currentExonerated++
      }

      return newMembers.slice(0, totalMembers)
    })
  }, [numAdults, numChildren, numExonerated, totalMembers])

  const handleMemberChange = (index: number, field: keyof Member, value: string | number) => {
    const newMembers = [...members]
    if (field === "age") {
      newMembers[index][field] = value === "" ? "" : Number(value)
    } else if (field === "idNumber") {
      // Solo permitir dígitos y limitar la longitud
      const cleanedValue = String(value).replace(/[^0-9]/g, "") // Eliminar cualquier cosa que no sea un dígito
      newMembers[index][field] = cleanedValue.slice(0, 8) // Limitar a un máximo de 8 dígitos
    } else {
      newMembers[index][field] = value as any
    }
    setMembers(newMembers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = members.every((member) => {
      const isBaseValid =
        member.firstName.trim() !== "" &&
        member.lastName.trim() !== "" &&
        member.age !== "" &&
        member.phone.trim() !== "" &&
        member.email.trim() !== "" &&
        (member.category !== "exonerated" || member.exonerationReason?.trim() !== "")

      // Validación específica para el número de cédula (solo 7 u 8 dígitos, sin guion)
      const isIdNumberValid = /^\d{7,8}$/.test(member.idNumber)

      return isBaseValid && isIdNumberValid
    })

    if (isValid) {
      onMembersSubmit(members)
    } else {
      alert(
        "Por favor, completa todos los campos de todos los integrantes correctamente. Asegúrate de que el número de cédula tenga 7 u 8 dígitos (ej. 1234567 u 12345678).",
      )
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="rounded-xl border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-800">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Datos de los Integrantes ({members.length} personas)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {members.map((member, index) => (
            <Card key={member.id} className="border-emerald-100 bg-emerald-50 p-4 space-y-4">
              <h4 className="font-semibold text-emerald-800">
                {member.category === "adult" ? "Adulto" : member.category === "child" ? "Niño" : "Exonerado"}{" "}
                {index + 1}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`} className="text-emerald-800">
                    Nombre
                  </Label>
                  <Input
                    id={`firstName-${index}`}
                    placeholder="Nombre"
                    value={member.firstName}
                    onChange={(e) => handleMemberChange(index, "firstName", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`} className="text-emerald-800">
                    Apellido
                  </Label>
                  <Input
                    id={`lastName-${index}`}
                    placeholder="Apellido"
                    value={member.lastName}
                    onChange={(e) => handleMemberChange(index, "lastName", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`age-${index}`} className="text-emerald-800">
                    Edad
                  </Label>
                  <Input
                    id={`age-${index}`}
                    type="number"
                    placeholder="Edad"
                    value={member.age}
                    onChange={(e) => handleMemberChange(index, "age", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`idNumber-${index}`} className="text-emerald-800">
                    Número de Cédula
                  </Label>
                  <Input
                    id={`idNumber-${index}`}
                    placeholder="Número de Identificación"
                    value={member.idNumber}
                    onChange={(e) => handleMemberChange(index, "idNumber", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    maxLength={8} // Máximo 8 dígitos sin guion
                    pattern="^\d{7,8}$" // Solo 7 u 8 dígitos
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`} className="text-emerald-800">
                    Teléfono
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    placeholder="+503 7777-8888"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(index, "phone", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`} className="text-emerald-800">
                    Correo Electrónico
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    className="border-emerald-300 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                {member.category === "exonerated" && (
                  <div className="space-y-2 col-span-full">
                    <Label htmlFor={`exonerationReason-${index}`} className="text-emerald-800">
                      Razón de Exoneración
                    </Label>
                    <Select
                      value={member.exonerationReason || ""}
                      onValueChange={(value) => handleMemberChange(index, "exonerationReason", value)}
                    >
                      <SelectTrigger className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        <SelectValue placeholder="Selecciona una razón" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-emerald-200">
                        <SelectItem value="menor_4_anios">Menor de 4 años</SelectItem>
                        <SelectItem value="discapacitado">Persona con discapacidad</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>
          ))}
          <div className="flex justify-between gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              Atrás
            </Button>
            <Button type="submit" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar Datos y Proceder al Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
