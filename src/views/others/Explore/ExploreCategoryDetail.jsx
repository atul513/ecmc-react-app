import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Pagination from '@/components/ui/Pagination'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import {
    apiGetExamSection,
    apiGetExamSectionTree,
    apiGetExamSectionContent,
    apiGetExamSectionBreadcrumb,
} from '@/services/HomeService'
import {
    TbChevronRight, TbClipboardList, TbStar, TbLock, TbClock,
    TbBook, TbMinus, TbArrowLeft, TbPlayerPlay, TbSchool,
} from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const AccessBadge = ({ type }) =>
    type === 'free' ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            <TbStar size={10} /> Free
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
            <TbLock size={10} /> Paid
        </span>
    )

const QuizCard = ({ item }) => {
    const navigate = useNavigate()
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col gap-3"
            onClick={() => navigate('/sign-in')}
        >
            {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-36 object-cover rounded-xl" />
            ) : (
                <div className="w-full h-36 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <TbClipboardList className="text-4xl text-blue-400" />
                </div>
            )}
            <div className="flex items-center justify-between gap-2">
                <AccessBadge type={item.access_type} />
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {item.type ?? 'quiz'}
                </span>
            </div>
            <h3 className="font-bold heading-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
            </h3>
            {item.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{stripHtml(item.description)}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
                {item.total_questions != null && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {item.total_questions} Qs
                    </span>
                )}
                {item.total_marks != null && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {item.total_marks} marks
                    </span>
                )}
                {item.total_duration_min != null && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TbClock size={11} /> {item.total_duration_min} min
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                {item.negative_marking ? (
                    <span className="text-xs text-red-500 font-medium flex items-center gap-0.5">
                        <TbMinus size={12} /> Neg. marking
                    </span>
                ) : <span />}
                <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
                    <TbPlayerPlay size={12} /> Start
                </span>
            </div>
        </div>
    )
}

const PracticeCard = ({ item }) => {
    const navigate = useNavigate()
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col gap-3"
            onClick={() => navigate('/sign-in')}
        >
            <div className="w-full h-36 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <TbBook className="text-4xl text-violet-400" />
            </div>
            <div className="flex items-center justify-between gap-2">
                <AccessBadge type={item.access_type} />
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-600">Practice</span>
            </div>
            <h3 className="font-bold heading-text text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
            </h3>
            {item.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{stripHtml(item.description)}</p>
            )}
            {item.subject?.name && (
                <span className="text-xs text-gray-400">{item.subject.name}</span>
            )}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                {item.allow_reward_points ? (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                        <TbStar size={12} /> Reward Points
                    </span>
                ) : <span />}
                <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
                    <TbPlayerPlay size={12} /> Practice
                </span>
            </div>
        </div>
    )
}

const ExploreCategoryDetail = () => {
    const { slug } = useParams()
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [section, setSection] = useState(null)
    const [tree, setTree] = useState([])
    const [breadcrumb, setBreadcrumb] = useState([])
    const [content, setContent] = useState({ quizzes: [], practice_sets: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [contentPage, setContentPage] = useState(1)
    const [contentTotal, setContentTotal] = useState(0)
    const perPage = 12

    useEffect(() => {
        setLoading(true)
        setTree([])
        setBreadcrumb([])
        setContent({ quizzes: [], practice_sets: [] })
        setContentPage(1)

        Promise.all([
            apiGetExamSection(slug).catch(() => null),
            apiGetExamSectionTree(slug).catch(() => ({ data: [] })),
            apiGetExamSectionBreadcrumb(slug).catch(() => ({ data: [] })),
            apiGetExamSectionContent(slug, { page: 1, per_page: perPage }).catch(() => ({ data: {} })),
        ]).then(([secRes, treeRes, bcRes, contentRes]) => {
            if (!secRes?.data) { setError(true); return }
            setSection(secRes.data)
            setTree(treeRes?.data || [])
            setBreadcrumb(bcRes?.data || [])
            const cData = contentRes?.data || {}
            setContent({
                quizzes: cData.quizzes?.data || cData.quizzes || [],
                practice_sets: cData.practice_sets?.data || cData.practice_sets || [],
            })
            setContentTotal(
                (cData.quizzes?.total || cData.quizzes?.length || 0) +
                (cData.practice_sets?.total || cData.practice_sets?.length || 0)
            )
        }).finally(() => setLoading(false))
    }, [slug])

    const loadContentPage = (page) => {
        setContentPage(page)
        apiGetExamSectionContent(slug, { page, per_page: perPage })
            .then((res) => {
                const cData = res?.data || {}
                setContent({
                    quizzes: cData.quizzes?.data || cData.quizzes || [],
                    practice_sets: cData.practice_sets?.data || cData.practice_sets || [],
                })
            })
            .catch(() => {})
    }

    const children = tree.length > 0 ? tree : (section?.children ?? [])

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="40px" /></div>
                ) : error || !section ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-3">Section not found</p>
                        <Link to="/explore" className="text-primary hover:underline text-sm">Browse all sections</Link>
                    </div>
                ) : (
                    <>
                        {/* Breadcrumb */}
                        <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400 mb-6">
                            <Link to="/landing" className="hover:text-primary transition-colors">Home</Link>
                            <TbChevronRight />
                            <Link to="/explore" className="hover:text-primary transition-colors">Explore</Link>
                            {breadcrumb.map((bc) => (
                                <span key={bc.id} className="flex items-center gap-1.5">
                                    <TbChevronRight />
                                    {bc.id === section.id ? (
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">{bc.name}</span>
                                    ) : (
                                        <Link to={`/explore/${bc.slug ?? bc.id}`} className="hover:text-primary transition-colors">
                                            {bc.name}
                                        </Link>
                                    )}
                                </span>
                            ))}
                            {breadcrumb.length === 0 && (
                                <>
                                    <TbChevronRight />
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">{section.name}</span>
                                </>
                            )}
                        </div>

                        {/* Header */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-8">
                            <div className="flex items-start gap-4">
                                {section.icon_url ? (
                                    <img src={section.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <TbSchool className="text-2xl text-primary" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {section.type && (
                                            <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                                                {section.type}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold heading-text mb-2">
                                        {section.name}
                                    </h1>
                                    {section.description && (
                                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm leading-relaxed">
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <TbClipboardList className="text-blue-500" />
                                    <span>{content.quizzes.length} Quizzes/Exams</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <TbBook className="text-violet-500" />
                                    <span>{content.practice_sets.length} Practice Sets</span>
                                </div>
                                {children.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <TbSchool className="text-emerald-500" />
                                        <span>{children.length} Sub-sections</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sub-sections */}
                        {children.length > 0 && (
                            <div className="mb-10">
                                <h2 className="font-bold heading-text text-lg mb-4">Sub-sections</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {children.map((child) => (
                                        <Link
                                            key={child.id}
                                            to={`/explore/${child.slug ?? child.id}`}
                                            className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-primary hover:shadow-md transition-all group"
                                        >
                                            {child.icon_url ? (
                                                <img src={child.icon_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <TbSchool className="text-primary text-sm" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold heading-text group-hover:text-primary transition-colors truncate">
                                                    {child.name}
                                                </div>
                                                {child.type && (
                                                    <div className="text-[10px] text-gray-400 uppercase">{child.type}</div>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 shrink-0">
                                                {child.quizzes_count ?? child.content_count ?? ''}
                                            </div>
                                            <TbChevronRight className="text-gray-300 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quizzes / Exams */}
                        {content.quizzes.length > 0 && (
                            <div className="mb-10">
                                <h2 className="font-bold heading-text text-lg mb-4 flex items-center gap-2">
                                    <TbClipboardList className="text-blue-500" />
                                    Quizzes & Exams
                                    <span className="text-sm font-normal text-gray-400">({content.quizzes.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {content.quizzes.map((q) => (
                                        <QuizCard key={q.id} item={q} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Practice Sets */}
                        {content.practice_sets.length > 0 && (
                            <div className="mb-10">
                                <h2 className="font-bold heading-text text-lg mb-4 flex items-center gap-2">
                                    <TbBook className="text-violet-500" />
                                    Practice Sets
                                    <span className="text-sm font-normal text-gray-400">({content.practice_sets.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {content.practice_sets.map((p) => (
                                        <PracticeCard key={p.id} item={p} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {contentTotal > perPage && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={contentTotal}
                                    pageSize={perPage}
                                    currentPage={contentPage}
                                    onChange={loadContentPage}
                                />
                            </div>
                        )}

                        {/* Empty state */}
                        {content.quizzes.length === 0 && content.practice_sets.length === 0 && children.length === 0 && (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <TbClipboardList className="mx-auto text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-400 mb-1">No content in this section yet.</p>
                                <p className="text-xs text-gray-300">Check back later or browse other sections.</p>
                            </div>
                        )}

                        {/* Back */}
                        <div className="mt-10 text-center">
                            <Link to="/explore" className="text-primary hover:underline text-sm inline-flex items-center gap-1.5">
                                <TbArrowLeft /> Browse All Sections
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default ExploreCategoryDetail
