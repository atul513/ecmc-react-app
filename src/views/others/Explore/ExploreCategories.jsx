import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/ui/Input'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetExamSectionHierarchy, apiGetExamSectionTypes } from '@/services/HomeService'
import {
    TbChevronRight, TbChevronDown, TbSearch, TbSchool,
    TbX, TbFilter, TbBook, TbAtom, TbMathFunction,
    TbBuildingBank, TbCalendar, TbCategory, TbLayersSubtract,
} from 'react-icons/tb'

// ─── Colors & icons per type ─────────────────────────────────────────────────
const TYPE_CONFIG = {
    exam_group:      { color: 'bg-purple-500',  light: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300', icon: TbBuildingBank },
    exam:            { color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',       icon: TbBook },
    exam_variant:    { color: 'bg-cyan-500',    light: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300',       icon: TbLayersSubtract },
    education_board: { color: 'bg-indigo-500',  light: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300', icon: TbBuildingBank },
    state_board:     { color: 'bg-teal-500',    light: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300',       icon: TbBuildingBank },
    class:           { color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',   icon: TbSchool },
    semester:        { color: 'bg-lime-500',     light: 'bg-lime-50 text-lime-600 dark:bg-lime-900/20 dark:text-lime-300',       icon: TbCalendar },
    year:            { color: 'bg-orange-500',  light: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300', icon: TbCalendar },
    subject:         { color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300', icon: TbAtom },
    chapter:         { color: 'bg-rose-500',    light: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300',       icon: TbBook },
    topic:           { color: 'bg-pink-500',    light: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300',       icon: TbMathFunction },
    unit:            { color: 'bg-violet-500',  light: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300', icon: TbCategory },
    custom:          { color: 'bg-gray-500',    light: 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300',           icon: TbCategory },
}

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.custom

// ─── Recursive Tree Node ─────────────────────────────────────────────────────
const TreeNode = ({ node, depth = 0 }) => {
    const [open, setOpen] = useState(depth < 2) // auto-expand first 2 levels
    const children = node.children ?? []
    const hasChildren = children.length > 0
    const cfg = getTypeConfig(node.type)
    const Icon = cfg.icon

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-2.5 px-3 rounded-xl transition-all group
                    ${hasChildren ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30' : ''}
                    ${depth === 0 ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm mb-2' : ''}`}
                style={{ paddingLeft: depth === 0 ? 12 : depth * 20 + 12 }}
                onClick={() => hasChildren && setOpen((v) => !v)}
            >
                {/* Expand/collapse or bullet */}
                {hasChildren ? (
                    <span className={`w-5 h-5 flex items-center justify-center rounded transition-transform shrink-0 ${open ? 'rotate-0' : '-rotate-90'}`}>
                        <TbChevronDown size={14} className="text-gray-400" />
                    </span>
                ) : (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.color}`} />
                )}

                {/* Icon */}
                {node.icon_url ? (
                    <img src={node.icon_url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                ) : (
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${cfg.light}`}>
                        <Icon size={14} />
                    </span>
                )}

                {/* Name + type */}
                <Link
                    to={`/explore/${node.slug ?? node.id}`}
                    className="flex-1 min-w-0 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className={`font-medium leading-snug line-clamp-1 ${depth === 0 ? 'text-sm text-gray-900 dark:text-white' : 'text-sm text-gray-700 dark:text-gray-200'}`}>
                        {node.name}
                    </span>
                </Link>

                {/* Type badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 hidden sm:inline-block ${cfg.light}`}>
                    {(node.type || '').replace(/_/g, ' ')}
                </span>

                {/* Children count */}
                {hasChildren && (
                    <span className="text-[10px] text-gray-400 shrink-0">{children.length}</span>
                )}

                {/* Arrow to detail */}
                <Link
                    to={`/explore/${node.slug ?? node.id}`}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-primary hover:bg-primary/10 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                    title="View details"
                >
                    <TbChevronRight size={14} />
                </Link>
            </div>

            {/* Children */}
            {hasChildren && open && (
                <div className={`${depth === 0 ? 'ml-2 pl-3 border-l-2 border-gray-100 dark:border-gray-700' : 'ml-2 pl-2 border-l border-gray-100 dark:border-gray-700/50'}`}>
                    {children.map((child) => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Card view for root sections (alternative top-level display) ─────────────
const RootCard = ({ node }) => {
    const children = node.children ?? []
    const cfg = getTypeConfig(node.type)
    const Icon = cfg.icon

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all">
            {/* Header */}
            <Link
                to={`/explore/${node.slug ?? node.id}`}
                className="flex items-center gap-3 p-5 group"
            >
                {node.icon_url ? (
                    <img src={node.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.light}`}>
                        <Icon size={22} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {node.name}
                    </h3>
                    {node.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{node.description}</p>
                    )}
                </div>
                <TbChevronRight className="text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
            </Link>

            {/* Nested tree */}
            {children.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700/50 pt-3 max-h-80 overflow-y-auto">
                    {children.map((child) => (
                        <TreeNode key={child.id} node={child} depth={0} />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                <span className={`px-2 py-0.5 rounded-full capitalize ${cfg.light}`}>
                    {(node.type || '').replace(/_/g, ' ')}
                </span>
                {children.length > 0 && <span>{children.length} sub-sections</span>}
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────
const ExploreCategories = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [hierarchy, setHierarchy] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeType, setActiveType] = useState('')
    const [viewMode, setViewMode] = useState('card') // 'card' | 'tree'

    const searchTimer = useRef(null)

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => setDebouncedSearch(search), 350)
        return () => clearTimeout(searchTimer.current)
    }, [search])

    // Load types once
    useEffect(() => {
        apiGetExamSectionTypes()
            .then((res) => {
                const raw = res?.data ?? res
                if (Array.isArray(raw)) setTypes(raw)
                else if (raw && typeof raw === 'object') {
                    setTypes(Object.entries(raw).map(([value, label]) => ({ value, label })))
                }
            })
            .catch(() => {})
    }, [])

    // Load hierarchy on filter change
    useEffect(() => {
        setLoading(true)
        const params = {}
        if (activeType) params.type = activeType
        if (debouncedSearch) params.search = debouncedSearch

        apiGetExamSectionHierarchy(params)
            .then((res) => {
                const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
                setHierarchy(data)
            })
            .catch(() => setHierarchy([]))
            .finally(() => setLoading(false))
    }, [activeType, debouncedSearch])

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

                {/* Hero */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">
                        Explore Exams &amp; Courses
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm leading-relaxed">
                        Browse the full hierarchy — from exam groups down to individual topics. Click any node to see quizzes and practice sets.
                    </p>
                </div>

                {/* Filter bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Input
                                prefix={<TbSearch size={16} className="text-gray-400" />}
                                placeholder="Search exams, subjects, chapters..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                suffix={search ? (
                                    <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                        <TbX size={14} />
                                    </button>
                                ) : null}
                            />
                        </div>

                        {/* View toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5 shrink-0">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                            >
                                Cards
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'tree' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                            >
                                Tree
                            </button>
                        </div>

                        {(search || activeType) && (
                            <button
                                onClick={() => { setSearch(''); setActiveType('') }}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 whitespace-nowrap shrink-0"
                            >
                                <TbX size={14} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Type pills */}
                    {types.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                            <TbFilter size={14} className="text-gray-400 shrink-0" />
                            <button
                                onClick={() => setActiveType('')}
                                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                                    ${!activeType
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-primary/50'
                                    }`}
                            >
                                All types
                            </button>
                            {types.map((t) => {
                                const key = typeof t === 'string' ? t : (t.value ?? t.name ?? String(t))
                                const label = typeof t === 'object' ? (t.label ?? t.name ?? key) : key
                                const cfg = getTypeConfig(key)
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveType(activeType === key ? '' : key)}
                                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                                            ${activeType === key
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : `${cfg.light} border-transparent hover:opacity-80`
                                            }`}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="40px" /></div>
                ) : hierarchy.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <TbBook className="mx-auto text-5xl text-gray-200 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 text-lg font-medium mb-1">No sections found</p>
                        <p className="text-gray-400 text-sm mb-4">
                            {search || activeType ? 'Try adjusting your search or filters' : 'Check back later'}
                        </p>
                        {(search || activeType) && (
                            <button onClick={() => { setSearch(''); setActiveType('') }} className="text-primary hover:underline text-sm">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : viewMode === 'card' ? (
                    /* ── Card view: root sections as cards with nested tree inside ── */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {hierarchy.map((root) => (
                            <RootCard key={root.id} node={root} />
                        ))}
                    </div>
                ) : (
                    /* ── Tree view: full hierarchy as a flat expandable tree ── */
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="space-y-1">
                            {hierarchy.map((root) => (
                                <TreeNode key={root.id} node={root} depth={0} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Count */}
                {!loading && hierarchy.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-6">
                        Showing {hierarchy.length} root section{hierarchy.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default ExploreCategories
