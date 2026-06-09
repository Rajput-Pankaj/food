import { MEDIA_SEED_PREFIX } from '../constants/media';

const SEED_IMAGE_NAMES = [
  'image1.avif',
  'image2.avif',
  'image3.avif',
  'image4.avif',
  'image5.avif',
  'image6.avif',
  'image7.avif',
  'image8.avif',
  'image9.avif',
  'image10.avif',
  'image11.avif',
  'image12.avif',
  'image13.avif',
  'image14.webp',
  'image15.avif',
  'image16.avif',
  'image17.avif',
  'image18.avif',
  'image19.avif',
  'image20.avif',
  'image21.avif',
  'image22.avif',
  'image23.avif',
  'image24.avif',
  'image25.avif',
];

export const MENU_SEED_IMAGE_PATHS = SEED_IMAGE_NAMES.map((name) => `${MEDIA_SEED_PREFIX}/${name}`);

export function getMenuImage(index) {
  const safeIndex =
    ((Number(index) % SEED_IMAGE_NAMES.length) + SEED_IMAGE_NAMES.length) %
    SEED_IMAGE_NAMES.length;
  return MENU_SEED_IMAGE_PATHS[safeIndex];
}

export function getGalleryImages(imageIndex, extraOffsets = [1, 2]) {
  return extraOffsets.map((offset) => getMenuImage(imageIndex + offset));
}
