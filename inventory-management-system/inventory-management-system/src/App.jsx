import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Boxes, LayoutDashboard, Package, Tags, Search, Plus, Bell, LogOut,
  Menu, X, TrendingUp, AlertTriangle, DollarSign, PackageCheck, Pencil,
  Trash2, ArrowUpDown, RefreshCw, CircleHelp
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import Auth from './components/Auth'
import StatCard from './components/StatCard'
import ProductModal from './components/ProductModal'
import CategoryManager from './components/CategoryManager'
import { formatCurrency, formatDate, getErrorMessage } from './utils'

export default function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalProduct, setModalProduct] = useState(undefined)
  const [showCategories, setShowCategories] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sort, setSort] = useState('updated_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [page, setPage] = useState('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.clearTimeout(notify.timer)
    notify.timer = window.setTimeout(() => setToast(null), 4200)
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) notify(getErrorMessage(error), 'error')
      setSession(data?.session ?? null)
      setAuthReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [notify])

  const loadData = useCallback(async () => {
    if (!session?.user?.id || !supabase) return
    setLoading(true)
    try {
      const [productResult, categoryResult] = await Promise.all([
        supabase.from('products').select('*, categories(id,name)').order('updated_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ])
      if (productResult.error) throw productResult.error
      if (categoryResult.error) throw categoryResult.error
      setProducts(productResult.data || [])
      setCategories(categoryResult.data || [])
    } catch (error) {
      notify(getErrorMessage(error), 'error')
    } finally { setLoading(false) }
  }, [session?.user?.id, notify])

  useEffect(() => { loadData() }, [loadData])

  const filteredProducts = useMemo(() => {
    let rows = products.filter(product => {
      const term = search.toLowerCase().trim()
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term) || (product.description || '').toLowerCase().includes(term)
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter
      const isLow = Number(product.quantity) <= Number(product.reorder_level)
      const matchesStock = stockFilter === 'all' || (stockFilter === 'low' ? isLow : Number(product.quantity) > Number(product.reorder_level))
      return matchesSearch && matchesCategory && matchesStock
    })
    rows = [...rows].sort((a, b) => {
      const av = a[sort] ?? ''
      const bv = b[sort] ?? ''
      const result = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDirection === 'asc' ? result : -result
    })
    return rows
  }, [products, search, categoryFilter, stockFilter, sort, sortDirection])

  const stats = useMemo(() => ({
    products: products.length,
    units: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    low: products.filter(item => Number(item.quantity) <= Number(item.reorder_level)).length,
    value: products.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
  }), [products])

  async function saveProduct(values) {
    const payload = { ...values, user_id: session.user.id }
    const result = modalProduct?.id
      ? await supabase.from('products').update(payload).eq('id', modalProduct.id).select().single()
      : await supabase.from('products').insert(payload).select().single()
    if (result.error) throw new Error(getErrorMessage(result.error))
    setModalProduct(undefined)
    notify(modalProduct?.id ? 'Product updated successfully.' : 'Product added successfully.')
    await loadData()
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) return notify(getErrorMessage(error), 'error')
    notify('Product deleted.')
    await loadData()
  }

  async function addCategory(values) {
    const { error } = await supabase.from('categories').insert({ ...values, user_id: session.user.id })
    if (error) throw new Error(getErrorMessage(error))
    notify('Category created.')
    await loadData()
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(getErrorMessage(error))
    notify('Category deleted. Related products are now uncategorized.')
    await loadData()
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) notify(getErrorMessage(error), 'error')
    else notify('Signed out.')
  }

  function changeSort(field) {
    if (sort === field) setSortDirection(current => current === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setSortDirection('asc') }
  }

  if (!isSupabaseConfigured) {
    return <main className="setup-screen"><div className="setup-card"><div className="brand-mark"><Boxes size={25}/></div><p className="eyebrow">STOCKROOM SETUP</p><h1>Connect your Supabase project</h1><p className="muted">The application is ready, but it needs your Supabase project URL and public anon/publishable key.</p><ol><li>Open the project folder and copy <code>.env.example</code> to <code>.env.local</code>.</li><li>In Supabase, open <strong>Project Settings → API</strong>.</li><li>Paste the Project URL and anon/publishable key into <code>.env.local</code>.</li><li>Run <code>npm run dev</code> again.</li></ol><div className="security-note"><LockKeyholeIcon/> Never use the <code>service_role</code> key in this React app or commit secrets to GitHub.</div><p className="muted small">Run the SQL in <code>supabase/schema.sql</code> before signing in.</p></div></main>
  }

  if (!authReady) return <div className="loading-screen"><div className="loader-ring"/><span>Loading Stockroom...</span></div>
  if (!session) return <Auth supabase={supabase} notify={notify}/>

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="sidebar-brand"><div className="brand-mark"><Boxes size={23}/></div><div><strong>stockroom</strong><small>INVENTORY CONTROL</small></div><button className="icon-button sidebar-close" onClick={() => setMobileNav(false)}><X size={19}/></button></div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav">
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => {setPage('dashboard');setMobileNav(false)}}><LayoutDashboard size={18}/> Overview</button>
          <button className={page === 'products' ? 'active' : ''} onClick={() => {setPage('products');setMobileNav(false)}}><Package size={18}/> Products <span className="nav-count">{products.length}</span></button>
          <button onClick={() => {setShowCategories(true);setMobileNav(false)}}><Tags size={18}/> Categories</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Use the README for setup and troubleshooting tips.</p></div>
          <div className="profile-row"><div className="avatar">{(session.user.email || 'U').slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{session.user.email}</strong><small>Account</small></div><button className="icon-button" onClick={signOut} title="Sign out"><LogOut size={17}/></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div><p className="breadcrumb">Workspace <span>/</span> {page === 'dashboard' ? 'Overview' : 'Products'}</p><h1>{page === 'dashboard' ? 'Inventory overview' : 'Products'}</h1></div></div>
          <div className="topbar-actions"><div className="secure-status"><span/> Database connected</div><button className="icon-button" onClick={loadData} title="Refresh data"><RefreshCw size={18}/></button><button className="button primary top-add" onClick={() => setModalProduct(null)}><Plus size={17}/> Add product</button></div>
        </header>

        <div className="content-wrap">
          {page === 'dashboard' && <>
            <section className="welcome-row"><div><p className="eyebrow">YOUR INVENTORY AT A GLANCE</p><h2>Good to see you.</h2><p className="muted">Here’s what’s happening with your stock today.</p></div><div className="date-chip">{new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date())}</div></section>
            <section className="stats-grid">
              <StatCard label="Total products" value={stats.products.toLocaleString()} note="Unique items tracked" icon={Package} tone="blue"/>
              <StatCard label="Units in stock" value={stats.units.toLocaleString()} note="Across all products" icon={PackageCheck} tone="violet"/>
              <StatCard label="Low-stock items" value={stats.low.toLocaleString()} note={stats.low ? 'Needs your attention' : 'Stock levels look good'} icon={AlertTriangle} tone="amber"/>
              <StatCard label="Inventory value" value={formatCurrency(stats.value)} note="Based on current quantity" icon={DollarSign} tone="green"/>
            </section>
            <section className="panel inventory-panel">
              <div className="panel-heading"><div><h3>Inventory snapshot</h3><p>Review your latest products and stock levels.</p></div><button className="button subtle" onClick={() => setPage('products')}>View all products <ArrowUpDown size={15}/></button></div>
              <ProductTable products={products.slice(0, 5)} onEdit={p => setModalProduct(p)} onDelete={deleteProduct} loading={loading}/>
            </section>
            <section className="bottom-grid">
              <div className="panel category-panel"><div className="panel-heading"><div><h3>Categories</h3><p>How your inventory is organized.</p></div><button className="icon-button" onClick={() => setShowCategories(true)}><Tags size={18}/></button></div>{categories.length ? <div className="category-summary">{categories.slice(0,5).map(cat => <button key={cat.id} onClick={() => {setCategoryFilter(cat.id);setPage('products')}}><span className="category-dot"/><strong>{cat.name}</strong><small>{products.filter(p => p.category_id === cat.id).length} items</small></button>)}</div> : <p className="empty-note">Create categories to organize your products.</p>}</div>
              <div className="panel attention-panel"><div className="panel-heading"><div><h3>Stock alerts</h3><p>Items at or below their reorder level.</p></div><span className="alert-count">{stats.low}</span></div>{products.filter(p => Number(p.quantity) <= Number(p.reorder_level)).slice(0,4).map(p => <div className="alert-row" key={p.id}><span className="alert-symbol"><AlertTriangle size={16}/></span><div><strong>{p.name}</strong><small>{p.sku}</small></div><b>{p.quantity} left</b></div>)}{!stats.low && <div className="all-good"><PackageCheck size={22}/><span>All products are above their reorder levels.</span></div>}</div>
            </section>
          </>}

          {page === 'products' && <>
            <section className="products-intro"><div><p className="muted">Manage product details, quantities, and stock alerts.</p></div><button className="button primary" onClick={() => setModalProduct(null)}><Plus size={17}/> Add product</button></section>
            <section className="panel products-panel">
              <div className="filters-row"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, SKU, description..."/></div><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="all">All categories</option>{categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><select value={stockFilter} onChange={e => setStockFilter(e.target.value)}><option value="all">All stock levels</option><option value="low">Low stock</option><option value="healthy">Healthy stock</option></select></div>
              <div className="table-meta"><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</span><button className="text-button" onClick={() => {setSearch('');setCategoryFilter('all');setStockFilter('all')}}>Clear filters</button></div>
              <ProductTable products={filteredProducts} onEdit={p => setModalProduct(p)} onDelete={deleteProduct} loading={loading} sortable onSort={changeSort}/>
            </section>
          </>}
          <footer className="app-footer"><span>© {new Date().getFullYear()} Stockroom Inventory</span><span><span className="footer-dot"/> Your data is securely stored in Supabase</span></footer>
        </div>
      </main>
      {modalProduct !== undefined && <ProductModal product={modalProduct} categories={categories} onClose={() => setModalProduct(undefined)} onSave={saveProduct}/>}
      {showCategories && <CategoryManager categories={categories} onAdd={addCategory} onDelete={deleteCategory} onClose={() => setShowCategories(false)}/>}
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.type === 'success' ? <PackageCheck size={18}/> : <AlertTriangle size={18}/>} {toast.message}<button onClick={() => setToast(null)}><X size={16}/></button></div>}
    </div>
  )
}

function ProductTable({ products, onEdit, onDelete, loading, sortable = false, onSort }) {
  if (loading && !products.length) return <div className="table-state"><div className="loader-ring small-ring"/> Loading inventory...</div>
  if (!products.length) return <div className="table-state empty-state"><div className="empty-icon"><Package size={25}/></div><strong>No products found</strong><span>Add your first product or adjust your search filters.</span></div>
  const heading = (label, field) => <button className="sort-heading" onClick={() => sortable && onSort(field)}>{label}{sortable && <ArrowUpDown size={13}/>}</button>
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>{heading('PRODUCT','name')}</th><th>{heading('SKU','sku')}</th><th>CATEGORY</th><th>{heading('PRICE','price')}</th><th>{heading('IN STOCK','quantity')}</th><th>STATUS</th><th> </th></tr></thead><tbody>{products.map(product => {
    const low = Number(product.quantity) <= Number(product.reorder_level)
    return <tr key={product.id}><td><div className="product-cell"><div className="product-thumb"><Package size={17}/></div><div><strong>{product.name}</strong><small>{product.description || 'No description'}</small></div></div></td><td><span className="sku">{product.sku}</span></td><td><span className="category-pill">{product.categories?.name || 'Uncategorized'}</span></td><td className="price-cell">{formatCurrency(product.price)}</td><td><strong>{Number(product.quantity).toLocaleString()}</strong></td><td><span className={`status-pill ${low ? 'low' : 'healthy'}`}><span/>{low ? 'Low stock' : 'In stock'}</span></td><td><div className="row-actions"><button className="icon-button" onClick={() => onEdit(product)} title="Edit product"><Pencil size={16}/></button><button className="icon-button danger-hover" onClick={() => onDelete(product)} title="Delete product"><Trash2 size={16}/></button></div></td></tr>
  })}</tbody></table></div>
}

function LockKeyholeIcon() {
  return <span className="security-icon"><AlertTriangle size={17}/></span>
}