import { useState, useEffect, useRef } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { useAuth } from '@/auth'
import ApiService from '@/services/ApiService'
import {
    PiUserDuotone, PiLockDuotone, PiFloppyDiskDuotone,
    PiChartBarDuotone, PiCheckCircleDuotone, PiXCircleDuotone,
    PiBookOpenDuotone, PiStudentDuotone, PiChalkboardTeacherDuotone,
    PiUsersThreeDuotone, PiShieldCheckDuotone, PiClockCountdownDuotone,
    PiCameraDuotone, PiTrashDuotone,
} from 'react-icons/pi'
import { TbCalendarOff } from 'react-icons/tb'

// ─── Stat tile ────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, icon: Icon, color = 'text-primary', sub }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex items-start gap-3">
        {Icon && (
            <div className={`text-2xl mt-0.5 ${color}`}>
                <Icon />
            </div>
        )}
        <div>
            <div className="text-2xl font-bold heading-text">{value ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    </div>
)

// ─── Role-specific stats ──────────────────────────────────────────────────────
const StudentStats = ({ stats, subscription }) => {
    const q = stats?.quiz || {}
    const p = stats?.practice || {}
    const recent = stats?.recent_attempts || []

    return (
        <div className="flex flex-col gap-5">
            {/* Subscription */}
            {subscription && (
                <AdaptiveCard>
                    <div className="flex items-center gap-2 mb-4">
                        <PiShieldCheckDuotone className="text-xl text-emerald-500" />
                        <h5 className="font-semibold">Subscription</h5>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                            {subscription.plan_name}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <TbCalendarOff size={14} />
                            Expires {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {subscription.days_remaining != null && (
                            <span className="text-sm text-amber-600 font-medium">
                                {subscription.days_remaining} days left
                            </span>
                        )}
                    </div>
                </AdaptiveCard>
            )}

            {/* Quiz stats */}
            <AdaptiveCard>
                <div className="flex items-center gap-2 mb-4">
                    <PiChartBarDuotone className="text-xl text-primary" />
                    <h5 className="font-semibold">Exam Performance</h5>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatTile label="Total Attempts" value={q.total_attempts} icon={PiChartBarDuotone} />
                    <StatTile label="Passed" value={q.passed} icon={PiCheckCircleDuotone} color="text-emerald-500" />
                    <StatTile label="Failed" value={q.failed} icon={PiXCircleDuotone} color="text-red-500" />
                    <StatTile label="Avg Score" value={q.avg_score != null ? `${q.avg_score}%` : null} icon={PiChartBarDuotone} color="text-amber-500" />
                    <StatTile label="Best Score" value={q.best_score != null ? `${q.best_score}%` : null} icon={PiCheckCircleDuotone} color="text-primary" />
                </div>
            </AdaptiveCard>

            {/* Practice stats */}
            <AdaptiveCard>
                <div className="flex items-center gap-2 mb-4">
                    <PiBookOpenDuotone className="text-xl text-violet-500" />
                    <h5 className="font-semibold">Practice Progress</h5>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatTile label="Sets Attempted" value={p.sets_attempted} icon={PiBookOpenDuotone} color="text-violet-500" />
                    <StatTile label="Total Answered" value={p.total_answered} icon={PiChartBarDuotone} />
                    <StatTile label="Correct Answers" value={p.correct_answers} icon={PiCheckCircleDuotone} color="text-emerald-500" />
                </div>
            </AdaptiveCard>

            {/* Recent attempts */}
            {recent.length > 0 && (
                <AdaptiveCard>
                    <div className="flex items-center gap-2 mb-4">
                        <PiClockCountdownDuotone className="text-xl text-gray-400" />
                        <h5 className="font-semibold">Recent Attempts</h5>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
                        {recent.slice(0, 5).map((a) => {
                            const title = a.quiz?.title || a.quiz_title || 'Attempt'
                            const type = a.quiz?.type
                            const pct = a.percentage != null ? `${parseFloat(a.percentage).toFixed(1)}%` : null
                            const passed = a.is_passed
                            const date = a.submitted_at
                                ? new Date(a.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : null

                            return (
                                <div key={a.id} className="flex items-center justify-between py-3 text-sm gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-700 dark:text-gray-300 truncate">{title}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {type && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {type}
                                                </span>
                                            )}
                                            {date && <span className="text-xs text-gray-400">{date}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {pct && <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{pct}</span>}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                            {passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </AdaptiveCard>
            )}
        </div>
    )
}

const TeacherStats = ({ stats }) => {
    const q = stats?.quizzes || {}
    const qs = stats?.questions || {}
    const ps = stats?.practice_sets || {}
    const sa = stats?.student_attempts || {}

    return (
        <AdaptiveCard>
            <div className="flex items-center gap-2 mb-4">
                <PiChalkboardTeacherDuotone className="text-xl text-primary" />
                <h5 className="font-semibold">Your Content & Activity</h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatTile label="Total Quizzes" value={q.total} icon={PiChartBarDuotone} />
                <StatTile label="Published" value={q.published} icon={PiCheckCircleDuotone} color="text-emerald-500" />
                <StatTile label="Draft" value={q.draft} icon={PiClockCountdownDuotone} color="text-amber-500" />
                <StatTile label="Questions" value={qs.total} icon={PiBookOpenDuotone} color="text-violet-500" />
                <StatTile label="Practice Sets" value={ps.total} icon={PiBookOpenDuotone} />
                <StatTile label="Student Attempts" value={sa.total} icon={PiStudentDuotone} color="text-primary" />
                <StatTile label="Unique Students" value={sa.unique_students} icon={PiUsersThreeDuotone} color="text-cyan-500" />
                <StatTile label="Avg Score" value={sa.avg_score != null ? `${sa.avg_score}%` : null} icon={PiChartBarDuotone} color="text-amber-500" />
            </div>
        </AdaptiveCard>
    )
}

const AdminStats = ({ stats }) => {
    const u = stats?.user_stats    || {}
    const c = stats?.content_stats || {}
    const a = stats?.attempt_stats || {}

    return (
        <AdaptiveCard>
            <div className="flex items-center gap-2 mb-4">
                <PiUsersThreeDuotone className="text-xl text-primary" />
                <h5 className="font-semibold">Platform Overview</h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatTile label="Total Users" value={u.total} icon={PiUsersThreeDuotone} color="text-primary" />
                <StatTile label="Students" value={u.students} icon={PiStudentDuotone} color="text-blue-500" />
                <StatTile label="Teachers" value={u.teachers} icon={PiChalkboardTeacherDuotone} color="text-violet-500" />
                <StatTile label="Parents" value={u.parents} icon={PiUsersThreeDuotone} color="text-cyan-500" />
                <StatTile label="Quizzes" value={c.quizzes} icon={PiChartBarDuotone} sub={`${c.published ?? 0} published`} />
                <StatTile label="Questions" value={c.questions} icon={PiBookOpenDuotone} color="text-amber-500" />
                <StatTile label="Practice Sets" value={c.practice_sets} icon={PiBookOpenDuotone} color="text-emerald-500" />
                <StatTile label="Total Attempts" value={a.total} icon={PiCheckCircleDuotone} color="text-red-500" sub={`${a.this_month ?? 0} this month`} />
            </div>
        </AdaptiveCard>
    )
}

const ParentStats = ({ stats }) => {
    const children = stats?.children || []

    return (
        <AdaptiveCard>
            <div className="flex items-center gap-2 mb-4">
                <PiUsersThreeDuotone className="text-xl text-primary" />
                <h5 className="font-semibold">Children Performance</h5>
            </div>
            {children.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No children linked to your account yet.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {children.map((child) => (
                        <div key={child.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                            <div className="font-semibold mb-3">{child.name}</div>
                            <div className="grid grid-cols-3 gap-3">
                                <StatTile label="Attempts" value={child.total_attempts} icon={PiChartBarDuotone} />
                                <StatTile label="Passed" value={child.passed} icon={PiCheckCircleDuotone} color="text-emerald-500" />
                                <StatTile label="Avg Score" value={child.avg_score != null ? `${child.avg_score}%` : null} icon={PiChartBarDuotone} color="text-amber-500" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdaptiveCard>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
    const storeUser = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const { signOut } = useAuth()

    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)

    const avatarInputRef = useRef(null)
    const [fields, setFields] = useState({
        first_name: '', last_name: '', username: '', email: '',
        phone_code: '', phone: '', country: '', address: '', city: '', postal_code: '',
    })
    const [savingProfile, setSavingProfile] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [removingAvatar, setRemovingAvatar] = useState(false)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    useEffect(() => {
        ApiService.fetchDataWithAxios({ url: '/profile', method: 'get' })
            .then((res) => {
                const data = res?.data?.data ?? res?.data ?? res
                setProfileData(data)
                setFields({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    username: data.username || '',
                    email: data.email || storeUser?.email || '',
                    phone_code: data.phone_code || '',
                    phone: data.phone || '',
                    country: data.country || '',
                    address: data.address || '',
                    city: data.city || '',
                    postal_code: data.postal_code || '',
                })
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const role = profileData?.role ?? storeUser?.role ?? storeUser?.authority?.[0] ?? 'user'
    const displayName = [fields.first_name, fields.last_name].filter(Boolean).join(' ') || profileData?.name || storeUser?.userName || 'Your Name'
    const initials = displayName.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingAvatar(true)
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const res = await ApiService.fetchDataWithAxios({
                url: '/profile/avatar',
                method: 'post',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const newUrl = res?.data?.avatar_url ?? res?.avatar_url
            setProfileData((prev) => ({ ...prev, avatar_url: newUrl }))
            setUser({ ...storeUser, avatar: newUrl })
            toast.push(<Notification type="success" title="Avatar updated" />, { placement: 'top-center' })
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Upload failed'} />, { placement: 'top-center' })
        } finally {
            setUploadingAvatar(false)
            e.target.value = ''
        }
    }

    const handleRemoveAvatar = async () => {
        setRemovingAvatar(true)
        try {
            await ApiService.fetchDataWithAxios({ url: '/profile/avatar', method: 'delete' })
            setProfileData((prev) => ({ ...prev, avatar_url: null }))
            setUser({ ...storeUser, avatar: null })
            toast.push(<Notification type="success" title="Avatar removed" />, { placement: 'top-center' })
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Remove failed'} />, { placement: 'top-center' })
        } finally {
            setRemovingAvatar(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setSavingProfile(true)
        try {
            const payload = {}
            Object.entries(fields).forEach(([k, v]) => { if (v !== '') payload[k] = v })
            const res = await ApiService.fetchDataWithAxios({ url: '/profile', method: 'put', data: payload })
            const updated = res?.data?.data ?? res?.data ?? res
            const fullName = [updated?.first_name, updated?.last_name].filter(Boolean).join(' ') || updated?.name
            setUser({ ...storeUser, userName: fullName, name: fullName, email: updated?.email ?? fields.email })
            toast.push(<Notification type="success" title="Profile updated" />, { placement: 'top-center' })
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to update profile'} />, { placement: 'top-center' })
        } finally {
            setSavingProfile(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.push(<Notification type="warning" title="All password fields are required" />, { placement: 'top-center' })
            return
        }
        if (newPassword !== confirmPassword) {
            toast.push(<Notification type="warning" title="New passwords do not match" />, { placement: 'top-center' })
            return
        }
        if (newPassword.length < 6) {
            toast.push(<Notification type="warning" title="Password must be at least 6 characters" />, { placement: 'top-center' })
            return
        }
        setSavingPassword(true)
        try {
            await ApiService.fetchDataWithAxios({
                url: '/profile/password',
                method: 'put',
                data: { current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword },
            })
            toast.push(<Notification type="success" title="Password changed. Please sign in again." />, { placement: 'top-center' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => signOut(), 1500)
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to change password'} />, { placement: 'top-center' })
        } finally {
            setSavingPassword(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
    }

    const avatar = profileData?.avatar_url || profileData?.avatar || storeUser?.avatar
    const stats = profileData?.stats
    const subscription = profileData?.subscription

    return (
        <Container>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-semibold">My Profile</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Your account overview and settings</p>
                </div>

                {/* Avatar card */}
                <AdaptiveCard>
                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center overflow-hidden">
                                {avatar
                                    ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow hover:bg-primary/90 transition disabled:opacity-60"
                                title="Upload photo"
                            >
                                {uploadingAvatar
                                    ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <PiCameraDuotone size={14} />
                                }
                            </button>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg heading-text">{displayName}</div>
                            <div className="text-sm text-gray-500">{fields.email}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize">
                                    {role}
                                </span>
                                {profileData?.member_since && (
                                    <span className="text-xs text-gray-400">
                                        Member since {new Date(profileData.member_since).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                        {avatar && (
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<PiTrashDuotone />}
                                loading={removingAvatar}
                                onClick={handleRemoveAvatar}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start"
                            >
                                Remove photo
                            </Button>
                        )}
                    </div>
                </AdaptiveCard>

                {/* Role-specific stats */}
                {stats && (role === 'student') && (
                    <StudentStats stats={stats} subscription={subscription} />
                )}
                {stats && (role === 'teacher') && (
                    <TeacherStats stats={stats} />
                )}
                {stats && (role === 'admin' || role === 'superadmin') && (
                    <AdminStats stats={stats} />
                )}
                {stats && (role === 'parent') && (
                    <ParentStats stats={stats} />
                )}

                {/* Personal info form */}
                <AdaptiveCard>
                    <div className="flex items-center gap-2 mb-5">
                        <PiUserDuotone className="text-xl text-primary" />
                        <h5 className="font-semibold">Personal Information</h5>
                    </div>
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <Input
                                    value={fields.first_name}
                                    onChange={(e) => setFields((f) => ({ ...f, first_name: e.target.value }))}
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <Input
                                    value={fields.last_name}
                                    onChange={(e) => setFields((f) => ({ ...f, last_name: e.target.value }))}
                                    placeholder="Last name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <Input
                                    value={fields.username}
                                    onChange={(e) => setFields((f) => ({ ...f, username: e.target.value }))}
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <Input
                                    type="email"
                                    value={fields.email}
                                    onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Code</label>
                                <Input
                                    value={fields.phone_code}
                                    onChange={(e) => setFields((f) => ({ ...f, phone_code: e.target.value }))}
                                    placeholder="+91"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <Input
                                    value={fields.phone}
                                    onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                <Input
                                    value={fields.country}
                                    onChange={(e) => setFields((f) => ({ ...f, country: e.target.value }))}
                                    placeholder="India"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <Input
                                    value={fields.city}
                                    onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                                <Input
                                    value={fields.postal_code}
                                    onChange={(e) => setFields((f) => ({ ...f, postal_code: e.target.value }))}
                                    placeholder="400001"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <Input
                                    value={fields.address}
                                    onChange={(e) => setFields((f) => ({ ...f, address: e.target.value }))}
                                    placeholder="Street address"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="solid" icon={<PiFloppyDiskDuotone />} loading={savingProfile}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </AdaptiveCard>

                {/* Change password form */}
                <AdaptiveCard>
                    <div className="flex items-center gap-2 mb-5">
                        <PiLockDuotone className="text-xl text-primary" />
                        <h5 className="font-semibold">Change Password</h5>
                    </div>
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="solid" icon={<PiLockDuotone />} loading={savingPassword}>
                                Change Password
                            </Button>
                        </div>
                    </form>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default Profile
