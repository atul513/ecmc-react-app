import { Link } from 'react-router'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import Header from '@/components/template/Header'
import Logo from '@/components/template/Logo'
import UserDropdown from '@/components/template/UserProfileDropdown'

const LandingLayout = ({ children }) => {
    const { authenticated } = useAuth()
    const mode = useThemeStore((state) => state.mode)

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                className="shadow-sm dark:shadow-gray-700/20"
                headerStart={
                    <Link to="/" className="flex items-center">
                        <Logo imgClass="max-h-9" mode={mode} />
                    </Link>
                }
                headerEnd={
                    authenticated ? (
                        <UserDropdown />
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/sign-in"
                                className="font-semibold heading-text px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/sign-up"
                                className="font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )
                }
            />
            <main className="flex-1">{children}</main>
        </div>
    )
}

export default LandingLayout
