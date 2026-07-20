export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <span
      className="verified-badge"
      title="Verified by Pancake Dig — the person or organization behind this listing has confirmed their identity"
      aria-label="Verified by Pancake Dig — the person or organization behind this listing has confirmed their identity"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <circle cx="12" cy="12" r="10" fill="#FFC42B" />
        <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#0B1620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </span>
  )
}
