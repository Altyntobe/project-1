import { NormalizedProduct } from "@/lib/parsers/dummyjson"

interface FakeStoreProduct {
  id: number
  title: string
  price: number
  category: string
  image: string
}

type FakeStoreResponse = FakeStoreProduct[]

const FAKESTORE_URL = "https://fakestoreapi.com/products"

async function fetchWithRetries(url: string, attempts = 3): Promise<Response> {
  let last: Response | null = null
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1000 * i))
    last = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AnalyticalDashboard/1.0",
      },
      next: { revalidate: 0 },
    })
    if (last.ok) return last
  }
  return last!
}

export async function parseFakeStore(): Promise<NormalizedProduct[]> {
  const response = await fetchWithRetries(FAKESTORE_URL)

  if (!response.ok) {
    throw new Error(
      `Fake Store недоступен (HTTP ${response.status}) — остальные источники всё равно загрузятся`
    )
  }

  const products: FakeStoreResponse = await response.json()

  return products.map((product) => ({
    externalId: `fakestore-${product.id}`,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    source: "fakestore",
    fetchedAt: new Date(),
  }))
}

