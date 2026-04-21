import { useEffect, useRef, useState } from 'react'
import './App.css'

const AGE_VERIFIED_KEY = 'ijinja-age-verified'
const WHATSAPP_NUMBER = '27742643837'
const MANUAL_ORDER_API_PATH = '/api/store/manual-order'
const USE_WHATSAPP_CHECKOUT = true
const STORY_VIDEO_SRC = '/content/assets/fire-video.mp4'
const HERO_PHOTO_SRC = '/content/assets/ijinja-can-on-head.webp'
const DRINK_CASE_SIZE = 24

const PAYMENT_OPTIONS = [
  'EFT / Bank Transfer',
  'Card on Delivery',
  'Cash on Delivery',
]
const MERCH_IN_STOCK = false

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
    inStock: true,
    coverClass: 'can-cover-original',
    image: '/content/products/ijinja-original.png',
    description:
      'A balanced ginger profile with clean heat and smooth everyday drinkability.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
  {
    id: 'ijinja-alcohol-free',
    name: 'Ijinja Alcohol Free',
    tag: 'Alcohol Free',
    inStock: false,
    coverClass: 'can-cover-alcohol-free',
    image: '/content/products/ijinja-alcohol-free.png',
    description:
      'All the Ijinja flavor and fire, made for alcohol-free moments.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
  {
    id: 'ijinja-with-gin',
    name: 'Ijinja with Gin',
    tag: 'With Gin',
    inStock: false,
    coverClass: 'can-cover-with-gin',
    image: '/content/products/ijinja-with-gin.png',
    description:
      'A bold, premium blend where spicy ginger meets a crisp gin finish.',
    price: 34.99,
    options: [`Case (${DRINK_CASE_SIZE} Cans)`],
  },
]

const drinkProductIds = new Set(products.map((product) => product.id))

const merchProducts = [
  {
    id: 'ijinja-tee',
    name: 'Ijinja Heritage Tee',
    tag: 'Apparel',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/Ijinja-shirt1-front.png',
    images: [
      '/content/products/Ijinja-shirt1-front.png',
      '/content/products/Ijinja-shirt1-back.png',
    ],
    description: 'Soft cotton tee with front logo print for everyday wear.',
    price: 299,
    options: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'ijinja-cap',
    name: 'Ijinja Classic Cap',
    tag: 'Accessories',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/ijinja-hat1-front.png',
    images: [
      '/content/products/ijinja-hat1-front.png',
      '/content/products/ijinja-hat1-back.png',
    ],
    description: 'Curved peak cap with adjustable strap and embroidered logo.',
    price: 249,
    options: ['One Size'],
  },
  {
    id: 'ijinja-cooler',
    name: 'Ijinja Cooler Bag',
    tag: 'Lifestyle',
    inStock: MERCH_IN_STOCK,
    image: '/content/products/Ijinja-cooler.png',
    description: 'Insulated carry bag built for road trips, markets, and events.',
    price: 399,
    options: ['Standard'],
  },
]

const storeProducts = [...products, ...merchProducts]

const menuItems = [
  { label: 'Our Story', href: '#our-story' },
  { label: 'Products', href: '#products' },
  { label: 'Buy Ijinja', href: '#buy-products' },
  { label: 'Store', href: '#store' },
  { label: "T&C's", href: '/terms-and-conditions.html' },
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
    value: '+27 74 264 3837',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [selectedMerchOptions, setSelectedMerchOptions] = useState(() =>
    storeProducts.reduce((accumulator, product) => {
      accumulator[product.id] = product.options?.[0] || 'Standard'
      return accumulator
    }, {}),
  )
  const [activeMerchImage, setActiveMerchImage] = useState(() =>
    merchProducts.reduce((accumulator, product) => {
      accumulator[product.id] = 0
      return accumulator
    }, {}),
  )
  const [cartItems, setCartItems] = useState([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState('')
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm)
  const [headerCartVisible, setHeaderCartVisible] = useState(false)
  const [headerCartExiting, setHeaderCartExiting] = useState(false)
  const menuWrapRef = useRef(null)
  const headerCartHideTimerRef = useRef(null)
  const storySectionRef = useRef(null)
  const storyVideoRef = useRef(null)
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
    if (typeof document === 'undefined' || !menuOpen) {
      return
    }

    const closeMenuOnOutsidePress = (event) => {
      const menuWrap = menuWrapRef.current
      if (
        !menuWrap ||
        !(event.target instanceof Node) ||
        menuWrap.contains(event.target)
      ) {
        return
      }

      setMenuOpen(false)
    }

    const closeMenuOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeMenuOnOutsidePress)
    document.addEventListener('keydown', closeMenuOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeMenuOnOutsidePress)
      document.removeEventListener('keydown', closeMenuOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storySection = storySectionRef.current
    const storyVideo = storyVideoRef.current

    if (!storySection || !storyVideo) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let measureFrameId = null
    let measureQueued = false
    let videoDuration = 0

    const setVideoTime = (progress) => {
      if (!videoDuration) {
        return
      }

      const maxTime = Math.max(videoDuration - 0.05, 0)
      const nextTime = Math.min(maxTime, Math.max(0, progress * maxTime))
      if (Math.abs(storyVideo.currentTime - nextTime) > 0.01) {
        storyVideo.currentTime = nextTime
      }
    }

    const updateVideoTimeForScroll = () => {
      measureQueued = false

      if (mediaQuery.matches) {
        setVideoTime(0)
        return
      }

      const rect = storySection.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollRange = rect.height + viewportHeight
      const traveled = viewportHeight - rect.top
      const progress = Math.min(1, Math.max(0, traveled / scrollRange))

      setVideoTime(progress)
    }

    const queueMeasure = () => {
      if (measureQueued) {
        return
      }

      measureQueued = true
      measureFrameId = window.requestAnimationFrame(updateVideoTimeForScroll)
    }

    const syncVideoDuration = () => {
      const nextDuration = storyVideo.duration
      if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
        return
      }

      videoDuration = nextDuration
      queueMeasure()
    }

    storyVideo.pause()
    storyVideo.currentTime = 0
    syncVideoDuration()
    queueMeasure()

    storyVideo.addEventListener('loadedmetadata', syncVideoDuration)
    storyVideo.addEventListener('durationchange', syncVideoDuration)
    window.addEventListener('scroll', queueMeasure, { passive: true })
    window.addEventListener('resize', queueMeasure)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', queueMeasure)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(queueMeasure)
    }

    return () => {
      storyVideo.removeEventListener('loadedmetadata', syncVideoDuration)
      storyVideo.removeEventListener('durationchange', syncVideoDuration)
      window.removeEventListener('scroll', queueMeasure)
      window.removeEventListener('resize', queueMeasure)
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', queueMeasure)
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(queueMeasure)
      }
      if (measureFrameId !== null) {
        window.cancelAnimationFrame(measureFrameId)
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
  const isProductInStock = (product) => product.inStock !== false
  const getProductById = (productId) =>
    storeProducts.find((entry) => entry.id === productId)
  const isDrinkProduct = (productOrId) => {
    const productId =
      typeof productOrId === 'string' ? productOrId : productOrId?.id
    return Boolean(productId && drinkProductIds.has(productId))
  }
  const getUnitPrice = (product) => {
    if (!product || typeof product.price !== 'number') {
      return null
    }

    return isDrinkProduct(product) ? product.price * DRINK_CASE_SIZE : product.price
  }

  const getMerchImages = (product) =>
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image]

  const updateSelectedOption = (productId, option) => {
    setSelectedMerchOptions((current) => ({
      ...current,
      [productId]: option,
    }))
  }

  const cycleMerchImage = (productId, imageCount, direction = 1) => {
    if (imageCount <= 1) {
      return
    }

    setActiveMerchImage((current) => {
      const currentIndex = current[productId] ?? 0
      const nextIndex = (currentIndex + direction + imageCount) % imageCount
      return {
        ...current,
        [productId]: nextIndex,
      }
    })
  }

  const addToCart = (productId) => {
    const product = getProductById(productId)
    if (!product) {
      return
    }
    if (!isProductInStock(product)) {
      return
    }

    const selectedOption = selectedMerchOptions[productId] || product.options?.[0] || 'Standard'

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
      const product = getProductById(entry.productId)
      if (!product) {
        return null
      }

      const unitPrice = getUnitPrice(product)

      return {
        ...entry,
        product,
        unitPrice,
        lineTotal: unitPrice === null ? null : unitPrice * entry.quantity,
      }
    })
    .filter(Boolean)

  const cartItemCount = cartLineItems.reduce((sum, entry) => sum + entry.quantity, 0)
  const cartTotal = cartLineItems.reduce((sum, entry) => sum + (entry.lineTotal ?? 0), 0)
  const hasUnpricedItems = cartLineItems.some((entry) => entry.lineTotal === null)

  useEffect(() => {
    if (cartItemCount > 0) {
      if (headerCartHideTimerRef.current !== null) {
        window.clearTimeout(headerCartHideTimerRef.current)
        headerCartHideTimerRef.current = null
      }

      setHeaderCartVisible(true)
      setHeaderCartExiting(false)
      return
    }

    if (!headerCartVisible) {
      return
    }

    setHeaderCartExiting(true)
    headerCartHideTimerRef.current = window.setTimeout(() => {
      setHeaderCartVisible(false)
      setHeaderCartExiting(false)
      headerCartHideTimerRef.current = null
    }, 260)

    return () => {
      if (headerCartHideTimerRef.current !== null) {
        window.clearTimeout(headerCartHideTimerRef.current)
        headerCartHideTimerRef.current = null
      }
    }
  }, [cartItemCount, headerCartVisible])

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
    setCheckoutSuccess('')
    setCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setCheckoutError('')
    setCheckoutSuccess('')
    setCheckoutSubmitting(false)
    setCheckoutOpen(false)
  }

  const handleManualCheckout = async (event) => {
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

    const payload = {
      fullName: trimmedDetails.fullName,
      email: trimmedDetails.email,
      phone: trimmedDetails.phone,
      address: trimmedDetails.address,
      paymentMethod: trimmedDetails.paymentMethod,
      notes: trimmedDetails.notes,
      orderTotal: cartTotal,
      currencyCode: 'ZAR',
      items: cartLineItems.map((entry) => ({
        productId: entry.productId,
        productName: entry.product.name,
        option: entry.option,
        quantity: entry.quantity,
        unitPrice: entry.unitPrice ?? 0,
        lineTotal: entry.lineTotal ?? 0,
      })),
    }

    setCheckoutError('')
    setCheckoutSuccess('')

    if (USE_WHATSAPP_CHECKOUT) {
      const orderLines = cartLineItems.map((entry, index) => {
        const lineTotalText =
          entry.lineTotal === null ? 'Quoted item' : formatPrice(entry.lineTotal)
        return `${index + 1}. ${entry.product.name} (${entry.option}) x ${entry.quantity} - ${lineTotalText}`
      })

      const totalText = hasUnpricedItems
        ? `${formatPrice(cartTotal)} + quoted items`
        : formatPrice(cartTotal)

      const messageLines = [
        'Hello Ijinja team, I would like to place this order:',
        '',
        `Name: ${payload.fullName}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone}`,
        `Delivery address: ${payload.address}`,
        `Payment option: ${payload.paymentMethod}`,
      ]

      if (payload.notes) {
        messageLines.push(`Notes: ${payload.notes}`)
      }

      messageLines.push('', 'Order items:', ...orderLines, '', `Order total: ${totalText}`)

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        messageLines.join('\n'),
      )}`

      const popupWindow = window.open('', '_blank')
      if (popupWindow) {
        popupWindow.opener = null
        popupWindow.location.href = whatsappUrl
      } else {
        window.location.href = whatsappUrl
      }

      setCheckoutSuccess('WhatsApp opened with your order message ready to send.')
      return
    }

    setCheckoutSubmitting(true)

    try {
      const response = await fetch(MANUAL_ORDER_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      let responseBody = null
      try {
        responseBody = await response.json()
      } catch {
        responseBody = null
      }

      if (!response.ok) {
        const errorText =
          responseBody?.error ||
          responseBody?.detail ||
          'We could not submit your order right now. Please try again.'
        setCheckoutError(errorText)
        return
      }

      const orderReference = responseBody?.orderReference?.trim()
      const orderReferenceText = orderReference ? ` Ref: ${orderReference}.` : ''

      if (responseBody?.status === 'submitted_confirmation_failed') {
        const customerConfirmationError = responseBody?.customerConfirmationError
        const customerConfirmationText =
          customerConfirmationError && typeof customerConfirmationError === 'string'
            ? ` Customer confirmation message failed: ${customerConfirmationError}`
            : ''

        setCheckoutSuccess(
          `Order submitted successfully.${orderReferenceText} Our team will contact you to confirm stock, delivery, and payment.${customerConfirmationText}`,
        )
      } else {
        setCheckoutSuccess(
          `Order submitted and confirmation sent to your phone.${orderReferenceText} Our team will contact you to confirm stock, delivery, and payment.`,
        )
      }

      setCheckoutForm(initialCheckoutForm)
      clearCart()
    } catch {
      setCheckoutError('Network error while submitting your order. Please try again.')
    } finally {
      setCheckoutSubmitting(false)
    }
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
              {USE_WHATSAPP_CHECKOUT
                ? 'Fill in your details below. When you submit, WhatsApp will open with your order message ready to send to the supplier.'
                : 'Fill in your details below. We will submit your order to the Ijinja team, then confirm stock, delivery, and payment with you manually.'}
            </p>

            {checkoutError && (
              <p className="checkout-error" role="alert">
                {checkoutError}
              </p>
            )}

            {checkoutSuccess && (
              <p className="checkout-success" role="status">
                {checkoutSuccess}
              </p>
            )}

            <form className="checkout-form" onSubmit={handleManualCheckout}>
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
                  <strong>
                    {hasUnpricedItems
                      ? `${formatPrice(cartTotal)} + quoted items`
                      : formatPrice(cartTotal)}
                  </strong>
                </p>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="checkout-button checkout-button-secondary"
                  onClick={closeCheckout}
                  disabled={checkoutSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="checkout-button checkout-button-primary"
                  disabled={checkoutSubmitting}
                >
                  {checkoutSubmitting
                    ? 'Submitting...'
                    : USE_WHATSAPP_CHECKOUT
                      ? 'Open WhatsApp'
                      : 'Submit Order'}
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
            {headerCartVisible && (
              <a
                className={`header-cart-link ${headerCartExiting ? 'is-exiting' : ''}`}
                href="#cart"
                aria-label={`View cart. ${cartItemCount} item${cartItemCount === 1 ? '' : 's'} in cart.`}
              >
                <img
                  src="/content/assets/shopping-bag-checkmark-icon.webp"
                  alt=""
                  className="header-cart-icon"
                  loading="eager"
                  decoding="async"
                />
                <span key={cartItemCount} className="header-cart-count">
                  {cartItemCount}
                </span>
              </a>
            )}

            <a className="shop-cta" href="#store">
              Shop now
            </a>

            <div className="menu-wrap" ref={menuWrapRef}>
              <button
                type="button"
                className={`hamburger ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
                src={HERO_PHOTO_SRC}
                alt="Ijinja can balanced on a person's head"
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
              <video
                ref={storyVideoRef}
                muted
                playsInline
                preload="metadata"
                aria-label="Ijinja story fire animation"
              >
                <source src={STORY_VIDEO_SRC} type="video/mp4" />
              </video>
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
              <button
                type="button"
                onClick={goPrev}
                className="nav-button nav-button-prev"
                aria-label="Previous product"
              >
                &lt;
              </button>

              <div
                className="carousel-track"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-layout">
                      <div className={`product-cover ${product.coverClass}`}>
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
              <button
                type="button"
                onClick={goNext}
                className="nav-button nav-button-next"
                aria-label="Next product"
              >
                &gt;
              </button>
            </div>

            <div className="carousel-actions">
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
            </div>
          </section>

          <section
            className="content-section buy-products-section"
            id="buy-products"
            aria-label="Buy Ijinja products"
          >
            <div className="buy-products-head">
              <p className="section-kicker">Buy Products</p>
              <h2 className="section-title">Order Your Ijinja Range</h2>
              <p>
                Ready to stock up? Drinks are sold per case of {DRINK_CASE_SIZE}{' '}
                cans.
              </p>
            </div>

            <div className="buy-products-grid">
              {products.map((product) => {
                const isInStock = isProductInStock(product)
                const casePrice = getUnitPrice(product)

                return (
                  <article key={product.id} className="buy-product-card">
                    <div className={`buy-product-image ${product.coverClass}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>

                    <div className="buy-product-content">
                      <p className="product-tag">{product.tag}</p>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p className="buy-product-price">
                        {casePrice === null
                          ? 'Price on request'
                          : `${formatPrice(casePrice)} per case (Vat included)`}
                      </p>
                      <p className="buy-product-minimum">
                        {formatPrice(product.price)} per can x {DRINK_CASE_SIZE} cans
                      </p>

                      <button
                        type="button"
                        className="buy-product-button"
                        onClick={() => addToCart(product.id)}
                        disabled={!isInStock}
                      >
                        {isInStock ? 'Add Case to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            <p className="buy-products-note">
              Need wholesale, event, or stockist orders?{' '}
              <a href="#contact">Contact us directly</a> and we'll help.
            </p>
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
                {USE_WHATSAPP_CHECKOUT
                  ? 'Add items to your cart and submit your order. WhatsApp will open with your order message ready to send to our team.'
                  : 'Add items to your cart and submit your order. Our team will confirm stock, delivery, and payment with you personally.'}
              </p>
            </div>

            <div className="merch-layout">
              <div className="merch-grid">
                {merchProducts.map((product) => {
                  const merchImages = getMerchImages(product)
                  const imageCount = merchImages.length
                  const imageIndex =
                    imageCount > 0 ? (activeMerchImage[product.id] ?? 0) % imageCount : 0
                  const activeImage = merchImages[imageIndex] || product.image
                  const isInStock = isProductInStock(product)

                  const merchCardClassName = `merch-card${product.id === 'ijinja-tee' ? ' merch-card-tee' : ''}${product.id === 'ijinja-cap' ? ' merch-card-cap' : ''}`

                  return (
                  <article
                    key={product.id}
                    className={merchCardClassName}
                  >
                    <div className="merch-image-wrap">
                      <img
                        src={activeImage}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />

                      {imageCount > 1 && (
                        <div className="merch-image-controls">
                          <button
                            type="button"
                            className="merch-image-arrow"
                            onClick={() => cycleMerchImage(product.id, imageCount, 1)}
                            aria-label={`Show other side of ${product.name}`}
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="merch-details">
                      <p className="product-tag">{product.tag}</p>
                      <p
                        className={`stock-status ${
                          isInStock ? 'stock-status-in' : 'stock-status-out'
                        }`}
                      >
                        {isInStock ? 'In Stock' : 'Out of Stock'}
                      </p>
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
                          disabled={!isInStock}
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
                        disabled={!isInStock}
                      >
                        {isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </article>
                  )
                })}
              </div>

              <aside className="cart-panel" id="cart" aria-label="Shopping cart">
                <div className="cart-head">
                  <h3>Your Cart</h3>
                  <p>
                    {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
                  </p>
                </div>

                {!cartLineItems.length && (
                  <p className="cart-empty">
                    Your cart is empty. Add products or merch items to begin your order.
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
                          <strong>
                            {entry.lineTotal === null
                              ? 'Price on request'
                              : formatPrice(entry.lineTotal)}
                          </strong>
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
                    <strong>
                      {hasUnpricedItems
                        ? `${formatPrice(cartTotal)} + quoted items`
                        : formatPrice(cartTotal)}
                    </strong>
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
                      Checkout
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
          <p>
            <a href="/terms-and-conditions.html">Terms &amp; Conditions</a>
          </p>
        </footer>
      </div>
    </>
  )
}

export default App
