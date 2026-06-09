import { useEffect, useState } from 'react';
import { MdClose, MdPhotoLibrary } from 'react-icons/md';
import { BLOG_CATEGORIES, BLOG_PLACEHOLDER_IMAGE } from '../../constants/blog';
import { slugify } from '../../utils/blogContent';
import MediaPicker from './MediaPicker';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'FoodExpress Team',
  category: BLOG_CATEGORIES[0],
  image: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  tagsText: '',
  available: true,
};

function postToForm(post) {
  if (!post) return emptyForm;

  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content || '',
    author: post.author || 'FoodExpress Team',
    category: post.category,
    image: post.image || '',
    publishedAt: post.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    tagsText: (post.tags || []).join(', '),
    available: post.available,
  };
}

export default function BlogPostModal({ post, onClose, onSave }) {
  const isEdit = Boolean(post);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    setForm(postToForm(post));
    setSlugTouched(Boolean(post?.slug));
    setError('');
  }, [post]);

  const handleTitleChange = (title) => {
    setForm((current) => ({
      ...current,
      title,
      slug: !slugTouched || !current.slug ? slugify(title) : current.slug,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.excerpt.trim()) {
      setError('Excerpt is required.');
      return;
    }
    if (!form.content.trim()) {
      setError('Content is required.');
      return;
    }

    onSave({
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      publishedAt: new Date(form.publishedAt).toISOString(),
    });
  };

  const coverSrc = form.image ? resolveMediaUrl(form.image) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close blog editor"
      />
      <div className="relative bg-white w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Blog Post' : 'Add Blog Post'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid sm:grid-cols-[7.5rem_1fr] gap-4 items-start">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="group relative w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 overflow-hidden bg-gray-50 transition-colors"
                aria-label={form.image ? 'Change cover image' : 'Choose cover image'}
              >
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = BLOG_PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-2">
                    <MdPhotoLibrary className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-medium text-center leading-tight">Choose image</span>
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {form.image ? 'Change' : 'Upload / pick'}
                </span>
              </button>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="w-full text-xs text-red-600 hover:text-red-700"
                >
                  Remove image
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="blog-title"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="blog-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  URL slug
                </label>
                <input
                  id="blog-slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: slugify(event.target.value) });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="blog-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="blog-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
              >
                {BLOG_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="blog-author" className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                id="blog-author"
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="blog-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="blog-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Use blank lines between paragraphs. Start lines with ## or ### for headings. Use - for
              bullet lists.
            </p>
            <textarea
              id="blog-content"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              rows={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="blog-date" className="block text-sm font-medium text-gray-700 mb-1">
                Publish date
              </label>
              <input
                id="blog-date"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="blog-tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              id="blog-tags"
              value={form.tagsText}
              onChange={(event) => setForm({ ...form, tagsText: event.target.value })}
              placeholder="recipes, healthy, tips"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => setForm({ ...form, available: event.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Published (visible on blog)
          </label>
        </form>

        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
          >
            {isEdit ? 'Save changes' : 'Publish post'}
          </button>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setForm((current) => ({ ...current, image: url }));
          setPickerOpen(false);
        }}
        title="Choose Cover Image"
      />
    </div>
  );
}
