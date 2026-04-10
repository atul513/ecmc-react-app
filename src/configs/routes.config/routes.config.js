import { lazy } from 'react'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import ecmcRoute from './ecmcRoute'

export const publicRoutes = [...authRoute]

const legalMeta = {
    layout: 'blank',
    footer: false,
    pageContainerType: 'gutterless',
    pageBackgroundType: 'plain',
}

export const openRoutes = [
    {
        key: 'landing',
        path: `/landing`,
        component: lazy(() => import('@/views/others/Landing')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'terms',
        path: `/terms`,
        component: lazy(() => import('@/views/others/Legal/TermsConditions')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'privacy',
        path: `/privacy`,
        component: lazy(() => import('@/views/others/Legal/PrivacyPolicy')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'cookie-policy',
        path: `/cookie-policy`,
        component: lazy(() => import('@/views/others/Legal/CookiePolicy')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'refund-policy',
        path: `/refund-policy`,
        component: lazy(() => import('@/views/others/Legal/RefundPolicy')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'contact',
        path: `/contact`,
        component: lazy(() => import('@/views/others/Legal/ContactUs')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'faq',
        path: `/faq`,
        component: lazy(() => import('@/views/others/Legal/FAQ')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'about',
        path: `/about`,
        component: lazy(() => import('@/views/others/Legal/AboutUs')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'pricing',
        path: `/pricing`,
        component: lazy(() => import('@/views/others/Pricing/PublicPricing')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'public-home',
        path: `/home`,
        component: lazy(() => import('@/views/others/PublicHome')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'public-practice-sets',
        path: `/practice-sets`,
        component: lazy(() => import('@/views/others/PublicPracticeSets')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'public-exams',
        path: `/exams`,
        component: lazy(() => import('@/views/others/PublicExams')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'public-blogs',
        path: `/blogs`,
        component: lazy(() => import('@/views/others/Blog/PublicBlogList')),
        authority: [],
        meta: legalMeta,
    },
    {
        key: 'public-blog-detail',
        path: `/blogs/:slug`,
        component: lazy(() => import('@/views/others/Blog/PublicBlogDetail')),
        authority: [],
        meta: legalMeta,
    },
]

export const protectedRoutes = [
    ...ecmcRoute,
    ...uiComponentsRoute,
]
