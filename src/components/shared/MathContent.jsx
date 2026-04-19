import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ─── Auto-render for delimited math ($...$, $$...$$, \(...\), \[...\]) ─────────
let _renderMathInElement = null
const getAutoRender = async () => {
    if (!_renderMathInElement) {
        const m = await import('katex/dist/contrib/auto-render')
        _renderMathInElement = m.default
    }
    return _renderMathInElement
}

const DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
]

// ─── Detect raw LaTeX (no $ delimiters, but contains LaTeX commands) ──────────
const RAW_LATEX_RE = /\\(?:frac|sqrt|int|sum|prod|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|partial|nabla|cdot|times|div|pm|mp|leq|geq|neq|approx|sim|equiv|text|mathrm|mathbf|vec|hat|bar|dot|overline|underline|left|right|begin|end|forall|exists|cup|cap|subset|supset|mathbb|binom|pmatrix|vmatrix|cases)/

const isRawLatex = (html) => {
    if (!html) return false
    // Strip HTML tags to get raw text
    const text = html.replace(/<[^>]+>/g, '').trim()
    // Already has delimiters → let auto-render handle it
    if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) return false
    return RAW_LATEX_RE.test(text)
}

// ─── Render raw LaTeX as inline KaTeX HTML ────────────────────────────────────
const renderRawLatex = (html) => {
    const text = html.replace(/<[^>]+>/g, '').trim()
    try {
        return katex.renderToString(text, { throwOnError: false, displayMode: false, output: 'html' })
    } catch {
        return html
    }
}

/**
 * Renders an HTML string with math support.
 * - Raw LaTeX (no delimiters): rendered directly via katex.renderToString
 * - Delimited math ($...$, $$...$$, \(...\), \[...\]): rendered via KaTeX auto-render
 * - Plain HTML: rendered as-is
 */
const MathContent = ({ html, className = '', as: Tag = 'span' }) => {
    const ref = useRef(null)
    const raw = isRawLatex(html)

    useEffect(() => {
        if (raw || !ref.current || !html) return
        let cancelled = false
        getAutoRender().then((render) => {
            if (cancelled || !ref.current) return
            try {
                render(ref.current, { delimiters: DELIMITERS, throwOnError: false })
            } catch (_) { /* ignore */ }
        })
        return () => { cancelled = true }
    }, [html, raw])

    if (raw) {
        return (
            <Tag
                className={className}
                dangerouslySetInnerHTML={{ __html: renderRawLatex(html) }}
            />
        )
    }

    return (
        <Tag
            ref={ref}
            className={className}
            dangerouslySetInnerHTML={{ __html: html || '' }}
        />
    )
}

export default MathContent
