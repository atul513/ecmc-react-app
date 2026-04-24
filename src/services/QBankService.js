import ApiService from './ApiService'

const BASE = '/v1'

// ─── Subjects ─────────────────────────────────────────────────────────────────
export async function apiGetSubjects(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects`, method: 'get', params })
}
export async function apiGetSubject(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects/${id}`, method: 'get' })
}
export async function apiCreateSubject(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects`, method: 'post', data })
}
export async function apiUpdateSubject(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects/${id}`, method: 'put', data })
}
export async function apiDeleteSubject(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects/${id}`, method: 'delete' })
}

// ─── Topics ───────────────────────────────────────────────────────────────────
export async function apiGetTopics(subjectId, params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/subjects/${subjectId}/topics`, method: 'get', params })
}
export async function apiGetTopic(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/topics/${id}`, method: 'get' })
}
export async function apiCreateTopic(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/topics`, method: 'post', data })
}
export async function apiUpdateTopic(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/topics/${id}`, method: 'put', data })
}
export async function apiDeleteTopic(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/topics/${id}`, method: 'delete' })
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export async function apiGetTags(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/tags`, method: 'get', params })
}
export async function apiCreateTag(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/tags`, method: 'post', data })
}
export async function apiDeleteTag(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/tags/${id}`, method: 'delete' })
}

// ─── Questions ────────────────────────────────────────────────────────────────
export async function apiGetQuestions(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions`, method: 'get', params })
}
export async function apiGetQuestion(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}`, method: 'get' })
}
export async function apiCreateQuestion(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions`, method: 'post', data })
}
export async function apiUpdateQuestion(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}`, method: 'put', data })
}
export async function apiDeleteQuestion(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}`, method: 'delete' })
}
export async function apiGetQuestionHistory(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/history`, method: 'get' })
}

// ─── Question Workflow ────────────────────────────────────────────────────────
export async function apiSubmitQuestionForReview(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/submit-review`, method: 'post' })
}
export async function apiApproveQuestion(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/approve`, method: 'post' })
}
export async function apiRejectQuestion(id, reason) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/reject`, method: 'post', data: { reason } })
}
export async function apiCloneQuestion(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/clone`, method: 'post' })
}
export async function apiBulkUpdateQuestionStatus(question_ids, status) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/bulk-status`, method: 'patch', data: { question_ids, status } })
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function apiDownloadImportTemplate(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/import/template`, method: 'get', responseType: 'blob', params })
}
export async function apiImportQuestions(formData) {
    return ApiService.fetchDataWithAxios({
        url: `${BASE}/questions/import`,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
export async function apiImportQuestionsJson(formData) {
    return ApiService.fetchDataWithAxios({
        url: `${BASE}/questions/import-json`,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
export async function apiGetImportStatus(batchId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/import/${batchId}/status`, method: 'get' })
}
export async function apiGetImportErrors(batchId, format = 'json') {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/import/${batchId}/errors`, method: 'get', params: { format } })
}
export async function apiGetImportBatches(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/import/batches`, method: 'get', params })
}
export async function apiRollbackImportBatch(batchId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/import/${batchId}`, method: 'delete' })
}

// ─── Stats & Search ───────────────────────────────────────────────────────────
export async function apiGetQBankStats() {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions-stats`, method: 'get' })
}
export async function apiGetQBankAggregations(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions-stats/aggregations`, method: 'get', params })
}
export async function apiAdvancedSearch(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions-search`, method: 'post', data })
}
export async function apiGetQuestionPerformance(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/questions/${id}/performance`, method: 'get' })
}
