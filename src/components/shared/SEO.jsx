import { Helmet } from 'react-helmet-async'
import { APP_NAME } from '@/constants/app.constant'

const SITE_NAME = APP_NAME
const BASE_URL = 'https://test.store4robo.com'
const DEFAULT_IMAGE = `${BASE_URL}/img/og-default.png`
const DEFAULT_DESC = 'Smart platform for online exams, quizzes and practice sets — for students, teachers and institutions.'

const SEO = ({
    title,
    description = DEFAULT_DESC,
    canonical,
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
    schema,
}) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Online Exam & Practice Platform`
    const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL

    return (
        <Helmet>
            {/* Basic */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={SITE_NAME} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD structured data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    )
}

export default SEO
