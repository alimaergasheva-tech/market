/** Фиксированный фон: mesh, сетка, мягкие орбы. Без фиолетового glow. */
export function SiteAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="tm-bg-base absolute inset-0" />
      <div className="tm-bg-mesh absolute inset-0" />
      <div className="tm-bg-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" />
      <div className="tm-orb tm-orb-a absolute -top-24 -left-16 size-[28rem] rounded-full" />
      <div className="tm-orb tm-orb-b absolute top-1/3 -right-20 size-[24rem] rounded-full" />
      <div className="tm-orb tm-orb-c absolute -bottom-32 left-1/3 size-[22rem] rounded-full" />
      <div className="tm-bg-noise absolute inset-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color-mix(in_srgb,var(--tm-surface)_88%,transparent)]" />
    </div>
  );
}
