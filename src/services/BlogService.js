import ApiService from './ApiService'

// ─── Admin: Blogs ─────────────────────────────────────────────────────────────

export async function apiGetBlogs(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blogs', method: 'get', params })
}

export async function apiGetBlog(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}`, method: 'get' })
}

export async function apiCreateBlog(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blogs', method: 'post', data })
}

export async function apiUpdateBlog(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}`, method: 'put', data })
}

export async function apiUpdateBlogStatus(id, status) {
    return ApiService.fetchDataWithAxios({
        url: `/admin/blogs/${id}/status`,
        method: 'patch',
        data: { status },
    })
}

export async function apiToggleBlogFeatured(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}/featured`, method: 'patch' })
}

export async function apiDeleteBlog(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}`, method: 'delete' })
}

export async function apiRestoreBlog(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}/restore`, method: 'post' })
}

export async function apiForceDeleteBlog(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blogs/${id}/force`, method: 'delete' })
}

// ─── Admin: Categories ────────────────────────────────────────────────────────

export async function apiGetBlogCategories(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blog-categories', method: 'get', params })
}

export async function apiGetBlogCategory(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-categories/${id}`, method: 'get' })
}

export async function apiCreateBlogCategory(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blog-categories', method: 'post', data })
}

export async function apiUpdateBlogCategory(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-categories/${id}`, method: 'put', data })
}

export async function apiDeleteBlogCategory(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-categories/${id}`, method: 'delete' })
}

// ─── Admin: Tags ──────────────────────────────────────────────────────────────

export async function apiGetBlogTags(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blog-tags', method: 'get', params })
}

export async function apiCreateBlogTag(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blog-tags', method: 'post', data })
}

export async function apiUpdateBlogTag(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-tags/${id}`, method: 'put', data })
}

export async function apiDeleteBlogTag(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-tags/${id}`, method: 'delete' })
}

// ─── Admin: Comments ──────────────────────────────────────────────────────────

export async function apiGetBlogComments(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/blog-comments', method: 'get', params })
}

export async function apiUpdateCommentStatus(id, status) {
    return ApiService.fetchDataWithAxios({
        url: `/admin/blog-comments/${id}/status`,
        method: 'patch',
        data: { status },
    })
}

export async function apiBulkUpdateCommentStatus(ids, status) {
    return ApiService.fetchDataWithAxios({
        url: '/admin/blog-comments/bulk-status',
        method: 'post',
        data: { ids, status },
    })
}

export async function apiDeleteComment(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-comments/${id}`, method: 'delete' })
}

// ─── Public Blog ─────────────────────────────────────────────────────────────

export async function apiGetPublicBlogs(params) {
    return ApiService.fetchDataWithAxios({ url: '/v1/blogs', method: 'get', params })
}

export async function apiGetPublicBlog(slug) {
    return ApiService.fetchDataWithAxios({ url: `/v1/blogs/${slug}`, method: 'get' })
}

export async function apiGetPublicBlogCategories() {
    return ApiService.fetchDataWithAxios({ url: '/v1/blog-categories', method: 'get' })
}

export async function apiGetPublicBlogTags() {
    return ApiService.fetchDataWithAxios({ url: '/v1/blog-tags', method: 'get' })
}

export async function apiGetBlogCommentsBySlug(slug, params) {
    return ApiService.fetchDataWithAxios({ url: `/v1/blogs/${slug}/comments`, method: 'get', params })
}

export async function apiGetRelatedBlogs(slug) {
    return ApiService.fetchDataWithAxios({ url: `/v1/blogs/${slug}/related`, method: 'get' })
}

export async function apiPostBlogComment(slug, data) {
    return ApiService.fetchDataWithAxios({ url: `/v1/blogs/${slug}/comments`, method: 'post', data })
}

export async function apiGetBlogComment(id) {
    return ApiService.fetchDataWithAxios({ url: `/admin/blog-comments/${id}`, method: 'get' })
}
