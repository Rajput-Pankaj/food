import image1 from '../assets/image1.avif';
import image2 from '../assets/image2.avif';
import image3 from '../assets/image3.avif';
import image4 from '../assets/image4.avif';
import image5 from '../assets/image5.avif';
import image6 from '../assets/image6.avif';
import image7 from '../assets/image7.avif';
import image8 from '../assets/image8.avif';
import image9 from '../assets/image9.avif';
import image10 from '../assets/image10.avif';
import image11 from '../assets/image11.avif';
import image12 from '../assets/image12.avif';
import image13 from '../assets/image13.avif';
import image14 from '../assets/image14.webp';
import image15 from '../assets/image15.avif';
import image16 from '../assets/image16.avif';
import image17 from '../assets/image17.avif';
import image18 from '../assets/image18.avif';
import image19 from '../assets/image19.avif';
import image20 from '../assets/image20.avif';
import image21 from '../assets/image21.avif';
import image22 from '../assets/image22.avif';
import image23 from '../assets/image23.avif';
import image24 from '../assets/image24.avif';
import image25 from '../assets/image25.avif';

export const MENU_IMAGES = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
  image23,
  image24,
  image25,
];

export function getMenuImage(index) {
  return MENU_IMAGES[((index % MENU_IMAGES.length) + MENU_IMAGES.length) % MENU_IMAGES.length];
}

export function getGalleryImages(imageIndex, extraOffsets = [1, 2]) {
  return extraOffsets.map((offset) => getMenuImage(imageIndex + offset));
}
