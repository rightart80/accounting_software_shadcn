import {
  cryptoCoins,
  cryptoTransactions,
  cryptoPriceHistory,
} from "@/data/seed"
import type { CryptoCoin, CryptoTransaction } from "@/types/crypto"

export function getCryptoCoins(): CryptoCoin[] {
  return cryptoCoins
}

export function getCryptoTransactions(): CryptoTransaction[] {
  return cryptoTransactions
}

export function getCryptoPriceHistory() {
  return cryptoPriceHistory
}
