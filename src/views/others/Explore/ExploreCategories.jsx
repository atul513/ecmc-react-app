import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/ui/Input'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetExamSections, apiGetExamSectionTypes } from '@/services/HomeService'
import {
    TbChevronRight, TbBook, TbSearch, TbSchool, TbArrowRight,
    TbClipboardList, TbX, TbFilter,
} from 'react-icons/tb'

const TYPE_COLORS = {
    exam_group: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    exam: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    variant: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
    class: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    subject: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    chapter: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    topic: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
}

const TypePill = ({ type, active, onClick, count }) => {
    const colors = TYPE_COLORS[type] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all capitalize whitespace-nowrap
                ${active
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : `${colors} hover:opacity-80`
                }`}
        >
            {(type || 'All').replace(/_/g, ' ')}
            {count != null && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

const SectionCard = ({ section }) => {
    const children = section.children ?? []
    const itemCount = section.quizzes_count ?? section.content_count ?? 0

    return (
        <Link
            to={`/explore/${section.slug ?? section.id}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
        >
            <div className="p-5 flex-1">
                <div className="flex items-start gap-3">
                    {section.icon_url ? (
                        <img src={section.icon_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                    ) : (
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                            ${TYPE_COLORS[section.type]?.split(' ').slice(0, 2).join(' ') || 'bg-primary/10 text-primary'}`}>
                            <TbSchool className="text-xl" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
                                {section.name}
                            </h3>
                            <TbArrowRight className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-0.5" size={16} />
                        </div>
                        {section.type && (
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                {section.type.replace(/_/g, ' ')}
                            </span>
                        )}
                    </div>
                </div>

                {section.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-2.5 leading-relaxed">{section.description}</p>
                )}

                {children.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {children.slice(0, 4).map((child) => (
                            <span key={child.id} className="text-[11px] bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                {child.name}
                            </span>
                        ))}
                        {children.length > 4 && (
                            <span className="text-[11px] text-gray-400 px-2 py-1">+{children.length - 4} more</span>
                        )}
                    </div>
                )}
            </div>

            <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <TbClipboardList size={13} />
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                {children.length > 0 && (
                    <span className="text-xs text-gray-400">{children.length} sub-sections</span>
                )}
            </div>
        </Link>
    )
}

const PER_PAGE = 18

const ExploreCategories = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [sections, setSections] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeType, setActiveType] = useState('')
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0)

    const searchTimer = useRef(null)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
        return () => clearTimeout(searchTimer.current)
    }, [search])

    useEffect(() => { setPage(1) }, [activeType])

    const fetchSections = useCallback(() => {
        setLoading(true)
        const params = { root_only: true, per_page: PER_PAGE, page }
        if (activeType) params.type = activeType
        if (debouncedSearch) params.search = debouncedSearch
        apiGetExamSections(params)
            .then((res) => {
                const d = res?.data
                if (d && d.data && Array.isArray(d.data)) {
                    setSections(d.data)
                    setLastPage(d.last_page ?? 1)
                    setTotal(d.total ?? d.data.length)
                } else {
                    const arr = Array.isArray(d) ? d : []
                    setSections(arr)
                    setLastPage(1)
                    setTotal(arr.length)
                }
            })
            .catch(() => setSections([]))
            .finally(() => setLoading(false))
    }, [activeType, debouncedSearch, page])

    useEffect(() => {
        apiGetExamSectionTypes()
            .then((res) => {
                const t = res?.data || []
                setTypes(Array.isArray(t) ? t : Object.values(t))
            })
            .catch(() => {})
    }, [])

    useEffect(() => { fetchSections() }, [fetchSections])

    const hasFilters = !!debouncedSearch || !!activeType

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
                    <Link to="/landing" className="hover:text-primary transition-colors">Home</Link>
                    <TbChevronRight size={14} />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Explore</span>
                </div>

                {/* Hero header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">
                        Explore Exams &amp; Courses
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm leading-relaxed">
                        Browse by exam, subject, or topic. Find quizzes, mock tests, and practice sets curated for your preparation.
                    </p>
                </div>

                {/* Filter bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 flex flex-col gap-3">
                    {/* Search row */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Input
                                prefix={<TbSearch size={16} className="text-gray-400" />}
                                placeholder="Search exams, subjects, chapters…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                suffix={search ? (
                                    <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                        <TbX size={14} />
                                    </button>
                                ) : null}
                            />
                        </div>
                        {hasFilters && (
                            <button
                                onClick={() => { setSearch(''); setActiveType('') }}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap"
                            >
                                <TbX size={14} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Type filter pills */}
                    {types.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                            <TbFilter size={14} className="text-gray-400 shrink-0" />
                            <button
                                onClick={() => setActiveType('')}
                                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                                    ${!activeType
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-primary/50'
                                    }`}
                            >
                                All types
                            </button>
                            {types.map((t) => {
                                const typeName = typeof t === 'string' ? t : t.value ?? t.name ?? t
                                return (
                                    <TypePill
                                        key={typeName}
                                        type={typeName}
                                        active={activeType === typeName}
                                        onClick={() => setActiveType(activeType === typeName ? '' : typeName)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Results count */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {total === 0
                                ? 'No sections found'
                                : <><span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span> section{total !== 1 ? 's' : ''} found</>
                            }
                            {hasFilters && <span className="text-gray-400"> for your filters</span>}
                        </p>
                        {total > 0 && (
                            <span className="text-xs text-gray-400">
                                Page {page} of {lastPage}
                            </span>
                        )}
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="40px" /></div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <TbBook className="mx-auto text-5xl text-gray-200 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 text-lg font-medium mb-1">No sections found</p>
                        <p className="text-gray-400 text-sm mb-4">
                            {hasFilters ? 'Try adjusting your search or filters' : 'Check back later'}
                        </p>
                        {hasFilters && (
                            <button
                                onClick={() => { setSearch(''); setActiveType('') }}
                                className="text-primary hover:underline text-sm"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sections.map((sec) => (
                                <SectionCard key={sec.id} section={sec} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
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
                                            <span key={`e-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`min-w-[36px] h-9 px-3 rounded-xl text-sm font-medium transition-all
                                                    ${p === page
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
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
                    </>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default ExploreCategories
