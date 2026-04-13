import ApiService from './ApiService'

// ─── Public ───────────────────────────────────────────────────────────────────
export async function apiGetPublicPlans() {
    return ApiService.fetchDataWithAxios({ url: '/v1/plans', method: 'get' })
}
export async function apiGetPublicPlan(id) {
    return ApiService.fetchDataWithAxios({ url: `/v1/plans/${id}`, method: 'get' })
}

// ─── Student ──────────────────────────────────────────────────────────────────
export async function apiGetMySubscription() {
    return ApiService.fetchDataWithAxios({ url: '/my/subscription', method: 'get' })
}
export async function apiGetMySubscriptions() {
    return ApiService.fetchDataWithAxios({ url: '/my/subscriptions', method: 'get' })
}
export async function apiSubscribeToPlan(planId, data = {}) {
    return ApiService.fetchDataWithAxios({ url: `/plans/${planId}/subscribe`, method: 'post', data })
}
export async function apiCancelSubscription() {
    return ApiService.fetchDataWithAxios({ url: '/my/subscription/cancel', method: 'post' })
}

// ─── Admin · Plans ────────────────────────────────────────────────────────────
export async function apiAdminGetPlans(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/plans', method: 'get', params })
}
export async function apiAdminCreatePlan(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/plans', method: 'post', data })
}
export async function apiAdminUpdatePlan(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/plans/${id}`, method: 'put', data })
}
export async function apiAdminDeletePlan(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/plans/${id}`, method: 'delete' })
}

// ─── Admin · Subscriptions ────────────────────────────────────────────────────
export async function apiAdminGetSubscriptions(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/subscriptions', method: 'get', params })
}
export async function apiAdminAssignSubscription(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/subscriptions', method: 'post', data })
}
export async function apiAdminUpdateSubscriptionStatus(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/subscriptions/${id}/status`, method: 'patch', data })
}
export async function apiAdminExtendSubscription(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/subscriptions/${id}/extend`, method: 'patch', data })
}
