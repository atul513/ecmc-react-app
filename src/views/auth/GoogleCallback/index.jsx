import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth'
import { apiGoogleCallback } from '@/services/OAuthServices'
import { TbLoader, TbAlertCircle } from 'react-icons/tb'
import { useState } from 'react'

const ROLE_ENTRY_PATHS = {
    superadmin: '/app/superadmin/dashboard',
    admin:      '/app/admin/dashboard',
    teacher:    '/app/teacher/dashboard',
    student:    '/app/student/dashboard',
    parent:     '/app/parent/dashboard',
}

const GoogleCallback = () => {
    const { oAuthSignIn } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const called = useRef(false)

    useEffect(() => {
        if (called.current) return
        called.current = true

        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
            navigate('/sign-in')
            return
        }

        oAuthSignIn(async ({ onSignIn }) => {
            try {
                const resp = await apiGoogleCallback(code)

                if (!resp?.token) {
                    setError('Authentication failed. No token received.')
                    return
                }

                const rawUser = resp.user || {}
                const role = typeof rawUser.role === 'string'
                    ? rawUser.role.toLowerCase()
                    : String(rawUser.role || '')
                const normalizedUser = { ...rawUser, authority: role ? [role] : [] }

                onSignIn({ accessToken: resp.token }, normalizedUser)

                const entryPath = ROLE_ENTRY_PATHS[role] || '/app/student/dashboard'
                navigate(entryPath, { replace: true })
            } catch (err) {
                const msg = err?.response?.data?.message || 'Google sign-in failed. Please try again.'
                setError(msg)
            }
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
                <TbAlertCircle className="text-5xl text-red-400" />
                <p className="text-gray-700 dark:text-gray-300 font-semibold">{error}</p>
                <button
                    onClick={() => navigate('/sign-in')}
                    className="mt-2 text-sm text-primary underline"
                >
                    Back to Sign In
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <TbLoader className="animate-spin text-4xl text-primary" />
            <p className="text-gray-500 text-sm">Signing you in with Google...</p>
        </div>
    )
}

export default GoogleCallback
