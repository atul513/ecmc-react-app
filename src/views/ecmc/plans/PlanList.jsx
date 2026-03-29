import { useEffect, useState, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiAdminGetPlans,
    apiAdminCreatePlan,
    apiAdminUpdatePlan,
    apiAdminDeletePlan,
} from '@/services/PlanService'
import {
    TbPlus, TbEdit, TbTrash, TbSearch, TbCheck,
    TbX, TbCurrencyRupee, TbCalendar, TbLoader,
} from 'react-icons/tb'

// ─── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
        ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        {active ? 'Active' : 'Inactive'}
    </span>
)

// ─── Plan Form Dialog ──────────────────────────────────────────────────────────
const PlanDialog = ({ plan, onClose, onSaved }) => {
    const isEdit = Boolean(plan?.id)
    const [saving, setSaving] = useState(false)
    const [featureInput, setFeatureInput] = useState('')
    const [form, setForm] = useState({
        name:          plan?.name          || '',
        description:   plan?.description   || '',
        price:         plan?.price         ?? '',
        currency:      plan?.currency      || 'INR',
        duration_days: plan?.duration_days ?? '',
        features:      plan?.features      || [],
        is_active:     plan?.is_active     ?? true,
    })
    const [errors, setErrors] = useState({})

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

    const addFeature = () => {
        const t = featureInput.trim()
        if (!t) return
        set('features', [...form.features, t])
        setFeatureInput('')
    }
    const removeFeature = (i) => set('features', form.features.filter((_, idx) => idx !== i))

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (form.price === '' || isNaN(Number(form.price))) e.price = 'Valid price required'
        if (form.duration_days === '' || isNaN(Number(form.duration_days))) e.duration_days = 'Valid duration required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            const payload = {
                ...form,
                price:         Number(form.price),
                duration_days: Number(form.duration_days),
            }
            let saved
            if (isEdit) {
                const res = await apiAdminUpdatePlan(plan.id, payload)
                saved = res?.data
            } else {
                const res = await apiAdminCreatePlan(payload)
                saved = res?.data
            }
            toast.push(<Notification type="success" title={isEdit ? 'Plan updated' : 'Plan created'} />, { placement: 'top-center' })
            onSaved(saved)
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to save plan'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="font-semibold text-base">{isEdit ? 'Edit Plan' : 'Create Plan'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><TbX className="text-xl" /></button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Plan Name <span className="text-red-400">*</span></label>
                        <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Basic, Pro, Premium" invalid={Boolean(errors.name)} />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            rows={3}
                            placeholder="Short description of this plan"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                        />
                    </div>

                    {/* Price + Currency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <TbCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="number" min="0" step="0.01"
                                    className="pl-8"
                                    value={form.price}
                                    onChange={(e) => set('price', e.target.value)}
                                    placeholder="0"
                                    invalid={Boolean(errors.price)}
                                />
                            </div>
                            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <Input value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="INR" />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (days) <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <TbCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="number" min="1"
                                className="pl-8"
                                value={form.duration_days}
                                onChange={(e) => set('duration_days', e.target.value)}
                                placeholder="30"
                                invalid={Boolean(errors.duration_days)}
                            />
                        </div>
                        {errors.duration_days && <p className="text-xs text-red-500 mt-1">{errors.duration_days}</p>}
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Features</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                placeholder="Add a feature..."
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" icon={<TbPlus />} onClick={addFeature}>Add</Button>
                        </div>
                        <div className="space-y-1.5">
                            {form.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                    <TbCheck className="text-emerald-500 shrink-0" />
                                    <span className="flex-1 text-sm">{f}</span>
                                    <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500">
                                        <TbX />
                                    </button>
                                </div>
                            ))}
                            {form.features.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No features added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-3 pt-1">
                        <Switcher checked={form.is_active} onChange={(val) => set('is_active', val)} />
                        <div>
                            <p className="text-sm font-medium">Active</p>
                            <p className="text-xs text-gray-400">Inactive plans won't be shown to users</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t dark:border-gray-700 shrink-0">
                    <Button className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="solid" className="flex-1" loading={saving} onClick={handleSave}>
                        {isEdit ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const PlanList = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialog, setDialog] = useState(null) // null | { plan? }
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiAdminGetPlans()
            setPlans(res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load plans" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSaved = (saved) => {
        if (saved) load()
        setDialog(null)
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await apiAdminDeletePlan(deleteTarget.id)
            toast.push(<Notification type="success" title="Plan deleted" />, { placement: 'top-center' })
            setDeleteTarget(null)
            load()
        } catch (err) {
            const msg = err?.response?.data?.message || 'Delete failed'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setDeleting(false)
        }
    }

    const filtered = plans.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Container>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold">Plans</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Manage subscription plans</p>
                    </div>
                    <Button variant="solid" icon={<TbPlus />} onClick={() => setDialog({})}>
                        New Plan
                    </Button>
                </div>

                {/* Search */}
                <Input
                    prefix={<TbSearch />}
                    placeholder="Search plans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />

                {/* Plans grid */}
                {loading ? (
                    <div className="flex justify-center py-16"><Spinner size="36px" /></div>
                ) : filtered.length === 0 ? (
                    <AdaptiveCard>
                        <div className="text-center py-12 text-gray-400">
                            {search ? 'No plans match your search' : 'No plans created yet'}
                        </div>
                    </AdaptiveCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((plan) => (
                            <AdaptiveCard key={plan.id} className="flex flex-col gap-3 relative">
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h5 className="font-bold text-base">{plan.name}</h5>
                                        {plan.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{plan.description}</p>
                                        )}
                                    </div>
                                    <StatusBadge active={plan.is_active} />
                                </div>

                                {/* Price + Duration */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-extrabold text-primary">
                                            {plan.currency === 'INR' ? '₹' : plan.currency}{Number(plan.price).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <TbCalendar />
                                        {plan.duration_days} days
                                    </div>
                                </div>

                                {/* Features */}
                                {plan.features?.length > 0 && (
                                    <ul className="space-y-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <TbCheck className="text-emerald-500 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-2 border-t dark:border-gray-700">
                                    <Button size="sm" icon={<TbEdit />} className="flex-1" onClick={() => setDialog({ plan })}>
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="plain" className="text-red-500 hover:bg-red-50" icon={<TbTrash />} onClick={() => setDeleteTarget(plan)}>
                                        Delete
                                    </Button>
                                </div>
                            </AdaptiveCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Plan dialog */}
            {dialog !== null && (
                <PlanDialog
                    plan={dialog.plan}
                    onClose={() => setDialog(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="font-bold text-lg mb-2">Delete Plan?</h3>
                        <p className="text-gray-500 text-sm mb-5">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button variant="solid" className="flex-1 bg-red-500 hover:bg-red-600" loading={deleting} onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

export default PlanList
