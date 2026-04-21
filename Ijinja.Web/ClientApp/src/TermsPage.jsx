import './terms.css'

const TERMS_SECTIONS = [
  {
    title: 'Eligibility and Age Restriction',
    body: 'You must be 18 years or older to purchase alcohol-containing Ij!nja products. By placing an order, you confirm that the information you provide is accurate and that you are legally permitted to receive the products you order.',
  },
  {
    title: 'Orders and Acceptance',
    body: 'Placing an order does not guarantee acceptance. We may decline or cancel orders for stock, pricing, or verification reasons. If this happens after payment is received, we will contact you and arrange a refund or alternative.',
  },
  {
    title: 'Pricing and Payments',
    body: 'All prices are listed in South African Rand (ZAR) and may change without notice. Delivery or special handling fees, where applicable, are shown at checkout. Payment options are displayed before order confirmation.',
  },
  {
    title: 'Delivery and Risk',
    body: 'Delivery timelines are estimates and may vary by location and courier conditions. Risk in the goods passes to you at delivery. Someone eligible to receive the order must be available at the delivery address.',
  },
  {
    title: 'Returns and Refunds',
    body: 'If your order arrives damaged, incorrect, or incomplete, contact us as soon as possible with your order details. We will assess the issue and arrange replacement, correction, or refund where appropriate.',
  },
  {
    title: 'Liability and Product Use',
    body: 'Consume responsibly. To the fullest extent permitted by law, Ij!nja is not liable for indirect or consequential losses arising from product use, delivery delays, or temporary service interruptions.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these Terms and Conditions from time to time. Updates take effect when published on this page, and continued use of our website or services means you accept the latest version.',
  },
]

function TermsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="terms-shell">
      <header className="terms-card terms-header">
        <a className="terms-brand" href="/">
          <img
            src="/content/assets/logo-1.png"
            alt="Ijinja logo"
            className="terms-brand-logo"
            loading="eager"
            decoding="async"
          />
          <span className="terms-brand-text">Ij!nja</span>
        </a>

        <a className="terms-home-link" href="/">
          Back to Home
        </a>
      </header>

      <main className="terms-main">
        <section className="terms-card terms-hero">
          <p className="terms-kicker">Legal Page</p>
          <h1>Terms &amp; Conditions</h1>
          <p>
            Last updated on 21 April 2026. These terms govern purchases and use of
            the Ij!nja website, products, and related services.
          </p>
        </section>

        <section className="terms-card terms-content" aria-label="Terms and conditions">
          {TERMS_SECTIONS.map((section, index) => (
            <article key={section.title} className="terms-item">
              <h2>
                {index + 1}. {section.title}
              </h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        <section className="terms-card terms-contact">
          <h2>Need help with an order?</h2>
          <p>
            Contact us at <a href="mailto:admin@ijinja.co.za">admin@ijinja.co.za</a>{' '}
            or WhatsApp us at{' '}
            <a href="https://wa.me/27742643837" target="_blank" rel="noreferrer">
              +27 74 264 3837
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="terms-card terms-footer">
        <p>(c) {currentYear} Ij!nja. All Rights Reserved.</p>
        <p>
          <a href="/">Return to Homepage</a>
        </p>
      </footer>
    </div>
  )
}

export default TermsPage
