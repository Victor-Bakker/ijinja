import { useEffect, useRef, useState } from 'react'
import './App.css'
import AgeGate from './components/AgeGate/AgeGate'
import CheckoutModal from './components/CheckoutModal/CheckoutModal'
import Header from './components/Header/Header'
import Store from './components/Store/Store'
import {
  DRINK_CASE_SIZE,
  HERO_PHOTO_SRC,
  MANUAL_ORDER_API_PATH,
  PAYMENT_OPTIONS,
  STORY_VIDEO_SRC,
  USE_WHATSAPP_CHECKOUT,
  WHATSAPP_NUMBER,
  contactDetails,
  drinkProductIds,
  initialCheckoutForm,
  menuItems,
  merchProducts,
  products,
  socialLinks,
  storeProducts,
} from './data/siteContent'

const AGE_VERIFIED_KEY = 'ijinja-age-verified'

const moneyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
})

function App() {
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

    const selectedOption =
      selectedMerchOptions[productId] || product.options?.[0] || 'Standard'

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
        <AgeGate onVerifyAge={handleVerifyAge} onUnderAge={handleUnderAge} />
      )}

      <CheckoutModal
        isOpen={checkoutOpen}
        checkoutForm={checkoutForm}
        paymentOptions={PAYMENT_OPTIONS}
        useWhatsappCheckout={USE_WHATSAPP_CHECKOUT}
        checkoutError={checkoutError}
        checkoutSuccess={checkoutSuccess}
        checkoutSubmitting={checkoutSubmitting}
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        hasUnpricedItems={hasUnpricedItems}
        formatPrice={formatPrice}
        onUpdateField={updateCheckoutField}
        onClose={closeCheckout}
        onSubmit={handleManualCheckout}
      />

      <div className={`page-shell ${!ageVerified ? 'is-locked' : ''}`}>
        <Header
          menuItems={menuItems}
          headerCartVisible={headerCartVisible}
          headerCartExiting={headerCartExiting}
          cartItemCount={cartItemCount}
        />

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

          <Store
            useWhatsappCheckout={USE_WHATSAPP_CHECKOUT}
            merchProducts={merchProducts}
            selectedMerchOptions={selectedMerchOptions}
            activeMerchImage={activeMerchImage}
            cartLineItems={cartLineItems}
            cartItemCount={cartItemCount}
            cartTotal={cartTotal}
            hasUnpricedItems={hasUnpricedItems}
            formatPrice={formatPrice}
            isProductInStock={isProductInStock}
            getMerchImages={getMerchImages}
            updateSelectedOption={updateSelectedOption}
            cycleMerchImage={cycleMerchImage}
            addToCart={addToCart}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            openCheckout={openCheckout}
          />

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
