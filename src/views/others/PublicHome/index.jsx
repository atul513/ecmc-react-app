import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import SEO from '@/components/shared/SEO'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetHome } from '@/services/HomeService'
import {
    TbBook, TbClipboardList, TbClock, TbLoader, TbAlertCircle,
    TbLock, TbStar, TbChevronRight,
} from 'react-icons/tb'

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
                    className="w-full h-36 object-cover rounded-xl"
                />
            ) : (
                <div className="w-full h-36 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
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
            {item.subject && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.subject.name}</p>
            )}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{item.total_questions} questions</span>
                {item.access_type === 'paid' && item.price && (
                    <span className="text-sm font-bold text-primary">₹{item.price}</span>
                )}
            </div>
        </div>
    )
}

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
                    className="w-full h-36 object-cover rounded-xl"
                />
            ) : (
                <div className="w-full h-36 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
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
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{item.total_questions} questions</span>
                {item.total_marks && <span>{item.total_marks} marks</span>}
                {item.total_duration_min && (
                    <span className="flex items-center gap-1">
                        <TbClock size={12} /> {item.total_duration_min} min
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                {item.negative_marking && (
                    <span className="text-xs text-red-500 font-medium">Negative marking</span>
                )}
                {item.access_type === 'paid' && item.price && (
                    <span className="text-sm font-bold text-primary ml-auto">₹{item.price}</span>
                )}
            </div>
        </div>
    )
}

const SectionHeader = ({ title, subtitle, linkTo, linkLabel }) => {
    const navigate = useNavigate()
    return (
        <div className="flex items-end justify-between mb-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold heading-text mb-1">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            {linkTo && (
                <button
                    onClick={() => navigate(linkTo)}
                    className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0"
                >
                    {linkLabel} <TbChevronRight />
                </button>
            )}
        </div>
    )
}

const PublicHome = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [practiceSets, setPracticeSets] = useState([])
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        apiGetHome({ limit: 6 })
            .then((res) => {
                setPracticeSets(res?.data?.practice_sets || [])
                setExams(res?.data?.exams || [])
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <SEO
                title="Explore Exams & Practice Sets"
                description="Browse free and premium online exams, quizzes and practice sets. Start practising today on ECMC."
                canonical="/home"
            />
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold heading-text mb-4">
                        Explore <span className="text-primary">Exams</span> &{' '}
                        <span className="text-primary">Practice Sets</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        Browse our curated collection of practice sets and exams. Sign in to start attempting.
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
                        <p>Failed to load content. Please try again later.</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Practice Sets */}
                        <section className="mb-16">
                            <SectionHeader
                                title="Practice Sets"
                                subtitle="Self-paced practice with instant feedback and explanations"
                                linkTo="/practice-sets"
                                linkLabel="View all"
                            />
                            {practiceSets.length === 0 ? (
                                <p className="text-gray-400 text-sm">No practice sets available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                                    {practiceSets.map((item) => (
                                        <PracticeSetCard key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Exams */}
                        <section>
                            <SectionHeader
                                title="Exams"
                                subtitle="Timed competitive exams with negative marking and detailed reports"
                                linkTo="/exams"
                                linkLabel="View all"
                            />
                            {exams.length === 0 ? (
                                <p className="text-gray-400 text-sm">No exams available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                                    {exams.map((item) => (
                                        <ExamCard key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default PublicHome
