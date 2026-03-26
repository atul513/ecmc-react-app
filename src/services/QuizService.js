import ApiService from './ApiService'

const BASE = '/v1'

// ─── Quiz Categories ───────────────────────────────────────────────────────────
export async function apiGetQuizCategories(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quiz-categories`, method: 'get', params })
}
export async function apiGetQuizCategory(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quiz-categories/${id}`, method: 'get' })
}
export async function apiCreateQuizCategory(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quiz-categories`, method: 'post', data })
}
export async function apiUpdateQuizCategory(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quiz-categories/${id}`, method: 'put', data })
}
export async function apiDeleteQuizCategory(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quiz-categories/${id}`, method: 'delete' })
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export async function apiGetQuizzes(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes`, method: 'get', params })
}
export async function apiGetQuiz(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}`, method: 'get' })
}
export async function apiCreateQuiz(data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes`, method: 'post', data })
}
export async function apiUpdateQuiz(id, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}`, method: 'put', data })
}
export async function apiDeleteQuiz(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}`, method: 'delete' })
}
export async function apiPublishQuiz(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/publish`, method: 'post' })
}
export async function apiArchiveQuiz(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/archive`, method: 'post' })
}
export async function apiGetQuizQuestions(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/questions`, method: 'get' })
}
export async function apiGetQuizSchedules(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/schedules`, method: 'get' })
}
export async function apiGetQuizLeaderboard(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/leaderboard`, method: 'get' })
}
export async function apiCheckQuizAccess(id) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${id}/check-access`, method: 'get' })
}

// ─── Attempts ─────────────────────────────────────────────────────────────────
export async function apiStartQuiz(quizId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/quizzes/${quizId}/start`, method: 'post' })
}
export async function apiSaveAnswer(attemptId, data) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/attempts/${attemptId}/answer`, method: 'post', data })
}
export async function apiSubmitAttempt(attemptId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/attempts/${attemptId}/submit`, method: 'post' })
}
export async function apiGetAttemptResult(attemptId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/attempts/${attemptId}/result`, method: 'get' })
}
export async function apiGetAttempt(attemptId) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/attempts/${attemptId}`, method: 'get' })
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
export async function apiGetMyAttempts(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/my/attempts`, method: 'get', params })
}
export async function apiGetMyQuizzes(params) {
    return ApiService.fetchDataWithAxios({ url: `${BASE}/my/quizzes`, method: 'get', params })
}
