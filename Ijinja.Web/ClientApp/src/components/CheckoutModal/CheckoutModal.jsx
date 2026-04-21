import './CheckoutModal.css'

function CheckoutModal({
  isOpen,
  checkoutForm,
  paymentOptions,
  useWhatsappCheckout,
  checkoutError,
  checkoutSuccess,
  checkoutSubmitting,
  cartItemCount,
  cartTotal,
  hasUnpricedItems,
  formatPrice,
  onUpdateField,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null
  }

  return (
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
            onClick={onClose}
            aria-label="Close checkout details"
          >
            X
          </button>
        </div>

        <p className="checkout-copy">
          {useWhatsappCheckout
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

        <form className="checkout-form" onSubmit={onSubmit}>
          <label>
            <span>Full Name</span>
            <input
              type="text"
              value={checkoutForm.fullName}
              onChange={(event) => onUpdateField('fullName', event.target.value)}
              autoComplete="name"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={checkoutForm.email}
              onChange={(event) => onUpdateField('email', event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            <span>Phone</span>
            <input
              type="tel"
              value={checkoutForm.phone}
              onChange={(event) => onUpdateField('phone', event.target.value)}
              autoComplete="tel"
            />
          </label>

          <label>
            <span>Delivery Address</span>
            <textarea
              rows={3}
              value={checkoutForm.address}
              onChange={(event) => onUpdateField('address', event.target.value)}
              autoComplete="street-address"
            />
          </label>

          <label>
            <span>Payment Option</span>
            <select
              value={checkoutForm.paymentMethod}
              onChange={(event) => onUpdateField('paymentMethod', event.target.value)}
            >
              {paymentOptions.map((option) => (
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
              onChange={(event) => onUpdateField('notes', event.target.value)}
            />
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
              onClick={onClose}
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
                : useWhatsappCheckout
                  ? 'Open WhatsApp'
                  : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal
