<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getBusinesses } from '@/services/businesses'
import {
  createProduct,
  deleteProduct,
  deleteProductPrice,
  getProducts,
  setProductPrice,
  updateProduct,
} from '@/services/products'
import { formatDetailedPrice, formatPrice } from '@/utils/currency'
import {
  UNIT_TYPES,
  detailedPrice as computeDetailedPrice,
  packageQtyDisplay,
  packageQtyLabel,
  unitLabel,
  unitSuffix,
} from '@/utils/units'

const products = ref([])
const businesses = ref([])
const loading = ref(true)
const searchTerm = ref('')

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return products.value
  return products.value.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      (product.category ?? '').toLowerCase().includes(term),
  )
})

const name = ref('')
const category = ref('')
const unit = ref('unidad')
const detailedPrice = ref(false)

const editingProductId = ref(null)
const editProductForm = reactive({ name: '', category: '', unit: 'unidad', detailedPrice: false })

// Por producto: formulario de precio { [productId]: { businessId, price, currency, packageQty, editing } }
const priceForms = reactive({})

function emptyPriceForm() {
  return { businessId: '', price: '', currency: 'CRC', packageQty: '', editing: false }
}

async function loadAll() {
  loading.value = true
  const [productList, businessList] = await Promise.all([getProducts(), getBusinesses()])
  products.value = productList
  businesses.value = businessList
  loading.value = false
}

async function handleCreateProduct() {
  if (!name.value.trim()) return
  await createProduct({
    name: name.value.trim(),
    category: category.value.trim() || null,
    unit: unit.value,
    detailedPrice: detailedPrice.value,
  })
  name.value = ''
  category.value = ''
  unit.value = 'unidad'
  detailedPrice.value = false
  await loadAll()
}

function startEditProduct(product) {
  editingProductId.value = product.id
  editProductForm.name = product.name
  editProductForm.category = product.category ?? ''
  editProductForm.unit = product.unit ?? 'unidad'
  editProductForm.detailedPrice = product.detailedPrice ?? false
}

function cancelEditProduct() {
  editingProductId.value = null
}

async function saveEditProduct(productId) {
  if (!editProductForm.name.trim()) return
  await updateProduct(productId, {
    name: editProductForm.name.trim(),
    category: editProductForm.category.trim() || null,
    unit: editProductForm.unit,
    detailedPrice: editProductForm.detailedPrice,
  })
  editingProductId.value = null
  await loadAll()
}

function priceForm(productId) {
  if (!priceForms[productId]) {
    priceForms[productId] = emptyPriceForm()
  }
  return priceForms[productId]
}

function businessName(businessId) {
  return businesses.value.find((b) => b.id === businessId)?.name ?? businessId
}

function startEditPrice(productId, businessId, entry) {
  priceForms[productId] = {
    businessId,
    price: entry.price,
    currency: entry.currency,
    packageQty: entry.packageQty ?? '',
    editing: true,
  }
}

function cancelPriceEdit(productId) {
  priceForms[productId] = emptyPriceForm()
}

async function handleSetPrice(productId) {
  const form = priceForm(productId)
  if (!form.businessId || form.price === '') return
  const packageQty = form.packageQty === '' ? null : Number(form.packageQty)
  await setProductPrice(productId, form.businessId, Number(form.price), form.currency, packageQty)
  priceForms[productId] = emptyPriceForm()
  await loadAll()
}

async function handleDeleteProduct(productId) {
  if (!confirm('¿Eliminar este producto y todos sus precios?')) return
  await deleteProduct(productId)
  delete priceForms[productId]
  await loadAll()
}

async function handleDeletePrice(productId, businessId) {
  if (!confirm('¿Eliminar este precio?')) return
  await deleteProductPrice(productId, businessId)
  if (priceForms[productId]?.businessId === businessId) {
    priceForms[productId] = emptyPriceForm()
  }
  await loadAll()
}

onMounted(loadAll)
</script>

<template>
  <h1 class="h4 mb-3">Productos</h1>

  <div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <form class="row g-2 align-items-end" @submit.prevent="handleCreateProduct">
        <div class="col-12 col-sm-5">
          <label class="form-label" for="pname">Nombre del producto</label>
          <input id="pname" v-model="name" type="text" class="form-control" required />
        </div>
        <div class="col-7 col-sm-3">
          <label class="form-label" for="pcat">Categoría (opcional)</label>
          <input id="pcat" v-model="category" type="text" class="form-control" />
        </div>
        <div class="col-5 col-sm-2">
          <label class="form-label" for="punit">Se vende por</label>
          <select id="punit" v-model="unit" class="form-select" required>
            <option v-for="u in UNIT_TYPES" :key="u.value" :value="u.value">{{ u.label }}</option>
          </select>
        </div>
        <div class="col-12 col-sm-2">
          <button type="submit" class="btn btn-primary w-100">Agregar</button>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input id="pdetailed" v-model="detailedPrice" type="checkbox" class="form-check-input" />
            <label class="form-check-label small" for="pdetailed">
              Ver precio detallado (compara por presentación cuando cambia entre negocios)
            </label>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div v-if="!loading && products.length" class="mb-3">
    <div class="input-group">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
      <input
        v-model="searchTerm"
        type="search"
        class="form-control"
        placeholder="Buscar producto por nombre o categoría…"
        aria-label="Buscar producto"
      />
    </div>
  </div>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <div v-else-if="products.length === 0" class="text-muted">Aún no hay productos agregados.</div>
  <div v-else-if="filteredProducts.length === 0" class="text-muted">
    No se encontraron productos para "{{ searchTerm }}".
  </div>
  <div v-else class="d-flex flex-column gap-3">
    <div v-for="product in filteredProducts" :key="product.id" class="card shadow-sm border-0">
      <div class="card-body">
        <form
          v-if="editingProductId === product.id"
          class="row g-2 align-items-end mb-3"
          @submit.prevent="saveEditProduct(product.id)"
        >
          <div class="col-12 col-sm-5">
            <label class="form-label">Nombre</label>
            <input v-model="editProductForm.name" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-7 col-sm-3">
            <label class="form-label">Categoría</label>
            <input v-model="editProductForm.category" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-5 col-sm-2">
            <label class="form-label">Se vende por</label>
            <select v-model="editProductForm.unit" class="form-select form-select-sm">
              <option v-for="u in UNIT_TYPES" :key="u.value" :value="u.value">{{ u.label }}</option>
            </select>
          </div>
          <div class="col-12 col-sm-2 d-flex gap-1">
            <button type="submit" class="btn btn-sm btn-success w-100" title="Guardar cambios">
              <i class="bi bi-check-lg"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="Cancelar"
              @click="cancelEditProduct"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="col-12">
            <div class="form-check">
              <input
                :id="`pdetailed-${product.id}`"
                v-model="editProductForm.detailedPrice"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label small" :for="`pdetailed-${product.id}`">
                Ver precio detallado
              </label>
            </div>
          </div>
        </form>
        <h2 v-else class="h6 mb-2 d-flex align-items-center gap-2">
          {{ product.name }}
          <span class="badge text-bg-light fw-normal">{{ unitLabel(product.unit) }}</span>
          <span class="d-flex gap-1 ms-auto">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary py-0 px-1"
              title="Editar producto"
              @click="startEditProduct(product)"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger py-0 px-1"
              title="Eliminar producto"
              @click="handleDeleteProduct(product.id)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </span>
        </h2>

        <ul v-if="Object.keys(product.prices ?? {}).length" class="list-unstyled small mb-3">
          <li
            v-for="(entry, businessId) in product.prices"
            :key="businessId"
            class="d-flex justify-content-between align-items-center py-1"
          >
            <span>
              <i class="bi bi-shop me-1"></i>{{ businessName(businessId) }}:
              <span class="fw-semibold">
                {{ formatPrice(entry.price, entry.currency) }} {{ unitSuffix(product.unit) }}
              </span>
              <span v-if="packageQtyDisplay(entry.packageQty, product.unit)" class="text-muted">
                ({{ packageQtyDisplay(entry.packageQty, product.unit) }})
              </span>
              <template
                v-for="detail in [
                  product.detailedPrice ? computeDetailedPrice(entry, product.unit) : null,
                ]"
                :key="`detail-${businessId}`"
              >
                <template v-if="detail">
                  <br />
                  <span class="text-muted" style="font-size: var(--font-size-xs)">
                    {{ formatDetailedPrice(detail.amount, detail.currency) }}{{ detail.suffix }}
                  </span>
                </template>
              </template>
            </span>
            <span class="d-flex gap-1">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary py-0 px-1"
                title="Editar precio"
                @click="startEditPrice(product.id, businessId, entry)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger py-0 px-1"
                title="Eliminar precio"
                @click="handleDeletePrice(product.id, businessId)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </span>
          </li>
        </ul>
        <p v-else class="text-muted small mb-3">Sin precios registrados todavía.</p>

        <template v-if="editingProductId !== product.id">
        <div v-if="priceForm(product.id).editing" class="small text-primary mb-1">
          <i class="bi bi-pencil me-1"></i>Editando precio de
          {{ businessName(priceForm(product.id).businessId) }}
        </div>
        <form
          class="row g-2 align-items-end"
          @submit.prevent="handleSetPrice(product.id)"
        >
          <div class="col-12 col-sm-4">
            <select
              v-model="priceForm(product.id).businessId"
              class="form-select form-select-sm"
              :disabled="priceForm(product.id).editing"
              required
            >
              <option value="" disabled>Negocio</option>
              <option v-for="b in businesses" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="col-6 col-sm-3">
            <input
              v-model="priceForm(product.id).price"
              type="number"
              step="0.01"
              min="0"
              class="form-control form-control-sm"
              placeholder="Precio"
              required
            />
          </div>
          <div class="col-6 col-sm-3">
            <select v-model="priceForm(product.id).currency" class="form-select form-select-sm">
              <option value="CRC">CRC</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div v-if="product.detailedPrice" class="col-12 col-sm-4">
            <input
              v-model="priceForm(product.id).packageQty"
              type="number"
              step="0.01"
              min="0"
              class="form-control form-control-sm"
              :placeholder="packageQtyLabel(product.unit)"
              required
            />
          </div>
          <div class="col-12 col-sm-2 d-flex gap-1">
            <button type="submit" class="btn btn-sm btn-outline-primary w-100">Guardar</button>
            <button
              v-if="priceForm(product.id).editing"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="Cancelar"
              @click="cancelPriceEdit(product.id)"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </form>
        </template>
      </div>
    </div>
  </div>
</template>
