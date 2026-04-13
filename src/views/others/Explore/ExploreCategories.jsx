import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/ui/Input'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiGetExamSections, apiGetExamSectionTypes } from '@/services/HomeService'
import {
    TbChevronRight, TbBook, TbArrowRight, TbSearch, TbSchool,
} from 'react-icons/tb'

const SectionCard = ({ section }) => {
    const children = section.children ?? []

    return (
        <Link
            to={`/explore/${section.slug ?? section.id}`}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex-1">
                <div className="flex items-start gap-3">
                    {section.icon_url ? (
                        <img src={section.icon_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                    ) : (
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <TbSchool className="text-xl text-primary" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold heading-text group-hover:text-primary transition-colors line-clamp-1">
                            {section.name}
                        </h3>
                        {section.type && (
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                {section.type}
                            </span>
                        )}
                        {section.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{section.description}</p>
                        )}
                    </div>
                    <TbArrowRight className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
            </div>

            {/* Sub-sections */}
            {children.length > 0 && (
                <div className="px-5 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                        {children.slice(0, 5).map((child) => (
                            <span
                                key={child.id}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full"
                            >
                                {child.name}
                            </span>
                        ))}
                        {children.length > 5 && (
                            <span className="text-xs text-gray-400 px-2 py-1.5">
                                +{children.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer stats */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 mt-auto">
                <span>{section.quizzes_count ?? section.content_count ?? 0} items</span>
                {children.length > 0 && <span>{children.length} sub-sections</span>}
            </div>
        </Link>
    )
}

const ExploreCategories = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [sections, setSections] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeType, setActiveType] = useState('')

    useEffect(() => {
        Promise.all([
            apiGetExamSections({ root_only: true }).catch(() => ({ data: [] })),
            apiGetExamSectionTypes().catch(() => ({ data: [] })),
        ]).then(([secRes, typesRes]) => {
            setSections(secRes?.data || [])
            const t = typesRes?.data || []
            setTypes(Array.isArray(t) ? t : Object.values(t))
        }).finally(() => setLoading(false))
    }, [])

    const filtered = sections.filter((s) => {
        const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase())
        const matchType = !activeType || s.type === activeType
        return matchSearch && matchType
    })

    return (
        <main className="w-full text-base min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
                    <Link to="/landing" className="hover:text-primary transition-colors">Home</Link>
                    <TbChevronRight />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Explore</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold heading-text mb-3">
                        Explore Exams & Courses
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                        Browse by exam, subject, or topic. Find quizzes, mock tests, and practice sets curated for your preparation.
                    </p>
                </div>

                {/* Search + type filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search exams, subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 max-w-md"
                    />
                    {types.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveType('')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    !activeType
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                All
                            </button>
                            {types.map((t) => {
                                const typeName = typeof t === 'string' ? t : t.value ?? t.name ?? t
                                return (
                                    <button
                                        key={typeName}
                                        onClick={() => setActiveType(typeName)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                                            activeType === typeName
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                        }`}
                                    >
                                        {typeName.replace(/_/g, ' ')}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="40px" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <TbBook className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-400 text-lg mb-1">No sections found</p>
                        <p className="text-gray-300 text-sm">
                            {search || activeType ? 'Try different filters' : 'Check back later'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((sec) => (
                            <SectionCard key={sec.id} section={sec} />
                        ))}
                    </div>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default ExploreCategories
