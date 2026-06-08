import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';

export function getItemGallery(item) {
  if (!item) return [MENU_PLACEHOLDER_IMAGE];

  const primary = item.food_image || MENU_PLACEHOLDER_IMAGE;
  const extras = (item.galleryImages || []).filter(
    (url) => url && String(url) !== String(primary)
  );

  return [...new Set([primary, ...extras])];
}

export function parseGalleryText(text = '') {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
