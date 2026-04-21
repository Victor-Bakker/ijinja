import './AgeGate.css'

function AgeGate({ onVerifyAge, onUnderAge }) {
  return (
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
            onClick={onVerifyAge}
          >
            I am 18 years or older
          </button>

          <button
            type="button"
            className="age-button age-button-secondary"
            onClick={onUnderAge}
          >
            I am younger than 18
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgeGate
