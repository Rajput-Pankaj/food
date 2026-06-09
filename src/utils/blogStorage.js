import { blogsApi } from '../api';
import { USE_API } from '../config/api';
import { blog_posts } from '../data/blogSeed';
import { BLOG_PLACEHOLDER_IMAGE } from '../constants/blog';
import { estimateReadTime, slugify } from './blogContent';
import { getJson, setJson, storageKeys } from './storage';

function dispatchBlogUpdated() {
  window.dispatchEvent(new Event('blog-updated'));
}

function getBlogOverrides() {
  return getJson(storageKeys.BLOG_OVERRIDES_KEY, {});
}

function getCustomPosts() {
  return getJson(storageKeys.BLOG_CUSTOM_POSTS_KEY, []);
}

function saveCustomPosts(posts) {
  setJson(storageKeys.BLOG_CUSTOM_POSTS_KEY, posts);
  dispatchBlogUpdated();
}

function mergePost(basePost, override = {}) {
  const content = override.content ?? basePost.content ?? '';
  const title = override.title ?? basePost.title;
  const slug = override.slug ?? basePost.slug ?? slugify(title);

  return {
    ...basePost,
    title,
    slug,
    excerpt: override.excerpt ?? basePost.excerpt ?? '',
    content,
    author: override.author ?? basePost.author ?? 'FoodExpress Team',
    category: override.category ?? basePost.category,
    image: override.image || override.image_url || basePost.image || BLOG_PLACEHOLDER_IMAGE,
    publishedAt: override.publishedAt ?? basePost.publishedAt,
    tags: override.tags ?? basePost.tags ?? [],
    readTime: estimateReadTime(content),
    available: override.available ?? true,
    isCustom: Boolean(basePost.isCustom),
    deleted: override.deleted === true,
  };
}

function getAllBlogPostsForAdmin() {
  const overrides = getBlogOverrides();

  const basePosts = blog_posts.map((post) =>
    mergePost({ ...post, isCustom: false }, overrides[post.id] || {})
  );

  const customPosts = getCustomPosts().map((post) =>
    mergePost({ ...post, isCustom: true }, overrides[post.id] || {})
  );

  return [...basePosts, ...customPosts]
    .filter((post) => !post.deleted)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPublishedBlogPosts() {
  return getAllBlogPostsForAdmin().filter((post) => post.available);
}

export function getBlogPostBySlug(slug) {
  return getPublishedBlogPosts().find((post) => post.slug === slug) || null;
}

export function getBlogStats() {
  const posts = getAllBlogPostsForAdmin();
  const categories = [...new Set(posts.map((post) => post.category))].sort();

  return {
    total: posts.length,
    published: posts.filter((post) => post.available).length,
    drafts: posts.filter((post) => !post.available).length,
    custom: posts.filter((post) => post.isCustom).length,
    categories: categories.length,
    categoryList: categories,
  };
}

export function getRelatedBlogPosts(currentPost, limit = 3) {
  if (!currentPost) return [];

  return getPublishedBlogPosts()
    .filter(
      (post) =>
        post.slug !== currentPost.slug &&
        (post.category === currentPost.category ||
          post.tags?.some((tag) => currentPost.tags?.includes(tag)))
    )
    .slice(0, limit);
}

function buildPostPayload(formData = {}) {
  const title = formData.title?.trim() || '';
  const content = formData.content?.trim() || '';

  return {
    title,
    slug: formData.slug?.trim() || slugify(title),
    excerpt: formData.excerpt?.trim() || '',
    content,
    author: formData.author?.trim() || 'FoodExpress Team',
    category: formData.category,
    image: formData.image?.trim() || formData.image_url?.trim() || '',
    publishedAt: formData.publishedAt || new Date().toISOString(),
    tags: formData.tagsText
      ? formData.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [],
    available: formData.available !== false,
  };
}

function setBlogOverride(postId, override) {
  const overrides = getBlogOverrides();
  overrides[postId] = { ...overrides[postId], ...override };
  setJson(storageKeys.BLOG_OVERRIDES_KEY, overrides);
  dispatchBlogUpdated();
  return overrides;
}

export async function addCustomBlogPost(formData) {
  if (USE_API) {
    const payload = buildPostPayload(formData);
    const saved = await blogsApi.create({
      id: `blog-${Date.now()}`,
      ...payload,
      image: payload.image || BLOG_PLACEHOLDER_IMAGE,
      isCustom: true,
    });
    dispatchBlogUpdated();
    return saved;
  }

  const customPosts = getCustomPosts();
  const id = `blog-${crypto.randomUUID()}`;
  const payload = buildPostPayload(formData);

  const newPost = {
    id,
    ...payload,
    image: payload.image || BLOG_PLACEHOLDER_IMAGE,
    readTime: estimateReadTime(payload.content),
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  saveCustomPosts([...customPosts, newPost]);

  if (formData.available === false) {
    setBlogOverride(id, { available: false });
  }

  return newPost;
}

export async function updateBlogPost(postId, formData) {
  if (USE_API) {
    const payload = buildPostPayload(formData);
    await blogsApi.update(postId, {
      ...payload,
      image: payload.image || BLOG_PLACEHOLDER_IMAGE,
    });
    dispatchBlogUpdated();
    return;
  }

  const customPosts = getCustomPosts();
  const isCustom = customPosts.some((post) => post.id === postId);
  const payload = buildPostPayload(formData);

  if (isCustom) {
    const updated = customPosts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        ...payload,
        image: payload.image || post.image,
        readTime: estimateReadTime(payload.content),
      };
    });
    saveCustomPosts(updated);
  }

  setBlogOverride(postId, payload);
}

export async function deleteBlogPost(postId, isCustom = false) {
  if (USE_API) {
    if (isCustom) {
      await blogsApi.remove(postId);
    } else {
      await blogsApi.update(postId, { deleted: true, available: false });
    }
    dispatchBlogUpdated();
    return;
  }

  const customPosts = getCustomPosts();

  if (customPosts.some((post) => post.id === postId)) {
    saveCustomPosts(customPosts.filter((post) => post.id !== postId));
    const overrides = getBlogOverrides();
    delete overrides[postId];
    setJson(storageKeys.BLOG_OVERRIDES_KEY, overrides);
  } else {
    setBlogOverride(postId, { deleted: true });
  }

  dispatchBlogUpdated();
}

export async function resetBlogPost(postId) {
  if (USE_API) {
    const base = blog_posts.find((post) => String(post.id) === String(postId));
    if (base) {
      await blogsApi.update(postId, { ...base, available: true, deleted: false });
    } else {
      await blogsApi.remove(postId);
    }
    dispatchBlogUpdated();
    return;
  }

  const customPosts = getCustomPosts();
  if (customPosts.some((post) => post.id === postId)) {
    deleteBlogPost(postId);
    return;
  }

  const overrides = getBlogOverrides();
  delete overrides[postId];
  setJson(storageKeys.BLOG_OVERRIDES_KEY, overrides);
  dispatchBlogUpdated();
}

export function resetBlogStorage() {
  setJson(storageKeys.BLOG_OVERRIDES_KEY, {});
  setJson(storageKeys.BLOG_CUSTOM_POSTS_KEY, []);
  dispatchBlogUpdated();
}
