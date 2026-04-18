import { NextResponse } from "next/server"
import { parseDummyJSON } from "@/lib/parsers/dummyjson"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const products = await parseDummyJSON()

    // Save to database
    const saved = await Promise.all(
      products.map((product) =>
        prisma.productExternalData.create({
          data: product,
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: saved.length,
      products: saved,
    })
  } catch (error) {
    console.error("Error parsing DummyJSON:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

