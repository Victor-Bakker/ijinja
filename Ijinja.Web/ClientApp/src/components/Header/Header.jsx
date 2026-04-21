import { useEffect, useRef, useState } from 'react'
import './Header.css'

function Header({
  menuItems,
  headerCartVisible,
  headerCartExiting,
  cartItemCount,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef(null)

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

  return (
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
  )
}

export default Header
