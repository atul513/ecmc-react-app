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
