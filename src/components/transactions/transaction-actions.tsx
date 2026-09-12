"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CheckCheckIcon, CheckIcon, DownloadIcon, LoaderIcon, XIcon } from "lucide-react"

import { currentUser } from "@/lib/mock-user"
import { canBulkApproveTransactions } from "@/lib/permissions"
import { Button } from "@/components/ui/button"

type ApproveStep = "idle" | "loading" | "success"

interface TransactionActionsProps {
  selectedCount: number
  onExport: () => void
  onClear: () => void
}

export function TransactionActions({
  selectedCount,
  onExport,
  onClear,
}: TransactionActionsProps) {
  const canApprove = canBulkApproveTransactions(currentUser)
  const [approveStep, setApproveStep] = useState<ApproveStep>("idle")

  function handleApprove() {
    setApproveStep("loading")
    setTimeout(() => {
      setApproveStep("success")
      setTimeout(() => {
        setApproveStep("idle")
        onClear()
      }, 1500)
    }, 1200)
  }

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center p-4 md:pl-[calc(var(--sidebar-width)+1rem)]"
        >
          <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-2.5 shadow-lg ring-1 ring-foreground/10">

            <AnimatePresence mode="wait">
              {approveStep === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-500"
                >
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckIcon className="size-3" />
                  </div>
                  <span className="text-sm font-medium">Approved!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className="tabular-nums text-sm font-medium">
                    {selectedCount} selected
                  </span>

                  <div className="h-4 w-px bg-border" />

                  {canApprove ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleApprove}
                      disabled={approveStep === "loading"}
                    >
                      {approveStep === "loading" ? (
                        <LoaderIcon className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCheckIcon className="size-3.5" />
                      )}
                      {approveStep === "loading" ? "Approving…" : "Bulk Approve"}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Admins only
                    </span>
                  )}

                  <Button variant="outline" size="sm" onClick={onExport}>
                    <DownloadIcon className="size-3.5" />
                    Export CSV
                  </Button>

                  <Button variant="ghost" size="sm" onClick={onClear}>
                    <XIcon className="size-3.5" />
                    Clear
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
