import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [sourceStats, sourceCategories] = await Promise.all([
      prisma.productExternalData.groupBy({
        by: ["source"],
        _count: true,
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.productExternalData.groupBy({
        by: ["source", "category"],
        _count: true,
      }),
    ])

    const categoryMap = new Map<string, string[]>()
    for (const row of sourceCategories) {
      if (!categoryMap.has(row.source)) {
        categoryMap.set(row.source, [])
      }
      categoryMap.get(row.source)!.push(row.category)
    }

    const sources = sourceStats.map((s) => ({
      source: s.source,
      count: s._count,
      averagePrice: s._avg.price,
      minPrice: s._min.price,
      maxPrice: s._max.price,
      categories: categoryMap.get(s.source) ?? [],
    }))

    return NextResponse.json({ sources })
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
