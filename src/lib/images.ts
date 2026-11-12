export function imageVariants(src: string) {
  const base = src.replace(/\.(jpe?g|png)$/i, "");
  return {
    fallback: src,
    webp: `${base}.webp`,
    avif: `${base}.avif`,
  };
}
