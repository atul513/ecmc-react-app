import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import FallbackRoute from './FallbackRoute'
import PageContainer from '@/components/template/PageContainer'
import { protectedRoutes, publicRoutes, openRoutes } from '@/configs/routes.config'
import { useAuth } from '@/auth'
import { Routes, Route, Navigate } from 'react-router'


const AllRoutes = (props) => {
    const { user } = useAuth()

    return (
        <Routes>
            {/* Root — redirect based on auth state */}
            <Route index element={<FallbackRoute />} />

            {/* Open routes — accessible to everyone, no auth redirect */}
            {openRoutes.map((route) => (
                <Route
                    key={route.key}
                    path={route.path}
                    element={
                        <AppRoute
                            routeKey={route.key}
                            component={route.component}
                            {...route.meta}
                        />
                    }
                />
            ))}

           

            {/* Public routes (auth pages — redirect to dashboard if already signed in) */}
            <Route element={<PublicRoute />}>
                {publicRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <AppRoute
                                routeKey={route.key}
                                component={route.component}
                                {...route.meta}
                            />
                        }
                    />
                ))}
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                {protectedRoutes.map((route, index) => (
                    <Route
                        key={route.key + index}
                        path={route.path}
                        element={
                            <AuthorityGuard
                                userAuthority={user.authority}
                                authority={route.authority}
                            >
                                <PageContainer {...props} {...route.meta}>
                                    <AppRoute
                                        routeKey={route.key}
                                        component={route.component}
                                        {...route.meta}
                                    />
                                </PageContainer>
                            </AuthorityGuard>
                        }
                    />
                ))}
                <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
        </Routes>
    )
}

export default AllRoutes
