import { useEffect, useRef, useState } from 'react'
import './App.css'

const AGE_VERIFIED_KEY = 'ijinja-age-verified'
const CART_STORAGE_KEY = 'ijinja-merch-cart'
const WHATSAPP_NUMBER = '27825772758'

const PAYMENT_OPTIONS = [
  'EFT / Bank Transfer',
  'Card on Delivery',
  'Cash on Delivery',
]

const moneyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
})

const products = [
  {
    id: 'ijinja-original',
    name: 'Ijinja Original',
    tag: 'Original',
    image: '/content/products/ijinja-original.png',
    description:
      'A balanced ginger profile with clean heat and smooth everyday drinkability.',
  },
  {
    id: 'ijinja-alcohol-free',
    name: 'Ijinja Alcohol Free',
    tag: 'Alcohol Free',
    image: '/content/products/ijinja-alcohol-free.png',
    description:
      'All the Ijinja flavor and fire, made for alcohol-free moments.',
  },
  {
    id: 'ijinja-with-gin',
    name: 'Ijinja with Gin',
    tag: 'With Gin',
    image: '/content/products/ijinja-with-gin.png',
    description:
      'A bold, premium blend where spicy ginger meets a crisp gin finish.',
  },
]

const merchProducts = [
  {
    id: 'ijinja-tee',
    name: 'Ijinja Heritage Tee',
    tag: 'Apparel',
    image: '/content/products/ijinja-original.png',
    description: 'Soft cotton tee with front logo print for everyday wear.',
    price: 299,
    options: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'ijinja-cap',
    name: 'Ijinja Classic Cap',
    tag: 'Accessories',
    image: '/content/products/ijinja-alcohol-free.png',
    description: 'Curved peak cap with adjustable strap and embroidered logo.',
    price: 249,
    options: ['One Size'],
  },
  {
    id: 'ijinja-cooler',
    name: 'Ijinja Cooler Bag',
    tag: 'Lifestyle',
    image: '/content/products/ijinja-with-gin.png',
    description: 'Insulated carry bag built for road trips, markets, and events.',
    price: 399,
    options: ['Standard'],
  },
]

const menuItems = [
  { label: 'Our Story', href: '#our-story' },
  { label: 'Products', href: '#products' },
  { label: 'Store', href: '#store' },
  { label: 'Contact', href: '#contact' },
]

const contactDetails = [
  {
    label: 'Email',
    value: 'admin@ijinja.co.za',
    href: 'mailto:admin@ijinja.co.za',
  },
  { label: 'Contact Person', value: 'Eugene van Zyl' },
  {
    label: 'WhatsApp',
    value: '082 577 2758',
    href: 'https://wa.me/27825772758',
    external: true,
  },
]

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/IjinjaSpirit' },
  { label: 'Instagram', href: 'https://www.instagram.com/ijinja_spirit/' },
]

const initialCheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  paymentMethod: PAYMENT_OPTIONS[0],
  notes: '',
}

const getInitialCart = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!storedCart) {
      return []
    }

    const parsedCart = JSON.parse(storedCart)
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedMerchOptions, setSelectedMerchOptions] = useState(() =>
    merchProducts.reduce((accumulator, product) => {
      accumulator[product.id] = product.options[0]
      return accumulator
    }, {}),
  )
  const [cartItems, setCartItems] = useState(getInitialCart)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm)
  const storySectionRef = useRef(null)
  const storyCanRef = useRef(null)
  const [ageVerified, setAgeVerified] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(AGE_VERIFIED_KEY) === 'true'
  })

  useEffect(() => {
    const autoRotate = setInterval(() => {
      setActiveSlide((current) => (current + 1) % products.length)
    }, 5000)

    return () => clearInterval(autoRotate)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !ageVerified) {
      return
    }

    window.localStorage.setItem(AGE_VERIFIED_KEY, 'true')
  }, [ageVerified])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const originalOverflow = document.body.style.overflow

    if (!ageVerified || checkoutOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [ageVerified, checkoutOpen])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storySection = storySectionRef.current
    const storyCan = storyCanRef.current

    if (!storySection || !storyCan) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      storyCan.style.transform = 'rotate(0deg)'
      return
    }

    let frameId = null
    let ticking = false

    const updateRotation = () => {
      ticking = false

      const rect = storySection.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollRange = rect.height + viewportHeight
      const traveled = viewportHeight - rect.top
      const progress = Math.min(1, Math.max(0, traveled / scrollRange))
      const rotation = progress * 360

      storyCan.style.transform = `rotate(${rotation.toFixed(2)}deg)`
    }

    const queueUpdate = () => {
      if (ticking) {
        return
      }

      ticking = true
      frameId = window.requestAnimationFrame(updateRotation)
    }

    queueUpdate()
    window.addEventListener('scroll', queueUpdate, { passive: true })
    window.addEventListener('resize', queueUpdate)

    return () => {
      window.removeEventListener('scroll', queueUpdate)
      window.removeEventListener('resize', queueUpdate)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const goToSlide = (index) => setActiveSlide(index)

  const goPrev = () => {
    setActiveSlide((current) => (current - 1 + products.length) % products.length)
  }

  const goNext = () => {
    setActiveSlide((current) => (current + 1) % products.length)
  }

  const handleVerifyAge = () => setAgeVerified(true)

  const handleUnderAge = () => {
    window.open('https://www.google.com/', '_blank', 'noopener,noreferrer')
  }

  const formatPrice = (value) => moneyFormatter.format(value)

  const updateSelectedOption = (productId, option) => {
    setSelectedMerchOptions((current) => ({
      ...current,
      [productId]: option,
    }))
  }

  const addToCart = (productId) => {
    const product = merchProducts.find((entry) => entry.id === productId)
    if (!product) {
      return
    }

    const selectedOption = selectedMerchOptions[productId] || product.options[0]

    setCartItems((current) => {
      const existingItem = current.find(
        (entry) => entry.productId === productId && entry.option === selectedOption,
      )

      if (existingItem) {
        return current.map((entry) =>
          entry.productId === productId && entry.option === selectedOption
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        )
      }

      return [...current, { productId, option: selectedOption, quantity: 1 }]
    })
  }

  const updateCartQuantity = (productId, option, quantity) => {
    if (quantity <= 0) {
      setCartItems((current) =>
        current.filter(
          (entry) => !(entry.productId === productId && entry.option === option),
        ),
      )
      return
    }

    setCartItems((current) =>
      current.map((entry) =>
        entry.productId === productId && entry.option === option
          ? { ...entry, quantity }
          : entry,
      ),
    )
  }

  const removeFromCart = (productId, option) => {
    setCartItems((current) =>
      current.filter((entry) => !(entry.productId === productId && entry.option === option)),
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartLineItems = cartItems
    .map((entry) => {
      const product = merchProducts.find((item) => item.id === entry.productId)
      if (!product) {
        return null
      }

      return {
        ...entry,
        product,
        lineTotal: product.price * entry.quantity,
      }
    })
    .filter(Boolean)

  const cartItemCount = cartLineItems.reduce((sum, entry) => sum + entry.quantity, 0)
  const cartTotal = cartLineItems.reduce((sum, entry) => sum + entry.lineTotal, 0)

  const updateCheckoutField = (field, value) => {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const openCheckout = () => {
    if (!cartLineItems.length) {
      return
    }

    setCheckoutError('')
    setCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setCheckoutError('')
    setCheckoutOpen(false)
  }

  const handleWhatsAppCheckout = (event) => {
    event.preventDefault()

    if (!cartLineItems.length) {
      return
    }

    const trimmedDetails = {
      fullName: checkoutForm.fullName.trim(),
      email: checkoutForm.email.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim(),
      paymentMethod: checkoutForm.paymentMethod.trim(),
      notes: checkoutForm.notes.trim(),
    }

    const missingFields = []

    if (!trimmedDetails.fullName) {
      missingFields.push('name')
    }

    if (!trimmedDetails.email) {
      missingFields.push('email')
    }

    if (!trimmedDetails.phone) {
      missingFields.push('phone')
    }

    if (!trimmedDetails.address) {
      missingFields.push('delivery address')
    }

    if (!trimmedDetails.paymentMethod) {
      missingFields.push('payment option')
    }

    if (missingFields.length) {
      setCheckoutError(`Please complete: ${missingFields.join(', ')}.`)
      return
    }

    const lines = [
      'Hi Ijinja team, I would like to place a merch order:',
      '',
      ...cartLineItems.map(
        (entry, index) =>
          `${index + 1}. ${entry.product.name} (${entry.option}) x${entry.quantity} - ${formatPrice(entry.lineTotal)}`,
      ),
      '',
      `Order Total: ${formatPrice(cartTotal)}`,
      '',
      'Customer details:',
      `- Name: ${trimmedDetails.fullName}`,
      `- Email: ${trimmedDetails.email}`,
      `- Phone: ${trimmedDetails.phone}`,
      `- Delivery address: ${trimmedDetails.address}`,
      `- Payment option: ${trimmedDetails.paymentMethod}`,
    ]

    if (trimmedDetails.notes) {
      lines.push(`- Notes: ${trimmedDetails.notes}`)
    }

    lines.push('', 'Please confirm stock, delivery fee, and payment instructions.')

    const message = encodeURIComponent(lines.join('\n'))
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

    setCheckoutOpen(false)
    setCheckoutError('')
  }

  return (
    <>
      {!ageVerified && (
        <div
          className="age-gate-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
        >
          <div className="age-gate-card">
            <img
              src="/content/assets/logo-1.png"
              alt="Ijinja logo"
              className="age-gate-logo"
              loading="eager"
            />
            <p className="age-gate-kicker">Age Verification</p>
            <h2 id="age-gate-title">Please verify your age</h2>
            <p className="age-gate-copy">
              You must be 18 years or older to access this website.
            </p>

            <div className="age-gate-actions">
              <button
                type="button"
                className="age-button age-button-primary"
                onClick={handleVerifyAge}
              >
                I am 18 years or older
              </button>

              <button
                type="button"
                className="age-button age-button-secondary"
                onClick={handleUnderAge}
              >
                I am younger than 18
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div
          className="checkout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <div className="checkout-card">
            <div className="checkout-head">
              <h2 id="checkout-title">Checkout Details</h2>
              <button
                type="button"
                className="checkout-close"
                onClick={closeCheckout}
                aria-label="Close checkout details"
              >
                X
              </button>
            </div>

            <p className="checkout-copy">
              Fill in your details below. We will open WhatsApp with your order and
              info pre-filled so you only need to send it.
            </p>

            {checkoutError && (
              <p className="checkout-error" role="alert">
                {checkoutError}
              </p>
            )}

            <form className="checkout-form" onSubmit={handleWhatsAppCheckout}>
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  value={checkoutForm.fullName}
                  onChange={(event) =>
                    updateCheckoutField('fullName', event.target.value)
                  }
                  autoComplete="name"
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={checkoutForm.email}
                  onChange={(event) => updateCheckoutField('email', event.target.value)}
                  autoComplete="email"
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={checkoutForm.phone}
                  onChange={(event) => updateCheckoutField('phone', event.target.value)}
                  autoComplete="tel"
                />
              </label>

              <label>
                <span>Delivery Address</span>
                <textarea
                  rows={3}
                  value={checkoutForm.address}
                  onChange={(event) => updateCheckoutField('address', event.target.value)}
                  autoComplete="street-address"
                ></textarea>
              </label>

              <label>
                <span>Payment Option</span>
                <select
                  value={checkoutForm.paymentMethod}
                  onChange={(event) =>
                    updateCheckoutField('paymentMethod', event.target.value)
                  }
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Notes (Optional)</span>
                <textarea
                  rows={2}
                  value={checkoutForm.notes}
                  onChange={(event) => updateCheckoutField('notes', event.target.value)}
                ></textarea>
              </label>

              <div className="checkout-summary">
                <p>
                  <span>Items</span>
                  <strong>{cartItemCount}</strong>
                </p>
                <p>
                  <span>Total</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </p>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="checkout-button checkout-button-secondary"
                  onClick={closeCheckout}
                >
                  Cancel
                </button>
                <button type="submit" className="checkout-button checkout-button-primary">
                  Open WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`page-shell ${!ageVerified ? 'is-locked' : ''}`}>
        <header className="content-section site-header">
          <a className="brand" href="/">
            <img
              src="/content/assets/logo-1.png"
              alt="Ijinja logo"
              className="brand-logo"
              loading="eager"
              decoding="async"
            />
            <span className="brand-text">Ij!nja</span>
          </a>

          <div className="header-actions">
            <a className="shop-cta" href="#store">
              Shop Merch
            </a>

            <div className="menu-wrap">
              <button
                type="button"
                className={`hamburger ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              {menuOpen && (
                <nav className="menu-dropdown" aria-label="Main navigation">
                  {menuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </header>

        <main className="home-content">
          <section className="content-section hero-section">
            <div className="hero-copy">
              <p className="hero-kicker">South African Ginger Beer</p>
              <h1>Rooted in spice, brewed for spirit.</h1>
              <p className="hero-summary">
                Crafted with bold ginger character and a smooth finish, Ijinja
                brings people together around flavor, warmth, and celebration.
              </p>
            </div>

            <div className="hero-image-wrap">
              <img
                src="/content/products/ijinja-original.png"
                alt="Ijinja Original can"
                loading="lazy"
              />
            </div>
          </section>

          <section
            className="content-section story-section"
            id="our-story"
            ref={storySectionRef}
          >
            <div className="story-image">
              <img
                ref={storyCanRef}
                src="/content/products/ijinja-with-gin.png"
                alt="Ijinja with Gin can"
                loading="lazy"
              />
            </div>

            <div className="story-copy">
              <p className="section-kicker">Our Story</p>
              <h2 className="section-title">The Spirit of Ij!nja</h2>
              <p>
                Long ago, in the rolling hills where the Zulu and Xhosa people
                gathered to share stories by the fire, there grew a root with a
                fiery spirit: Ij!nja, the ginger root.
              </p>
              <p>
                Crafted with care and respect for tradition, that spirit was
                reborn into a drink that celebrates warmth, connection, and
                moments best shared.
              </p>
            </div>
          </section>

          <section
            className="content-section products-section"
            id="products"
            aria-label="Featured products"
          >
            <div className="products-head">
              <p className="section-kicker">Featured Range</p>
              <h2 className="section-title">Choose Your Ijinja</h2>
            </div>

            <div className="carousel-viewport">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {products.map((product, index) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-layout">
                      <div className={`product-cover cover-${index + 1}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <div className="product-details">
                        <p className="product-tag">{product.tag}</p>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="carousel-actions">
              <button type="button" onClick={goPrev} className="nav-button">
                Prev
              </button>

              <div className="indicators">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Show ${product.name}`}
                    className={`indicator ${activeSlide === index ? 'active' : ''}`}
                  ></button>
                ))}
              </div>

              <button type="button" onClick={goNext} className="nav-button">
                Next
              </button>
            </div>
          </section>

          <section
            className="content-section merch-section"
            id="store"
            aria-label="Merch store"
          >
            <div className="merch-head">
              <p className="section-kicker">Merch Store</p>
              <h2 className="section-title">Gear Up with Ijinja</h2>
              <p>
                Add items to your cart and checkout directly on WhatsApp. We
                will confirm stock, delivery, and payment with you personally.
              </p>
            </div>

            <div className="merch-layout">
              <div className="merch-grid">
                {merchProducts.map((product) => (
                  <article key={product.id} className="merch-card">
                    <div className="merch-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>

                    <div className="merch-details">
                      <p className="product-tag">{product.tag}</p>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p className="merch-price">{formatPrice(product.price)}</p>

                      <label className="merch-option-row">
                        <span>Size / Option</span>
                        <select
                          value={selectedMerchOptions[product.id]}
                          onChange={(event) =>
                            updateSelectedOption(product.id, event.target.value)
                          }
                        >
                          {product.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="merch-add-button"
                        onClick={() => addToCart(product.id)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-panel" aria-label="Shopping cart">
                <div className="cart-head">
                  <h3>Your Cart</h3>
                  <p>
                    {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
                  </p>
                </div>

                {!cartLineItems.length && (
                  <p className="cart-empty">
                    Your cart is empty. Add merch items to begin your order.
                  </p>
                )}

                {!!cartLineItems.length && (
                  <ul className="cart-list">
                    {cartLineItems.map((entry) => (
                      <li
                        key={`${entry.productId}-${entry.option}`}
                        className="cart-list-item"
                      >
                        <div className="cart-item-main">
                          <h4>{entry.product.name}</h4>
                          <p>{entry.option}</p>
                          <strong>{formatPrice(entry.lineTotal)}</strong>
                        </div>

                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  entry.productId,
                                  entry.option,
                                  entry.quantity - 1,
                                )
                              }
                              aria-label={`Decrease ${entry.product.name} quantity`}
                            >
                              -
                            </button>
                            <span>{entry.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  entry.productId,
                                  entry.option,
                                  entry.quantity + 1,
                                )
                              }
                              aria-label={`Increase ${entry.product.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="remove-item"
                            onClick={() =>
                              removeFromCart(entry.productId, entry.option)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="cart-footer">
                  <p className="cart-total">
                    <span>Total</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </p>

                  <div className="cart-buttons">
                    <button
                      type="button"
                      className="cart-button cart-button-secondary"
                      onClick={clearCart}
                      disabled={!cartLineItems.length}
                    >
                      Clear Cart
                    </button>
                    <button
                      type="button"
                      className="cart-button cart-button-primary"
                      onClick={openCheckout}
                      disabled={!cartLineItems.length}
                    >
                      Checkout on WhatsApp
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="content-section contact-section" id="contact">
            <div className="contact-copy">
              <p className="section-kicker">Call Us</p>
              <h2 className="section-title">Contact Details</h2>
              <p>For orders, stockists, and partnerships, reach out directly.</p>
            </div>

            <div className="contact-list">
              {contactDetails.map((item) => (
                <p key={item.label}>
                  <span>{item.label}:</span>{' '}
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </p>
              ))}
            </div>

            <div className="social-links">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </main>

        <footer className="content-section site-footer">
          <p>(c) 2026 Ij!nja. All Rights Reserved.</p>
        </footer>
      </div>
    </>
  )
}

export default App
