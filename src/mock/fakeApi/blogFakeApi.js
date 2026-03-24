import { mock } from '../MockAdapter'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const categories = [
    { id: 1, name: 'Announcements', slug: 'announcements', description: 'School announcements', parent_id: null, parent: null, blogs_count: 3 },
    { id: 2, name: 'Events', slug: 'events', description: 'School events', parent_id: null, parent: null, blogs_count: 5 },
    { id: 3, name: 'Academic', slug: 'academic', description: 'Academic topics', parent_id: null, parent: null, blogs_count: 2 },
]

const tags = [
    { id: 1, name: 'Important', slug: 'important', blogs_count: 4 },
    { id: 2, name: 'Sports', slug: 'sports', blogs_count: 2 },
    { id: 3, name: 'Exam', slug: 'exam', blogs_count: 3 },
    { id: 4, name: 'Holiday', slug: 'holiday', blogs_count: 1 },
]

const blogs = [
    {
        id: 1,
        title: 'Welcome Back to School',
        slug: 'welcome-back-to-school',
        excerpt: 'We are excited to welcome all students back for the new academic year.',
        content: '<p>We are excited to welcome all students back for the new academic year. This semester promises to be full of learning and growth.</p>',
        status: 'published',
        is_featured: true,
        is_comments_enabled: true,
        featured_image: '/img/blog/post-1.jpg',
        published_at: '2024-09-01T08:00:00Z',
        created_at: '2024-08-28T10:00:00Z',
        deleted_at: null,
        category: categories[0],
        tags: [tags[0]],
        author: { id: 1, name: 'School Admin' },
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
    },
    {
        id: 2,
        title: 'Annual Sports Day 2024',
        slug: 'annual-sports-day-2024',
        excerpt: 'Join us for a day of exciting sports competitions and team activities.',
        content: '<p>Our annual sports day will be held on the school grounds. All students are encouraged to participate.</p>',
        status: 'published',
        is_featured: false,
        is_comments_enabled: true,
        featured_image: '/img/blog/post-2.jpg',
        published_at: '2024-09-15T09:00:00Z',
        created_at: '2024-09-10T10:00:00Z',
        deleted_at: null,
        category: categories[1],
        tags: [tags[1]],
        author: { id: 1, name: 'School Admin' },
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
    },
    {
        id: 3,
        title: 'Mid-Term Exam Schedule',
        slug: 'mid-term-exam-schedule',
        excerpt: 'Find the complete schedule for mid-term examinations.',
        content: '<p>The mid-term examination schedule has been released. Please review your timetable carefully.</p>',
        status: 'draft',
        is_featured: false,
        is_comments_enabled: false,
        featured_image: '',
        published_at: null,
        created_at: '2024-09-20T10:00:00Z',
        deleted_at: null,
        category: categories[2],
        tags: [tags[2]],
        author: { id: 1, name: 'School Admin' },
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
    },
    {
        id: 4,
        title: 'Holiday Notice - Diwali Break',
        slug: 'holiday-notice-diwali-break',
        excerpt: 'School will remain closed during the Diwali holiday period.',
        content: '<p>The school will be closed from October 28 to November 5 for the Diwali celebrations.</p>',
        status: 'scheduled',
        is_featured: false,
        is_comments_enabled: true,
        featured_image: '',
        published_at: '2024-10-25T07:00:00Z',
        created_at: '2024-10-20T10:00:00Z',
        deleted_at: null,
        category: categories[0],
        tags: [tags[0], tags[3]],
        author: { id: 1, name: 'School Admin' },
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
    },
]

const comments = [
    {
        id: 1,
        content: 'Great post! Very informative.',
        status: 'approved',
        author_name: 'Jane Student',
        author_email: 'student@ecmc.com',
        created_at: '2024-09-02T09:00:00Z',
        blog: { id: 1, title: 'Welcome Back to School' },
    },
    {
        id: 2,
        content: 'When will the sports day registration open?',
        status: 'pending',
        author_name: 'Bob Parent',
        author_email: 'parent@ecmc.com',
        created_at: '2024-09-16T11:00:00Z',
        blog: { id: 2, title: 'Annual Sports Day 2024' },
    },
    {
        id: 3,
        content: 'Buy cheap stuff at spam-site.com!!!',
        status: 'spam',
        author_name: 'Spammer',
        author_email: 'spam@spam.com',
        created_at: '2024-09-17T14:00:00Z',
        blog: { id: 1, title: 'Welcome Back to School' },
    },
]

// Utility: paginate array
const paginate = (arr, page = 1, perPage = 10) => {
    const start = (page - 1) * perPage
    return {
        data: arr.slice(start, start + perPage),
        total: arr.length,
        current_page: page,
        per_page: perPage,
    }
}

// ─── Blog Handlers ────────────────────────────────────────────────────────────

mock.onGet('/admin/blogs').reply((config) => {
    const params = config.params || {}
    let result = [...blogs]
    if (params.status) result = result.filter((b) => b.status === params.status)
    if (params.trashed === '1') result = result.filter((b) => b.deleted_at)
    else result = result.filter((b) => !b.deleted_at)
    if (params.search) result = result.filter((b) => b.title.toLowerCase().includes(params.search.toLowerCase()))
    return [200, { data: paginate(result, params.page, params.per_page) }]
})

mock.onGet(/\/admin\/blogs\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const blog = blogs.find((b) => b.id === id)
    if (!blog) return [404, { message: 'Blog not found' }]
    return [200, { data: blog }]
})

mock.onPost('/admin/blogs').reply((config) => {
    const data = JSON.parse(config.data)
    const newBlog = { ...data, id: blogs.length + 1, created_at: new Date().toISOString(), deleted_at: null }
    blogs.push(newBlog)
    return [201, { data: newBlog }]
})

mock.onPut(/\/admin\/blogs\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const data = JSON.parse(config.data)
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return [404, { message: 'Blog not found' }]
    blogs[idx] = { ...blogs[idx], ...data }
    return [200, { data: blogs[idx] }]
})

mock.onPatch(/\/admin\/blogs\/\d+\/status/).reply((config) => {
    const parts = config.url.split('/')
    const id = parseInt(parts[parts.length - 2])
    const data = JSON.parse(config.data)
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return [404, { message: 'Blog not found' }]
    blogs[idx].status = data.status
    return [200, { data: blogs[idx] }]
})

mock.onPatch(/\/admin\/blogs\/\d+\/featured/).reply((config) => {
    const parts = config.url.split('/')
    const id = parseInt(parts[parts.length - 2])
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return [404, { message: 'Blog not found' }]
    blogs[idx].is_featured = !blogs[idx].is_featured
    return [200, { data: blogs[idx] }]
})

mock.onDelete(/\/admin\/blogs\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return [404, { message: 'Blog not found' }]
    blogs[idx].deleted_at = new Date().toISOString()
    return [200, { message: 'Blog moved to trash' }]
})

mock.onPost(/\/admin\/blogs\/\d+\/restore/).reply((config) => {
    const parts = config.url.split('/')
    const id = parseInt(parts[parts.length - 2])
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return [404, { message: 'Blog not found' }]
    blogs[idx].deleted_at = null
    return [200, { data: blogs[idx] }]
})

mock.onDelete(/\/admin\/blogs\/\d+\/force/).reply((config) => {
    const parts = config.url.split('/')
    const id = parseInt(parts[parts.length - 3])
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx !== -1) blogs.splice(idx, 1)
    return [200, { message: 'Blog permanently deleted' }]
})

// ─── Category Handlers ────────────────────────────────────────────────────────

mock.onGet('/admin/blog-categories').reply((config) => {
    const params = config.params || {}
    let result = [...categories]
    if (params.search) result = result.filter((c) => c.name.toLowerCase().includes(params.search.toLowerCase()))
    return [200, { data: paginate(result, params.page, params.per_page) }]
})

mock.onGet(/\/admin\/blog-categories\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const cat = categories.find((c) => c.id === id)
    if (!cat) return [404, { message: 'Category not found' }]
    return [200, { data: cat }]
})

mock.onPost('/admin/blog-categories').reply((config) => {
    const data = JSON.parse(config.data)
    const newCat = { ...data, id: categories.length + 1, blogs_count: 0 }
    categories.push(newCat)
    return [201, { data: newCat }]
})

mock.onPut(/\/admin\/blog-categories\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const data = JSON.parse(config.data)
    const idx = categories.findIndex((c) => c.id === id)
    if (idx === -1) return [404, { message: 'Category not found' }]
    categories[idx] = { ...categories[idx], ...data }
    return [200, { data: categories[idx] }]
})

mock.onDelete(/\/admin\/blog-categories\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const idx = categories.findIndex((c) => c.id === id)
    if (idx !== -1) categories.splice(idx, 1)
    return [200, { message: 'Category deleted' }]
})

// ─── Tag Handlers ─────────────────────────────────────────────────────────────

mock.onGet('/admin/blog-tags').reply((config) => {
    const params = config.params || {}
    let result = [...tags]
    if (params.search) result = result.filter((t) => t.name.toLowerCase().includes(params.search.toLowerCase()))
    return [200, { data: paginate(result, params.page, params.per_page) }]
})

mock.onPost('/admin/blog-tags').reply((config) => {
    const data = JSON.parse(config.data)
    const newTag = { ...data, id: tags.length + 1, blogs_count: 0 }
    tags.push(newTag)
    return [201, { data: newTag }]
})

mock.onPut(/\/admin\/blog-tags\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const data = JSON.parse(config.data)
    const idx = tags.findIndex((t) => t.id === id)
    if (idx === -1) return [404, { message: 'Tag not found' }]
    tags[idx] = { ...tags[idx], ...data }
    return [200, { data: tags[idx] }]
})

mock.onDelete(/\/admin\/blog-tags\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const idx = tags.findIndex((t) => t.id === id)
    if (idx !== -1) tags.splice(idx, 1)
    return [200, { message: 'Tag deleted' }]
})

// ─── Comment Handlers ─────────────────────────────────────────────────────────

mock.onGet('/admin/blog-comments').reply((config) => {
    const params = config.params || {}
    let result = [...comments]
    if (params.status) result = result.filter((c) => c.status === params.status)
    if (params.search) result = result.filter((c) => c.content.toLowerCase().includes(params.search.toLowerCase()))
    return [200, { data: paginate(result, params.page, params.per_page) }]
})

mock.onPatch(/\/admin\/blog-comments\/\d+\/status/).reply((config) => {
    const parts = config.url.split('/')
    const id = parseInt(parts[parts.length - 2])
    const data = JSON.parse(config.data)
    const idx = comments.findIndex((c) => c.id === id)
    if (idx === -1) return [404, { message: 'Comment not found' }]
    comments[idx].status = data.status
    return [200, { data: comments[idx] }]
})

mock.onPost('/admin/blog-comments/bulk-status').reply((config) => {
    const data = JSON.parse(config.data)
    const { ids, status } = data
    ids.forEach((id) => {
        const idx = comments.findIndex((c) => c.id === id)
        if (idx !== -1) comments[idx].status = status
    })
    return [200, { message: 'Bulk status updated' }]
})

mock.onDelete(/\/admin\/blog-comments\/\d+$/).reply((config) => {
    const id = parseInt(config.url.split('/').pop())
    const idx = comments.findIndex((c) => c.id === id)
    if (idx !== -1) comments.splice(idx, 1)
    return [200, { message: 'Comment deleted' }]
})
