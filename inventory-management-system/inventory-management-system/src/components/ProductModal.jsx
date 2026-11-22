import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = { name: '', sku: '', description: '', price: '', quantity: '0', category_id: '', reorder_level: '5' }

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        quantity: String(product.quantity ?? 0),
        category_id: product.category_id || '',
        reorder_level: String(product.reorder_level ?? 5),
      })
    } else setForm(emptyForm)
  }, [product])

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const price = Number(form.price)
    const quantity = Number(form.quantity)
    const reorder = Number(form.reorder_level)
    if (!form.name.trim() || !form.sku.trim()) return setError('Product name and SKU are required.')
    if (!Number.isFinite(price) || price < 0) return setError('Enter a valid price of zero or more.')
    if (!Number.isInteger(quantity) || quantity < 0) return setError('Quantity must be a whole number of zero or more.')
    if (!Number.isInteger(reorder) || reorder < 0) return setError('Reorder level must be a whole number of zero or more.')
    setBusy(true)
    try {
      await onSave({
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        price,
        quantity,
        category_id: form.category_id || null,
        reorder_level: reorder,
      })
    } catch (err) {
      setError(err.message || 'Could not save product.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-heading">
          <div><p className="eyebrow">{product ? 'UPDATE INVENTORY' : 'NEW INVENTORY ITEM'}</p><h2 id="product-modal-title">{product ? 'Edit product' : 'Add product'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="product-form">
          <div className="form-grid">
            <div className="field span-two"><label>Product name *</label><input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Wireless Keyboard" maxLength={100} required /></div>
            <div className="field"><label>SKU *</label><input value={form.sku} onChange={e => update('sku', e.target.value)} placeholder="e.g. KEY-001" maxLength={40} required /></div>
            <div className="field"><label>Category</label><select value={form.category_id} onChange={e => update('category_id', e.target.value)}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="field"><label>Unit price ($) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" required /></div>
            <div className="field"><label>Quantity *</label><input type="number" min="0" step="1" value={form.quantity} onChange={e => update('quantity', e.target.value)} required /></div>
            <div className="field"><label>Low-stock alert at</label><input type="number" min="0" step="1" value={form.reorder_level} onChange={e => update('reorder_level', e.target.value)} required /></div>
            <div className="field span-two"><label>Description</label><textarea rows="3" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Optional product details..." maxLength={500} /></div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving...' : product ? 'Save changes' : 'Add product'}</button></div>
        </form>
      </section>
    </div>
  )
}