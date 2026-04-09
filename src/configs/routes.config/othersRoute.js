import { lazy } from 'react'

const othersRoute = [
    {
        key: 'payment',
        path: `/payment/:planId`,
        component: lazy(() => import('@/views/payment/PaymentPage')),
        authority: [],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(() => import('@/views/others/AccessDenied')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export default othersRoute
