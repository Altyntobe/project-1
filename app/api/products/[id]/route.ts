import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const product = await prisma.productExternalData.findUnique({
      where: { id: params.id },
      include: {
        productImage: {
          select: { id: true, mimeType: true, fileName: true, updatedAt: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const { productImage, ...productData } = product
    return NextResponse.json({
      ...productData,
      hasCustomImage: !!productImage,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.productExternalData.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = await prisma.productExternalData.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        price: parsedPrice,
        category: category.trim(),
        source: source.trim(),
        image: image?.trim() || null,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existing = await prisma.productExternalData.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.productExternalData.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

