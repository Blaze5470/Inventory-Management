import { useState } from 'react'
import { Plus, Trash2, Tag, X } from 'lucide-react'

export default function CategoryManager({ categories, onAdd, onDelete, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function add(event) {
    event.preventDefault()
    if (!name.trim()) return setError('Category name is required.')
    setBusy(true); setError('')
    try {
      await onAdd({ name: name.trim(), description: description.trim() })
      setName(''); setDescription('')
    } catch (err) { setError(err.message || 'Could not add category.') }
    finally { setBusy(false) }
  }

  async function remove(category) {
    if (!window.confirm(`Delete category "${category.name}"? Products in this category will become uncategorized.`)) return
    try { await onDelete(category.id) }
    catch (err) { setError(err.message || 'Could not delete category.') }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal-card category-modal" role="dialog" aria-modal="true" aria-labelledby="category-title">
        <div className="modal-heading"><div><p className="eyebrow">ORGANIZE INVENTORY</p><h2 id="category-title">Manage categories</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
        <form className="category-add" onSubmit={add}>
          <div className="field"><label>Category name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Electronics" maxLength={60}/></div>
          <div className="field"><label>Description (optional)</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="What belongs here?" maxLength={200}/></div>
          <button className="button primary" disabled={busy}><Plus size={17}/> Add</button>
        </form>
        {error && <div className="form-error">{error}</div>}
        <div className="category-list">{categories.length ? categories.map(category => <div className="category-row" key={category.id}><span className="category-symbol"><Tag size={16}/></span><div className="category-info"><strong>{category.name}</strong><small>{category.description || 'No description'}</small></div><button className="icon-button danger-hover" onClick={() => remove(category)} aria-label={`Delete ${category.name}`}><Trash2 size={17}/></button></div>) : <p className="empty-note">No categories yet. Add your first category above.</p>}</div>
      </section>
    </div>
  )
}