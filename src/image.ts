const fallbackSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" role="img" aria-label="스포츠 모임 이미지">
    <rect width="800" height="480" fill="#fce7f3"/>
    <path d="M0 350 190 165l130 125 135-165 345 225v130H0Z" fill="#f9a8d4"/>
    <path d="m250 480 160-205 105 115 80-90 205 180H250Z" fill="#be185d" opacity=".9"/>
    <text x="400" y="110" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="700" fill="#831843">SPORTS MATE</text>
  </svg>`;

export const FALLBACK_IMAGE_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;

export const handleImageError = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement;
  if (image.dataset.fallbackApplied) return;

  image.dataset.fallbackApplied = "true";
  image.src = FALLBACK_IMAGE_URL;
};
