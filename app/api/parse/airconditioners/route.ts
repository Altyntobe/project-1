import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseAirConditioners } from "@/lib/parsers/airconditioners"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const products = parseAirConditioners()

    const saved = await Promise.all(
      products.map((product) =>
        prisma.productExternalData.upsert({
          where: {
            externalId_source: {
              externalId: product.externalId,
              source: product.source,
            },
          },
          update: {
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
            fetchedAt: product.fetchedAt,
          },
          create: product,
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: saved.length,
    })
  } catch (error) {
    console.error("Error parsing airconditioners:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
