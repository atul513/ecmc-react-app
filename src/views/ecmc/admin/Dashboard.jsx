import { useEffect, useState } from 'react'
import { apiGetAdminDashboard, apiGetAdminUsers, apiCreateAdminUser } from '@/services/DashboardService'
import { useSessionUser } from '@/store/authStore'
import {
    TbLoader, TbUsers, TbClipboardCheck, TbPencil,
    TbCreditCard, TbChartBar, TbSearch, TbPlus,
    TbAlertCircle, TbRefresh, TbX,
} from 'react-icons/tb'

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`text-2xl ${color}`} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
)

const SectionTitle = ({ title }) => (
    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</h2>
)

const RoleBadge = ({ role }) => {
    const map = {
        admin:      'bg-indigo-100 text-indigo-700',
        superadmin: 'bg-purple-100 text-purple-700',
        teacher:    'bg-blue-100 text-blue-700',
        student:    'bg-emerald-100 text-emerald-700',
        parent:     'bg-orange-100 text-orange-700',
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[role] ?? 'bg-gray-100 text-gray-500'}`}>
            {role}
        </span>
    )
}

// ─── Create User Dialog ────────────────────────────────────────────────────────
const CreateUserDialog = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState('')
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) { setErr('All fields required.'); return }
        setSaving(true); setErr('')
        try {
            await apiCreateAdminUser(form)
            onCreated()
            onClose()
        } catch (e) {
            setErr(e?.response?.data?.message || 'Failed to create user.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Create User</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><TbX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {err && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</p>}
                    {[
                        { key: 'name', label: 'Full Name', type: 'text' },
                        { key: 'email', label: 'Email', type: 'email' },
                        { key: 'password', label: 'Password', type: 'password' },
                    ].map(({ key, label, type }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                            <input
                                type={type}
                                value={form[key]}
                                onChange={(e) => set(key, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => set('role', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {['student', 'teacher', 'parent', 'admin'].map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
                            {saving ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const user = useSessionUser((s) => s.user)

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const [users, setUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [usersMeta, setUsersMeta] = useState(null)
    const [showCreate, setShowCreate] = useState(false)

    const loadDashboard = () => {
        setLoading(true)
        apiGetAdminDashboard()
            .then((res) => setData(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    const loadUsers = () => {
        setUsersLoading(true)
        apiGetAdminUsers({ search, role: roleFilter, page, per_page: 10 })
            .then((res) => {
                const payload = res?.data ?? res
                setUsers(payload?.data ?? payload ?? [])
                setUsersMeta(payload?.meta ?? null)
            })
            .finally(() => setUsersLoading(false))
    }

    useEffect(() => { loadDashboard() }, [])
    useEffect(() => { loadUsers() }, [search, roleFilter, page])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
                <TbLoader className="text-3xl animate-spin" />
                <span>Loading dashboard…</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                <TbAlertCircle className="text-4xl text-red-400" />
                <span>Failed to load dashboard. Please refresh.</span>
            </div>
        )
    }

    const d = data ?? {}
    const userStats    = d.user_stats       ?? {}
    const contentStats = d.content_stats    ?? {}
    const attemptStats = d.attempt_stats    ?? {}
    const subStats     = d.subscription_stats ?? {}
    const recentUsers  = d.recent_users     ?? []
    const recentImports = d.recent_imports  ?? []

    return (
        <div className="space-y-8">
            {showCreate && (
                <CreateUserDialog
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { loadUsers(); loadDashboard() }}
                />
            )}

            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Welcome, {user?.userName || user?.name || 'Admin'}. Here's your platform overview.
                </p>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={TbUsers} label="Total Users" color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20"
                    value={userStats.total}
                    sub={`${userStats.students ?? 0} students · ${userStats.teachers ?? 0} teachers`}
                />
                <StatCard
                    icon={TbClipboardCheck} label="Total Quizzes" color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20"
                    value={contentStats.quizzes}
                    sub={`${contentStats.published ?? 0} published`}
                />
                <StatCard
                    icon={TbChartBar} label="Total Attempts" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20"
                    value={attemptStats.total}
                    sub={`${attemptStats.this_month ?? 0} this month`}
                />
                <StatCard
                    icon={TbCreditCard} label="Active Subscriptions" color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20"
                    value={subStats.active}
                    sub={`₹${(subStats.revenue_this_month ?? 0).toLocaleString()} this month`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Content overview */}
                <div>
                    <SectionTitle title="Content Overview" />
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard icon={TbPencil} label="Questions" value={contentStats.questions} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-900/20" />
                        <StatCard icon={TbChartBar} label="Practice Sets" value={contentStats.practice_sets} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
                        <StatCard icon={TbUsers} label="New Users (Month)" value={userStats.new_this_month} color="text-pink-600" bg="bg-pink-50 dark:bg-pink-900/20" />
                        <StatCard icon={TbClipboardCheck} label="Draft Quizzes" value={contentStats.draft} color="text-gray-500" bg="bg-gray-100 dark:bg-gray-700" />
                    </div>
                </div>

                {/* Recent imports */}
                {recentImports.length > 0 && (
                    <div>
                        <SectionTitle title="Recent Imports" />
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                            {recentImports.slice(0, 5).map((imp) => (
                                <div key={imp.id} className="px-5 py-3 flex items-center justify-between text-sm gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-700 dark:text-gray-300 truncate">{imp.file_name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{imp.importer?.name} · {imp.created_at ? new Date(imp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-gray-500">{imp.success_count}/{imp.total_rows}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${imp.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                            {imp.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent users strip */}
            {recentUsers.length > 0 && (
                <div>
                    <SectionTitle title="Recent Registrations" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                        {recentUsers.map((u) => (
                            <div key={u.id} className="px-5 py-3 flex items-center justify-between text-sm">
                                <div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                                    <span className="text-gray-400 ml-2">{u.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RoleBadge role={u.role} />
                                    <span className="text-xs text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Users Table */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionTitle title="Users" />
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
                    >
                        <TbPlus size={16} /> Add User
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Search users…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="">All Roles</option>
                            {['student', 'teacher', 'parent', 'admin'].map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        {usersLoading && <TbRefresh className="text-gray-400 animate-spin" />}
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        {usersLoading ? 'Loading…' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : (
                                users.map((u, i) => (
                                    <tr key={u.id ?? i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                                            {u.name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {usersMeta && usersMeta.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
                            <span>Page {usersMeta.current_page} of {usersMeta.last_page} ({usersMeta.total} total)</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                                <button className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40" disabled={page >= usersMeta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
