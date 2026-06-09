import { Link, useParams } from 'react-router-dom';
import { MdDateRange, MdPerson } from 'react-icons/md';
import { LuArrowLeft, LuClock3, LuUtensilsCrossed } from 'react-icons/lu';
import PageLayout from '../components/PageLayout';
import BlogCard from '../components/blog/BlogCard';
import BlogContent from '../components/blog/BlogContent';
import { BLOG_CATEGORY_COLORS } from '../constants/blog';
import { useBlogPost } from '../hooks/useBlogPost';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { formatBlogDate } from '../utils/blogContent';
import { getRelatedBlogPosts } from '../utils/blogStorage';

export default function BlogPost() {
  const { slug } = useParams();
  const { post } = useBlogPost(slug);

  useDocumentTitle(post?.title || 'Blog Article');

  if (!post) {
    return (
      <PageLayout showSearch={false}>
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-5xl mb-4">📝</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h1>
          <p className="text-gray-500 mb-6">This story may have been removed or is unavailable.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            <LuArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
        </div>
      </PageLayout>
    );
  }

  const relatedPosts = getRelatedBlogPosts(post, 3);
  const categoryClass =
    BLOG_CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <PageLayout showSearch={false}>
      <article className="bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
          <nav className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            <Link to="/blog" className="hover:text-green-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              className="hover:text-green-600 transition-colors"
            >
              {post.category}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[12rem] sm:max-w-none">
              {post.title}
            </span>
          </nav>
        </div>

        <header className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-6 sm:pt-8 pb-4">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${categoryClass}`}
          >
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MdPerson className="w-4 h-4 text-green-600" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MdDateRange className="w-4 h-4 text-green-600" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LuClock3 className="w-4 h-4 text-green-600" />
              {post.readTime}
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100">
            <img
              src={resolveMediaUrl(post.image)}
              alt={post.title}
              className="w-full h-52 sm:h-72 lg:h-[28rem] object-cover"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10 lg:py-12">
          <BlogContent content={post.content} />

          {post.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 pb-10">
          <div className="rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Hungry after reading?</h2>
              <p className="text-green-50 text-sm mt-1">Explore our menu and order your favorites.</p>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors shrink-0"
            >
              <LuUtensilsCrossed className="w-4 h-4" />
              Browse Menu
            </Link>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section className="bg-slate-50 border-t border-gray-100 py-10 sm:py-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Related articles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {relatedPosts.map((related) => (
                  <BlogCard key={related.id} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            <LuArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}
