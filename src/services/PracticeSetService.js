import ApiService from './ApiService'

const BASE = '/v1'

// ─── Admin CRUD ───────────────────────────────────────────────────────────────
export async function apiGetPracticeSets(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets`, method: 'get', params })
}
export async function apiGetPracticeSet(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}`, method: 'get' })
}
export async function apiCreatePracticeSet(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets`, method: 'post', data })
}
export async function apiUpdatePracticeSet(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}`, method: 'put', data })
}
export async function apiDeletePracticeSet(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}`, method: 'delete' })
}
export async function apiPublishPracticeSet(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}/publish`, method: 'post' })
}
export async function apiGetPracticeSetQuestions(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}/questions`, method: 'get' })
}

// ─── Student Flow ─────────────────────────────────────────────────────────────
export async function apiGetMyPracticeSets(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets`, method: 'get', params: { status: 'published', ...params } })
}
export async function apiStartPracticeSet(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}/start`, method: 'get' })
}
export async function apiCheckPracticeAnswer(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}/check-answer`, method: 'post', data })
}
export async function apiGetPracticeProgress(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/practice-sets/${id}/progress`, method: 'get' })
}

// ─── Reward Points ────────────────────────────────────────────────────────────
export async function apiGetMyRewardPoints() {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/my/reward-points`, method: 'get' })
}
