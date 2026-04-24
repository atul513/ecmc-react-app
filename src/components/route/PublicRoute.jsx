import { Navigate, Outlet, useLocation } from 'react-router'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

const { authenticatedEntryPath } = appConfig

const ROLE_ENTRY_PATHS = {
    superadmin: '/app/superadmin/dashboard',
    admin: '/app/admin/dashboard',
    teacher: '/app/teacher/dashboard',
    student: '/app/student/dashboard',
    parent: '/app/parent/dashboard',
}

const PublicRoute = () => {
    const { authenticated, user } = useAuth()
    const location = useLocation()

    if (!authenticated) return <Outlet />

    const params = new URLSearchParams(location.search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)
    if (redirectUrl) return <Navigate to={redirectUrl} />

    const role = user?.role ?? user?.authority?.[0]
    const redirectTo = ROLE_ENTRY_PATHS[role] ?? authenticatedEntryPath

    return <Navigate to={redirectTo} />
}

export default PublicRoute
