import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

/** Источники демо-каталога, которые больше не используются в проекте. */
const REMOVED_SOURCES = ["dummyjson", "fakestore"] as const

export async function POST() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await prisma.productExternalData.deleteMany({
      where: { source: { in: [...REMOVED_SOURCES] } },
    })
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error("cleanup-dummy:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
