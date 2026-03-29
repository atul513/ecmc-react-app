import { useEffect, useState } from 'react'
import {
    apiGetSuperAdminDashboard,
    apiGetSuperAdminUsers,
    apiUpdateUserRole,
} from '@/services/DashboardService'
import { useSessionUser } from '@/store/authStore'
import {
    TbLoader, TbUsers, TbClipboardCheck, TbBuilding,
    TbCreditCard, TbChartBar, TbSearch, TbEdit,
    TbAlertCircle, TbRefresh, TbX, TbTrendingUp,
    TbCurrencyRupee, TbSchool,
} from 'react-icons/tb'

const StatCard = ({ icon: Icon, label, value, sub, delta, color = 'text-primary', bg = 'bg-primary/10' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`text-xl ${color}`} />
            </div>
            {delta != null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {delta >= 0 ? '+' : ''}{delta}%
                </span>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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

// ─── Change Role Dialog ────────────────────────────────────────────────────────
const ChangeRoleDialog = ({ user, onClose, onChanged }) => {
    const [role, setRole] = useState(user.role ?? 'student')
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true); setErr('')
        try {
            await apiUpdateUserRole(user.id, { role })
            onChanged()
            onClose()
        } catch (e) {
            setErr(e?.response?.data?.message || 'Failed to update role.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Change Role</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><TbX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {err && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Changing role for <strong>{user.name ?? user.email}</strong>
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {['student', 'teacher', 'parent', 'admin', 'superadmin'].map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
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
    const [editUser, setEditUser] = useState(null)

    const loadUsers = () => {
        setUsersLoading(true)
        apiGetSuperAdminUsers({ search, role: roleFilter, page, per_page: 15 })
            .then((res) => {
                const payload = res?.data ?? res
                setUsers(payload?.data ?? payload ?? [])
                setUsersMeta(payload?.meta ?? null)
            })
            .finally(() => setUsersLoading(false))
    }

    useEffect(() => {
        apiGetSuperAdminDashboard()
            .then((res) => setData(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

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

    const stats = data ?? {}
    const mom = stats.month_over_month ?? {}
    const plans = stats.plans ?? []
    const revenue = stats.revenue ?? {}

    return (
        <div className="space-y-8">
            {editUser && (
                <ChangeRoleDialog
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onChanged={() => { setEditUser(null); loadUsers() }}
                />
            )}

            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Super Admin Dashboard ⚡
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Welcome, {user?.firstName || user?.name || 'Super Admin'}. Full system overview.
                </p>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={TbUsers} label="Total Users" value={stats.total_users} delta={mom.users} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                <StatCard icon={TbSchool} label="Schools" value={stats.total_schools} delta={mom.schools} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20" />
                <StatCard icon={TbClipboardCheck} label="Total Quizzes" value={stats.total_quizzes} delta={mom.quizzes} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                <StatCard icon={TbChartBar} label="Total Attempts" value={stats.total_attempts} delta={mom.attempts} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-900/20" />
            </div>

            {/* Revenue & Subscriptions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={TbCreditCard} label="Active Subscriptions" value={stats.active_subscriptions} delta={mom.subscriptions} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                <StatCard icon={TbCurrencyRupee} label="Total Revenue" value={revenue.total != null ? `₹${Number(revenue.total).toLocaleString()}` : '—'} delta={mom.revenue} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                <StatCard icon={TbTrendingUp} label="This Month" value={revenue.this_month != null ? `₹${Number(revenue.this_month).toLocaleString()}` : '—'} color="text-pink-600" bg="bg-pink-50 dark:bg-pink-900/20" />
                <StatCard icon={TbBuilding} label="Active Schools" value={stats.active_schools} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-900/20" />
            </div>

            {/* Plans Overview */}
            {plans.length > 0 && (
                <div>
                    <SectionTitle title="Plans Performance" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((p, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{p.name}</p>
                                <p className="text-2xl font-bold text-primary mb-0.5">{p.subscribers ?? 0}</p>
                                <p className="text-sm text-gray-500">subscribers</p>
                                {p.revenue != null && (
                                    <p className="text-sm text-gray-400 mt-1">₹{Number(p.revenue).toLocaleString()} revenue</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Users */}
            <div>
                <SectionTitle title="All Users" />
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
                            {['student', 'teacher', 'parent', 'admin', 'superadmin'].map((r) => (
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
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">
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
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => setEditUser(u)}
                                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <TbEdit size={14} /> Change Role
                                            </button>
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

export default SuperAdminDashboard
