import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadAllContent, saveSection, imageToDataUrl } from '../utils/siteContent.js'
import { DEFAULT_CONTENT } from '../utils/defaults.js'
import './admin.css'

/* ── helpers ───────────────────────────────────────────────── */
function SaveRow({ onSave, saved }) {
  return (
    <div className="ap-save-row">
      <button className="ap-save-btn" onClick={onSave}>💾 Save Changes</button>
      {saved && <span className="ap-saved-msg">✅ Saved!</span>}
    </div>
  )
}

function useSection(key, initial) {
  const [data, setData] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  // Wrap setData to push to undo stack
  const setDataWithUndo = (updater) => {
    setUndoStack((stack) => [...stack, data])
    setRedoStack([])
    setData(typeof updater === 'function' ? updater : () => updater)
  }

  const undo = () => {
    if (undoStack.length === 0) return
    setRedoStack((stack) => [data, ...stack])
    const prev = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setData(prev)
  }

  const redo = () => {
    if (redoStack.length === 0) return
    setUndoStack((stack) => [...stack, data])
    const next = redoStack[0]
    setRedoStack((stack) => stack.slice(1))
    setData(next)
  }

  const save = useCallback(async () => {
    await saveSection(key, data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [key, data])

  return [data, setDataWithUndo, saved, save, undo, redo, undoStack, redoStack]
}

function fieldUpdater(setData) {
  return (path, value) => {
    setData(prev => {
      const next = structuredClone(prev)
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
      obj[parts[parts.length - 1]] = value
      return next
    })
  }
}

/* ════════════════════════════════════════════════════════════
   SECTION EDITORS
   ════════════════════════════════════════════════════════════ */

/* ── Dashboard overview ──── */
function DashHome({ content }) {
  const [submissions, setSubmissions] = useState([]);
  
  useEffect(() => {
    try {
      const subs = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      setSubmissions(subs.reverse().slice(0, 10)); // Show latest 10
    } catch {}
  }, []);

  // CSV export helper
  function exportCSV() {
    if (!submissions.length) return;
    const header = ['Name','Phone','Email','Budget','Location','Date'];
    const rows = submissions.map(sub => [
      sub.name,
      sub.phone,
      sub.email || '-',
      sub.budget || '-',
      sub.location || '-',
      new Date(sub.timestamp).toLocaleDateString()
    ]);
    const csv = [header, ...rows].map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dizain-leads.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }
  return (
    <div>
      <h2 className="ap-section-title">Dashboard Overview</h2>
      <p className="ap-section-desc">Welcome back, Admin. Edit any section from the left sidebar.</p>
      <div className="ap-dash-grid">
        {[
          ['🏗️', `${content.services?.length ?? 0}`, 'Services'],
          ['🖼️', `${content.gallery?.length ?? 0}`, 'Gallery items'],
          ['📦', `${content.packages?.length ?? 0}`, 'Packages'],
          ['⭐', `${content.testimonials?.length ?? 0}`, 'Reviews'],
          ['❓', `${content.faqs?.length ?? 0}`, 'FAQs'],
          ['📊', `${content.metrics?.length ?? 0}`, 'Metrics'],
        ].map(([icon, val, lbl]) => (
          <div className="ap-dash-stat" key={lbl}>
            <strong>{icon} {val}</strong>
            <span>{lbl}</span>
          </div>
        ))}
      </div>
      {/* Recent Form Submissions */}
      {submissions.length > 0 && (
        <div className="ap-card" style={{marginTop: 24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <p className="ap-card-title">Recent Form Submissions</p>
            <button className="ap-save-btn" style={{margin:'0 0 0 12px',padding:'6px 14px',fontSize:'0.98rem'}} onClick={exportCSV}>
              ⬇️ Export to CSV
            </button>
          </div>
          <div style={{background:'#d4edda',padding:'10px 14px',borderRadius:6,marginBottom:12,border:'1px solid #28a745'}}>
            <p style={{margin:0,fontSize:'0.88rem',color:'#155724'}}>
              ✅ <strong>Email notifications enabled!</strong> All form submissions are automatically sent to <strong>dizainconstruction@gmail.com</strong>
            </p>
          </div>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #e2e8f0', textAlign: 'left'}}>
                  <th style={{padding: '8px'}}>Name</th>
                  <th style={{padding: '8px'}}>Phone</th>
                  <th style={{padding: '8px'}}>Email</th>
                  <th style={{padding: '8px'}}>Budget</th>
                  <th style={{padding: '8px'}}>Location</th>
                  <th style={{padding: '8px'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                    <td style={{padding: '8px'}}>{sub.name}</td>
                    <td style={{padding: '8px'}}><a href={`tel:${sub.phone}`} style={{color:'#2563eb',textDecoration:'underline'}}>{sub.phone}</a></td>
                    <td style={{padding: '8px'}}>{sub.email || '-'}</td>
                    <td style={{padding: '8px'}}>{sub.budget || '-'}</td>
                    <td style={{padding: '8px'}}>{sub.location || '-'}</td>
                    <td style={{padding: '8px'}}>{new Date(sub.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="ap-card">
        <p className="ap-card-title">Quick Guide</p>
        <ul style={{ fontSize: '.88rem', color: '#475569', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
          <li>Select a section from the left to edit its content.</li>
          <li>Click <strong>Save Changes</strong> after every edit — changes sync to the site instantly.</li>
          <li>Images can be uploaded or set by URL in Gallery &amp; Hero sections.</li>
          <li>All data is stored in browser localStorage. Connect Firebase for cloud sync.</li>
          <li>Form submissions are captured in localStorage and shown above.</li>
        </ul>
      </div>
    </div>
  )
}

/* ── Contact ──── */
function ContactEditor({ initial }) {
  const [d, setD, saved, save, undo, redo, undoStack, redoStack] = useSection('contact', initial)
  const up = fieldUpdater(setD)
  const handleLogo = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => up('logoUrl', ev.target.result)
    reader.readAsDataURL(f)
  }
  return (
    <div>
      <h2 className="ap-section-title">Contact Information</h2>
      <p className="ap-section-desc">Phone, email, address, and logo shown in the site header/footer.</p>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <button className="ap-undo-btn" onClick={undo} disabled={undoStack.length === 0} style={{padding:'4px 12px',borderRadius:4,border:'1px solid #ddd',background:'#f3f4f6',cursor:undoStack.length===0?'not-allowed':'pointer'}}>Undo</button>
        <button className="ap-redo-btn" onClick={redo} disabled={redoStack.length === 0} style={{padding:'4px 12px',borderRadius:4,border:'1px solid #ddd',background:'#f3f4f6',cursor:redoStack.length===0?'not-allowed':'pointer'}}>Redo</button>
      </div>
      <div className="ap-card">
        <div className="ap-row-2">
          <div className="ap-field">
            <label>Phone Number</label>
            <input value={d.phone ?? ''} onChange={e => up('phone', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>WhatsApp Number (digits only, no +)</label>
            <input value={d.whatsapp ?? ''} onChange={e => up('whatsapp', e.target.value)} />
          </div>
        </div>
        <div className="ap-field" style={{marginTop:8}}>
          <label>
            <input type="checkbox" checked={d.whatsappEnabled ?? true} onChange={e => up('whatsappEnabled', e.target.checked)} style={{marginRight:8}} />
            Show WhatsApp Chat Button
          </label>
        </div>
        <div className="ap-field">
          <label>Address</label>
          <input value={d.address ?? ''} onChange={e => up('address', e.target.value)} />
        </div>
        <div className="ap-field">
          <label>Email Address</label>
          <input type="email" value={d.email ?? ''} onChange={e => up('email', e.target.value)} />
        </div>
        <div className="ap-field">
          <label>Logo</label>
          <input type="file" accept="image/*" onChange={handleLogo} />
          {d.logoUrl && (
            <img
              src={d.logoUrl}
              alt="Logo preview"
              className="brand-logo"
              style={{
                marginTop: 8,
                border: '2px solid #e2e8f0',
                background: '#fff',
                maxWidth: 180,
                display: 'block'
              }}
            />
          )}
        </div>
        <SaveRow onSave={save} saved={saved} />
      </div>
    </div>
  )
}

/* ── Hero ──── */
function HeroEditor({ initial }) {
  const [d, setD, saved, save] = useSection('hero', initial)
  const up = fieldUpdater(setD)
  const handleFile = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    const url = await imageToDataUrl(f)
    up('heroImageUrl', url)
  }
  return (
    <div>
      <h2 className="ap-section-title">Hero Section</h2>
      <p className="ap-section-desc">The top fold of the homepage — badge, heading, image, and trust pills.</p>
      <div className="ap-card">
        <p className="ap-card-title">Text Content</p>
        <div className="ap-field">
          <label>Badge Text</label>
          <input value={d.badge ?? ''} onChange={e => up('badge', e.target.value)} />
        </div>
        <div className="ap-row-2">
          <div className="ap-field">
            <label>Heading Line 1</label>
            <input value={d.heading1 ?? ''} onChange={e => up('heading1', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>Heading Line 2 (italic accent)</label>
            <input value={d.heading2 ?? ''} onChange={e => up('heading2', e.target.value)} />
          </div>
        </div>
        <div className="ap-field">
          <label>Summary paragraph</label>
          <textarea rows={3} value={d.summary ?? ''} onChange={e => up('summary', e.target.value)} />
        </div>
        <SaveRow onSave={save} saved={saved} />
      </div>
      <div className="ap-card">
        <p className="ap-card-title">Hero Image</p>
        <div className="ap-field">
          <label>Image URL</label>
          <input value={d.heroImageUrl ?? ''} onChange={e => up('heroImageUrl', e.target.value)} />
        </div>
        <div className="ap-field">
          <label>Upload Image File</label>
          <label className="ap-file-btn">📁 Choose File <input type="file" accept="image/*" hidden onChange={handleFile} /></label>
        </div>
        {d.heroImageUrl
          ? <img className="ap-img-preview" src={d.heroImageUrl} alt="Hero preview" />
          : <div className="ap-img-placeholder">No image set</div>}
        <div className="ap-row-2" style={{ marginTop: '1rem' }}>
          <div className="ap-field">
            <label>Image Alt Text</label>
            <input value={d.heroImageAlt ?? ''} onChange={e => up('heroImageAlt', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>Caption</label>
            <input value={d.heroImageCaption ?? ''} onChange={e => up('heroImageCaption', e.target.value)} />
          </div>
        </div>
        <div className="ap-field">
          <label>Caption Sub-line</label>
          <input value={d.heroImageSub ?? ''} onChange={e => up('heroImageSub', e.target.value)} />
        </div>
        <SaveRow onSave={save} saved={saved} />
      </div>
      <div className="ap-card">
        <p className="ap-card-title">Trust Pills (3 stats below heading)</p>
        <div className="ap-list">
          {(d.trustPills ?? []).map((pill, i) => (
            <div className="ap-list-item" key={i}>
              <div className="ap-row-2">
                <div className="ap-field">
                  <label>Value (e.g. "120+")</label>
                  <input value={pill.value ?? ''} onChange={e => {
                    const next = [...d.trustPills]; next[i] = { ...next[i], value: e.target.value }; setD({ ...d, trustPills: next })
                  }} />
                </div>
                <div className="ap-field">
                  <label>Label</label>
                  <input value={pill.label ?? ''} onChange={e => {
                    const next = [...d.trustPills]; next[i] = { ...next[i], label: e.target.value }; setD({ ...d, trustPills: next })
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <SaveRow onSave={save} saved={saved} />
      </div>
    </div>
  )
}

/* ── Trust Bar ──── */
function TrustBarEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('trustBar', initial)
  const [newItem, setNewItem] = useState('')
  return (
    <div>
      <h2 className="ap-section-title">Trust Bar</h2>
      <p className="ap-section-desc">Short trust statements shown in the horizontal strip below the hero.</p>
      <div className="ap-card">
        <div className="ap-tags">
          {(items ?? []).map((item, i) => (
            <span className="ap-tag" key={i}>
              {item}
              <button className="ap-tag-del" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Remove">×</button>
            </span>
          ))}
        </div>
        <div className="ap-tag-add-row">
          <input placeholder="Add new trust item…" value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem('') } }} />
          <button className="ap-tag-add-btn" onClick={() => { if (newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem('') } }}>+ Add</button>
        </div>
        <SaveRow onSave={save} saved={saved} />
      </div>
    </div>
  )
}

/* ── Metrics ──── */
function MetricsEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('metrics', initial)
  const update = (i, key, val) => {
    const next = items.map((m, j) => j === i ? { ...m, [key]: val } : m)
    setItems(next)
  }
  return (
    <div>
      <h2 className="ap-section-title">Metrics Strip</h2>
      <p className="ap-section-desc">The key stats strip (e.g. "120+ Projects", "12 Years").</p>
      <div className="ap-list">
        {(items ?? []).map((m, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">Metric {i + 1}</span>
            </div>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Value (e.g. "120+")</label>
                <input value={m.value ?? ''} onChange={e => update(i, 'value', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Label</label>
                <input value={m.label ?? ''} onChange={e => update(i, 'label', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Sub-label</label>
                <input value={m.sub ?? ''} onChange={e => update(i, 'sub', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Services ──── */
function ServicesEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('services', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const add = () => setItems([...items, { icon: '🔨', title: 'New Service', copy: '', tag: '' }])
  return (
    <div>
      <h2 className="ap-section-title">Services</h2>
      <p className="ap-section-desc">Construction services listed on the services section of the homepage.</p>
      <div className="ap-list">
        {(items ?? []).map((s, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">Service {i + 1}</span>
              <button className="ap-remove-btn" onClick={() => remove(i)}>✕ Remove</button>
            </div>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Emoji Icon</label>
                <input value={s.icon ?? ''} onChange={e => update(i, 'icon', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Title</label>
                <input value={s.title ?? ''} onChange={e => update(i, 'title', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Badge Tag (optional)</label>
                <input value={s.tag ?? ''} onChange={e => update(i, 'tag', e.target.value)} />
              </div>
            </div>
            <div className="ap-field">
              <label>Description</label>
              <textarea rows={2} value={s.copy ?? ''} onChange={e => update(i, 'copy', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <button className="ap-add-btn" onClick={add}>+ Add Service</button>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Gallery ──── */
function GalleryEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('gallery', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const add = () => setItems([...items, { id: Date.now(), src: '', alt: '', title: '', type: '', desc: '', featured: false }])
  const handleFile = async (i, e) => {
    const f = e.target.files[0]; if (!f) return
    const url = await imageToDataUrl(f)
    update(i, 'src', url)
  }
  return (
    <div>
      <h2 className="ap-section-title">Project Gallery</h2>
      <p className="ap-section-desc">Photos displayed in the gallery grid. Upload or set a URL for each photo.</p>
      <div style={{background:'#d1ecf1',padding:'12px 16px',borderRadius:8,marginBottom:20,border:'1px solid #17a2b8'}}>
        <p style={{margin:'0 0 8px 0',fontSize:'0.95rem',color:'#0c5460'}}>
          💡 <strong>Tips for Gallery Images:</strong>
        </p>
        <ul style={{margin:0,paddingLeft:20,fontSize:'0.9rem',color:'#0c5460'}}>
          <li>You can add unlimited images - no restriction on number</li>
          <li>For best performance, compress images before upload (use <a href="https://tinypng.com" target="_blank" rel="noopener" style={{color:'#0c5460',textDecoration:'underline'}}>TinyPNG</a>)</li>
          <li>Recommended size: 800x600px, under 150KB each</li>
          <li>Mark 1-2 images as "Featured" to show them larger in the gallery</li>
          <li>Click "Save Gallery" at the bottom after making changes</li>
        </ul>
      </div>
      <div className="ap-list">
        {(items ?? []).map((img, i) => (
          <div className="ap-list-item" key={img.id ?? i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">Gallery Photo {i + 1}{img.featured ? ' ★ Featured (large)' : ''}</span>
              <button className="ap-remove-btn" onClick={() => remove(i)}>✕ Remove</button>
            </div>
            <div className="ap-row-2">
              <div>
                <div className="ap-field">
                  <label>Image URL</label>
                  <input value={img.src ?? ''} onChange={e => update(i, 'src', e.target.value)} />
                </div>
                <div className="ap-field">
                  <label>Upload File</label>
                  <label className="ap-file-btn">📁 Choose <input type="file" accept="image/*" hidden onChange={e => handleFile(i, e)} /></label>
                </div>
              </div>
              {img.src
                ? <img className="ap-img-preview" src={img.src} alt={img.alt || 'Gallery'} style={{ maxHeight: 120 }} />
                : <div className="ap-img-placeholder">No image</div>}
            </div>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Title</label>
                <input value={img.title ?? ''} onChange={e => update(i, 'title', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Type (e.g. Villa)</label>
                <input value={img.type ?? ''} onChange={e => update(i, 'type', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Alt Text</label>
                <input value={img.alt ?? ''} onChange={e => update(i, 'alt', e.target.value)} />
              </div>
            </div>
            <div className="ap-row-2">
              <div className="ap-field">
                <label>Description</label>
                <input value={img.desc ?? ''} onChange={e => update(i, 'desc', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Featured (shows large)</label>
                <select value={img.featured ? 'yes' : 'no'} onChange={e => update(i, 'featured', e.target.value === 'yes')}>
                  <option value="no">No</option>
                  <option value="yes">Yes – show large</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="ap-add-btn" onClick={add}>+ Add Gallery Photo</button>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Process ──── */
function ProcessEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('processSteps', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  return (
    <div>
      <h2 className="ap-section-title">How It Works</h2>
      <p className="ap-section-desc">The 6-step process section explaining how Dizain works.</p>
      <div className="ap-list">
        {(items ?? []).map((s, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Step Number</label>
                <input value={s.num ?? i + 1} onChange={e => update(i, 'num', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Title</label>
                <input value={s.title ?? ''} onChange={e => update(i, 'title', e.target.value)} />
              </div>
              <div>&nbsp;</div>
            </div>
            <div className="ap-field">
              <label>Description</label>
              <textarea rows={2} value={s.desc ?? ''} onChange={e => update(i, 'desc', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Packages ──── */
function PackagesEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('packages', initial)
  const [active, setActive] = useState(0)
  const up = (key, val) => setItems(items.map((p, i) => i === active ? { ...p, [key]: val } : p))
  const upSpec = (si, field, val) => {
    const specs = items[active].specs.map((s, i) => i === si ? { ...s, [field]: val } : s)
    up('specs', specs)
  }
  const upSpecItem = (si, ii, val) => {
    const specs = items[active].specs.map((s, i) => {
      if (i !== si) return s
      const its = s.items.map((it, j) => j === ii ? val : it)
      return { ...s, items: its }
    })
    up('specs', specs)
  }
  const removeSpecItem = (si, ii) => {
    const specs = items[active].specs.map((s, i) => i !== si ? s : { ...s, items: s.items.filter((_, j) => j !== ii) })
    up('specs', specs)
  }
  const addSpecItem = (si) => {
    const specs = items[active].specs.map((s, i) => i !== si ? s : { ...s, items: [...s.items, ''] })
    up('specs', specs)
  }
  const pkg = items[active]
  if (!pkg) return (
    <div>
      <h2 className="ap-section-title">Pricing Packages</h2>
      <p className="ap-section-desc">No packages defined. Click below to add your first package.</p>
      <button className="ap-add-btn" onClick={() => setItems([...items, {
        name: '', price: '', unit: '', tagline: '', badge: '', specs: [{ category: '', items: [''] }] }])}>+ Add Package</button>
    </div>
  )
  const addPackage = () => {
    setItems([...items, { name: '', price: '', unit: '', tagline: '', badge: '', specs: [{ category: '', items: [''] }] }])
    setActive(items.length)
  }
  const removePackage = (idx) => {
    if (items.length === 1) return
    const newItems = items.filter((_, i) => i !== idx)
    setItems(newItems)
    setActive(Math.max(0, idx - 1))
  }
  return (
    <div>
      <h2 className="ap-section-title">Pricing Packages</h2>
      <p className="ap-section-desc">Edit, add, or remove package tiers — pricing, tagline, and material specifications.</p>
      <div className="ap-pkg-tabs">
        {items.map((p, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <button className={`ap-pkg-tab${active === i ? ' active' : ''}`} onClick={() => setActive(i)}>{p.name || 'Untitled'}</button>
            {items.length > 1 && <button className="ap-spec-del" style={{marginLeft:4}} onClick={() => removePackage(i)} aria-label="Remove package">✕</button>}
          </span>
        ))}
        <button className="ap-add-btn" style={{marginLeft:12}} onClick={addPackage}>+ Add Package</button>
      </div>
      <div className="ap-card">
        <p className="ap-card-title">Package: {pkg.name}</p>
        <div className="ap-row-3">
          <div className="ap-field">
            <label>Package Name</label>
            <input value={pkg.name ?? ''} onChange={e => up('name', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>Price (e.g. "₹1,699")</label>
            <input value={pkg.price ?? ''} onChange={e => up('price', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>Unit (e.g. "per sq.ft")</label>
            <input value={pkg.unit ?? ''} onChange={e => up('unit', e.target.value)} />
          </div>
        </div>
        <div className="ap-row-2">
          <div className="ap-field">
            <label>Tagline</label>
            <input value={pkg.tagline ?? ''} onChange={e => up('tagline', e.target.value)} />
          </div>
          <div className="ap-field">
            <label>Badge (e.g. "Most Popular")</label>
            <input value={pkg.badge ?? ''} onChange={e => up('badge', e.target.value)} />
          </div>
        </div>
        <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '.75rem', marginTop: '.5rem' }}>Specification Groups</p>
        {(pkg.specs ?? []).map((spec, si) => (
          <div className="ap-spec-group" key={si}>
            <div className="ap-field" style={{ marginBottom: '.5rem' }}>
              <label>Category Name</label>
              <input value={spec.category ?? ''} onChange={e => upSpec(si, 'category', e.target.value)} />
            </div>
            <p className="ap-spec-group-label">Items</p>
            <div className="ap-spec-items">
              {(spec.items ?? []).map((item, ii) => (
                <div className="ap-spec-item-row" key={ii}>
                  <input value={item} onChange={e => upSpecItem(si, ii, e.target.value)} placeholder="Specification item" />
                  <button className="ap-spec-del" onClick={() => removeSpecItem(si, ii)} aria-label="Remove item">✕</button>
                </div>
              ))}
            </div>
            <button className="ap-add-btn" style={{ marginTop: '.3rem' }} onClick={() => addSpecItem(si)}>+ Add Item</button>
          </div>
        ))}
        <SaveRow onSave={save} saved={saved} />
      </div>
    </div>
  )
}

/* ── Testimonials ──── */
function TestimonialsEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('testimonials', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const add = () => setItems([...items, { name: '', title: '', project: '', stars: 5, quote: '', photoUrl: '' }])
  const handlePhoto = async (i, e) => {
    const f = e.target.files[0]
    if (!f) return
    const url = await imageToDataUrl(f)
    update(i, 'photoUrl', url)
  }
  return (
    <div>
      <h2 className="ap-section-title">Client Testimonials</h2>
      <p className="ap-section-desc">Reviews displayed on the homepage.</p>
      <div className="ap-list">
        {(items ?? []).map((t, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">{t.name || `Review ${i + 1}`}</span>
              <button className="ap-remove-btn" onClick={() => remove(i)}>✕ Remove</button>
            </div>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Full Name</label>
                <input value={t.name ?? ''} onChange={e => update(i, 'name', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Title / Role</label>
                <input value={t.title ?? ''} onChange={e => update(i, 'title', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Project (e.g. "3 BHK, Adyar")</label>
                <input value={t.project ?? ''} onChange={e => update(i, 'project', e.target.value)} />
              </div>
            </div>
            <div className="ap-row-2">
              <div className="ap-field">
                <label>Star Rating (1–5)</label>
                <select value={t.stars ?? 5} onChange={e => update(i, 'stars', Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                </select>
              </div>
            </div>
            <div className="ap-field">
              <label>Quote</label>
              <textarea rows={3} value={t.quote ?? ''} onChange={e => update(i, 'quote', e.target.value)} />
            </div>
            <div className="ap-field">
              <label>Client Photo (optional)</label>
              <input value={t.photoUrl ?? ''} onChange={e => update(i, 'photoUrl', e.target.value)} placeholder="Image URL" />
            </div>
            <div className="ap-field">
              <label>Upload Photo</label>
              <label className="ap-file-btn">📁 Choose Photo <input type="file" accept="image/*" hidden onChange={e => handlePhoto(i, e)} /></label>
            </div>
            {t.photoUrl && (
              <img
                src={t.photoUrl}
                alt={t.name || 'Client photo'}
                style={{
                  marginTop: 8,
                  border: '2px solid #e2e8f0',
                  background: '#fff',
                  maxWidth: 120,
                  maxHeight: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}
          </div>
        ))}
      </div>
      <button className="ap-add-btn" onClick={add}>+ Add Review</button>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── FAQs ──── */
function FaqsEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('faqs', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const add = () => setItems([...items, { question: '', answer: '' }])
  return (
    <div>
      <h2 className="ap-section-title">FAQs</h2>
      <p className="ap-section-desc">Frequently asked questions accordion on the homepage.</p>
      <div className="ap-list">
        {(items ?? []).map((f, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">FAQ {i + 1}</span>
              <button className="ap-remove-btn" onClick={() => remove(i)}>✕ Remove</button>
            </div>
            <div className="ap-field">
              <label>Question</label>
              <input value={f.question ?? ''} onChange={e => update(i, 'question', e.target.value)} />
            </div>
            <div className="ap-field">
              <label>Answer</label>
              <textarea rows={3} value={f.answer ?? ''} onChange={e => update(i, 'answer', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <button className="ap-add-btn" onClick={add}>+ Add FAQ</button>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Comparison ──── */
function ComparisonEditor({ initial }) {
  const [items, setItems, saved, save] = useSection('comparison', initial)
  const update = (i, key, val) => setItems(items.map((m, j) => j === i ? { ...m, [key]: val } : m))
  const remove = (i) => setItems(items.filter((_, j) => j !== i))
  const add = () => setItems([...items, { factor: '', dizain: '', typical: '' }])
  return (
    <div>
      <h2 className="ap-section-title">Comparison Table</h2>
      <p className="ap-section-desc">"Us vs Typical Contractors" comparison rows.</p>
      <div className="ap-list">
        {(items ?? []).map((row, i) => (
          <div className="ap-list-item" key={i}>
            <div className="ap-list-item-header">
              <span className="ap-list-item-label">{row.factor || `Row ${i + 1}`}</span>
              <button className="ap-remove-btn" onClick={() => remove(i)}>✕ Remove</button>
            </div>
            <div className="ap-row-3">
              <div className="ap-field">
                <label>Factor</label>
                <input value={row.factor ?? ''} onChange={e => update(i, 'factor', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Dizain (✓ value)</label>
                <input value={row.dizain ?? ''} onChange={e => update(i, 'dizain', e.target.value)} />
              </div>
              <div className="ap-field">
                <label>Typical (✗ value)</label>
                <input value={row.typical ?? ''} onChange={e => update(i, 'typical', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="ap-add-btn" onClick={add}>+ Add Row</button>
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ── Theme Customization ──── */
function ThemeEditor() {
  const PRESET_THEMES = {
    default: {
      name: 'Orange Construction (Default)',
      colors: {
        accent: '#f97316',
        accentStrong: '#ea580c',
        accentSoft: '#fed7aa',
        accentTint: '#fff7ed',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 55%, #f0f9ff 100%)'
      }
    },
    blue: {
      name: 'Professional Blue',
      colors: {
        accent: '#2563eb',
        accentStrong: '#1d4ed8',
        accentSoft: '#bfdbfe',
        accentTint: '#eff6ff',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f0f9ff 100%)'
      }
    },
    green: {
      name: 'Eco Green',
      colors: {
        accent: '#16a34a',
        accentStrong: '#15803d',
        accentSoft: '#bbf7d0',
        accentTint: '#f0fdf4',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 55%, #ecfdf5 100%)'
      }
    },
    red: {
      name: 'Bold Red',
      colors: {
        accent: '#dc2626',
        accentStrong: '#b91c1c',
        accentSoft: '#fecaca',
        accentTint: '#fef2f2',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 55%, #fff1f2 100%)'
      }
    },
    purple: {
      name: 'Royal Purple',
      colors: {
        accent: '#9333ea',
        accentStrong: '#7e22ce',
        accentSoft: '#e9d5ff',
        accentTint: '#faf5ff',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 55%, #f3e8ff 100%)'
      }
    },
    teal: {
      name: 'Modern Teal',
      colors: {
        accent: '#0d9488',
        accentStrong: '#0f766e',
        accentSoft: '#99f6e4',
        accentTint: '#f0fdfa',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bgHero: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 55%, #ccfbf1 100%)'
      }
    },
    dark: {
      name: 'Dark Mode',
      colors: {
        accent: '#f59e0b',
        accentStrong: '#d97706',
        accentSoft: '#fcd34d',
        accentTint: '#fef3c7',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        bgHero: 'linear-gradient(135deg, #1e293b 0%, #0f172a 55%, #020617 100%)'
      }
    }
  }

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('siteTheme')
      return saved ? JSON.parse(saved) : { preset: 'default', custom: PRESET_THEMES.default.colors }
    } catch {
      return { preset: 'default', custom: PRESET_THEMES.default.colors }
    }
  })
  const [saved, setSaved] = useState(false)

  const applyTheme = (colors) => {
    const root = document.documentElement
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-strong', colors.accentStrong)
    root.style.setProperty('--accent-soft', colors.accentSoft)
    root.style.setProperty('--accent-tint', colors.accentTint)
    root.style.setProperty('--text-primary', colors.textPrimary)
    root.style.setProperty('--text-secondary', colors.textSecondary)
    root.style.setProperty('--bg-hero', colors.bgHero)
    
    // Update shadow color to match accent
    const accentRgb = hexToRgb(colors.accent)
    if (accentRgb) {
      root.style.setProperty('--shadow-orange', `0 6px 24px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.28)`)
    }
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const selectPreset = (presetKey) => {
    const colors = PRESET_THEMES[presetKey].colors
    setTheme({ preset: presetKey, custom: colors })
    applyTheme(colors)
  }

  const updateCustomColor = (key, value) => {
    const newCustom = { ...theme.custom, [key]: value }
    setTheme({ preset: 'custom', custom: newCustom })
    applyTheme(newCustom)
  }

  const saveTheme = () => {
    localStorage.setItem('siteTheme', JSON.stringify(theme))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Notify to reload homepage if open
    window.dispatchEvent(new Event('themeChanged'))
  }

  const resetToDefault = () => {
    selectPreset('default')
    localStorage.removeItem('siteTheme')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Apply theme on component mount
  useEffect(() => {
    applyTheme(theme.custom)
  }, [])

  return (
    <div>
      <h2 className="ap-section-title">Theme & Color Customization</h2>
      <p className="ap-section-desc">Customize your website's color scheme and appearance. Changes apply instantly with live preview.</p>
      
      <div style={{background:'#fff3cd',padding:'12px 16px',borderRadius:8,marginBottom:20,border:'1px solid #ffc107'}}>
        <p style={{margin:0,fontSize:'0.95rem',color:'#856404'}}>
          💡 <strong>Tip:</strong> Choose a preset theme or customize individual colors. Changes apply to the entire website instantly. 
          Refresh your main website after saving to see changes.
        </p>
      </div>

      {/* Preset Themes */}
      <div className="ap-card" style={{marginBottom:24}}>
        <p className="ap-card-title">Preset Themes</p>
        <p style={{fontSize:'0.9rem',color:'#64748b',marginBottom:16}}>Quick theme selection - click to apply</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',gap:12}}>
          {Object.entries(PRESET_THEMES).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => selectPreset(key)}
              style={{
                padding:'16px',
                borderRadius:8,
                border: theme.preset === key ? '3px solid #f97316' : '2px solid #e2e8f0',
                background: key === 'dark' ? '#0f172a' : '#fff',
                cursor:'pointer',
                textAlign:'left',
                transition:'all 0.2s',
                position:'relative'
              }}
            >
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:24,height:24,borderRadius:4,background:preset.colors.accent}}/>
                <div style={{width:16,height:16,borderRadius:4,background:preset.colors.accentStrong}}/>
                <div style={{width:16,height:16,borderRadius:4,background:preset.colors.accentSoft}}/>
              </div>
              <div style={{fontSize:'0.9rem',fontWeight:600,color: key === 'dark' ? '#f1f5f9' : '#0f172a'}}>
                {preset.name}
              </div>
              {theme.preset === key && (
                <div style={{position:'absolute',top:8,right:8,fontSize:'1.2rem'}}>✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="ap-card" style={{marginBottom:24}}>
        <p className="ap-card-title">Custom Colors</p>
        <p style={{fontSize:'0.9rem',color:'#64748b',marginBottom:16}}>Fine-tune individual colors for a unique look</p>
        
        <div style={{display:'grid',gap:16}}>
          <div className="ap-field">
            <label>Primary Accent Color</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.accent}
                onChange={e => updateCustomColor('accent', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.accent}
                onChange={e => updateCustomColor('accent', e.target.value)}
                placeholder="#f97316"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Used for buttons, links, highlights</span>
            </div>
          </div>

          <div className="ap-field">
            <label>Accent Strong (Hover)</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.accentStrong}
                onChange={e => updateCustomColor('accentStrong', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.accentStrong}
                onChange={e => updateCustomColor('accentStrong', e.target.value)}
                placeholder="#ea580c"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Darker shade for hover effects</span>
            </div>
          </div>

          <div className="ap-field">
            <label>Accent Soft (Light)</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.accentSoft}
                onChange={e => updateCustomColor('accentSoft', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.accentSoft}
                onChange={e => updateCustomColor('accentSoft', e.target.value)}
                placeholder="#fed7aa"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Light shade for backgrounds</span>
            </div>
          </div>

          <div className="ap-field">
            <label>Accent Tint (Very Light)</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.accentTint}
                onChange={e => updateCustomColor('accentTint', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.accentTint}
                onChange={e => updateCustomColor('accentTint', e.target.value)}
                placeholder="#fff7ed"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Very light tint for subtle backgrounds</span>
            </div>
          </div>

          <div className="ap-field">
            <label>Primary Text Color</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.textPrimary}
                onChange={e => updateCustomColor('textPrimary', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.textPrimary}
                onChange={e => updateCustomColor('textPrimary', e.target.value)}
                placeholder="#0f172a"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Main headings and body text</span>
            </div>
          </div>

          <div className="ap-field">
            <label>Secondary Text Color</label>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <input
                type="color"
                value={theme.custom.textSecondary}
                onChange={e => updateCustomColor('textSecondary', e.target.value)}
                style={{width:60,height:40,border:'1px solid #e2e8f0',borderRadius:6,cursor:'pointer'}}
              />
              <input
                type="text"
                value={theme.custom.textSecondary}
                onChange={e => updateCustomColor('textSecondary', e.target.value)}
                placeholder="#64748b"
                style={{flex:1,maxWidth:120}}
              />
              <span style={{fontSize:'0.85rem',color:'#64748b'}}>Descriptions and secondary content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div className="ap-card" style={{marginBottom:24}}>
        <p className="ap-card-title">Live Preview</p>
        <div style={{padding:20,borderRadius:8,border:'1px solid #e2e8f0',background:'#f8fafc'}}>
          <div style={{marginBottom:16}}>
            <h3 style={{color:theme.custom.textPrimary,marginBottom:8}}>Sample Heading</h3>
            <p style={{color:theme.custom.textSecondary,marginBottom:16}}>This is how your text will look with the current theme colors.</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button style={{padding:'10px 20px',background:theme.custom.accent,color:'#fff',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>
              Primary Button
            </button>
            <button style={{padding:'10px 20px',background:theme.custom.accentStrong,color:'#fff',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>
              Button Hover
            </button>
            <div style={{padding:'10px 20px',background:theme.custom.accentSoft,color:theme.custom.textPrimary,borderRadius:6,fontWeight:600}}>
              Light Badge
            </div>
            <div style={{padding:'10px 20px',background:theme.custom.accentTint,color:theme.custom.textPrimary,borderRadius:6}}>
              Very Light
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <button className="ap-save-btn" onClick={saveTheme}>
          💾 Save Theme
        </button>
        <button 
          onClick={resetToDefault}
          style={{
            padding:'10px 20px',
            background:'#64748b',
            color:'#fff',
            border:'none',
            borderRadius:6,
            fontWeight:600,
            cursor:'pointer'
          }}
        >
          ↺ Reset to Default
        </button>
        {saved && <span className="ap-saved-msg">✅ Theme Saved! Refresh homepage to see changes.</span>}
      </div>

      <div style={{marginTop:24,padding:16,background:'#e0f2fe',borderRadius:8,border:'1px solid #0ea5e9'}}>
        <p style={{margin:0,fontSize:'0.9rem',color:'#0c4a6e'}}>
          <strong>📱 Note:</strong> After saving your theme, refresh your main website to see the changes applied. 
          The admin panel preview shows how colors will look, but the full site needs a refresh to update.
        </p>
      </div>
    </div>
  )
}

/* ── Section Headings ──── */
function SectionHeadingsEditor({ initial }) {
  const [d, setD, saved, save] = useSection('sectionHeadings', initial)
  const up = (section, field, val) => {
    setD(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: val }
    }))
  }
  return (
    <div>
      <h2 className="ap-section-title">Section Headings</h2>
      <p className="ap-section-desc">Edit the headings, eyebrows, and descriptions for each section of the homepage.</p>
      <div style={{background:'#fff3cd',padding:'12px 16px',borderRadius:8,marginBottom:20,border:'1px solid #ffc107'}}>
        <p style={{margin:0,fontSize:'0.95rem',color:'#856404'}}>
          📝 <strong>Note:</strong> If you see truncated text like "Every Construction Need, One T..." on the site, 
          edit the full heading text below. The text will now wrap properly instead of being cut off.
        </p>
      </div>
      
      {Object.keys(d || {}).map(section => (
        <div className="ap-card" key={section} style={{marginBottom: 16}}>
          <p className="ap-card-title" style={{textTransform: 'capitalize'}}>{section} Section</p>
          {d[section].eyebrow !== undefined && (
            <div className="ap-field">
              <label>Eyebrow (small text above heading)</label>
              <input value={d[section].eyebrow || ''} onChange={e => up(section, 'eyebrow', e.target.value)} />
            </div>
          )}
          {d[section].heading !== undefined && (
            <div className="ap-field">
              <label>Main Heading</label>
              <input value={d[section].heading || ''} onChange={e => up(section, 'heading', e.target.value)} />
            </div>
          )}
          {d[section].description !== undefined && (
            <div className="ap-field">
              <label>Description</label>
              <textarea rows={2} value={d[section].description || ''} onChange={e => up(section, 'description', e.target.value)} />
            </div>
          )}
          {d[section].ctaButton !== undefined && (
            <div className="ap-field">
              <label>CTA Button Text</label>
              <input value={d[section].ctaButton || ''} onChange={e => up(section, 'ctaButton', e.target.value)} />
            </div>
          )}
          {d[section].tableHeaders !== undefined && (
            <>
              <div className="ap-field">
                <label>Table Header Column 1</label>
                <input value={d[section].tableHeaders?.column1 || ''} onChange={e => up(section, 'tableHeaders', {...d[section].tableHeaders, column1: e.target.value})} />
              </div>
              <div className="ap-field">
                <label>Table Header Column 2</label>
                <input value={d[section].tableHeaders?.column2 || ''} onChange={e => up(section, 'tableHeaders', {...d[section].tableHeaders, column2: e.target.value})} />
              </div>
              <div className="ap-field">
                <label>Table Header Column 3</label>
                <input value={d[section].tableHeaders?.column3 || ''} onChange={e => up(section, 'tableHeaders', {...d[section].tableHeaders, column3: e.target.value})} />
              </div>
            </>
          )}
        </div>
      ))}
      <SaveRow onSave={save} saved={saved} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ADMIN PANEL SHELL
   ════════════════════════════════════════════════════════════ */
const NAV = [
  { id: 'home',        label: 'Dashboard',   icon: '🏠' },
  { id: 'hero',        label: 'Hero Section', icon: '🌟' },
  { id: 'contact',     label: 'Contact Info', icon: '📞' },
  { id: 'trustbar',    label: 'Trust Bar',    icon: '🏅' },
  { id: 'metrics',     label: 'Metrics',      icon: '📊' },
  { id: 'services',    label: 'Services',     icon: '🏗️' },
  { id: 'gallery',     label: 'Gallery',      icon: '🖼️' },
  { id: 'process',     label: 'How It Works', icon: '📋' },
  { id: 'packages',    label: 'Packages',     icon: '💰' },
  { id: 'testimonials',label: 'Testimonials', icon: '⭐' },
  { id: 'faqs',        label: 'FAQs',         icon: '❓' },
  { id: 'comparison',  label: 'Comparison',   icon: '📑' },
  { id: 'headings',    label: 'Section Headings', icon: '📝' },
  { id: 'theme',       label: 'Theme & Colors', icon: '🎨' },
]

function getTrackingConfig() {
  let config = {}
  try {
    config = JSON.parse(localStorage.getItem('trackingConfig') || '{}')
  } catch {}
  return config
}

function setTrackingConfig(config) {
  localStorage.setItem('trackingConfig', JSON.stringify(config))
}

export default function AdminPanel() {
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [tracking, setTracking] = useState(getTrackingConfig())
  const [trackSaved, setTrackSaved] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('dizain_admin')) {
      nav('/admin')
      return
    }
    loadAllContent().then(setContent)
  }, [nav])

  // Save tracking config
  const saveTracking = () => {
    setTrackingConfig(tracking)
    setTrackSaved(true)
    setTimeout(() => setTrackSaved(false), 2000)
    // Set window vars for scripts
    if (typeof window !== 'undefined') {
      window.GA_MEASUREMENT_ID = tracking.gaId || 'G-XXXXXXXXXX'
      window.FB_PIXEL_ID = tracking.fbPixelId || 'YOUR_PIXEL_ID'
    }
  }

  function logout() {
    sessionStorage.removeItem('dizain_admin')
    nav('/admin')
  }

  return (
    <div className="ap-page">
      {/* Top bar */}
      <header className="ap-topbar">
        <a className="ap-logo" href="/">
          {content.contact?.logoUrl ? (
            <img src={content.contact.logoUrl} alt="Logo" style={{height:32,marginRight:8,verticalAlign:'middle'}} />
          ) : (
            <span className="ap-logo-hex">⬡</span>
          )}
          Dizain Constructions — Admin
        </a>
        <div className="ap-topbar-right">
          <a href="/" target="_blank" rel="noopener noreferrer">View Site ↗</a>
          <button className="ap-preview" style={{marginLeft:8,marginRight:8,padding:'6px 16px',background:'#f97316',color:'#fff',border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}} onClick={() => window.open('/', '_blank')}>Preview Site</button>
          <button className="ap-logout" onClick={logout}>Log Out</button>
        </div>
      </header>

      <div className="ap-body">
        {/* Sidebar */}
        <nav className="ap-sidebar" aria-label="Admin sections">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`ap-nav-btn${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="ap-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

        </nav>

        {/* Content */}
        <main className="ap-content">
          {/* Offer Banner Control */}
          {activeTab === 'home' && (
            <div className="ap-card" style={{marginBottom:24}}>
              <h3 style={{marginTop:0}}>Offer Banner</h3>
              <div className="ap-field">
                <label>
                  <input
                    type="checkbox"
                    checked={!!tracking.offerBannerEnabled}
                    onChange={e => setTracking(t => ({ ...t, offerBannerEnabled: e.target.checked }))}
                  />
                  Enable Offer Banner
                </label>
              </div>
              
              <div className="ap-field">
                <label style={{fontWeight:600,marginBottom:8,display:'block'}}>Banner Placement</label>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <label style={{fontWeight:400}}>
                    <input
                      type="radio"
                      name="bannerPlacement"
                      value="top"
                      checked={(tracking.offerBannerPlacement || 'hero') === 'top'}
                      onChange={e => setTracking(t => ({ ...t, offerBannerPlacement: e.target.value }))}
                      disabled={!tracking.offerBannerEnabled}
                    />
                    Top of Page (Sticky Banner)
                  </label>
                  <label style={{fontWeight:400}}>
                    <input
                      type="radio"
                      name="bannerPlacement"
                      value="hero"
                      checked={(tracking.offerBannerPlacement || 'hero') === 'hero'}
                      onChange={e => setTracking(t => ({ ...t, offerBannerPlacement: e.target.value }))}
                      disabled={!tracking.offerBannerEnabled}
                    />
                    Hero Section (Gift Box Style)
                  </label>
                  <label style={{fontWeight:400}}>
                    <input
                      type="radio"
                      name="bannerPlacement"
                      value="both"
                      checked={(tracking.offerBannerPlacement || 'hero') === 'both'}
                      onChange={e => setTracking(t => ({ ...t, offerBannerPlacement: e.target.value }))}
                      disabled={!tracking.offerBannerEnabled}
                    />
                    Both Locations
                  </label>
                </div>
              </div>

              <div className="ap-field">
                <label style={{fontWeight:600,marginBottom:8,display:'block'}}>Hero Banner Design Style</label>
                <select
                  value={tracking.offerBannerStyle || 'gift-orange'}
                  onChange={e => setTracking(t => ({ ...t, offerBannerStyle: e.target.value }))}
                  disabled={!tracking.offerBannerEnabled}
                  style={{maxWidth:420,padding:'8px 12px',fontSize:'0.95rem',borderRadius:6,border:'1px solid #ddd'}}
                >
                  <option value="gift-orange">🎁 Gift Box (Orange Gradient)</option>
                  <option value="gift-gold">🎁 Gift Box (Gold Luxury)</option>
                  <option value="ribbon-red">🎀 Ribbon Banner (Red)</option>
                  <option value="badge-blue">⭐ Star Badge (Blue)</option>
                  <option value="minimal-white">✨ Minimal (White/Clean)</option>
                  <option value="vibrant-purple">💎 Premium (Purple/Gradient)</option>
                </select>
                <small style={{display:'block',marginTop:6,color:'#666'}}>Design style applies to Hero Section placement</small>
              </div>

              <div className="ap-field">
                <label>Banner Text</label>
                <input
                  value={tracking.offerBannerText || '🎉 FREE ₹2 Lakh Premium Upgrades on Your Dream Home!'}
                  onChange={e => setTracking(t => ({ ...t, offerBannerText: e.target.value }))}
                  placeholder="Banner text"
                  style={{maxWidth:420}}
                  disabled={!tracking.offerBannerEnabled}
                />
                <small style={{display:'block',marginTop:6,color:'#666'}}>This text appears in both top and hero banners</small>
              </div>
              <button className="ap-save-btn" onClick={saveTracking}>Save Banner Settings</button>
              {trackSaved && <span className="ap-saved-msg" style={{marginLeft:12}}>✅ Saved!</span>}
            </div>
          )}
          {activeTab === 'home' && (
            <div className="ap-card" style={{marginBottom:24}}>
              <h3 style={{marginTop:0}}>Analytics & Pixel Settings</h3>
              <div className="ap-field">
                <label>Google Analytics Measurement ID</label>
                <input
                  value={tracking.gaId || ''}
                  onChange={e => setTracking(t => ({ ...t, gaId: e.target.value }))}
                  placeholder="G-XXXXXXXXXX"
                  style={{maxWidth:320}}
                />
              </div>
              <div className="ap-field">
                <label>Meta Pixel ID</label>
                <input
                  value={tracking.fbPixelId || ''}
                  onChange={e => setTracking(t => ({ ...t, fbPixelId: e.target.value }))}
                  placeholder="YOUR_PIXEL_ID"
                  style={{maxWidth:320}}
                />
              </div>
              <div className="ap-field">
                <label>Admin Email (for form submissions)</label>
                <input
                  value={tracking.adminEmail || ''}
                  onChange={e => setTracking(t => ({ ...t, adminEmail: e.target.value }))}
                  placeholder="your@email.com"
                  type="email"
                  style={{maxWidth:320}}
                />
              </div>
              <button className="ap-save-btn" onClick={saveTracking}>Save Analytics Settings</button>
              {trackSaved && <span className="ap-saved-msg" style={{marginLeft:12}}>✅ Saved!</span>}
            </div>
          )}
          {activeTab === 'home'         && <DashHome content={content} />}
          {activeTab === 'hero'         && <HeroEditor initial={content.hero} />}
          {activeTab === 'contact'      && <ContactEditor initial={content.contact} />}
          {activeTab === 'trustbar'     && <TrustBarEditor initial={content.trustBar} />}
          {activeTab === 'metrics'      && <MetricsEditor initial={content.metrics} />}
          {activeTab === 'services'     && <ServicesEditor initial={content.services} />}
          {activeTab === 'gallery'      && <GalleryEditor initial={content.gallery} />}
          {activeTab === 'process'      && <ProcessEditor initial={content.processSteps} />}
          {activeTab === 'packages'     && <PackagesEditor initial={content.packages} />}
          {activeTab === 'testimonials' && <TestimonialsEditor initial={content.testimonials} />}
          {activeTab === 'faqs'         && <FaqsEditor initial={content.faqs} />}
          {activeTab === 'comparison'   && <ComparisonEditor initial={content.comparison} />}
          {activeTab === 'headings'     && <SectionHeadingsEditor initial={content.sectionHeadings} />}
          {activeTab === 'theme'        && <ThemeEditor />}
        </main>
      </div>
    </div>
  )
}
