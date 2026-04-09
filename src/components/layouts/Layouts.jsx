import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import { useLocation } from 'react-router'
import { openRoutes } from '@/configs/routes.config'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { authenticated } = useAuth()
    const location = useLocation()

    const isOpenRoute = openRoutes.some((r) => r.path === location.pathname)

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {authenticated && !isOpenRoute ? (
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
