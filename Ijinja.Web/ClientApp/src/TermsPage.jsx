import './terms.css'

const TERMS_SECTIONS = [
  {
    title: 'Merchant and Customer Support Details',
    points: [
      'This website is operated by Ij!nja in South Africa.',
      'Customer support contact: admin@ijinja.co.za and WhatsApp +27 74 264 3837.',
      'All order and payment support queries should include your order reference.',
    ],
  },
  {
    title: 'Product Information and Order Acceptance',
    points: [
      'We provide descriptions of products and related services on our website.',
      'Placing an order is an offer to purchase. Orders are accepted only after confirmation and successful payment processing where applicable.',
      'We may decline or cancel orders where products are unavailable, pricing is incorrect, or fraud/risk checks fail.',
    ],
  },
  {
    title: 'Pricing, Currency, and Charges',
    points: [
      'All transactions are processed in South African Rand (ZAR).',
      'Prices shown on the website are in ZAR and include VAT where indicated.',
      'Delivery fees or additional service charges, where applicable, are shown before order confirmation.',
      'Card issuer or bank charges outside our control may apply according to your provider terms.',
    ],
  },
  {
    title: 'Payment Methods and PayFast',
    points: [
      'Available payment methods are shown at checkout and may include PayFast and manual settlement options.',
      'For PayFast transactions, you are securely redirected to PayFast to complete payment.',
      'Payment method logos displayed at checkout indicate currently supported methods.',
      'A successful PayFast redirect does not replace back-end payment validation and order verification.',
    ],
  },
  {
    title: 'Security Policy',
    points: [
      'Payments are processed over secure encrypted connections.',
      'Card payment details are captured on PayFast-hosted payment pages and are not stored in full by Ij!nja.',
      'We maintain reasonable technical and organisational controls to protect personal information and transaction records.',
    ],
  },
  {
    title: 'Delivery Policy and Risk',
    points: [
      'Delivery mode is courier or arranged delivery depending on destination and order profile.',
      'Delivery timelines are estimates and may vary due to logistics or operational constraints.',
      'Risk in goods passes to the customer upon delivery to the provided address.',
      'A person legally permitted to receive age-restricted goods must be present at delivery where required.',
    ],
  },
  {
    title: 'Returns, Refunds, and Cancellations',
    points: [
      'Report damaged, incorrect, or incomplete orders as soon as possible after delivery.',
      'Approved refunds are processed to the original payment method where possible, subject to payment network and bank timelines.',
      'If an order is cancelled after payment authorization or settlement, any refund may be reduced by non-recoverable third-party costs where legally permitted.',
    ],
  },
  {
    title: 'Country of Domicile and Export Restriction',
    points: [
      'Country of domicile: South Africa.',
      'Orders are fulfilled for South African delivery addresses unless otherwise agreed in writing.',
      'Export restrictions may apply and international fulfillment is not guaranteed.',
    ],
  },
  {
    title: 'Acceptance of Terms and Policy Updates',
    points: [
      'By completing checkout, you confirm that you accept these Terms and Conditions, including pricing, delivery, and refund terms.',
      'You must be 18 years or older to purchase alcohol-containing products.',
      'We may update these terms from time to time. The latest version published on this page applies to new transactions.',
    ],
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
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
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
