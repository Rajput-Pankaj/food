import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdSearch } from 'react-icons/md';
import PageLayout from '../components/PageLayout';
import BlogCard from '../components/blog/BlogCard';
import { BLOG_CATEGORIES } from '../constants/blog';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Blog() {
  useDocumentTitle('Blog');
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { posts } = useBlogPosts();

  const categories = useMemo(() => ['All', ...BLOG_CATEGORIES], []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [searchParams, categories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const [featuredPost, ...remainingPosts] = filteredPosts;

  return (
    <PageLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-2">
              FoodExpress Journal
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Stories, recipes & food wisdom
            </h1>
            <p className="mt-3 sm:mt-4 text-green-50 text-sm sm:text-base lg:text-lg leading-relaxed">
              Discover chef tips, seasonal updates, healthy eating guides, and kitchen inspiration from
              our team.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 sticky top-[var(--header-offset,0px)] z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-xs">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-8 sm:space-y-10">
          {filteredPosts.length > 0 ? (
            <>
              {featuredPost && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-3">
                    Featured
                  </p>
                  <BlogCard post={featuredPost} featured />
                </div>
              )}

              {remainingPosts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Latest articles</h2>
                    <p className="text-sm text-gray-500">
                      {filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                    {remainingPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500 text-sm sm:text-base px-4">
                Try another category or search term.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stay in the loop</h2>
          <p className="text-green-50 text-sm sm:text-base mb-6">
            Get fresh recipes, menu updates, and food stories from FoodExpress.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(event) => {
              event.preventDefault();
              alert('Thanks for subscribing! You will receive our latest food stories soon.');
              event.target.reset();
            }}
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              type="submit"
              className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}

export default Blog;
