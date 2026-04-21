import './Store.css'

function Store({
  useWhatsappCheckout,
  merchProducts,
  selectedMerchOptions,
  activeMerchImage,
  cartLineItems,
  cartItemCount,
  cartTotal,
  hasUnpricedItems,
  formatPrice,
  isProductInStock,
  getMerchImages,
  updateSelectedOption,
  cycleMerchImage,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  openCheckout,
}) {
  return (
    <section className="content-section merch-section" id="store" aria-label="Merch store">
      <div className="merch-head">
        <p className="section-kicker">Merch Store</p>
        <h2 className="section-title">Gear Up with Ijinja</h2>
        <p>
          {useWhatsappCheckout
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
              <article key={product.id} className={merchCardClassName}>
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
                <li key={`${entry.productId}-${entry.option}`} className="cart-list-item">
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
                      onClick={() => removeFromCart(entry.productId, entry.option)}
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
  )
}

export default Store
