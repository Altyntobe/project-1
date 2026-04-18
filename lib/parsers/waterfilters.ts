import { NormalizedProduct } from "@/lib/parsers/dummyjson"
import { waterfilters } from "@/data/waterfilters"

export function parseWaterFilters(): NormalizedProduct[] {
  return waterfilters.map((product) => ({
    externalId: `waterfilter-${product.id}`,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    source: "waterfilters",
    fetchedAt: new Date(),
  }))
}
