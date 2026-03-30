import { useRef, useImperativeHandle, useState, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'

const IsolatedNavigator = ({ ref }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)

    const authenticated = Boolean(tokenState && signedIn)

    const navigatorRef = useRef(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens, user) => {
        setToken(tokens.accessToken)
        setTokenState(tokens.accessToken)
        setSessionSignedIn(true)

        if (user) {
            setUser(user)
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({})
        setSessionSignedIn(false)
    }

    // Fix authority for sessions already persisted in localStorage (e.g. before role mapping was added)
    useEffect(() => {
        if (user?.role) {
            const role = typeof user.role === 'string' ? user.role.toLowerCase() : String(user.role)
            const current = user.authority
            if (!current || current.length === 0 || current[0] !== role) {
                setUser({ ...user, authority: [role] })
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const ROLE_ENTRY_PATHS = {
        superadmin: '/ecmc/superadmin/dashboard',
        admin:      '/ecmc/admin/dashboard',
        teacher:    '/ecmc/teacher/dashboard',
        student:    '/ecmc/student/dashboard',
        parent:     '/ecmc/parent/dashboard',
    }

    const normalizeUser = (user) => {
        if (!user) return user
        // Always derive authority from role field (lowercase), overriding whatever the API returned
        if (user.role) {
            const role = typeof user.role === 'string' ? user.role.toLowerCase() : String(user.role)
            return { ...user, authority: [role] }
        }
        return user
    }

    const getRoleEntryPath = (user) => {
        const role = user?.role ?? user?.authority?.[0]
        return ROLE_ENTRY_PATHS[role] ?? appConfig.authenticatedEntryPath
    }

    const redirectForUser = (user) => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)
        navigatorRef.current?.navigate(redirectUrl ? redirectUrl : getRoleEntryPath(user))
    }

    const signIn = async (values) => {
        try {
            const resp = await apiSignIn(values)
            console.log('[AUTH DEBUG] signIn raw response:', JSON.stringify(resp))
            if (resp) {
                const normalized = normalizeUser(resp.user)
                console.log('[AUTH DEBUG] normalized user:', JSON.stringify(normalized))
                handleSignIn({ accessToken: resp.token }, normalized)
                redirectForUser(normalized)
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign in',
            }
        } catch (errors) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values) => {
        try {
            const resp = await apiSignUp(values)
            if (resp) {
                const normalized = normalizeUser(resp.user)
                handleSignIn({ accessToken: resp.token }, normalized)
                redirectForUser(normalized)
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Unable to sign up',
            }
        } catch (errors) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate('/')
        }
    }
    const oAuthSignIn = (callback) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
