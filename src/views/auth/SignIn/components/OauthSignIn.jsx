import { useState } from 'react'
import Button from '@/components/ui/Button'
import { apiGetGoogleRedirectUrl } from '@/services/OAuthServices'

const OauthSignIn = ({ setMessage, disableSubmit }) => {
    const [loading, setLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        if (disableSubmit || loading) return
        setLoading(true)
        try {
            const resp = await apiGetGoogleRedirectUrl()
            const url = resp?.url || resp?.redirect_url || resp?.data?.url
            if (url) {
                window.location.href = url
            } else {
                setMessage?.('Could not get Google sign-in URL. Please try again.')
                setLoading(false)
            }
        } catch (error) {
            setMessage?.(error?.response?.data?.message || 'Google sign-in failed. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                className="flex-1"
                type="button"
                loading={loading}
                onClick={handleGoogleSignIn}
            >
                <div className="flex items-center justify-center gap-2">
                    <img
                        className="h-[25px] w-[25px]"
                        src="/img/others/google.png"
                        alt="Google sign in"
                    />
                    <span>Google</span>
                </div>
            </Button>
        </div>
    )
}

export default OauthSignIn
