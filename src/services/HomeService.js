import ApiService from './ApiService'

const V1 = '/v1'

// ─── Home & General ──────────────────────────────────────────────────────────
export async function apiGetHome(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/home`, method: 'get', params })
}

export async function apiGetHomeExams(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/home/exams`, method: 'get', params })
}

export async function apiGetHomePracticeSets(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/home/practice-sets`, method: 'get', params })
}

export async function apiGetPlans(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/plans`, method: 'get', params })
}

export async function apiGetPlan(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/plans/${id}`, method: 'get' })
}

export async function apiSubmitContact(data) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/contact`, method: 'post', data })
}

// ─── Explore — Exam Sections ─────────────────────────────────────────────────
export async function apiGetExamSections(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections`, method: 'get', params })
}

export async function apiGetExamSectionTypes() {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections/types`, method: 'get' })
}

export async function apiGetExamSection(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections/${id}`, method: 'get' })
}

export async function apiGetExamSectionTree(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections/${id}/tree`, method: 'get' })
}

export async function apiGetExamSectionContent(id, params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections/${id}/content`, method: 'get', params })
}

export async function apiGetExamSectionBreadcrumb(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/exam-sections/${id}/breadcrumb`, method: 'get' })
}

// ─── Quizzes & Categories ────────────────────────────────────────────────────
export async function apiGetPublicQuizCategories(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quiz-categories`, method: 'get', params })
}

export async function apiGetPublicQuizCategory(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quiz-categories/${id}`, method: 'get' })
}

export async function apiGetPublicQuizzes(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quizzes`, method: 'get', params })
}

export async function apiGetPublicQuiz(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quizzes/${id}`, method: 'get' })
}

export async function apiGetPublicQuizLeaderboard(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quizzes/${id}/leaderboard`, method: 'get' })
}

export async function apiGetPublicQuizSchedules(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/quizzes/${id}/schedules`, method: 'get' })
}

// ─── Practice Sets ───────────────────────────────────────────────────────────
export async function apiGetPublicPracticeSets(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/practice-sets`, method: 'get', params })
}

export async function apiGetPublicPracticeSet(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/practice-sets/${id}`, method: 'get' })
}

// ─── Filters & Taxonomy ─────────────────────────────────────────────────────
export async function apiGetPublicSubjects(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/subjects`, method: 'get', params })
}

export async function apiGetPublicSubject(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/subjects/${id}`, method: 'get' })
}

export async function apiGetPublicTopics(subjectId, params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/subjects/${subjectId}/topics`, method: 'get', params })
}

export async function apiGetPublicTopic(id) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/topics/${id}`, method: 'get' })
}

export async function apiGetPublicTags(params) {
    return ApiService.fetchDataWithAxios({ url: `${V1}/tags`, method: 'get', params })
}
