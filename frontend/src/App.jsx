import { useState, useEffect, useCallback } from 'react'
import { Search, Package, Bell, TrendingDown, Home, RefreshCw, X, Star, ExternalLink, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import * as api from './api'
import './index.css'

function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, show }
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} color="var(--green)" />}
          {t.type === 'error' && <AlertTriangle size={16} color="var(--red)" />}
          {t.type === 'info' && <Info size={16} color="var(--blue)" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

function AlertModal({ product, onClose, onCreated, toast }) {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!email || !targetPrice) return toast.show('Fill all fields', 'error')
    setLoading(true)
    try {
      await api.createAlert(product.asin, { email, target_price: parseFloat(targetPrice) })
      toast.show('Alert created!', 'success')
      onCreated()
      onClose()
    } catch {
      toast.show('Failed to create alert', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>Set Price Alert</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{product.title?.slice(0, 60)}...</p>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, background: 'var(--surface2)', padding: 14, borderRadius: 10 }}>
            <img src={product.image_url} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Current Price</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne', color: 'var(--green)' }}>
                {product.current_price ? `$${product.current_price}` : 'N/A'}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email for Notification</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Alert when price drops to ($)</label>
            <input className="form-input" type="number" placeholder="e.g. 49.99" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={loading}>
            {loading ? <span className="spinner" style={{width:16,height:16}} /> : <Bell size={15} />}
            {loading ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductModal({ asin, trackedProducts, onTrack, onClose, toast }) {
  const [product, setProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alerts, setAlerts] = useState([])
  const isTracked = trackedProducts.some(p => p.asin === asin)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [detRes, histRes] = await Promise.all([
          api.getProductDetails(asin),
          api.getPriceHistory(asin).catch(() => ({ data: { history: [] } }))
        ])
        setProduct(detRes.data)
        setHistory(histRes.data.history || [])
        if (isTracked) {
          const alertRes = await api.getProductAlerts(asin).catch(() => ({ data: [] }))
          setAlerts(alertRes.data)
        }
      } catch { toast.show('Failed to load product', 'error') }
      finally { setLoading(false) }
    }
    load()
  }, [asin])

  const chartData = history.slice().reverse().map((h, i) => ({
    day: `Day ${i + 1}`, price: parseFloat(h.price)
  }))

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ padding: 60 }}>
        <div className="loading"><div className="spinner" /><span>Loading product...</span></div>
      </div>
    </div>
  )

  if (!product) return null

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>Product Details</h3>
            <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              <img src={product.image_url} alt="" style={{ width: 120, height: 120, objectFit: 'contain', background: 'var(--surface2)', borderRadius: 10, padding: 8, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>{product.title}</h4>
                <div className="price-row">
                  {product.current_price && <span className="price-current">{product.current_price}</span>}
                  {product.original_price && <span className="price-original">{product.original_price}</span>}
                </div>
                {product.rating && (
                  <div className="rating" style={{ marginBottom: 10 }}>
                    <Star size={13} fill="currentColor" /><span>{product.rating}</span>
                    {product.reviews && <span style={{ color: 'var(--text3)' }}>({product.reviews?.toLocaleString()})</span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className={`btn btn-sm ${isTracked ? 'btn-secondary' : 'btn-primary'}`} onClick={() => onTrack(asin)}>
                    {isTracked ? 'Tracked ✓' : '+ Track Price'}
                  </button>
                  {isTracked && (
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowAlert(true)}>
                      <Bell size={13} /> Set Alert
                    </button>
                  )}
                  {product.product_url && (
                    <a href={product.product_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
                      <ExternalLink size={13} /> Amazon
                    </a>
                  )}
                </div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="chart-wrap">
                <div className="chart-title">Price History</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {alerts.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="chart-title">Active Alerts ({alerts.length})</div>
                {alerts.map(alert => (
                  <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>Alert at <strong style={{ color: 'var(--accent)' }}>${alert.target_price}</strong> → {alert.email}</span>
                    <span className={`tag ${alert.triggered ? 'tag-green' : 'tag-blue'}`}>{alert.triggered ? 'Triggered' : 'Active'}</span>
                  </div>
                ))}
              </div>
            )}

            {product.about && product.about.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="chart-title">About this product</div>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  {product.about.slice(0, 5).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {showAlert && product && (
        <AlertModal
          product={{ ...product, asin }}
          onClose={() => setShowAlert(false)}
          onCreated={() => {}}
          toast={toast}
        />
      )}
    </>
  )
}

function Dashboard({ trackedProducts, allAlerts, onNavigate }) {
  const triggered = allAlerts.filter(a => a.triggered).length
  const savings = trackedProducts.reduce((acc, p) => {
    if (p.current_price && p.original_price) {
      const diff = parseFloat(p.original_price) - parseFloat(p.current_price)
      return acc + (diff > 0 ? diff : 0)
    }
    return acc
  }, 0)

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Track prices, set alerts, save money.</p>
      </div>
      <div className="stats-row">
        <div className="stat-card stat-blue">
          <div className="stat-icon" style={{background:'rgba(79,172,254,0.15)',color:'var(--blue)'}}><Package size={18} /></div>
          <div className="stat-value">{trackedProducts.length}</div>
          <div className="stat-label">Tracked Products</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon"><Bell size={18} /></div>
          <div className="stat-value">{allAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon" style={{background:'rgba(0,214,143,0.15)',color:'var(--green)'}}><CheckCircle size={18} /></div>
          <div className="stat-value">{triggered}</div>
          <div className="stat-label">Triggered Alerts</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon" style={{background:'rgba(167,139,250,0.15)',color:'#a78bfa'}}><TrendingDown size={18} /></div>
          <div className="stat-value" style={{fontSize: savings > 9999 ? '20px' : '28px'}}>${savings.toFixed(0)}</div>
          <div className="stat-label">Potential Savings</div>
        </div>
      </div>

      {trackedProducts.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px' }}><Search size={28} /></div>
          <h3 style={{ fontFamily: 'Syne', fontSize: 18, marginBottom: 8 }}>Start Tracking Prices</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Search for products and track their prices over time.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('search')}><Search size={15} /> Search Products</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 600 }}>Recently Tracked</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate('tracked')}>View All</button>
          </div>
          <div className="tracked-list">
            {trackedProducts.slice(0, 5).map(p => (
              <div key={p.asin} className="tracked-item">
                <img src={p.image_url} alt="" className="tracked-img" onError={e => e.target.style.display='none'} />
                <div className="tracked-info">
                  <div className="tracked-title">{p.title}</div>
                  <div className="tracked-prices">
                    {p.current_price && <span className="price-current" style={{ fontSize: 16 }}>${parseFloat(p.current_price).toFixed(2)}</span>}
                    {p.original_price && <span className="price-original">${parseFloat(p.original_price).toFixed(2)}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{p.asin}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchPage({ trackedProducts, onTrack, onProductClick, toast }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.searchProducts(query)
      setResults(res.data.products || [])
      if (!res.data.success) toast.show(res.data.error || 'Search failed', 'error')
    } catch {
      toast.show('Search failed. Is the backend running?', 'error')
      setResults([])
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Search Products</h2>
        <p>Find products on Amazon and track their prices.</p>
      </div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 28, maxWidth: 600 }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={16} />
          <input className="search-input" placeholder="Search for products..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{width:16,height:16}} /> : <Search size={15} />}
          Search
        </button>
      </form>

      {loading && <div className="loading"><div className="spinner" /><span>Searching Amazon...</span></div>}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Search size={28} /></div>
          <h3>No Results</h3>
          <p>Try a different search term</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div style={{ marginBottom: 16, color: 'var(--text2)', fontSize: 13 }}>{results.length} results found</div>
          <div className="products-grid">
            {results.map(product => {
              const isTracked = trackedProducts.some(p => p.asin === product.asin)
              return (
                <div key={product.asin} className="product-card">
                  <div className="product-card-img" onClick={() => onProductClick(product.asin)}>
                    <img src={product.image_url} alt={product.title} onError={e => { e.target.style.display='none' }} />
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-title" onClick={() => onProductClick(product.asin)} style={{ cursor: 'pointer' }}>
                      {product.title}
                    </div>
                    <div className="price-row">
                      {product.current_price && <span className="price-current">{product.current_price}</span>}
                      {product.original_price && <span className="price-original">{product.original_price}</span>}
                      {product.discount && <span className="price-discount">{product.discount}</span>}
                    </div>
                    <div className="product-meta">
                      {product.rating && (
                        <div className="rating">
                          <Star size={12} fill="currentColor" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                      {product.is_prime && <span className="prime-badge">prime</span>}
                    </div>
                    <button className={`btn btn-track ${isTracked ? 'tracked' : ''}`} onClick={() => onTrack(product.asin)}>
                      {isTracked ? '✓ Tracked' : '+ Track Price'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function TrackedPage({ trackedProducts, onUntrack, onRefresh, onAlert, onProductClick }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Tracked Products</h2>
        <p>{trackedProducts.length} products being monitored</p>
      </div>
      {trackedProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Package size={28} /></div>
          <h3>No Tracked Products</h3>
          <p>Search for products and click "Track Price" to monitor them.</p>
        </div>
      ) : (
        <div className="tracked-list">
          {trackedProducts.map(p => (
            <div key={p.asin} className="tracked-item">
              <img src={p.image_url} alt="" className="tracked-img" onError={e => e.target.style.display='none'} />
              <div className="tracked-info">
                <div className="tracked-title" style={{ cursor: 'pointer' }} onClick={() => onProductClick(p.asin)}>{p.title}</div>
                <div className="tracked-prices">
                  {p.current_price && <span className="price-current" style={{ fontSize: 15 }}>${parseFloat(p.current_price).toFixed(2)}</span>}
                  {p.original_price && <span className="price-original">${parseFloat(p.original_price).toFixed(2)}</span>}
                  {p.alerts?.length > 0 && <span className="tag tag-blue"><Bell size={10} /> {p.alerts.length} alerts</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  ASIN: {p.asin} · Updated: {new Date(p.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="tracked-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => onAlert(p)} title="Set alert"><Bell size={13} /></button>
                <button className="btn btn-sm btn-secondary" onClick={() => onRefresh(p.asin)} title="Refresh price"><RefreshCw size={13} /></button>
                <button className="btn btn-sm btn-danger" onClick={() => onUntrack(p.asin)} title="Remove"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AlertsPage({ allAlerts, onDeleteAlert }) {
  const [tab, setTab] = useState('all')
  const filtered = tab === 'all' ? allAlerts : tab === 'active' ? allAlerts.filter(a => !a.triggered) : allAlerts.filter(a => a.triggered)

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Price Alerts</h2>
        <p>Get notified when prices drop to your target.</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({allAlerts.length})</button>
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active ({allAlerts.filter(a => !a.triggered).length})</button>
        <button className={`tab ${tab === 'triggered' ? 'active' : ''}`} onClick={() => setTab('triggered')}>Triggered ({allAlerts.filter(a => a.triggered).length})</button>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bell size={28} /></div>
          <h3>No Alerts</h3>
          <p>Go to Tracked Products and set a price alert.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {filtered.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.triggered ? 'triggered' : ''}`}>
              {alert.image_url && <img src={alert.image_url} className="alert-img" onError={e => e.target.style.display='none'} alt="" />}
              <div className="alert-info">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-prices">
                  <span className="alert-target">Target: ${parseFloat(alert.target_price).toFixed(2)}</span>
                  {alert.current_price && <span className="alert-current">Current: ${alert.current_price.toFixed(2)}</span>}
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>{alert.email}</span>
                </div>
              </div>
              <span className={`alert-status ${alert.triggered ? 'triggered-badge' : 'active'}`}>
                {alert.triggered ? '🎉 Triggered' : 'Active'}
              </span>
              <button className="btn btn-icon btn-danger btn-sm" onClick={() => onDeleteAlert(alert.id)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [trackedProducts, setTrackedProducts] = useState([])
  const [allAlerts, setAllAlerts] = useState([])
  const [selectedAsin, setSelectedAsin] = useState(null)
  const [alertProduct, setAlertProduct] = useState(null)
  const toast = useToast()

  const loadData = useCallback(async () => {
    try {
      const [trackedRes, alertsRes] = await Promise.all([api.getTrackedProducts(), api.getAllAlerts()])
      setTrackedProducts(trackedRes.data)
      setAllAlerts(alertsRes.data)
    } catch {}
  }, [])

  useEffect(() => { loadData() }, [])

  const handleTrack = async (asin) => {
    if (trackedProducts.some(p => p.asin === asin)) return toast.show('Already tracked', 'info')
    try {
      await api.trackProduct(asin)
      toast.show('Product added to tracking!', 'success')
      loadData()
    } catch { toast.show('Failed to track product', 'error') }
  }

  const handleUntrack = async (asin) => {
    try {
      await api.untrackProduct(asin)
      toast.show('Removed from tracking', 'info')
      loadData()
    } catch { toast.show('Failed to remove', 'error') }
  }

  const handleRefresh = async (asin) => {
    try {
      await api.refreshProduct(asin)
      toast.show('Price refreshed!', 'success')
      loadData()
    } catch { toast.show('Failed to refresh', 'error') }
  }

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.deleteAlert(alertId)
      toast.show('Alert deleted', 'info')
      loadData()
    } catch { toast.show('Failed to delete alert', 'error') }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>⚡ PricePulse</h1>
          <p>Amazon Tracker</p>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: <Home size={18} />, label: 'Dashboard' },
            { id: 'search',    icon: <Search size={18} />, label: 'Search' },
            { id: 'tracked',   icon: <Package size={18} />, label: 'Tracked', badge: trackedProducts.length },
            { id: 'alerts',    icon: <Bell size={18} />, label: 'Alerts', badge: allAlerts.filter(a => !a.triggered).length },
          ].map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><p>Powered by Amazon API</p></div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'var(--text)', textTransform: 'capitalize' }}>{page}</div>
          <div className="topbar-actions">
            <button className="btn btn-sm btn-secondary" onClick={loadData}><RefreshCw size={13} /> Refresh</button>
          </div>
        </div>
        {page === 'dashboard' && <Dashboard trackedProducts={trackedProducts} allAlerts={allAlerts} onNavigate={setPage} />}
        {page === 'search'    && <SearchPage trackedProducts={trackedProducts} onTrack={handleTrack} onProductClick={setSelectedAsin} toast={toast} />}
        {page === 'tracked'   && <TrackedPage trackedProducts={trackedProducts} onUntrack={handleUntrack} onRefresh={handleRefresh} onAlert={setAlertProduct} onProductClick={setSelectedAsin} />}
        {page === 'alerts'    && <AlertsPage allAlerts={allAlerts} onDeleteAlert={handleDeleteAlert} />}
      </main>

      {selectedAsin && <ProductModal asin={selectedAsin} trackedProducts={trackedProducts} onTrack={handleTrack} onClose={() => setSelectedAsin(null)} toast={toast} />}
      {alertProduct && <AlertModal product={alertProduct} onClose={() => setAlertProduct(null)} onCreated={loadData} toast={toast} />}
      <ToastContainer toasts={toast.toasts} />
    </div>
  )
}