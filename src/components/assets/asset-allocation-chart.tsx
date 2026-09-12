"use client"

import { useMemo, useState, useCallback } from "react"
import { PieChart, Pie, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import type { FixedAsset, AssetClassification } from "@/types/assets"

const ASSET_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
]

interface AssetAllocationChartProps {
  assets: FixedAsset[]
  classification: AssetClassification | "all"
}

export function AssetAllocationChart({
  assets,
  classification,
}: AssetAllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const { categoryData, totalValue } = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of assets) {
      map.set(a.subCategory, (map.get(a.subCategory) ?? 0) + a.currentValuation)
    }
    const data = Array.from(map.entries()).map(([subCat, val], i) => ({
      name: subCat,
      value: val,
      fill: ASSET_COLORS[i % ASSET_COLORS.length],
    }))
    const total = data.reduce((s, d) => s + d.value, 0)
    return { categoryData: data, totalValue: total }
  }, [assets])

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {}
    categoryData.forEach((c) => {
      config[c.name] = { label: c.name, color: c.fill }
    })
    return config
  }, [categoryData])

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const fmtCurrency = (v: number) =>
    `$${(v / 1_000_000).toFixed(2)}M`

  const title =
    classification === "property"
      ? "Property Category Breakdown"
      : classification === "movable"
      ? "Moving Asset Fleet Breakdown"
      : "Fixed Asset Capital Allocation"

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>
          {classification === "property"
            ? "Distribution across corporate facilities and land"
            : classification === "movable"
            ? "Distribution across fleet, machinery, and equipment"
            : "Portfolio breakdown across real estate and movable plant"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-between pb-4">
        <div className="relative flex w-full justify-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[220px] w-full"
          >
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                strokeWidth={2}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.fill}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    stroke="var(--background)"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Center text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground">Portfolio Value</span>
            <span className="text-xl font-bold tracking-tight">
              {fmtCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
          {categoryData.map((cat, i) => {
            const pct = totalValue > 0 ? ((cat.value / totalValue) * 100).toFixed(1) : "0"
            return (
              <div
                key={cat.name}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted/50"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.fill }}
                  />
                  <span className="truncate text-muted-foreground">{cat.name}</span>
                </div>
                <span className="tabular-nums font-medium">
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
