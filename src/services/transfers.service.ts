import { transferRecords, contacts } from "@/data/seed"
import type { TransferRecord } from "@/types/transfers"

export function getTransferRecords(): TransferRecord[] {
  return transferRecords
}

export function getContacts() {
  return contacts
}
