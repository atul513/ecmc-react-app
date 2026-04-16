import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import Spinner from '@/components/ui/Spinner'
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
    TbChevronRight, TbClipboardList, TbStar, TbLock,
    TbClock, TbBook, TbArrowLeft, TbPlayerPlay,
    TbSchool, TbSearch, TbX, TbMinus,
    TbQuestionMark, TbChartBar,
} from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const TYPE_COLORS = {
    exam_group: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    exam: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    variant: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    subject: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    chapter: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    topic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-500'}`}>
        {(type || '').replace(/_/g, ' ')}
    </span>
)

// ─── Content Card — compact horizontal list style ──────────────────────────────
const ContentCard = ({ item, type }) => {
    const navigate = useNavigate()
    const isQuiz = type === 'quiz'

    return (
        <div
            onClick={() => navigate('/sign-in')}
            className="group flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3.5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
        >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isQuiz ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-violet-50 dark:bg-violet-900/20'}`}>
                {isQuiz
                    ? <TbClipboardList className="text-blue-500 text-xl" />
                    : <TbBook className="text-violet-500 text-xl" />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isQuiz ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300'}`}>
                        {isQuiz ? (item.type ?? 'Quiz') : 'Practice'}
                    </span>
                    {item.access_type === 'free' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            Free
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            <TbLock size={10} /> Paid
                        </span>
                    )}
                    {isQuiz && item.negative_marking && (
                        <span className="text-[10px] text-red-500 font-medium flex items-center gap-0.5">
                            <TbMinus size={10} /> Neg.
                        </span>
                    )}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                </h3>
                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {item.total_questions != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <TbQuestionMark size={12} /> {item.total_questions} Qs
                        </span>
                    )}
                    {item.total_marks != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <TbChartBar size={12} /> {item.total_marks} marks
                        </span>
                    )}
                    {item.total_duration_min != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <TbClock size={12} /> {item.total_duration_min} min
                        </span>
                    )}
                    {!isQuiz && item.allow_reward_points && (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                            <TbStar size={12} /> Reward pts
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
                    <TbPlayerPlay size={13} />
                    {isQuiz ? 'Start' : 'Practice'}
                </span>
            </div>
        </div>
    )
}

// ─── Sub-section card ──────────────────────────────────────────────────────────
const SubSectionCard = ({ child }) => (
    <Link
        to={`/explore/${child.slug ?? child.id}`}
        className="group flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-primary/40 hover:shadow-md transition-all"
    >
        {child.icon_url ? (
            <img src={child.icon_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        ) : (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[child.type]?.split(' ').slice(0, 2).join(' ') || 'bg-primary/10'}`}>
                <TbSchool className="text-sm" />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
                {child.name}
            </div>
            {child.type && (
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{child.type.replace(/_/g, ' ')}</div>
            )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {(child.quizzes_count ?? child.content_count) != null && (
                <span className="text-xs text-gray-400">{child.quizzes_count ?? child.content_count} items</span>
            )}
            <TbChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={16} />
        </div>
    </Link>
)

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'quiz', label: 'Quizzes & Exams' },
    { key: 'practice', label: 'Practice Sets' },
]

const PER_PAGE = 15

const ExploreCategoryDetail = () => {
    const { slug } = useParams()
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [section, setSection] = useState(null)
    const [tree, setTree] = useState([])
    const [breadcrumb, setBreadcrumb] = useState([])
    const [quizzes, setQuizzes] = useState([])
    const [practiceSets, setPracticeSets] = useState([])
    const [quizTotal, setQuizTotal] = useState(0)
    const [practiceTotal, setPracticeTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [contentLoading, setContentLoading] = useState(false)
    const [error, setError] = useState(false)

    const [activeTab, setActiveTab] = useState('all')
    const [accessFilter, setAccessFilter] = useState('')   // '' | 'free' | 'paid'
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    // Load section meta on slug change
    useEffect(() => {
        setLoading(true)
        setError(false)
        setActiveTab('all')
        setAccessFilter('')
        setSearch('')
        setPage(1)

        Promise.all([
            apiGetExamSection(slug).catch(() => null),
            apiGetExamSectionTree(slug).catch(() => null),
            apiGetExamSectionBreadcrumb(slug).catch(() => null),
        ]).then(([secRes, treeRes, bcRes]) => {
            // secRes could be { data: {...} } or the section object directly (with id field)
            const sec = secRes?.data?.id ? secRes.data : secRes?.id ? secRes : null
            if (!sec) { setError(true); return }
            setSection(sec)
            // tree: could be { data: [...] } or array directly
            const treeData = Array.isArray(treeRes?.data) ? treeRes.data : (Array.isArray(treeRes) ? treeRes : [])
            setTree(treeData)
            // breadcrumb: could be { data: [...] } or array directly
            const bcData = Array.isArray(bcRes?.data) ? bcRes.data : (Array.isArray(bcRes) ? bcRes : [])
            setBreadcrumb(bcData)
        }).finally(() => setLoading(false))
    }, [slug])

    // Load content whenever filters/page change
    const loadContent = useCallback(() => {
        if (!slug) return
        setContentLoading(true)
        const params = { page, per_page: PER_PAGE }
        if (accessFilter) params.access_type = accessFilter
        if (search.trim()) params.search = search.trim()
        apiGetExamSectionContent(slug, params)
            .then((res) => {
                // res could be { data: { quizzes, practice_sets } } or { quizzes, practice_sets } directly
                const cData = (res?.data?.quizzes || res?.data?.practice_sets) ? res.data
                    : (res?.quizzes || res?.practice_sets) ? res
                    : res?.data || {}

                const qRaw = cData.quizzes
                const pRaw = cData.practice_sets

                // Each could be paginated { data: [...], total } or a plain array
                setQuizzes(qRaw?.data || (Array.isArray(qRaw) ? qRaw : []))
                setQuizTotal(qRaw?.total ?? (qRaw?.data || (Array.isArray(qRaw) ? qRaw : [])).length)
                setPracticeSets(pRaw?.data || (Array.isArray(pRaw) ? pRaw : []))
                setPracticeTotal(pRaw?.total ?? (pRaw?.data || (Array.isArray(pRaw) ? pRaw : [])).length)
            })
            .catch(() => {})
            .finally(() => setContentLoading(false))
    }, [slug, page, accessFilter, search])

    useEffect(() => {
        if (!loading && !error) loadContent()
    }, [loading, error, loadContent])

    // Reset page when filters change
    useEffect(() => { setPage(1) }, [activeTab, accessFilter, search])

    const children = tree.length > 0 ? tree : (section?.children ?? [])

    // Filter content by active tab
    const visibleQuizzes = activeTab === 'practice' ? [] : quizzes
    const visiblePractice = activeTab === 'quiz' ? [] : practiceSets

    const totalContent = quizTotal + practiceTotal
    const visibleTotal = activeTab === 'all' ? totalContent : activeTab === 'quiz' ? quizTotal : practiceTotal
    const lastPage = Math.ceil(visibleTotal / PER_PAGE) || 1

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
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
                            <TbChevronRight size={14} />
                            <Link to="/explore" className="hover:text-primary transition-colors">Explore</Link>
                            {breadcrumb.map((bc) => (
                                <span key={bc.id} className="flex items-center gap-1.5">
                                    <TbChevronRight size={14} />
                                    {bc.id === section.id ? (
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">{bc.name}</span>
                                    ) : (
                                        <Link to={`/explore/${bc.slug ?? bc.id}`} className="hover:text-primary transition-colors">{bc.name}</Link>
                                    )}
                                </span>
                            ))}
                            {breadcrumb.length === 0 && (
                                <><TbChevronRight size={14} /><span className="text-gray-700 dark:text-gray-200 font-medium">{section.name}</span></>
                            )}
                        </div>

                        {/* Section header card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-6">
                            <div className="flex items-start gap-4">
                                {section.icon_url ? (
                                    <img src={section.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                ) : (
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[section.type]?.split(' ').slice(0, 2).join(' ') || 'bg-primary/10'}`}>
                                        <TbSchool className="text-2xl text-primary" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    {section.type && <TypeBadge type={section.type} />}
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-50 mt-2 mb-1">
                                        {section.name}
                                    </h1>
                                    {section.description && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <TbClipboardList className="text-blue-500" size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-gray-100">{quizTotal}</div>
                                        <div className="text-xs text-gray-400">Quizzes & Exams</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                        <TbBook className="text-violet-500" size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-gray-100">{practiceTotal}</div>
                                        <div className="text-xs text-gray-400">Practice Sets</div>
                                    </div>
                                </div>
                                {children.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <TbSchool className="text-emerald-500" size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-gray-100">{children.length}</div>
                                            <div className="text-xs text-gray-400">Sub-sections</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sub-sections */}
                        {children.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <TbSchool className="text-emerald-500" />
                                    Sub-sections
                                    <span className="text-sm font-normal text-gray-400">({children.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {children.map((child) => (
                                        <SubSectionCard key={child.id} child={child} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content section */}
                        {totalContent > 0 || contentLoading ? (
                            <div>
                                {/* Tabs + filters */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                                    {/* Tab row */}
                                    <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                                        {TABS.map((tab) => {
                                            const count = tab.key === 'all' ? totalContent : tab.key === 'quiz' ? quizTotal : practiceTotal
                                            return (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                                        ${activeTab === tab.key
                                                            ? 'bg-primary text-white shadow-sm'
                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {tab.label}
                                                    {count > 0 && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                        <div className="ml-auto flex items-center gap-2 shrink-0">
                                            {/* Access filter */}
                                            <div className="flex gap-1">
                                                {[['', 'All'], ['free', 'Free'], ['paid', 'Paid']].map(([val, label]) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setAccessFilter(val)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                            ${accessFilter === val
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <Input
                                            prefix={<TbSearch size={15} className="text-gray-400" />}
                                            placeholder="Search within this section…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            suffix={search ? (
                                                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                                    <TbX size={14} />
                                                </button>
                                            ) : null}
                                            size="sm"
                                        />
                                    </div>
                                </div>

                                {/* Content list */}
                                {contentLoading ? (
                                    <div className="flex justify-center py-12"><Spinner size="32px" /></div>
                                ) : visibleQuizzes.length === 0 && visiblePractice.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <TbSearch className="mx-auto text-4xl text-gray-200 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-400">No results match your filters</p>
                                        <button onClick={() => { setSearch(''); setAccessFilter('') }} className="text-primary text-sm hover:underline mt-2">
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {/* Quizzes section */}
                                        {visibleQuizzes.length > 0 && (
                                            <>
                                                {activeTab === 'all' && (
                                                    <div className="flex items-center gap-2 mt-2 mb-1">
                                                        <TbClipboardList className="text-blue-500" size={16} />
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quizzes &amp; Exams</span>
                                                        <span className="text-xs text-gray-400">({quizTotal})</span>
                                                    </div>
                                                )}
                                                {visibleQuizzes.map((q) => (
                                                    <ContentCard key={q.id} item={q} type="quiz" />
                                                ))}
                                            </>
                                        )}

                                        {/* Practice section */}
                                        {visiblePractice.length > 0 && (
                                            <>
                                                {activeTab === 'all' && (
                                                    <div className="flex items-center gap-2 mt-4 mb-1">
                                                        <TbBook className="text-violet-500" size={16} />
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Practice Sets</span>
                                                        <span className="text-xs text-gray-400">({practiceTotal})</span>
                                                    </div>
                                                )}
                                                {visiblePractice.map((p) => (
                                                    <ContentCard key={p.id} item={p} type="practice" />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {lastPage > 1 && !contentLoading && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 2)
                                            .reduce((acc, p, idx, arr) => {
                                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                                                acc.push(p)
                                                return acc
                                            }, [])
                                            .map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`e-${idx}`} className="px-1 text-gray-400 text-sm">…</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`min-w-[36px] h-9 px-3 rounded-xl text-sm font-medium transition-all
                                                            ${p === page
                                                                ? 'bg-primary text-white shadow-sm'
                                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        <button
                                            disabled={page >= lastPage}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : !contentLoading && children.length === 0 ? (
                            <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <TbClipboardList className="mx-auto text-5xl text-gray-200 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 font-medium mb-1">No content yet</p>
                                <p className="text-xs text-gray-400">Check back later or browse other sections.</p>
                            </div>
                        ) : null}

                        {/* Back */}
                        <div className="mt-10 text-center">
                            <Link to="/explore" className="text-primary hover:underline text-sm inline-flex items-center gap-1.5">
                                <TbArrowLeft size={14} /> Browse All Sections
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
