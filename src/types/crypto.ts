export type CryptoCoin = {
  id: string
  symbol: string
  name: string
  logo: string
  price: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  holdings: number
  sparklineData: number[]
}

export type CryptoTransaction = {
  id: string
  type: "buy" | "sell" | "swap" | "receive" | "send"
  coin: string
  coinSymbol: string
  logo: string
  amount: number
  value: number
  date: string
  status: "completed" | "pending"
}
