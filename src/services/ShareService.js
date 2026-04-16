import ApiService from './ApiService'

const BASE = '/v1'

// ─── Admin endpoints ──────────────────────────────────────────────────────────
export async function apiCreateShareLink(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/create-link`, method: 'post', data })
}
export async function apiUpdateShareLink(shareLink, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/link/${shareLink}`, method: 'put', data })
}
export async function apiDeactivateShareLink(shareLink) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/link/${shareLink}`, method: 'delete' })
}
export async function apiSendInvites(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/send-invites`, method: 'post', data })
}
export async function apiListInvitations(contentType, contentId, params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/invitations/${contentType}/${contentId}`, method: 'get', params })
}
export async function apiResendInvite(invitationId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/resend/${invitationId}`, method: 'post' })
}
export async function apiCancelInvite(invitationId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/cancel/${invitationId}`, method: 'post' })
}
export async function apiGetShareAnalytics(contentType, contentId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/analytics/${contentType}/${contentId}`, method: 'get' })
}

// ─── Public endpoints (no auth) ───────────────────────────────────────────────
export async function apiResolveShareLink(shareCode, src) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/share/${shareCode}/resolve`, method: 'get', params: src ? { src } : {} })
}
export async function apiResolveInvite(inviteCode, src) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/invite/${inviteCode}/resolve`, method: 'get', params: src ? { src } : {} })
}
export async function apiRegisterViaInvite(inviteCode, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/invite/${inviteCode}/register`, method: 'post', data })
}
