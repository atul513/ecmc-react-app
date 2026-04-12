import ApiService from './ApiService'

const BASE = '/v1/exam-sections'

// ─── Public / Lookup ─────────────────────────────────────────────────────────
export async function apiGetExamSectionTypes() {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/types`, method: 'get' })
}
export async function apiGetExamSections(params) {
    return ApiService.fetchDataWithAxios({ url: BASE, method: 'get', params })
}
export async function apiGetExamSection(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}`, method: 'get' })
}
export async function apiGetExamSectionTree(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}/tree`, method: 'get' })
}
export async function apiGetExamSectionBreadcrumb(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}/breadcrumb`, method: 'get' })
}
export async function apiGetExamSectionContent(id, params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}/content`, method: 'get', params })
}
export async function apiGetExamSectionsTree() {
    return ApiService.fetchDataWithAxios({ url: BASE, method: 'get', params: { format: 'tree' } })
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────
export async function apiCreateExamSection(data) {
    return ApiService.fetchDataWithAxios({ url: BASE, method: 'post', data })
}
export async function apiUpdateExamSection(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}`, method: 'put', data })
}
export async function apiDeleteExamSection(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}`, method: 'delete' })
}
export async function apiBulkCreateExamSections(sections) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/bulk-create`, method: 'post', data: { sections } })
}

// ─── Content Linking ──────────────────────────────────────────────────────────
export async function apiLinkContentToSection(id, linkable_type, linkable_id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}/link`, method: 'post', data: { linkable_type, linkable_id } })
}
export async function apiUnlinkContentFromSection(id, linkable_type, linkable_id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/${id}/unlink`, method: 'delete', data: { linkable_type, linkable_id } })
}
