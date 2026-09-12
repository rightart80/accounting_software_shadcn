"use client"

import { useMemo } from "react"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getAssetValuationHistory } from "@/services/assets.service"
import type { AssetClassification } from "@/types/assets"

interface AssetValuationChartProps {
  classification: AssetClassification | "all"
}

const chartConfig: ChartConfig = {
  propertyValue: { label: "Real Estate & Properties", color: "var(--color-chart-1)" },
  movableValue: { label: "Moving & Fleet Assets", color: "var(--color-chart-2)" },
  totalCostBasis: { label: "Cost Basis", color: "var(--color-chart-4)" },
}

const historyData = getAssetValuationHistory()

export function AssetValuationChart({
  classification,
}: AssetValuationChartProps) {
  const chartData = useMemo(() => {
    return historyData.map((d) => ({
      ...d,
      displayPropertyM: d.propertyValue / 1_000_000,
      displayMovableM: d.movableValue / 1_000_000,
      displayTotalCostM: d.totalCostBasis / 1_000_000,
    }))
  }, [])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Asset Valuation & Capital Growth
            </CardTitle>
            <CardDescription>
              {classification === "property"
                ? "Historical assessed appreciation for properties ($ Millions)"
                : classification === "movable"
                ? "Fleet & equipment net book value over lifespan ($ Millions)"
                : "Multi-year capital asset valuation vs cost basis ($ Millions)"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-end pb-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="propValGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="movValGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `$${v}M`}
              className="text-xs fill-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            {(classification === "all" || classification === "property") && (
              <Area
                type="monotone"
                dataKey="displayPropertyM"
                name="propertyValue"
                stroke="var(--color-chart-1)"
                fill="url(#propValGrad)"
                strokeWidth={2}
              />
            )}

            {(classification === "all" || classification === "movable") && (
              <Area
                type="monotone"
                dataKey="displayMovableM"
                name="movableValue"
                stroke="var(--color-chart-2)"
                fill="url(#movValGrad)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
