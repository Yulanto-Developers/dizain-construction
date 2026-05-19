import { useState, useEffect, useRef } from 'react'
import './App.css'
import { loadAllContent } from './utils/siteContent.js'
import { sendConsultationEmail } from './utils/email.js'
import { DEFAULT_CONTENT } from './utils/defaults.js'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import toast from "react-hot-toast";

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/* ─── Star rating helper ────────────────────── */
function StarRating({ count }) {
  return <div className="stars" aria-label={`${count} out of 5`}>{'★'.repeat(count)}</div>
}

/* ═══════════════════════════════════════════════
   PUBLIC SITE APP
   ═══════════════════════════════════════════════ */
export default function App() {
  //header
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Content and state management
  const [c, setC] = useState(DEFAULT_CONTENT)
  const [activePkg, setActivePkg] = useState(1)
  const [openFaq, setOpenFaq] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [heroSent, setHeroSent] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  // Gallery lightbox state
  const [lightboxIdx, setLightboxIdx] = useState(null)
  // Banner state (from trackingConfig)
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [bannerConfig, setBannerConfig] = useState({
    enabled: false,
    text: '',
    placement: 'hero',
    style: 'gift-orange'
  });
  // Loading and error states for forms
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [modalFormLoading, setModalFormLoading] = useState(false);
  const [modalFormError, setModalFormError] = useState("");


  // Load content from localStorage / Firebase
  useEffect(() => {
    loadAllContent().then(setC)

    // Listen for localStorage changes (from admin panel)
    const handleStorage = (e) => {
      // Only reload if a cms_ key is changed (any section)
      if (e.key && e.key.startsWith('cms_')) {
        loadAllContent().then(setC)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Banner config from trackingConfig
  useEffect(() => {
    try {
      const config = JSON.parse(localStorage.getItem('trackingConfig') || '{}');
      setBannerConfig({
        enabled: !false,
        text: '🎉 FREE ₹2 Lakh Premium Upgrades on Your Dream Home!' || config.offerBannerText,
        placement: 'hero' || config.offerBannerPlacement,
        style: 'gift-orange' || config.offerBannerStyle
      });
    } catch { }
  }, []);

  // Load and apply theme
  useEffect(() => {
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
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }
      const accentRgb = hexToRgb(colors.accent)
      if (accentRgb) {
        root.style.setProperty('--shadow-orange', `0 6px 24px rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.28)`)
      }
    }

    // Load theme from localStorage
    try {
      const savedTheme = localStorage.getItem('siteTheme')
      if (savedTheme) {
        const theme = JSON.parse(savedTheme)
        applyTheme(theme.custom)
      }
    } catch (err) {
      console.error('Failed to load theme:', err)
    }

    // Listen for theme changes from admin panel
    const handleThemeChange = () => {
      try {
        const savedTheme = localStorage.getItem('siteTheme')
        if (savedTheme) {
          const theme = JSON.parse(savedTheme)
          applyTheme(theme.custom)
        }
      } catch (err) {
        console.error('Failed to apply theme:', err)
      }
    }
    window.addEventListener('themeChanged', handleThemeChange)

    return () => window.removeEventListener('themeChanged', handleThemeChange)
  }, [])

  // Back-to-top scroll listener
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard + scroll lock for modal and lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false)
        setLightboxIdx(null)
      }
      if (lightboxIdx !== null && c.gallery && c.gallery.length) {
        if (e.key === 'ArrowRight') setLightboxIdx(idx => (idx + 1) % c.gallery.length)
        if (e.key === 'ArrowLeft') setLightboxIdx(idx => (idx - 1 + c.gallery.length) % c.gallery.length)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxIdx, c.gallery])

  useEffect(() => {
    const isModalOpen = showModal || lightboxIdx !== null
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal, lightboxIdx])
  return (
    <>
      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑
        </button>
      )}

      {/* Top Offer Banner (admin controlled) */}
      {bannerConfig.enabled && (bannerConfig.placement === 'top' || bannerConfig.placement === 'both') && showTopBanner && (
        <div className="offer-banner-top">
          <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{bannerConfig.text}</span>
          <button
            aria-label="Close offer banner"
            onClick={() => setShowTopBanner(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#222',
              fontSize: '1.5rem',
              marginLeft: 12,
              cursor: 'pointer',
              lineHeight: 1
            }}
          >×</button>
        </div>
      )}
      {/* ─── Sticky nav ─────────────────────── */}
      <header className="topbar">

        <div className="topbar-inner">

          <a className="brand" href="#home">

            {
              c.contact?.logoUrl ? (

                <img
                  src={c.contact.logoUrl}
                  alt="Dizain Constructions Logo"
                  className="brand-logo"
                />

              ) : (

                <span className="brand-hex">⬡</span>
              )
            }

            Dizain Constructions

          </a>

          {/* Desktop Menu */}

          <nav className="nav-links" aria-label="Primary">

            <a href="#services">Services</a>

            <a href="#process">How It Works</a>

            <a href="#packages">Packages</a>

            <a href="#gallery">Our Projects</a>

            <a href="#testimonials">Reviews</a>

            <button
              className="nav-cta"
              onClick={() => setShowModal(true)}
            >
              Get Free Quote
            </button>

          </nav>

          {/* Mobile Menu Button */}

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

        </div>

        {/* Mobile Menu */}

        {
          menuOpen && (

            <nav className="mobile-menu">

              <a href="#services">Services</a>

              <a href="#process">How It Works</a>

              <a href="#packages">Packages</a>

              <a href="#gallery">Our Projects</a>

              <a href="#testimonials">Reviews</a>

              <button
                className="nav-cta mobile-cta"
                onClick={() => setShowModal(true)}
              >
                Get Free Quote
              </button>

            </nav>
          )
        }

      </header>

      {/* ─── Hero (full-bg, Brick&Bolt style) ─── */}
      <section
        className="hero-fullbg"
        id="home"
        style={{ backgroundImage: `url(${'/banner/banner-1.jpg' || c.hero?.heroImageUrl})` }}
      >
        <div className="hero-fullbg-inner">
          {/* LEFT: branding + headline */}
          <div className="hero-text">
            {c.hero?.badge && (
              <div className="hero-badge">
                <span className="badge-dot" aria-hidden="true" />
                {c.hero?.badge}
              </div>
            )}
            {(c.hero?.heading1 || c.hero?.heading2) && (
              <h1 className="hero-fullbg-h1">
                {c.hero?.heading1 && <>{c.hero.heading1}<br /></>}
                {c.hero?.heading2 && <em>{c.hero.heading2}</em>}
              </h1>
            )}
            {c.hero?.summary && <p className="hero-fullbg-p">{c.hero?.summary}</p>}

            {/* MOBILE ONLY CALL TO ACTION BUTTON */}
            {/* <div className="mobile-cta-wrapper">
            
              <button className="button button-primary mobile-pyp-trigger" onClick={() => setShowModal(true)}>
                Plan Your Project →
              </button>
            </div> */}


            {showModal && (
              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                  {/* Your Lead Form Here */}
                  <h3>Get Your Free Quote</h3>
                  {/* ... form fields ... */}
                </div>
              </div>
            )}

            {/* Offer Banner (Only one instance) */}
            {bannerConfig.enabled && (bannerConfig.placement === 'hero' || bannerConfig.placement === 'both') && (
              <div className={`hero-offer-box hero-offer-${bannerConfig.style}`}>
                <div className="hero-offer-icon">
                  {bannerConfig.style.includes('gift') ? '🎁' :
                    bannerConfig.style.includes('ribbon') ? '🎀' :
                      bannerConfig.style.includes('badge') ? '⭐' :
                        bannerConfig.style.includes('minimal') ? '✨' : '💎'}
                </div>
                <div className="hero-offer-content">
                  <div className="hero-offer-text">{bannerConfig.text}</div>
                  <div className="hero-offer-badge">Limited Time Only!</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Plan Your Project card (Placed correctly inside the inner div) */}
          <div className="pyp-card" id="contact">
            {heroSent ? (
              <div className="pyp-success">
                <div className="pyp-success-icon">✅</div>
                <h3>We'll Call You Shortly!</h3>
                <p>Our expert will reach you within 20 minutes for a free consultation.</p>
                <button className="button button-primary button-full" onClick={() => setHeroSent(false)}>
                  Submit Another →
                </button>
              </div>
            ) : (
              <>
                <p className="pyp-title">Plan Your Project</p>
                <p className="pyp-sub">Build with clarity on cost, quality, &amp; delivery</p>
                <form
                  className="pyp-form"
                  onSubmit={async e => {
                    e.preventDefault();
                    setFormLoading(true);
                    setFormError("");
                    const name = e.target[0].value.trim();
                    const phone = e.target[1].value.trim();
                    const budget = e.target[2].value;
                    const email = e.target[3].value.trim();
                    const location = e.target[4].value.trim();

                    if (!name || !phone || !budget || !email || !location) {
                      setFormError("All fields are required.");
                      setFormLoading(false);
                      return;
                    }

                    try {
                      const result = await sendConsultationEmail({ name, phone, budget, email, location });
                      if (result.success) setHeroSent(true);
                    } catch (err) {
                      setFormError("Network error. Please try again.");
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                >
                  <input type="text" placeholder="Your Full Name" required />
                  <div className="pyp-phone-row">
                    <span className="pyp-cc">🇮🇳 +91</span>
                    <input type="tel" placeholder="Phone Number" required maxLength={10} />
                  </div>
                  <select defaultValue="">
                    <option value="" disabled>Budget range</option>
                    <option>55 lakhs – 70 lakhs</option>
                    <option>70 lakhs – 95 lakhs</option>
                    <option>Above 1 crore</option>
                  </select>
                  <input type="email" placeholder="Your Email Address" required />
                  <input type="text" placeholder="Plot / Site Location" />
                  <button type="submit" className="button button-primary button-full pyp-submit" disabled={formLoading}>
                    {formLoading ? "Sending..." : "Start Your Construction →"}
                  </button>
                  {formError && <p className="form-error" style={{ color: '#d32f2f', marginTop: 8 }}>{formError}</p>}
                </form>
                <p className="pyp-disclaimer">🔒 No spam, ever.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="page-shell">
        <main>

          {/* ─── Trust bar ──────────────────── */}
          <div className="trust-bar section">
            {(c.trustBar || []).map((item) => (
              <div className="trust-bar-item" key={item}>{item}</div>
            ))}
          </div>

          {/* ─── Metrics ────────────────────── */}
          <section className="metrics-strip section" id="metrics-strip">
            <MetricsAnimated metrics={c.metrics || []} />
          </section>

          {/* ─── Services ───────────────────── */}
          <section className="section" id="services">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.services?.eyebrow || 'What We Build'}</p>
              <h2>{c.sectionHeadings?.services?.heading || 'Every Construction Need, One Trusted Team'}</h2>
              <p>{c.sectionHeadings?.services?.description || 'From the first drawing to the final key — Dizain manages every stage so you never chase multiple vendors.'}</p>
            </div>
            <div className="services-grid">
              {(c.services || []).map((s) => (
                <article className="service-card" key={s.title}>
                  {s.tag && <span className="service-tag">{s.tag}</span>}
                  <div className="service-icon-wrap">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.copy}</p>
                  <button className="service-link" onClick={() => setShowModal(true)}>Get a quote →</button>
                </article>
              ))}
            </div>
          </section>

          {/* ─── Gallery (Reference Logic) ─────────────── */}
          <section className="section gallery-section">
            <div className="section-heading centered" id="gallery">
              <p className="eyebrow">{c.sectionHeadings?.gallery?.eyebrow || 'Our Projects'}</p>
              <h2>{c.sectionHeadings?.gallery?.heading || "Homes We've Built Across Chennai"}</h2>
              <p>{c.sectionHeadings?.gallery?.description || "Every photo is a family's dream — delivered on time, on budget, and beyond expectation."}</p>
            </div>
            <div className="gallery-grid">
              {(c.gallery || []).map((img, idx) => (
                <div
                  className={`gallery-item${img.featured ? ' gallery-large' : ''}`}
                  key={img.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View image: ${img.title || img.alt || 'Project photo'}`}
                  onClick={(e) => {
                    e.stopPropagation()

                    // Disable popup on mobile
                    if (window.innerWidth <= 768) return

                    setLightboxIdx(idx)
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setLightboxIdx(idx) }}
                  style={{ outline: lightboxIdx === idx ? '2px solid #f97316' : undefined }}
                >
                  <picture>
                    <source srcSet={img.src.replace(/\.jpg$/i, '.jpg')} type="image/webp" />
                    <img src={img.src} alt={img.alt || img.title || 'Project photo'} loading="lazy" style={{ pointerEvents: 'none' }} />
                  </picture>
                  <div className="gallery-overlay">
                    <span className="gallery-type">{img.type}</span>
                    <h4>{img.title}</h4>
                    <p>{img.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="gallery-cta">
              <button className="button button-outline" onClick={() => setShowModal(true)}>
                {c.sectionHeadings?.gallery?.ctaButton || '📸 Build Your Dream Home Like This →'}
              </button>
            </div>

            {/* Lightbox Modal */}
            {lightboxIdx !== null && c.gallery && c.gallery[lightboxIdx] && (
              <div
                className="gallery-lightbox"
                role="dialog"
                aria-modal="true"
                aria-label="Project image viewer"
                tabIndex={-1}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15,23,42,0.92)',
                  zIndex: 2000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: 24
                }}
                onClick={e => { if (e.target.classList.contains('gallery-lightbox')) setLightboxIdx(null) }}
              >
                <button
                  aria-label="Close image viewer"
                  onClick={() => setLightboxIdx(null)}
                  style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', color: '#fff', fontSize: '2.2rem', cursor: 'pointer', zIndex: 10 }}
                >×</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <button
                    aria-label="Previous image"
                    onClick={e => { e.stopPropagation(); setLightboxIdx(idx => (idx - 1 + c.gallery.length) % c.gallery.length) }}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2.2rem', cursor: 'pointer' }}
                  >‹</button>
                  <div style={{ maxWidth: '90vw', maxHeight: '80vh', textAlign: 'center' }}>
                    <img
                      src={c.gallery[lightboxIdx].src}
                      alt={c.gallery[lightboxIdx].alt || c.gallery[lightboxIdx].title || 'Project photo'}
                      style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
                    />
                    <div style={{ color: '#fff', marginTop: 18 }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{c.gallery[lightboxIdx].title}</h3>
                      <p style={{ margin: '8px 0 0', fontSize: '1rem', color: '#e0e7ef' }}>{c.gallery[lightboxIdx].desc}</p>
                      <span style={{ fontSize: '.95rem', color: '#fed7aa', marginTop: 6 }}>{c.gallery[lightboxIdx].type}</span>
                    </div>
                  </div>
                  <button
                    aria-label="Next image"
                    onClick={e => { e.stopPropagation(); setLightboxIdx(idx => (idx + 1) % c.gallery.length) }}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2.2rem', cursor: 'pointer' }}
                  >›</button>
                </div>
                <div style={{ color: '#fff', marginTop: 16, fontSize: '.95rem' }}>
                  {lightboxIdx + 1} / {c.gallery.length}
                </div>
              </div>
            )}
          </section>

          {/* ─── Process (Restored) ─────────────── */}
          <section className="section section-alt" id="process">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.processSteps?.eyebrow || 'Our Process'}</p>
              <h2>{c.sectionHeadings?.processSteps?.heading || 'Your Home in 6 Clear Steps'}</h2>
              <p>{c.sectionHeadings?.processSteps?.description || 'No confusion, no surprises. Here is exactly what happens from your first call to the day you collect your keys.'}</p>
            </div>
            <div className="process-grid">
              {(c.processSteps || []).map((step) => (
                <article className="process-card" key={step.num}>
                  <div className="process-num-wrap">
                    <div className="process-num">{step.num}</div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ─── Guarantees ─────────────────── */}
          <section className="section">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.guarantees?.eyebrow || 'Our Commitments'}</p>
              <h2>{c.sectionHeadings?.guarantees?.heading || 'Promises We Put in Writing'}</h2>
              <p>{c.sectionHeadings?.guarantees?.description || 'Not marketing claims — written commitments in every contract, backed by 12 years and 120+ projects.'}</p>
            </div>
            <div className="guarantee-grid">
              {(c.guarantees || []).map((g) => (
                <article className="guarantee-card" key={g.title}>
                  <div className="guarantee-icon">{g.icon}</div>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ─── Packages ───────────────────── */}
          <section className="section section-alt" id="packages">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.packages?.eyebrow || 'Construction Packages'}</p>
              {/* <h2>{c.sectionHeadings?.packages?.heading || 'Transparent Pricing for Every Budget'}</h2> */}
              {c.sectionHeadings?.packages?.description && (
                <p>{c.sectionHeadings.packages.description}</p>
              )}
            </div>
            <div className="packages-container">
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                centeredSlides={true}
                loop={true}

                // 4. Add Autoplay configuration (3000ms = 3 seconds)
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false, // Keeps sliding even after user touches it
                }}

                // 5. Removed navigation={true}

                pagination={{ clickable: true, dynamicBullets: true }}
                breakpoints={{
                  1024: {
                    enabled: false,
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: false,
                  }
                }}
                className="pkg-swiper"
              >
                {(c.packages || []).map((pkg, i) => (
                  <SwiperSlide key={pkg.name || i}>
                    <div className={`pkg-card ${pkg.badge ? 'pkg-card-badge' : ''}`}>
                      {pkg.badge && <div className="pkg-badge-top">{pkg.badge}</div>}

                      <div className="pkg-card-header">
                        <h3 className="pkg-card-title">{pkg.name}</h3>
                        <div className="pkg-card-price-row">
                          <span className="pkg-card-price">{pkg.price}</span>
                          <span className="pkg-card-unit">{pkg.unit}</span>
                        </div>
                        <div className="pkg-card-tagline">{pkg.tagline}</div>
                      </div>

                      <div className="pkg-card-specs">
                        {pkg.specs?.map((spec, specIdx) => (
                          <div key={specIdx} className="pkg-spec-category">
                            {spec.category && <h4 className="pkg-category-name">{spec.category}</h4>}
                            <ul className="pkg-card-list">
                              {spec.items?.map((item, idx) => (
                                <li key={idx}><span className="spec-check">✓</span>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <button className="button button-primary button-full" onClick={() => setShowModal(true)}>
                        Get Quote
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>

          {/* ─── Testimonials ───────────────── */}
          <section className="section" id="testimonials">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.testimonials?.eyebrow || 'Client Reviews'}</p>
              <h2>{c.sectionHeadings?.testimonials?.heading || 'What Our Homeowners Say'}</h2>
              <p>{c.sectionHeadings?.testimonials?.description || 'Real feedback from clients who trusted us to build their most important investment.'}</p>
            </div>
            <div className="testimonial-grid">
              {(c.testimonials || []).map((item, idx) => (
                <article className="testimonial-card" key={item.name + idx}>
                  <StarRating count={item.stars} />
                  <p className="testimonial-quote">"{item.quote}"</p>
                  <div className="testimonial-meta">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="testimonial-avatar"
                        style={{ objectFit: 'cover', fontSize: 'inherit' }}
                      />
                    ) : (
                      <div className="testimonial-avatar" aria-hidden="true">{item.name.charAt(0)}</div>
                    )}
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.title}</span>
                      <span className="testimonial-project">🏠 {item.project}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ─── Comparison ─────────────────── */}
          <section className="section section-alt">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.comparison?.eyebrow || 'Why Dizain'}</p>
              <h2>{c.sectionHeadings?.comparison?.heading || 'Us vs. Typical Contractors'}</h2>
              <p>{c.sectionHeadings?.comparison?.description || 'The difference is not just quality — it is the entire experience from first call to final handover.'}</p>
            </div>
            <div className="comparison-table" role="table">
              <div className="comparison-row comparison-head" role="row">
                <span role="columnheader">{c.sectionHeadings?.comparison?.tableHeaders?.column1 || 'What matters to you'}</span>
                <span role="columnheader">{c.sectionHeadings?.comparison?.tableHeaders?.column2 || '🏆 Dizain Constructions'}</span>
                <span role="columnheader">{c.sectionHeadings?.comparison?.tableHeaders?.column3 || 'Typical contractor'}</span>
              </div>
              {(c.comparison || []).map((row) => (
                <div className="comparison-row" role="row" key={row.factor}>
                  <span role="cell">{row.factor}</span>
                  <span role="cell" className="cell-yes">{row.dizain}</span>
                  <span role="cell" className="cell-no">{row.typical}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ─── FAQ ────────────────────────── */}
          <section className="section faq-section py-5">
            <div className="section-heading centered">
              <p className="eyebrow">{c.sectionHeadings?.faqs?.eyebrow || 'FAQs'}</p>
              <h2>{c.sectionHeadings?.faqs?.heading || 'Questions Homeowners Ask'}</h2>
            </div>
            <div className="faq-list">
              {(c.faqs || []).map((item, i) => (
                <div key={item.question} className={`faq-item${openFaq === i ? ' faq-open' : ''}`}>
                  <button className="faq-question" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.question}</span>
                    <span className="faq-arrow" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <p className="faq-answer">{item.answer}</p>}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <a href="#contact" className="button button-outline">Still have questions? Contact us</a>
            </div>
          </section>

          <div className="mobile-cta-wrapper py-5">
            <button className="button button-primary mobile-pyp-trigger" onClick={() => setShowModal(true)}>
              Plan Your Project →
            </button>
          </div>

          {/* ─── CTA ────────────────────────── */}
          <section className="cta-section section">
            <div className="cta-glow" aria-hidden="true" />
            <p className="eyebrow">{c.sectionHeadings?.cta?.eyebrow || 'Start Today'}</p>
            <h2>{c.sectionHeadings?.cta?.heading || 'Ready to Build Your Dream Home?'}</h2>
            <p>{c.sectionHeadings?.cta?.description || 'Free consultation, free site visit, and a detailed cost estimate — all at zero obligation.'}</p>
            <div className="cta-actions">
              <button className="button button-primary" style={{ background: '#fff', color: 'var(--accent)' }} onClick={() => setShowModal(true)}>
                🏗️ Get Free Estimate
              </button>
            </div>
          </section>



        </main>

        {/* ─── Footer ─────────────────────── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-grid">
              <div className="footer-brand-col">
                <a className="brand footer-brand-link" href="#home">
                  {c.contact?.logoUrl ? (
                    <img src={c.contact.logoUrl} alt="Dizain Constructions Logo" className="brand-logo" style={{ height: 32, marginRight: 8, verticalAlign: 'middle' }} />
                  ) : (
                    <span className="brand-hex">⬡</span>
                  )}
                  Dizain Constructions
                </a>
                <p>Chennai's trusted construction partner for homes, villas, commercial builds, and renovation since 2012.</p>
                <div className="footer-contact">
                  <span style={{ color: '#fff', fontWeight: 600, letterSpacing: '0.01em' }}>📞 {c.contact?.phone}</span>
                  <a href={`mailto:${c.contact?.email}`}>✉️ {c.contact?.email}</a>
                  <div className="footer-address">🏠 {c.contact?.address}</div>
                </div>
              </div>
              <div className="footer-col">
                <h4>Services</h4>
                <ul>
                  {['Home Construction', 'Villa & Premium Homes', 'Commercial Buildouts', 'Renovation & Upgrades', 'Architectural Design'].map(s => (
                    <li key={s}><a href="#services">{s}</a></li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h4>Quick Links</h4>
                <ul>
                  {[['How It Works', '#process'], ['Packages & Pricing', '#packages'], ['Client Reviews', '#testimonials']].map(([l, h]) => (
                    <li key={l}><a href={h}>{l}</a></li>
                  ))}
                  <li><button className="footer-btn-link" onClick={() => setShowModal(true)}>Get Free Quote</button></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Service Areas</h4>
                <ul>
                  {['Chennai (all zones)', 'ECR Corridor', 'Tambaram & suburbs', 'Sholinganallur / OMR', 'Velachery & Adyar', 'Pallavaram & Chromepet'].map(a => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2026 Dizain Constructions. All rights reserved. Built with care for Chennai homeowners.</p>
            </div>
          </div>
        </footer>
      </div>




      {/* ─── Right-side consult tab ─────────── */}
      <button className="consult-tab" onClick={() => setShowModal(true)} aria-label="Free consultation">
        <span>📋 Free Consultation</span>
      </button>

      {/* ─── WhatsApp Floating Button ───────── */}
      {/* {
        !showModal && c.contact?.whatsapp && (c.contact?.whatsappEnabled ?? true) && (
          <a
            href={`https://wa.me/${c.contact.whatsapp}?text=Hi%2C+I+want+to+discuss+a+construction+project+with+Dizain+Constructions.`}
            className="wa-float-btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            style={{
              position: 'fixed',
              right: 20,
              bottom: 24,
              zIndex: 1200,
              background: '#25D366',
              color: '#fff',
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              fontSize: 32,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              border: 'none',
              outline: 'none',
              textDecoration: 'none',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973l-1.127 4.113 4.209-1.103a7.859 7.859 0 0 0 3.839 1.006h.001c4.368 0 7.926-3.558 7.93-7.93a7.856 7.856 0 0 0-2.332-5.547zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            <span style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              overflow: 'hidden'
            }}>Chat on WhatsApp</span>
          </a>
        )
      } */}

      {/* ─── Modal ──────────────────────────── */}
      {
        showModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <div className="modal-box">
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
              <div className="form-header">
                <p className="form-kicker">🗓️ Free Consultation</p>
                <h2>Plan Your Build Today</h2>
                <p className="form-copy">A project expert will contact you within 20 min with a free cost estimate.</p>
              </div>
              <form
                className="lead-form"
                onSubmit={async e => {
                  e.preventDefault();
                  setModalFormLoading(true);
                  setModalFormError("");
                  const name = e.target.mfname.value.trim();
                  const phone = e.target.mfphone.value.trim();
                  const location = e.target.mfloc.value.trim();
                  const budget = e.target.mfbudget.value;
                  const email = e.target.mfemail.value.trim();
                  const details = e.target.mfdetails.value.trim();
                  // Validation
                  if (!name || !phone || !location || !budget || !email) {
                    setModalFormError("All fields are required.");
                    setModalFormLoading(false);
                    return;
                  }
                  if (!/^\d{10}$/.test(phone)) {
                    setModalFormError("Enter a valid 10-digit mobile number.");
                    setModalFormLoading(false);
                    return;
                  }
                  if (!/^([\w-.]+)@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
                    setModalFormError("Enter a valid email address.");
                    setModalFormLoading(false);
                    return;
                  }
                  const formData = { name, phone, location, budget, email, details, timestamp: new Date().toISOString() };
                  // Save to localStorage for admin reference
                  // const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
                  // submissions.push(formData);
                  // localStorage.setItem('formSubmissions', JSON.stringify(submissions));
                  try {
                    const result = await sendConsultationEmail(formData);
                    if (!result.success) {
                      // toast.error("Failed to send. Please try again.");
                      setModalFormError("Failed to send. Please try again.");
                      setModalFormLoading(false);
                      return;
                    }
                    toast.success("Consultation request submitted successfully!");
                    setShowModal(false);
                    // Google Ads Conversion Tracking
                    if (window.gtag) {
                      window.gtag('event', 'conversion', {
                        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
                      });
                    }
                    // Meta Pixel Conversion Tracking
                    if (window.fbq) {
                      window.fbq('track', 'Lead');
                    }
                  } catch (err) {
                    setModalFormError("Network error. Please try again.");
                  } finally {
                    setModalFormLoading(false);
                  }
                }}
              >
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="mfname">Full Name *</label>
                    <input id="mfname" type="text" placeholder="e.g. Suresh Kumar" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mfphone">Phone Number *</label>
                    <input id="mfphone" type="tel" placeholder="+91 89393 30941" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="mfloc">Plot / Site Location *</label>
                  <input id="mfloc" type="text" placeholder="e.g. Adyar, Tambaram, ECR…" required />
                </div>
                <div className="form-group">
                  <label htmlFor="mfbudget">Estimated Budget</label>
                  <select id="mfbudget" defaultValue="">
                    <option value="" disabled>Budget range</option>
                    <option>55 lakhs – 70 lakhs</option>
                    <option>70 lakhs – 95 lakhs</option>
                    <option>Above 1 crore</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mfemail">Email Address *</label>
                  <input id="mfemail" type="email" placeholder="e.g. you@email.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="mfdetails">Tell us more (optional)</label>
                  <textarea id="mfdetails" placeholder="Plot size, number of floors, budget range…" rows="3" />
                </div>
                <button className="button button-primary button-full btn-submit" type="submit" disabled={modalFormLoading}>
                  {modalFormLoading ? (
                    <span className="spinner" aria-label="Loading" style={{ marginRight: 8 }}></span>
                  ) : null}
                  {modalFormLoading ? "Sending..." : "Request Free Consultation →"}
                </button>
                {modalFormError && <p className="form-error" role="alert" style={{ color: '#d32f2f', marginTop: 8 }}>{modalFormError}</p>}
                <p className="form-disclaimer">🔒 Your details are safe with us. No spam ever.</p>
              </form>
            </div>
          </div>
        )
      }
    </>
  )
}

// Animated metrics component
function MetricsAnimated({ metrics }) {
  const [counts, setCounts] = useState(metrics.map(m => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!metrics.length) return;
    const handleScroll = () => {
      if (hasAnimated) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        setHasAnimated(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated, metrics.length]);

  useEffect(() => {
    if (!hasAnimated || !metrics.length) return;
    let start = null;
    const duration = 1200;
    const startVals = metrics.map(() => 0);
    const endVals = metrics.map(m => {
      // Extract number from value string (e.g., "120+" or "₹5 Cr+")
      const num = parseInt((m.value || '').replace(/[^\d]/g, ''));
      return isNaN(num) ? 0 : num;
    });
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCounts(endVals.map((end, i) => Math.floor(progress * (end - startVals[i]) + startVals[i])));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCounts(endVals);
      }
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [hasAnimated, metrics.length]);

  return (
    <>
      <div ref={ref} className="metrics-animated-grid">
        {metrics.map((m, i) => (
          <article className="metric-card" key={m.label}>
            <strong>
              {typeof m.value === 'string' && m.value.match(/\D+$/)
                ? counts[i] + m.value.match(/\D+$/)[0]
                : counts[i]}
            </strong>
            <p className="metric-label">{m.label}</p>
            <span className="metric-sub">{m.sub}</span>
          </article>
        ))}
      </div>
    </>
  );
}
