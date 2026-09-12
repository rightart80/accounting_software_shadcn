"use client"

import { useState } from "react"
import { PlusIcon, CheckIcon, LoaderIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { usePreferences } from "@/contexts/preferences-context"

import type { Client, ClientType } from "@/types/clients"

interface AddClientProps {
  onAdd: (client: Client) => void
}

type Step = "idle" | "form" | "loading" | "success"

const clientTypes: { value: ClientType; label: string }[] = [
  { value: "Enterprise", label: "Enterprise" },
  { value: "Retainer", label: "Retainer" },
  { value: "Contract", label: "Contract" },
  { value: "SMB", label: "SMB" },
  { value: "Startup", label: "Startup" },
]

const clientTypeColors: Record<ClientType, string> = {
  Enterprise: "bg-blue-600",
  Retainer: "bg-purple-600",
  Contract: "bg-amber-600",
  SMB: "bg-green-500",
  Startup: "bg-emerald-600",
}

export function AddClient({ onAdd }: AddClientProps) {
  const { clientLabelSingular } = usePreferences()
  const [step, setStep] = useState<Step>("idle")
  const [company, setCompany] = useState("")
  const [name, setName] = useState("")
  const [clientType, setClientType] = useState<ClientType | "">("")
  const [email, setEmail] = useState("")

  function handleConnect() {
    if (!company || !name || !clientType || !email) return

    setStep("loading")
    setTimeout(() => {
      const sanitizedName = company.toLowerCase().replace(/[^a-z0-9]/g, "")
      const newClient: Client = {
        id: `cl-${Date.now()}`,
        name,
        company,
        type: clientType as ClientType,
        tier: clientType === "Enterprise" ? "tier-1" : "tier-2",
        industry: "Corporate Client",
        clientLogo: `/logos/${sanitizedName}-com.png`,
        clientNumber: `CLT-${Math.floor(1000 + Math.random() * 9000)}`,
        email,
        totalRevenue: 0,
        currency: "$",
        change: 0,
        changePercent: 0,
        lastActivity: "Just now",
        status: "active",
        activeProjects: 1,
        color: clientTypeColors[clientType as ClientType] ?? "bg-blue-600",
      }
      onAdd(newClient)
      setStep("success")

      setTimeout(() => {
        setStep("idle")
        setCompany("")
        setName("")
        setClientType("")
        setEmail("")
      }, 1500)
    }, 1500)
  }

  return (
    <Card
      className={cn(
        "flex min-h-[140px] items-center justify-center border-2 border-dashed ring-0 transition-colors",
        step === "idle" && "cursor-pointer hover:border-primary/40 hover:bg-muted/30"
      )}
      onClick={() => step === "idle" && setStep("form")}
    >
      <CardContent className="flex w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <PlusIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">Onboard New {clientLabelSingular}</span>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex w-full flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                placeholder="Contact person"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Select
                value={clientType}
                onValueChange={(v) => v && setClientType(v as ClientType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Engagement type" />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Billing email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setStep("idle")
                    setCompany("")
                    setName("")
                    setClientType("")
                    setEmail("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!company || !name || !clientType || !email}
                  onClick={handleConnect}
                >
                  Add {clientLabelSingular}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <LoaderIcon className="size-6 animate-spin" />
              <span className="text-sm">Registering {clientLabelSingular.toLowerCase()}...</span>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-emerald-500"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">{clientLabelSingular} Registered!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
