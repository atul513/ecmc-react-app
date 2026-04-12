import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import SEO from '@/components/shared/SEO'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetHomeExams } from '@/services/HomeService'
import {
    TbClipboardList, TbLoader, TbAlertCircle, TbStar, TbLock,
    TbClock, TbInbox, TbMinus,
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

const ExamCard = ({ item }) => {
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
                <div className="w-full h-40 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <TbClipboardList className="text-5xl text-blue-400" />
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

            {/* Exam meta pills */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {item.total_questions} Qs
                </span>
                {item.total_marks && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {item.total_marks} marks
                    </span>
                )}
                {item.total_duration_min && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TbClock size={11} /> {item.total_duration_min} min
                    </span>
                )}
                {item.pass_percentage && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        Pass {item.pass_percentage}%
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                {item.negative_marking && (
                    <span className="text-xs text-red-500 font-medium flex items-center gap-0.5">
                        <TbMinus size={12} /> Negative marking
                    </span>
                )}
                {item.access_type === 'paid' && item.price && (
                    <span className="text-sm font-bold text-primary ml-auto">₹{item.price}</span>
                )}
            </div>
        </div>
    )
}

const PublicExams = () => {
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
        apiGetHomeExams({ limit: LIMIT })
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
        apiGetHomeExams({ limit: newLimit })
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
                title="Online Exams — MCQ Tests & Mock Exams"
                description="Take timed online exams and mock tests. Instant results, detailed reports and performance analytics on ECMC."
                canonical="/exams"
            />
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold heading-text mb-2">
                        Exams
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Timed competitive exams with negative marking, leaderboards, and detailed reports.
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
                        <p>Failed to load exams. Please try again later.</p>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <TbInbox className="text-5xl" />
                        <p>No exams available yet.</p>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {items.map((item) => (
                                <ExamCard key={item.id} item={item} />
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

export default PublicExams
