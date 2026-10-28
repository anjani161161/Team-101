const logoAssets = {
  full: "/brand/atmoswatch-logo-master.png",
  compact: "/brand/atmoswatch-logo-header.webp",
  symbol: "/brand/atmoswatch-mark.png",
};

const logoAlt = {
  full: "AtmosWatch global disaster emblem with the tagline A Safer Tomorrow, Together.",
  compact: "AtmosWatch, A Safer Tomorrow, Together.",
  symbol: "AtmosWatch mountain, globe, and orbital emblem.",
};

export function BrandLogo({ variant = "compact", className = "", decorative = false }) {
  const resolvedVariant = logoAssets[variant] ? variant : "compact";
  return (
    <img
      className={`brand-logo brand-logo-${resolvedVariant} ${className}`.trim()}
      src={logoAssets[resolvedVariant]}
      alt={decorative ? "" : logoAlt[resolvedVariant]}
      aria-hidden={decorative ? "true" : undefined}
      loading={resolvedVariant === "full" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
