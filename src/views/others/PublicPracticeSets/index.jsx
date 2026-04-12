import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import SEO from '@/components/shared/SEO'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetHomePracticeSets } from '@/services/HomeService'
import {
    TbBook, TbLoader, TbAlertCircle, TbStar, TbLock, TbInbox,
} from 'react-icons/tb'

const LIMIT = 8

const AccessBadge = ({ type }) =>
    type === 'free' ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            <TbStar size={11} /> Free
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
            <TbLock size={11} /> Paid
        </span>
    )

const PracticeSetCard = ({ item }) => {
    const navigate = useNavigate()
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col gap-3"
            onClick={() => navigate('/sign-in')}
        >
            {item.thumbnail_url ? (
                <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-xl"
                />
            ) : (
                <div className="w-full h-40 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <TbBook className="text-5xl text-violet-400" />
                </div>
            )}
            <div className="flex items-center justify-between gap-2">
                <AccessBadge type={item.access_type} />
                {item.category && (
                    <span className="text-xs text-gray-400 truncate">{item.category.name}</span>
                )}
            </div>
            <h3 className="font-bold heading-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
            </h3>
            {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                </p>
            )}
            {item.subject && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full w-fit">
                    {item.subject.name}
                </span>
            )}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{item.total_questions} questions</span>
                {item.allow_reward_points && (
                    <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                        <TbStar size={12} /> Reward pts
                    </span>
                )}
                {item.access_type === 'paid' && item.price && (
                    <span className="text-sm font-bold text-primary">₹{item.price}</span>
                )}
            </div>
        </div>
    )
}

const PublicPracticeSets = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [limit, setLimit] = useState(LIMIT)

    useEffect(() => {
        setLoading(true)
        apiGetHomePracticeSets({ limit: LIMIT })
            .then((res) => {
                const data = res?.data || []
                setItems(data)
                setHasMore(data.length === LIMIT)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const loadMore = () => {
        const newLimit = limit + LIMIT
        setLoadingMore(true)
        apiGetHomePracticeSets({ limit: newLimit })
            .then((res) => {
                const data = res?.data || []
                setItems(data)
                setLimit(newLimit)
                setHasMore(data.length === newLimit && newLimit < 20)
            })
            .catch(() => {})
            .finally(() => setLoadingMore(false))
    }

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO
                title="Practice Sets — Free & Premium Online Practice"
                description="Practise with curated question sets across subjects. Get instant feedback, earn reward points and track your progress on ECMC."
                canonical="/practice-sets"
            />
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold heading-text mb-2">
                        Practice Sets
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Self-paced practice with instant feedback, explanations, and reward points.
                    </p>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <TbLoader className="animate-spin text-4xl text-primary" />
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <TbAlertCircle className="text-5xl text-red-400" />
                        <p>Failed to load practice sets. Please try again later.</p>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <TbInbox className="text-5xl" />
                        <p>No practice sets available yet.</p>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {items.map((item) => (
                                <PracticeSetCard key={item.id} item={item} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60"
                                >
                                    {loadingMore ? (
                                        <TbLoader className="animate-spin" />
                                    ) : null}
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default PublicPracticeSets
