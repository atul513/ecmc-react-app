import { useSessionUser, useToken } from '@/store/authStore'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error) => {
    const { response, config } = error
    const { setToken } = useToken()

    if (response && unauthorizedCode.includes(response.status)) {
        // Don't clear session for public API endpoints (v1/ routes called without auth)
        const url = config?.url || ''
        const isPublicApi = url.startsWith('/v1/') || url.includes('/v1/')
        const hasToken = useToken.getState().token

        // Only clear session if user was actually logged in (had a token)
        if (hasToken && !isPublicApi) {
            setToken('')
            useSessionUser.getState().setUser({})
            useSessionUser.getState().setSessionSignedIn(false)
        }
    }
}

export default AxiosResponseIntrceptorErrorCallback
