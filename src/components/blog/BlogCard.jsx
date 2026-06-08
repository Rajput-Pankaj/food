import { Link } from 'react-router-dom';
import { MdDateRange, MdPerson } from 'react-icons/md';
import { LuArrowRight, LuClock3 } from 'react-icons/lu';
import { BLOG_CATEGORY_COLORS } from '../../constants/blog';
import { formatBlogDate } from '../../utils/blogContent';

export default function BlogCard({ post, featured = false }) {
  const categoryClass =
    BLOG_CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700 border-gray-200';

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl">
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative p-6 sm:p-8 lg:p-10 min-h-[22rem] sm:min-h-[26rem] flex flex-col justify-end">
          <span
            className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold border ${categoryClass}`}
          >
            {post.category}
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-3xl">
            {post.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-200 line-clamp-2 max-w-2xl">
            {post.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <MdPerson className="w-4 h-4" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MdDateRange className="w-4 h-4" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LuClock3 className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="mt-6 inline-flex items-center gap-2 self-start bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Read article
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-100 transition-all overflow-hidden h-full flex flex-col">
      <Link to={`/blog/${post.slug}`} className="block relative h-44 sm:h-48 overflow-hidden bg-gray-100">
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${categoryClass}`}
          >
            {post.category}
          </span>
          <span className="text-xs text-gray-500 inline-flex items-center gap-1">
            <LuClock3 className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 inline-flex items-center gap-1 truncate">
              <MdPerson className="w-3.5 h-3.5 shrink-0" />
              {post.author}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatBlogDate(post.publishedAt)}</p>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 shrink-0"
          >
            Read
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
