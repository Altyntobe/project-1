import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, price, category, source, image } = body

    if (!title || price === undefined || price === null || !category || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const externalId = `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`

    const product = await prisma.productExternalData.create({
      data: {
        externalId,
        title: title.trim(),
        price: parsedPrice,
        category: category.trim(),
        source: source.trim(),
        image: image?.trim() || null,
        fetchedAt: new Date(),
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const source = searchParams.get("source")
    const MAX_LIMIT = 500
    const rawLimit = parseInt(searchParams.get("limit") || "50")
    const rawOffset = parseInt(searchParams.get("offset") || "0")
    const limit = isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
    const offset = isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0)

    const where: { category?: string; source?: string } = {}
    if (category) where.category = category
    if (source) where.source = source

    const [products, total] = await Promise.all([
      prisma.productExternalData.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { fetchedAt: "desc" },
      }),
      prisma.productExternalData.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

