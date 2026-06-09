import { mediaApi } from '../api';
import { USE_API } from '../config/api';
import { MEDIA_BLOG_PREFIX } from '../constants/media';
import { MENU_SEED_IMAGE_PATHS } from '../data/menuImages';
import { getJson, setJson, storageKeys } from './storage';

const BLOG_SEED_IMAGE_PATHS = [
  `${MEDIA_BLOG_PREFIX}/image1.avif`,
  `${MEDIA_BLOG_PREFIX}/image6.avif`,
  `${MEDIA_BLOG_PREFIX}/image10.avif`,
  `${MEDIA_BLOG_PREFIX}/image15.avif`,
  `${MEDIA_BLOG_PREFIX}/image20.avif`,
  `${MEDIA_BLOG_PREFIX}/image22.avif`,
  `${MEDIA_BLOG_PREFIX}/image8.avif`,
  `${MEDIA_BLOG_PREFIX}/image12.avif`,
];

const LOCAL_MEDIA_KEY = storageKeys.MEDIA_LIBRARY_KEY;
const MAX_LOCAL_UPLOADS = 30;
const MAX_LOCAL_BYTES = 500 * 1024;

function seedLibraryItems() {
  const menuSeeds = MENU_SEED_IMAGE_PATHS.map((url, index) => ({
    id: `seed-menu-${index}`,
    url,
    originalName: url.split('/').pop(),
    folder: 'seed',
    protected: true,
    createdAt: new Date(0).toISOString(),
  }));

  const blogSeeds = BLOG_SEED_IMAGE_PATHS.map((url, index) => ({
    id: `seed-blog-${index}`,
    url,
    originalName: `blog-${url.split('/').pop()}`,
    folder: 'blog',
    protected: true,
    createdAt: new Date(0).toISOString(),
  }));

  return [...menuSeeds, ...blogSeeds];
}

function readLocalLibrary() {
  const uploads = getJson(LOCAL_MEDIA_KEY, []);
  return [...seedLibraryItems(), ...uploads];
}

function writeLocalUploads(uploads) {
  setJson(LOCAL_MEDIA_KEY, uploads);
}

function mergeSeedItems(items) {
  const urls = new Set(items.map((item) => item.url));
  const merged = [...items];
  for (const seed of seedLibraryItems()) {
    if (!urls.has(seed.url)) merged.push(seed);
  }
  return merged;
}

export async function listMedia(options = {}) {
  if (USE_API) {
    const uploaded = await mediaApi.list(options);
    if (options.folder === 'uploads') return uploaded;
    return mergeSeedItems(uploaded);
  }

  const items = readLocalLibrary();
  if (options.folder) {
    return items.filter((item) => item.folder === options.folder);
  }
  return items;
}

export async function uploadMedia(file, meta = {}) {
  if (USE_API) {
    return mediaApi.upload(file, meta);
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }
  if (file.size > MAX_LOCAL_BYTES) {
    throw new Error('Image must be under 500KB in demo mode.');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

  const uploads = getJson(LOCAL_MEDIA_KEY, []);
  const item = {
    id: `local-${crypto.randomUUID()}`,
    url: dataUrl,
    originalName: file.name,
    folder: meta.folder || 'uploads',
    protected: false,
    createdAt: new Date().toISOString(),
  };

  writeLocalUploads([item, ...uploads].slice(0, MAX_LOCAL_UPLOADS));
  return item;
}

export async function deleteMedia(id) {
  if (USE_API) {
    return mediaApi.remove(id);
  }

  if (String(id).startsWith('seed-')) {
    throw new Error('Seed images cannot be deleted.');
  }

  const uploads = getJson(LOCAL_MEDIA_KEY, []).filter((item) => item.id !== id);
  writeLocalUploads(uploads);
  return { ok: true };
}
