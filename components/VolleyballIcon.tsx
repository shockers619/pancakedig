export function VolleyballIcon({ size = 28 }: { size?: number }) {
  // Modern volleyballs (e.g. Mikasa V200W-style construction) use three curved
  // panels that spiral around the ball, not a basketball's continuous ribs
  // meeting at two poles. This draws that as three identical swoosh arms,
  // each rotated 120° from the last, radiating from center toward the edge.
  //
  // Render order matters here: the navy fill goes down first, then the
  // yellow arms (which extend generously outward, past where the ring will
  // sit), and the white ring is drawn LAST, stroke-only with no fill. That
  // makes the ring paint over any yellow that reaches into its band — so
  // the yellow visually connects into the ring from underneath, but never
  // shows on top of it, regardless of exact endpoint precision.
  // Endpoint radius is tuned so the round line-cap's outer visible edge
  // stays within the ring's own outer boundary (not just past its inner
  // edge) — otherwise a sliver of yellow pokes past the ring into the
  // background on the far side, even with the ring painted on top.
  // Yellow stroke now matches the white ring's width exactly (2.2), instead
  // of being thicker than it — a thicker inner stroke than the outer ring
  // made the icon read as heavy/unbalanced.
  const arm = "M12,12 C15.99,10.01 19.31,10.67 21.04,14.92"
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--net-graphite)" />
      <g stroke="var(--volley-yellow)" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d={arm} transform="rotate(0 12 12)" />
        <path d={arm} transform="rotate(120 12 12)" />
        <path d={arm} transform="rotate(240 12 12)" />
      </g>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--chalk)" strokeWidth="2.2" />
    </svg>
  )
}
