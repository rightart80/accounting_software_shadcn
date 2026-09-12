"use client"

import { useState } from "react"
import { PlusIcon, Building2Icon, TruckIcon, LoaderIcon, CheckIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { FixedAsset, AssetClassification } from "@/types/assets"

interface AddAssetDialogProps {
  onAdd: (asset: FixedAsset) => void
  defaultClassification?: AssetClassification
}

export function AddAssetDialog({
  onAdd,
  defaultClassification = "property",
}: AddAssetDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "loading" | "success">("form")
  const [classification, setClassification] = useState<AssetClassification>(defaultClassification)
  const [name, setName] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [cost, setCost] = useState("")
  const [location, setLocation] = useState("")
  const [lifespan, setLifespan] = useState("20")
  const [custodian, setCustodian] = useState("")

  function handleRegister() {
    const parsedCost = parseFloat(cost)
    const parsedYears = parseInt(lifespan, 10)
    if (!name || isNaN(parsedCost) || parsedCost <= 0) return

    setStep("loading")
    setTimeout(() => {
      const isProp = classification === "property"
      const prefix = isProp ? "AST-PRP" : "AST-MOV"
      const randomTag = `${prefix}-${Math.floor(200 + Math.random() * 800)}`
      const annualDepr = Math.round(parsedCost / (parsedYears || 10))

      const newAsset: FixedAsset = {
        id: `ast-${Date.now()}`,
        assetTag: randomTag,
        name,
        classification,
        subCategory: subCategory || (isProp ? "Commercial Real Estate" : "Fleet Vehicle"),
        purchaseDate: new Date().toISOString().split("T")[0],
        acquisitionCost: parsedCost,
        currentValuation: parsedCost,
        salvageValue: Math.round(parsedCost * 0.1),
        usefulLifeYears: parsedYears || 15,
        depreciationMethod: "straight_line",
        accumulatedDepreciation: 0,
        annualDepreciationRate: annualDepr,
        location: location || "Corporate Headquarters",
        assignedCustodian: custodian || "Capital Assets Management",
        status: "in_service",
        condition: "excellent",
        identificationNumber: isProp
          ? `DEED-AUTO-${Math.floor(10000 + Math.random() * 90000)}`
          : `VIN-AUTO-${Math.floor(10000 + Math.random() * 90000)}`,
        insurancePolicyNumber: `POL-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        color: isProp ? "bg-blue-600" : "bg-teal-600",
      }

      onAdd(newAsset)
      setStep("success")

      setTimeout(() => {
        setStep("form")
        setOpen(false)
        setName("")
        setCost("")
        setLocation("")
        setCustodian("")
      }, 900)
    }, 700)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5 shadow-sm">
        <PlusIcon className="size-4" />
        Register Fixed Asset
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register Capital Asset</DialogTitle>
          <DialogDescription>
            Add a new property or moving asset to the enterprise fixed asset register.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <LoaderIcon className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Recording in asset ledger...</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-3 text-emerald-500"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckIcon className="size-6" />
              </div>
              <p className="text-sm font-semibold">Asset Capitalized Successfully!</p>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-2"
            >
              {/* Classification Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Asset Classification Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClassification("property")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all",
                      classification === "property"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Building2Icon className="size-4" />
                    Property / Real Estate
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassification("movable")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all",
                      classification === "movable"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <TruckIcon className="size-4" />
                    Moving / Equipment
                  </button>
                </div>
              </div>

              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Asset Title / Name
                </label>
                <Input
                  placeholder={
                    classification === "property"
                      ? "e.g. Dallas Distribution Center"
                      : "e.g. Freightliner Cascadia Unit #19"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Acquisition Cost & Lifespan */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Acquisition Cost ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Useful Life (Years)
                  </label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={lifespan}
                    onChange={(e) => setLifespan(e.target.value)}
                  />
                </div>
              </div>

              {/* Location & Custodian */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Physical Location
                  </label>
                  <Input
                    placeholder="Austin, TX"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Custodian Department
                  </label>
                  <Input
                    placeholder="Logistics Ops"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegister} disabled={!name || !cost}>
                  Record Asset
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
    </>
  )
}
