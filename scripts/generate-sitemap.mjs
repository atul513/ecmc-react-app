import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'public', 'sitemap.xml')

const SITE_URL = process.env.SITEMAP_SITE_URL || 'https://test.store4robo.com'
const cleanSiteUrl = SITE_URL.replace(/\/+$/, '')
const today = new Date().toISOString().slice(0, 10)

const routeFiles = [
    path.join(projectRoot, 'src', 'configs', 'routes.config', 'authRoute.js'),
    path.join(projectRoot, 'src', 'configs', 'routes.config', 'othersRoute.js'),
    path.join(projectRoot, 'src', 'configs', 'routes.config', 'routes.config.js'),
    path.join(projectRoot, 'src', 'configs', 'routes.config', 'ecmcRoute.js'),
]

const constantValues = {
    ECMC_PREFIX_PATH: '/app',
    ROOT: '/',
}

const EXCLUDED_PATHS = new Set([
    '/access-denied',
    '/auth/google/callback',
])

function isParameterized(pathname) {
    return pathname.includes(':')
}

function escapeXml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}

function getPriority(pathname) {
    if (pathname === '/landing') return '1.0'
    if (['/home', '/exams', '/practice-sets', '/explore', '/blogs'].includes(pathname)) return '0.9'
    if (['/pricing', '/about', '/contact', '/faq'].includes(pathname)) return '0.8'
    if (pathname.startsWith('/app/')) return '0.6'
    if (pathname.startsWith('/sign') || pathname.includes('password') || pathname.includes('otp')) return '0.4'
    return '0.5'
}

function getChangefreq(pathname) {
    if (pathname === '/landing') return 'weekly'
    if (['/home', '/exams', '/practice-sets', '/explore', '/blogs'].includes(pathname)) return 'daily'
    if (['/pricing', '/about', '/contact', '/faq'].includes(pathname)) return 'weekly'
    if (pathname.startsWith('/app/')) return 'weekly'
    if (pathname === '/terms' || pathname === '/privacy' || pathname.includes('policy')) return 'yearly'
    return 'monthly'
}

function normalizePath(rawPath) {
    let pathname = rawPath.trim()

    for (const [key, value] of Object.entries(constantValues)) {
        pathname = pathname.replaceAll(`\${${key}}`, value)
        pathname = pathname.replaceAll(`\${${key}}`, value)
        pathname = pathname.replaceAll(`\$\{${key}\}`, value)
    }

    pathname = pathname.replaceAll('//', '/')

    return pathname
}

async function collectPathsFromFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const matches = content.matchAll(/path:\s*(?:`([^`]+)`|'([^']+)'|"([^"]+)")/g)

    return Array.from(matches, (match) => {
        const rawPath = match[1] || match[2] || match[3] || ''
        return normalizePath(rawPath)
    })
}

const allPaths = (
    await Promise.all(routeFiles.map((filePath) => collectPathsFromFile(filePath)))
).flat()

const urls = Array.from(
    new Set(
        allPaths
            .filter(Boolean)
            .filter((pathname) => pathname.startsWith('/'))
            .filter((pathname) => !isParameterized(pathname))
            .filter((pathname) => !EXCLUDED_PATHS.has(pathname)),
    ),
).sort((a, b) => a.localeCompare(b))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map((pathname) => `  <url>
    <loc>${escapeXml(`${cleanSiteUrl}${pathname}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getChangefreq(pathname)}</changefreq>
    <priority>${getPriority(pathname)}</priority>
  </url>`)
    .join('\n')}
</urlset>
`

await fs.writeFile(outputPath, xml, 'utf8')

console.log(`Generated sitemap with ${urls.length} URLs at ${outputPath}`)
