import { Suspense } from 'react'
import { useLocation } from 'react-router'
import Loading from '@/components/shared/Loading'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'
import LandingLayout from './LandingLayout'

const Layout = ({ children }) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { authenticated } = useAuth()
    const { pathname } = useLocation()

    const isLanding = pathname === '/landing'

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {isLanding ? (
                <LandingLayout>{children}</LandingLayout>
            ) : authenticated ? (
                <PostLoginLayout layoutType={layoutType}>
                    {children}
                </PostLoginLayout>
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
