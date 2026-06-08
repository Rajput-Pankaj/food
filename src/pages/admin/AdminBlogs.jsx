import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdOpenInNew,
  MdSearch,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import BlogPostModal from '../../components/admin/BlogPostModal';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import {
  addCustomBlogPost,
  deleteBlogPost,
  resetBlogPost,
  updateBlogPost,
} from '../../utils/blogStorage';
import { formatBlogDate } from '../../utils/blogContent';

export default function AdminBlogs() {
  const { posts, refresh, loading } = useBlogPosts({ admin: true });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalPost, setModalPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    const categories = [...new Set(posts.map((post) => post.category))].sort();
    return {
      total: posts.length,
      published: posts.filter((post) => post.available).length,
      drafts: posts.filter((post) => !post.available).length,
      custom: posts.filter((post) => post.isCustom).length,
      categoryList: categories,
    };
  }, [posts]);

  const categories = useMemo(() => ['all', ...stats.categoryList], [stats.categoryList]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && post.available) ||
        (statusFilter === 'draft' && !post.available);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setModalPost(null);
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setModalPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPost(null);
  };

  const handleSave = async (formData) => {
    if (modalPost) {
      await updateBlogPost(modalPost.id, formData);
    } else {
      await addCustomBlogPost(formData);
    }
    await refresh();
    closeModal();
  };

  const handleTogglePublish = async (post) => {
    await updateBlogPost(post.id, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      image_url: post.image,
      publishedAt: post.publishedAt,
      tagsText: (post.tags || []).join(', '),
      available: !post.available,
    });
    await refresh();
  };

  const handleDelete = async (post) => {
    const message = post.isCustom
      ? `Delete "${post.title}" permanently?`
      : `Hide "${post.title}" from the blog? You can reset built-in posts later.`;
    if (!window.confirm(message)) return;
    await deleteBlogPost(post.id, post.isCustom);
    await refresh();
  };

  const handleReset = async (post) => {
    if (!window.confirm(`Reset "${post.title}" to default content?`)) return;
    await resetBlogPost(post.id);
    await refresh();
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Blog Management</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5">
            Create, edit, and publish food stories for customers
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 shrink-0"
        >
          <MdAdd className="w-5 h-5" />
          Add Post
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Posts', value: stats.total },
          { label: 'Published', value: stats.published },
          { label: 'Drafts', value: stats.drafts },
          { label: 'Custom', value: stats.custom },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-3">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search blog posts..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Filter by category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 text-sm">
            No blog posts match your filters.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
            >
              <img
                src={post.image}
                alt=""
                className="w-full sm:w-28 h-40 sm:h-24 rounded-lg object-cover shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {post.category}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      post.available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {post.available ? 'Published' : 'Draft'}
                  </span>
                  {post.isCustom && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Custom
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {post.author} · {formatBlogDate(post.publishedAt)} · {post.readTime}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                {post.available && (
                  <Link
                    to={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-700"
                  >
                    <MdOpenInNew className="w-4 h-4" />
                    View
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(post)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-700"
                >
                  <MdEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(post)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-700"
                >
                  {post.available ? (
                    <>
                      <MdVisibilityOff className="w-4 h-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <MdVisibility className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </button>
                {!post.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleReset(post)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-amber-400 hover:text-amber-700"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"
                >
                  <MdDelete className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {isModalOpen && (
        <BlogPostModal post={modalPost} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}
