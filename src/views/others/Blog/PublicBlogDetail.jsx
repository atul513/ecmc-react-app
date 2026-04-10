import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import { apiGetPublicBlog, apiGetRelatedBlogs, apiGetBlogCommentsBySlug } from '@/services/BlogService'
import {
    TbCalendar, TbClock, TbArrowLeft, TbTag,
    TbBrandFacebook, TbBrandTwitter, TbBrandLinkedin, TbLink,
    TbMessage,
} from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const PublicBlogDetail = () => {
    const { slug } = useParams()
    const [post, setPost] = useState(null)
    const [related, setRelated] = useState([])
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true)
        setRelated([])
        setComments([])
        apiGetPublicBlog(slug)
            .then((res) => {
                setPost(res?.data || null)
                // Load related and comments in parallel after post loads
                apiGetRelatedBlogs(slug).then((r) => setRelated(r?.data || [])).catch(() => {})
                apiGetBlogCommentsBySlug(slug).then((r) => setComments(r?.data || [])).catch(() => {})
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [slug])

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="40px" />
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <h2 className="text-2xl font-bold heading-text">Article Not Found</h2>
                <p className="text-gray-400">The article you're looking for doesn't exist or has been removed.</p>
                <Link to="/blogs" className="text-primary hover:underline text-sm">Browse all articles</Link>
            </div>
        )
    }

    const body = post.body ?? post.content ?? ''
    const date = post.published_at ?? post.created_at
    const readTime = post.read_time ?? (Math.ceil(stripHtml(body).split(/\s+/).length / 200) || 1)
    const tags = post.tags ?? []
    const pageUrl = encodeURIComponent(window.location.href)
    const pageTitle = encodeURIComponent(post.title || '')

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero / Header */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-14">
                    {/* Back */}
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition mb-6"
                    >
                        <TbArrowLeft /> All Articles
                    </Link>

                    {/* Category */}
                    {(post.category?.name ?? post.category_name) && (
                        <Link
                            to={`/blogs?category=${post.category?.slug ?? post.category_id ?? ''}`}
                            className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mb-4"
                        >
                            {post.category?.name ?? post.category_name}
                        </Link>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold heading-text leading-tight mb-5">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {(post.author?.name ?? post.author_name) && (
                            <span className="flex items-center gap-1.5">
                                {post.author?.avatar_url ? (
                                    <img src={post.author.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                                        {(post.author?.name ?? post.author_name ?? '').charAt(0)}
                                    </div>
                                )}
                                {post.author?.name ?? post.author_name}
                            </span>
                        )}
                        {date && (
                            <span className="flex items-center gap-1.5">
                                <TbCalendar />
                                {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <TbClock /> {readTime} min read
                        </span>
                    </div>
                </div>
            </div>

            {/* Featured image */}
            {(post.featured_image ?? post.thumbnail_url) && (
                <div className="max-w-4xl mx-auto px-4 -mt-2 mb-8">
                    <img
                        src={post.featured_image ?? post.thumbnail_url}
                        alt={post.title}
                        className="w-full rounded-2xl shadow-lg object-cover max-h-[480px]"
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <article
                    className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:heading-text
                        prose-a:text-primary prose-img:rounded-xl
                        prose-p:leading-relaxed prose-li:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: body }}
                />

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <TbTag className="text-gray-400" />
                        {tags.map((tag) => (
                            <Link
                                key={tag.id ?? tag}
                                to={`/blogs?tag=${tag.slug ?? tag.name ?? tag}`}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition"
                            >
                                {tag.name ?? tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Share */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-400 font-medium">Share:</span>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-blue-500 hover:text-white transition-all"
                    >
                        <TbBrandFacebook size={18} />
                    </a>
                    <a
                        href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-sky-500 hover:text-white transition-all"
                    >
                        <TbBrandTwitter size={18} />
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-blue-700 hover:text-white transition-all"
                    >
                        <TbBrandLinkedin size={18} />
                    </a>
                    <button
                        onClick={copyLink}
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all"
                        title="Copy link"
                    >
                        <TbLink size={18} />
                    </button>
                </div>

                {/* Comments */}
                {comments.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold heading-text text-lg mb-5 flex items-center gap-2">
                            <TbMessage className="text-primary" /> Comments ({comments.length})
                        </h3>
                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                            {(c.user?.name ?? c.author_name ?? 'A').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold heading-text">
                                                {c.user?.name ?? c.author_name ?? 'Anonymous'}
                                            </div>
                                            {c.created_at && (
                                                <div className="text-xs text-gray-400">
                                                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {c.body ?? c.content ?? c.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Related posts */}
            {related.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 py-10 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold heading-text text-lg mb-6 text-center">Related Articles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {related.slice(0, 3).map((r) => (
                            <Link
                                key={r.id}
                                to={`/blogs/${r.slug ?? r.id}`}
                                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                            >
                                {(r.featured_image ?? r.thumbnail_url) ? (
                                    <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={r.featured_image ?? r.thumbnail_url}
                                            alt={r.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                        <span className="text-3xl font-extrabold text-primary/20">{r.title?.charAt(0) || 'B'}</span>
                                    </div>
                                )}
                                <div className="p-4">
                                    <h4 className="font-semibold text-sm heading-text line-clamp-2 group-hover:text-primary transition-colors">
                                        {r.title}
                                    </h4>
                                    {r.published_at && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(r.published_at ?? r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom navigation */}
            <div className="max-w-3xl mx-auto px-4 pb-10 text-center">
                <Link to="/blogs" className="text-primary hover:underline text-sm inline-flex items-center gap-1.5">
                    <TbArrowLeft /> Back to All Articles
                </Link>
            </div>
        </div>
    )
}

export default PublicBlogDetail
