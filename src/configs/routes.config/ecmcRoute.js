import { lazy } from 'react'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import {
    SUPERADMIN,
    ADMIN,
    TEACHER,
    STUDENT,
    PARENT,
} from '@/constants/roles.constant'

const ecmcRoute = [
    // ─── QUESTION BANK MODULE (Admin + SuperAdmin) ────────────────
    {
        key: 'ecmc.qbank.stats',
        path: `${ECMC_PREFIX_PATH}/qbank/stats`,
        component: lazy(() => import('@/views/ecmc/qbank/stats/QBankStats')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.subjects',
        path: `${ECMC_PREFIX_PATH}/qbank/subjects`,
        component: lazy(() => import('@/views/ecmc/qbank/subjects/SubjectList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.topics',
        path: `${ECMC_PREFIX_PATH}/qbank/topics`,
        component: lazy(() => import('@/views/ecmc/qbank/topics/TopicList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.tags',
        path: `${ECMC_PREFIX_PATH}/qbank/tags`,
        component: lazy(() => import('@/views/ecmc/qbank/tags/TagList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.questions',
        path: `${ECMC_PREFIX_PATH}/qbank/questions`,
        component: lazy(() => import('@/views/ecmc/qbank/questions/QuestionList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.questions.create',
        path: `${ECMC_PREFIX_PATH}/qbank/questions/create`,
        component: lazy(() => import('@/views/ecmc/qbank/questions/QuestionCreate')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.questions.edit',
        path: `${ECMC_PREFIX_PATH}/qbank/questions/edit/:id`,
        component: lazy(() => import('@/views/ecmc/qbank/questions/QuestionEdit')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.qbank.import',
        path: `${ECMC_PREFIX_PATH}/qbank/import`,
        component: lazy(() => import('@/views/ecmc/qbank/import/QuestionImport')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── QUIZ MODULE (Admin + SuperAdmin) ────────────────────────
    {
        key: 'ecmc.quiz.categories',
        path: `${ECMC_PREFIX_PATH}/quiz/categories`,
        component: lazy(() => import('@/views/ecmc/quiz/categories/QuizCategoryList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.quiz.list',
        path: `${ECMC_PREFIX_PATH}/quiz`,
        component: lazy(() => import('@/views/ecmc/quiz/QuizList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.quiz.create',
        path: `${ECMC_PREFIX_PATH}/quiz/create`,
        component: lazy(() => import('@/views/ecmc/quiz/QuizCreate')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.quiz.edit',
        path: `${ECMC_PREFIX_PATH}/quiz/edit/:id`,
        component: lazy(() => import('@/views/ecmc/quiz/QuizEdit')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    // ─── EXAM SECTIONS (Admin + SuperAdmin) ──────────────────────
    {
        key: 'ecmc.exam-sections',
        path: `${ECMC_PREFIX_PATH}/exam-sections`,
        component: lazy(() => import('@/views/ecmc/exam-sections/ExamSectionList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    // ─── STUDENT PRACTICE SET ROUTES ─────────────────────────────
    {
        key: 'ecmc.student.mypracticesets',
        path: `${ECMC_PREFIX_PATH}/student/my-practice-sets`,
        component: lazy(() => import('@/views/ecmc/student/MyPracticeSets')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.practiceattempt',
        path: `${ECMC_PREFIX_PATH}/student/practice/:id`,
        component: lazy(() => import('@/views/ecmc/student/PracticeAttempt')),
        authority: [STUDENT],
        meta: { pageContainerType: 'gutterless' },
    },

    // ─── STUDENT QUIZ ROUTES ──────────────────────────────────────
    {
        key: 'ecmc.student.myquizzes',
        path: `${ECMC_PREFIX_PATH}/student/my-quizzes`,
        component: lazy(() => import('@/views/ecmc/student/MyQuizzes')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.myattempts',
        path: `${ECMC_PREFIX_PATH}/student/my-attempts`,
        component: lazy(() => import('@/views/ecmc/student/MyAttempts')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.attempt',
        path: `${ECMC_PREFIX_PATH}/student/attempt/:attemptId`,
        component: lazy(() => import('@/views/ecmc/student/QuizAttempt')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.attempt.report',
        path: `${ECMC_PREFIX_PATH}/attempt/:attemptId/report`,
        component: lazy(() => import('@/views/ecmc/student/QuizReport')),
        authority: [STUDENT, TEACHER, ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── PRACTICE SET MODULE (Admin + SuperAdmin) ────────────────
    {
        key: 'ecmc.practice.list',
        path: `${ECMC_PREFIX_PATH}/practice`,
        component: lazy(() => import('@/views/ecmc/practice/PracticeSetList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.practice.create',
        path: `${ECMC_PREFIX_PATH}/practice/create`,
        component: lazy(() => import('@/views/ecmc/practice/PracticeSetCreate')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.practice.edit',
        path: `${ECMC_PREFIX_PATH}/practice/edit/:id`,
        component: lazy(() => import('@/views/ecmc/practice/PracticeSetEdit')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── PLANS & SUBSCRIPTIONS MODULE (Admin + SuperAdmin) ────────
    {
        key: 'ecmc.plans.list',
        path: `${ECMC_PREFIX_PATH}/plans`,
        component: lazy(() => import('@/views/ecmc/plans/PlanList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.plans.subscriptions',
        path: `${ECMC_PREFIX_PATH}/subscriptions`,
        component: lazy(() => import('@/views/ecmc/plans/AdminSubscriptions')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    // ─── STUDENT SUBSCRIPTION ROUTE ───────────────────────────────
    {
        key: 'ecmc.student.mysubscription',
        path: `${ECMC_PREFIX_PATH}/student/my-subscription`,
        component: lazy(() => import('@/views/ecmc/student/MySubscription')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },

    // ─── CONTACT SUBMISSIONS (Admin + SuperAdmin) ────────────────
    {
        key: 'ecmc.admin.contact-submissions',
        path: `${ECMC_PREFIX_PATH}/admin/contact-submissions`,
        component: lazy(() => import('@/views/ecmc/admin/ContactSubmissions')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── BLOG MODULE (Admin + SuperAdmin) ─────────────────────────
    {
        key: 'ecmc.blog.list',
        path: `${ECMC_PREFIX_PATH}/blog`,
        component: lazy(() => import('@/views/ecmc/blog/BlogList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.blog.create',
        path: `${ECMC_PREFIX_PATH}/blog/create`,
        component: lazy(() => import('@/views/ecmc/blog/BlogCreate')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.blog.edit',
        path: `${ECMC_PREFIX_PATH}/blog/edit/:id`,
        component: lazy(() => import('@/views/ecmc/blog/BlogEdit')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.blog.categories',
        path: `${ECMC_PREFIX_PATH}/blog-categories`,
        component: lazy(() => import('@/views/ecmc/blog-categories/CategoryList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.blog.tags',
        path: `${ECMC_PREFIX_PATH}/blog-tags`,
        component: lazy(() => import('@/views/ecmc/blog-tags/TagList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.blog.comments',
        path: `${ECMC_PREFIX_PATH}/blog-comments`,
        component: lazy(() => import('@/views/ecmc/blog-comments/CommentList')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── SUPERADMIN ROUTES ────────────────────────────────────────
    {
        key: 'ecmc.superadmin.dashboard',
        path: `${ECMC_PREFIX_PATH}/superadmin/dashboard`,
        component: lazy(() => import('@/views/ecmc/superadmin/Dashboard')),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.superadmin.users',
        path: `${ECMC_PREFIX_PATH}/superadmin/users`,
        component: lazy(() => import('@/views/ecmc/superadmin/UserManagement')),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.superadmin.schools',
        path: `${ECMC_PREFIX_PATH}/superadmin/schools`,
        component: lazy(() =>
            import('@/views/ecmc/superadmin/SchoolManagement'),
        ),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.superadmin.reports',
        path: `${ECMC_PREFIX_PATH}/superadmin/reports`,
        component: lazy(() => import('@/views/ecmc/superadmin/Reports')),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.superadmin.settings',
        path: `${ECMC_PREFIX_PATH}/superadmin/settings`,
        component: lazy(() => import('@/views/ecmc/superadmin/SystemSettings')),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── ADMIN ROUTES ─────────────────────────────────────────────
    {
        key: 'ecmc.admin.dashboard',
        path: `${ECMC_PREFIX_PATH}/admin/dashboard`,
        component: lazy(() => import('@/views/ecmc/admin/Dashboard')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.admin.teachers',
        path: `${ECMC_PREFIX_PATH}/admin/teachers`,
        component: lazy(() => import('@/views/ecmc/admin/Teachers')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.admin.students',
        path: `${ECMC_PREFIX_PATH}/admin/students`,
        component: lazy(() => import('@/views/ecmc/admin/Students')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.admin.parents',
        path: `${ECMC_PREFIX_PATH}/admin/parents`,
        component: lazy(() => import('@/views/ecmc/admin/Parents')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.admin.classes',
        path: `${ECMC_PREFIX_PATH}/admin/classes`,
        component: lazy(() => import('@/views/ecmc/admin/Classes')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.admin.reports',
        path: `${ECMC_PREFIX_PATH}/admin/reports`,
        component: lazy(() => import('@/views/ecmc/admin/Reports')),
        authority: [ADMIN, SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },

    // ─── TEACHER ROUTES ───────────────────────────────────────────
    {
        key: 'ecmc.teacher.dashboard',
        path: `${ECMC_PREFIX_PATH}/teacher/dashboard`,
        component: lazy(() => import('@/views/ecmc/teacher/Dashboard')),
        authority: [TEACHER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.teacher.classes',
        path: `${ECMC_PREFIX_PATH}/teacher/classes`,
        component: lazy(() => import('@/views/ecmc/teacher/MyClasses')),
        authority: [TEACHER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.teacher.assignments',
        path: `${ECMC_PREFIX_PATH}/teacher/assignments`,
        component: lazy(() => import('@/views/ecmc/teacher/Assignments')),
        authority: [TEACHER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.teacher.performance',
        path: `${ECMC_PREFIX_PATH}/teacher/performance`,
        component: lazy(() =>
            import('@/views/ecmc/teacher/StudentPerformance'),
        ),
        authority: [TEACHER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.teacher.attendance',
        path: `${ECMC_PREFIX_PATH}/teacher/attendance`,
        component: lazy(() => import('@/views/ecmc/teacher/Attendance')),
        authority: [TEACHER],
        meta: { pageContainerType: 'contained' },
    },

    // ─── STUDENT ROUTES ───────────────────────────────────────────
    {
        key: 'ecmc.student.dashboard',
        path: `${ECMC_PREFIX_PATH}/student/dashboard`,
        component: lazy(() => import('@/views/ecmc/student/Dashboard')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.courses',
        path: `${ECMC_PREFIX_PATH}/student/courses`,
        component: lazy(() => import('@/views/ecmc/student/MyCourses')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.assignments',
        path: `${ECMC_PREFIX_PATH}/student/assignments`,
        component: lazy(() => import('@/views/ecmc/student/Assignments')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.grades',
        path: `${ECMC_PREFIX_PATH}/student/grades`,
        component: lazy(() => import('@/views/ecmc/student/Grades')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.student.schedule',
        path: `${ECMC_PREFIX_PATH}/student/schedule`,
        component: lazy(() => import('@/views/ecmc/student/Schedule')),
        authority: [STUDENT],
        meta: { pageContainerType: 'contained' },
    },

    // ─── PARENT ROUTES ────────────────────────────────────────────
    {
        key: 'ecmc.parent.dashboard',
        path: `${ECMC_PREFIX_PATH}/parent/dashboard`,
        component: lazy(() => import('@/views/ecmc/parent/Dashboard')),
        authority: [PARENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.parent.children',
        path: `${ECMC_PREFIX_PATH}/parent/children`,
        component: lazy(() => import('@/views/ecmc/parent/MyChildren')),
        authority: [PARENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.parent.attendance',
        path: `${ECMC_PREFIX_PATH}/parent/attendance`,
        component: lazy(() => import('@/views/ecmc/parent/Attendance')),
        authority: [PARENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.parent.grades',
        path: `${ECMC_PREFIX_PATH}/parent/grades`,
        component: lazy(() => import('@/views/ecmc/parent/Grades')),
        authority: [PARENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'ecmc.parent.messages',
        path: `${ECMC_PREFIX_PATH}/parent/messages`,
        component: lazy(() => import('@/views/ecmc/parent/Messages')),
        authority: [PARENT],
        meta: { pageContainerType: 'contained' },
    },
]

export default ecmcRoute
