"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translateCategory, translateSource } from "@/lib/translations/categories"
import { Pencil, Trash2, Plus, X, Search, ChevronLeft, ChevronRight, Upload, ImageIcon } from "lucide-react"

interface Product {
  id: string
  title: string
  price: number
  category: string
  source: string
  image: string | null
  fetchedAt: string
  createdAt: string
}

interface ProductForm {
  title: string
  price: string
  category: string
  source: string
}

const EMPTY_FORM: ProductForm = {
  title: "",
  price: "",
  category: "",
  source: "",
}

const KNOWN_CATEGORIES = [
  "сплит-система",
  "инвертор",
  "мобильный",
  "мульти-сплит",
  "кассетный",
  "обратный осмос",
  "кувшин",
  "под мойку",
  "магистральный",
  "насадка на кран",
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "smartphones",
  "skin-care",
  "electronics",
  "tablets",
  "vehicle",
]

const KNOWN_SOURCES = ["airconditioners", "waterfilters", "dummyjson", "fakestore", "manual"]

const PAGE_SIZE = 20

export default function AdminPage() {
  const { t, locale } = useLanguage()
  const a = t.admin

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSource, setFilterSource] = useState("")
  const [page, setPage] = useState(0)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (filterCategory) params.set("category", filterCategory)
      if (filterSource) params.set("source", filterSource)

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      setProducts(data.products)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [page, filterCategory, filterSource])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      title: product.title,
      price: String(product.price),
      category: product.category,
      source: product.source,
    })
    setImageFile(null)
    // Show existing image as preview
    setImagePreview(product.image || null)
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setFormError(null)
  }

  const handleFormChange = (field: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setFormError(t.products.allowedFormats)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError(t.products.maxFileSize)
      return
    }

    setImageFile(file)
    setFormError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError(a.fieldTitle + " — обязательное поле")
      return
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      setFormError(a.fieldPrice + " — введите корректное число")
      return
    }
    if (!form.category.trim()) {
      setFormError(a.fieldCategory + " — обязательное поле")
      return
    }
    if (!form.source.trim()) {
      setFormError(a.fieldSource + " — обязательное поле")
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        title: form.title.trim(),
        price: parseFloat(form.price),
        category: form.category.trim(),
        source: form.source.trim(),
        image: null as string | null,
      }

      let productId: string
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || "Failed to update")
        }
        productId = editingProduct.id
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || "Failed to create")
        }
        const data = await res.json()
        productId = data.product.id
      }

      // Upload image file if selected
      if (imageFile) {
        const fd = new FormData()
        fd.append("image", imageFile)
        const imgRes = await fetch(`/api/products/${productId}/image`, {
          method: "POST",
          body: fd,
        })
        if (!imgRes.ok) {
          const body = await imgRes.json().catch(() => ({}))
          throw new Error(body?.error || "Image upload failed")
        }
      }

      closeModal()
      await fetchProducts()
      showSuccess(editingProduct ? a.productUpdated : a.productAdded)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || "Failed to delete")
      }
      setDeleteTarget(null)
      await fetchProducts()
      showSuccess(a.productDeleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const filteredProducts = search.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    : products

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{a.title}</h1>
          <p className="text-muted-foreground mt-1">{a.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {a.addProduct}
        </button>
      </div>

      {/* Stats */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-card inline-block">
        <p className="text-sm text-muted-foreground">{a.totalProducts}</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500 text-green-700 dark:text-green-400 rounded">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive text-destructive rounded">
          {t.common.error}: {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={a.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(0) }}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{a.allCategories}</option>
          {KNOWN_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {translateCategory(cat, locale)}
            </option>
          ))}
        </select>

        <select
          value={filterSource}
          onChange={(e) => { setFilterSource(e.target.value); setPage(0) }}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{a.allSources}</option>
          {KNOWN_SOURCES.map((src) => (
            <option key={src} value={src}>
              {translateSource(src, locale)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">{a.fieldTitle}</th>
                <th className="text-left px-4 py-3 font-medium">{a.fieldPrice}</th>
                <th className="text-left px-4 py-3 font-medium">{a.fieldCategory}</th>
                <th className="text-left px-4 py-3 font-medium">{a.fieldSource}</th>
                <th className="text-left px-4 py-3 font-medium">{a.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    {t.common.loading}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    {a.noProductsFound}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[250px]">
                      <div className="flex items-center gap-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-8 w-8 rounded object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="truncate">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {product.price.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        {translateCategory(product.category, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        {translateSource(product.source, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title={a.editProduct}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title={a.deleteProduct}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {page + 1} {a.pageOf} {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3 w-3" /> {a.prev}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {a.next} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                {editingProduct ? a.editProduct : a.addProduct}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {a.fieldImage}
                </label>

                {/* Preview */}
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border mb-2">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      aria-label={t.products.deleteImage}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">{t.products.uploadImage}</span>
                    <span className="text-xs">{t.products.allowedFormats}</span>
                    <span className="text-xs">{t.products.maxFileSize}</span>
                  </button>
                )}

                {/* Change button shown when preview is active */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {t.products.changeImage}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  aria-label={t.products.uploadImage}
                  title={t.products.uploadImage}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {a.fieldTitle} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder={a.fieldTitlePlaceholder}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {a.fieldPrice} (₸) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {a.fieldCategory} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  list="categories-list"
                  value={form.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  placeholder={a.fieldCategoryPlaceholder}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <datalist id="categories-list">
                  {KNOWN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {a.fieldSource} <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.source}
                  onChange={(e) => handleFormChange("source", e.target.value)}
                  aria-label={a.fieldSource}
                  title={a.fieldSource}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{a.fieldSourcePlaceholder}</option>
                  {KNOWN_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {translateSource(src, locale)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form error */}
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? a.saving : t.common.save}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex-1 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-xl font-semibold mb-2">{a.deleteProduct}</h2>
            <p className="text-muted-foreground text-sm mb-2">{a.deleteConfirm}</p>
            <p className="font-medium mb-5 truncate">&ldquo;{deleteTarget.title}&rdquo;</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors font-medium"
              >
                {deleting ? a.deleting : a.confirmDelete}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {a.cancelDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
