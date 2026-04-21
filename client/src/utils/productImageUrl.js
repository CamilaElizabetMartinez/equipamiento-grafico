export const PLACEHOLDER_CARD_EMPTY =
  'https://via.placeholder.com/300x300/7C9692/FFFFFF?text=Sin+Imagen';

export const PLACEHOLDER_CARD_ERROR =
  'https://via.placeholder.com/300x300/7C9692/FFFFFF?text=Producto';

export const PLACEHOLDER_DETAIL =
  'https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Producto';

export function resolveProductImageUrl(url, placeholder = PLACEHOLDER_CARD_EMPTY) {
  if (url == null || typeof url !== 'string') return placeholder;
  const trimmed = url.trim();
  if (!trimmed) return placeholder;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function isVideoMultimediaUrl(url) {
  if (url == null || typeof url !== 'string') return false;
  const pathOnly = url.trim().split('?')[0];
  return /\.(mp4|webm|ogg|mov|m4v|mkv)(\?|$)/i.test(pathOnly);
}
