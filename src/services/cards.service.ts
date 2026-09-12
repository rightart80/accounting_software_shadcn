import { cardsData } from "@/data/seed"
import type { CardData } from "@/types/cards"

export function getCards(): CardData[] {
  return cardsData
}
