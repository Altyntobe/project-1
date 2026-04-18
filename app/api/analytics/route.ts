import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  try {
    await requireAuth()

    const [
      totalProducts,
      totalSources,
      categoryStats,
      priceStats,
      recentProducts,
      priceDistribution,
      dailyStats,
      sourcePriceStats,
      categoryCounts,
      monthlyTrends,
      categoryGrowth,
    ] = await Promise.all([
      prisma.productExternalData.count(),
      prisma.productExternalData.groupBy({
        by: ["source"],
        _count: true,
      }),
      prisma.productExternalData.groupBy({
        by: ["category"],
        _count: true,
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.productExternalData.aggregate({
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _sum: { price: true },
        _count: true,
      }),
      prisma.productExternalData.findMany({
        take: 10,
        orderBy: { fetchedAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          source: true,
          fetchedAt: true,
        },
      }),
      // Price distribution (SQLite compatible)
      prisma.$queryRaw`
        SELECT
          CASE
            WHEN price < 50 THEN '0-50'
            WHEN price < 100 THEN '50-100'
            WHEN price < 200 THEN '100-200'
            WHEN price < 500 THEN '200-500'
            ELSE '500+'
          END as range,
          COUNT(*) as count
        FROM ProductExternalData
        GROUP BY range
        ORDER BY MIN(price)
      `,
      // Daily stats for last 7 days (SQLite compatible)
      prisma.$queryRaw`
        SELECT
          date(fetchedAt) as date,
          COUNT(*) as count,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM ProductExternalData
        WHERE fetchedAt >= datetime('now', '-7 days')
        GROUP BY date(fetchedAt)
        ORDER BY date DESC
      `,
      // Source price statistics
      prisma.productExternalData.groupBy({
        by: ["source"],
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _sum: { price: true },
        _count: true,
      }),
      // Top categories by count
      prisma.productExternalData.groupBy({
        by: ["category"],
        _count: true,
        orderBy: { _count: { category: "desc" } },
        take: 10,
      }),
      // Price trends by month (SQLite compatible)
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', fetchedAt) as month,
          COUNT(*) as count,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          SUM(price) as total_value
        FROM ProductExternalData
        WHERE fetchedAt >= datetime('now', '-6 months')
        GROUP BY strftime('%Y-%m', fetchedAt)
        ORDER BY month DESC
      `,
      // Category growth (SQLite compatible)
      prisma.$queryRaw`
        SELECT
          category,
          COUNT(*) as total_count,
          AVG(price) as avg_price,
          COUNT(DISTINCT source) as source_count
        FROM ProductExternalData
        GROUP BY category
        ORDER BY total_count DESC
        LIMIT 15
      `,
    ])

    const priceRange = priceStats._max.price
      ? priceStats._max.price - (priceStats._min.price || 0)
      : 0

    const medianPrice: null = null

    return NextResponse.json({
      summary: {
        totalProducts,
        totalSources: totalSources.length,
        averagePrice: priceStats._avg.price,
        minPrice: priceStats._min.price,
        maxPrice: priceStats._max.price,
        totalValue: priceStats._sum.price,
        priceRange,
        medianPrice,
      },
      sources: totalSources.map((s) => ({
        source: s.source,
        count: s._count,
      })),
      categories: categoryStats.map((c) => ({
        category: c.category,
        count: c._count,
        averagePrice: c._avg.price,
        minPrice: c._min.price,
        maxPrice: c._max.price,
      })),
      recentProducts,
      priceDistribution: (priceDistribution as any[]).map((r: any) => ({
        range: r.range,
        count: Number(r.count),
      })),
      dailyStats: (dailyStats as any[]).map((d: any) => ({
        date: d.date,
        count: Number(d.count),
        avgPrice: Number(d.avg_price),
        minPrice: Number(d.min_price),
        maxPrice: Number(d.max_price),
      })),
      sourcePriceStats: sourcePriceStats.map((s) => ({
        source: s.source,
        averagePrice: s._avg.price,
        minPrice: s._min.price,
        maxPrice: s._max.price,
        totalValue: s._sum.price,
        count: s._count,
      })),
      topCategories: categoryCounts.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      monthlyTrends: (monthlyTrends as any[]).map((m: any) => ({
        month: m.month,
        count: Number(m.count),
        avgPrice: Number(m.avg_price),
        minPrice: Number(m.min_price),
        maxPrice: Number(m.max_price),
        totalValue: Number(m.total_value),
      })),
      categoryGrowth: (categoryGrowth as any[]).map((c: any) => ({
        category: c.category,
        totalCount: Number(c.total_count),
        avgPrice: Number(c.avg_price),
        sourceCount: Number(c.source_count),
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
