import { useMemo, useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import {
    apiGetProfile,
    apiUpdateProfile,
    apiUploadAvatar,
    apiRemoveAvatar,
} from '@/services/AccontsService'
import { useSessionUser } from '@/store/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus, TbTrash, TbLoader } from 'react-icons/tb'

const { Control } = components

// ─── Validation ────────────────────────────────────────────────────────────────
const validationSchema = z.object({
    firstName:   z.string().optional(),
    lastName:    z.string().optional(),
    username:    z.string().optional(),
    email:       z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
    dialCode:    z.string().optional(),
    phoneNumber: z.string().optional(),
    country:     z.string().optional(),
    address:     z.string().optional(),
    postcode:    z.string().optional(),
    city:        z.string().optional(),
})

// ─── Country flag select components ───────────────────────────────────────────
const CustomSelectOption = ({ variant, ...props }) => (
    <DefaultOption
        {...props}
        customLabel={(data, label) => (
            <span className="flex items-center gap-2">
                <Avatar shape="circle" size={20} src={`/img/countries/${data.value}.png`} />
                {variant === 'country' && <span>{label}</span>}
                {variant === 'phone' && <span>{data.dialCode}</span>}
            </span>
        )}
    />
)

const CustomControl = ({ children, ...props }) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </Control>
    )
}

// ─── Component ─────────────────────────────────────────────────────────────────
const SettingsProfile = () => {
    const { setUser } = useSessionUser()
    const fileInputRef = useRef(null)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(true)

    const dialCodeList = useMemo(() => {
        return JSON.parse(JSON.stringify(countryList)).map((c) => {
            c.label = c.dialCode
            return c
        })
    }, [])

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm({ resolver: zodResolver(validationSchema) })

    // ── Load profile ──────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setProfileLoading(true)
            try {
                const res = await apiGetProfile()
                const d = res?.data
                setAvatarUrl(d?.avatar_url || '')
                reset({
                    firstName:   d?.first_name  || '',
                    lastName:    d?.last_name   || '',
                    username:    d?.username    || '',
                    email:       d?.email       || '',
                    dialCode:    d?.phone_code  || '',
                    phoneNumber: d?.phone       || '',
                    country:     d?.country     || '',
                    address:     d?.address     || '',
                    city:        d?.city        || '',
                    postcode:    d?.postal_code || '',
                })
            } catch {
                toast.push(<Notification type="danger" title="Failed to load profile" />, { placement: 'top-center' })
            } finally {
                setProfileLoading(false)
            }
        }
        load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Avatar upload ─────────────────────────────────────────────────────────
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''

        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowed.includes(file.type)) {
            toast.push(<Notification type="warning" title="Only JPG, PNG or WEBP images allowed" />, { placement: 'top-center' })
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.push(<Notification type="warning" title="Image must be under 2 MB" />, { placement: 'top-center' })
            return
        }

        setAvatarLoading(true)
        // Optimistic preview
        const preview = URL.createObjectURL(file)
        setAvatarUrl(preview)

        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const res = await apiUploadAvatar(formData)
            const newUrl = res?.avatar_url || preview
            setAvatarUrl(newUrl)
            setUser({ avatar: newUrl })
            toast.push(<Notification type="success" title="Avatar updated" />, { placement: 'top-center' })
        } catch {
            setAvatarUrl('')
            toast.push(<Notification type="danger" title="Avatar upload failed" />, { placement: 'top-center' })
        } finally {
            URL.revokeObjectURL(preview)
            setAvatarLoading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        setAvatarLoading(true)
        try {
            await apiRemoveAvatar()
            setAvatarUrl('')
            setUser({ avatar: '' })
            toast.push(<Notification type="success" title="Avatar removed" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification type="danger" title="Failed to remove avatar" />, { placement: 'top-center' })
        } finally {
            setAvatarLoading(false)
        }
    }

    // ── Save profile ──────────────────────────────────────────────────────────
    const onSubmit = async (values) => {
        try {
            const payload = {
                first_name:  values.firstName   || undefined,
                last_name:   values.lastName    || undefined,
                username:    values.username    || undefined,
                email:       values.email       || undefined,
                phone_code:  values.dialCode    || undefined,
                phone:       values.phoneNumber || undefined,
                country:     values.country     || undefined,
                address:     values.address     || undefined,
                city:        values.city        || undefined,
                postal_code: values.postcode    || undefined,
            }
            const res = await apiUpdateProfile(payload)
            const d = res?.data

            // Sync session store
            setUser({
                userName: d?.username || d?.name || '',
                email:    d?.email    || '',
                avatar:   d?.avatar_url || avatarUrl,
            })

            toast.push(<Notification type="success" title="Profile saved" />, { placement: 'top-center' })
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to save profile'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        }
    }

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                <TbLoader className="animate-spin text-xl" /> Loading profile…
            </div>
        )
    }

    return (
        <>
            <h4 className="mb-8">Personal information</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>

                {/* Avatar */}
                <div className="mb-8">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <Avatar
                                size={90}
                                className="border-4 border-white bg-gray-100 text-gray-300 shadow-lg"
                                icon={<HiOutlineUser />}
                                src={avatarUrl}
                            />
                            {avatarLoading && (
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                    <TbLoader className="animate-spin text-white text-xl" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <Button
                                variant="solid"
                                size="sm"
                                type="button"
                                icon={<TbPlus />}
                                disabled={avatarLoading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload Image
                            </Button>
                            {avatarUrl && (
                                <Button
                                    size="sm"
                                    type="button"
                                    icon={<TbTrash />}
                                    disabled={avatarLoading}
                                    onClick={handleRemoveAvatar}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG or WEBP · max 2 MB</p>
                </div>

                {/* Name row */}
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                        label="First Name"
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message}
                    >
                        <Controller name="firstName" control={control} render={({ field }) => (
                            <Input type="text" autoComplete="off" placeholder="First Name" {...field} />
                        )} />
                    </FormItem>
                    <FormItem
                        label="Last Name"
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message}
                    >
                        <Controller name="lastName" control={control} render={({ field }) => (
                            <Input type="text" autoComplete="off" placeholder="Last Name" {...field} />
                        )} />
                    </FormItem>
                </div>

                {/* Username */}
                <FormItem
                    label="Username"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                >
                    <Controller name="username" control={control} render={({ field }) => (
                        <Input type="text" autoComplete="off" placeholder="username" {...field} />
                    )} />
                </FormItem>

                {/* Email */}
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller name="email" control={control} render={({ field }) => (
                        <Input type="email" autoComplete="off" placeholder="Email" {...field} />
                    )} />
                </FormItem>

                {/* Phone */}
                <div className="flex items-end gap-4 w-full mb-6">
                    <FormItem invalid={Boolean(errors.dialCode)}>
                        <label className="form-label mb-2">Phone number</label>
                        <Controller name="dialCode" control={control} render={({ field }) => (
                            <Select
                                options={dialCodeList}
                                className="w-[150px]"
                                components={{
                                    Option: (props) => <CustomSelectOption variant="phone" {...props} />,
                                    Control: CustomControl,
                                }}
                                placeholder=""
                                value={dialCodeList.filter((o) => o.dialCode === field.value)}
                                onChange={(opt) => field.onChange(opt?.dialCode || '')}
                            />
                        )} />
                    </FormItem>
                    <FormItem
                        className="w-full"
                        invalid={Boolean(errors.phoneNumber)}
                        errorMessage={errors.phoneNumber?.message}
                    >
                        <Controller name="phoneNumber" control={control} render={({ field }) => (
                            <NumericInput
                                autoComplete="off"
                                placeholder="Phone Number"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                            />
                        )} />
                    </FormItem>
                </div>

                <h4 className="mb-6">Address information</h4>

                {/* Country */}
                <FormItem
                    label="Country"
                    invalid={Boolean(errors.country)}
                    errorMessage={errors.country?.message}
                >
                    <Controller name="country" control={control} render={({ field }) => (
                        <Select
                            options={countryList}
                            components={{
                                Option: (props) => <CustomSelectOption variant="country" {...props} />,
                                Control: CustomControl,
                            }}
                            placeholder=""
                            value={countryList.filter((o) => o.value === field.value)}
                            onChange={(opt) => field.onChange(opt?.value || '')}
                        />
                    )} />
                </FormItem>

                {/* Address */}
                <FormItem
                    label="Address"
                    invalid={Boolean(errors.address)}
                    errorMessage={errors.address?.message}
                >
                    <Controller name="address" control={control} render={({ field }) => (
                        <Input type="text" autoComplete="off" placeholder="Address" {...field} />
                    )} />
                </FormItem>

                {/* City + Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        label="City"
                        invalid={Boolean(errors.city)}
                        errorMessage={errors.city?.message}
                    >
                        <Controller name="city" control={control} render={({ field }) => (
                            <Input type="text" autoComplete="off" placeholder="City" {...field} />
                        )} />
                    </FormItem>
                    <FormItem
                        label="Postal Code"
                        invalid={Boolean(errors.postcode)}
                        errorMessage={errors.postcode?.message}
                    >
                        <Controller name="postcode" control={control} render={({ field }) => (
                            <Input type="text" autoComplete="off" placeholder="Postal Code" {...field} />
                        )} />
                    </FormItem>
                </div>

                <div className="flex justify-end">
                    <Button variant="solid" type="submit" loading={isSubmitting}>
                        Save Changes
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
