import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import { apiGetPublicBlogs, apiGetPublicBlogCategories } from '@/services/BlogService'
import { TbSearch, TbCalendar, TbUser, TbArrowRight, TbClock } from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const BlogCard = ({ post }) => {
    const excerpt = stripHtml(post.body ?? post.content ?? post.excerpt ?? '').substring(0, 150)
    const date = post.published_at ?? post.created_at
    const readTime = post.read_time ?? (Math.ceil(stripHtml(post.body ?? post.content ?? '').split(/\s+/).length / 200) || 1)

    return (
        <Link
            to={`/blogs/${post.slug ?? post.id}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            {/* Thumbnail */}
            {post.featured_image ?? post.thumbnail_url ? (
                <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={post.featured_image ?? post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-primary/20">
                        {post.title?.charAt(0) || 'B'}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {/* Category badge */}
                {(post.category?.name ?? post.category_name) && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {post.category?.name ?? post.category_name}
                    </span>
                )}

                <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                </h3>

                {excerpt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                        {excerpt}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        {(post.author?.name ?? post.author_name) && (
                            <span className="flex items-center gap-1">
                                <TbUser className="text-sm" />
                                {post.author?.name ?? post.author_name}
                            </span>
                        )}
                        {date && (
                            <span className="flex items-center gap-1">
                                <TbCalendar className="text-sm" />
                                {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <span className="flex items-center gap-1">
                        <TbClock className="text-sm" /> {readTime} min read
                    </span>
                </div>
            </div>
        </Link>
    )
}

const PublicBlogList = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const page = Number(searchParams.get('page')) || 1
    const search = searchParams.get('search') || ''
    const categorySlug = searchParams.get('category') || ''
    const perPage = 12

    useEffect(() => {
        apiGetPublicBlogCategories().then((res) => setCategories(res?.data || [])).catch(() => {})
    }, [])

    useEffect(() => {
        setLoading(true)
        const params = { page, per_page: perPage, status: 'published' }
        if (search) params.search = search
        if (categorySlug) params.category = categorySlug
        apiGetPublicBlogs(params)
            .then((res) => {
                setPosts(res?.data?.data || res?.data || [])
                setTotal(res?.data?.total || res?.meta?.total || res?.pagination?.total || 0)
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false))
    }, [page, search, categorySlug])

    const setParam = (key, val) => {
        const next = new URLSearchParams(searchParams)
        if (val) next.set(key, val)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        setSearchParams(next)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold heading-text mb-3">Blog</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
                        Tips, tutorials, exam strategies, and educational insights to help you succeed.
                    </p>

                    {/* Search */}
                    <div className="max-w-md mx-auto">
                        <Input
                            prefix={<TbSearch />}
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setParam('search', e.target.value)}
                            size="lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Category tabs */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setParam('category', '')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                !categorySlug
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setParam('category', cat.slug ?? cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    categorySlug === (cat.slug ?? String(cat.id))
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="40px" /></div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-2">No articles found</p>
                        <p className="text-gray-300 text-sm">Try a different search or category</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>

                        {total > perPage && (
                            <div className="flex justify-center mt-10">
                                <Pagination
                                    total={total}
                                    pageSize={perPage}
                                    currentPage={page}
                                    onChange={(p) => setParam('page', p > 1 ? String(p) : '')}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer back link */}
            <div className="text-center py-8">
                <Link to="/landing" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    <TbArrowRight className="rotate-180" /> Back to Home
                </Link>
            </div>
        </div>
    )
}

export default PublicBlogList
