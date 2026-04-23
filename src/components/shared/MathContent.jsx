import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ─── LaTeX commands we auto-detect when there are no delimiters ──────────────
const RAW_LATEX_RE = /\\(?:frac|sqrt|int|sum|prod|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|partial|nabla|cdot|times|div|pm|mp|leq|geq|neq|approx|sim|equiv|text|mathrm|mathbf|vec|hat|bar|dot|overline|underline|left|right|begin|end|forall|exists|cup|cap|subset|supset|mathbb|binom|pmatrix|vmatrix|cases)/

// ─── Render a single LaTeX expression to HTML ────────────────────────────────
const renderTex = (tex, displayMode) => {
    try {
        return katex.renderToString(tex, {
            throwOnError: false,
            displayMode,
            output: 'html',
        })
    } catch {
        return tex
    }
}

// ─── Process a string: replace $$..$$, $..$, \(..\), \[..\] with KaTeX HTML ──
// Works on text content — we only apply it to text nodes, not inside HTML tags.
const processMath = (str) => {
    if (!str) return str
    // Order matters: match longest/most specific delimiters first.
    // $$...$$ (display)
    let out = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => renderTex(tex, true))
    // \[...\] (display)
    out = out.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => renderTex(tex, true))
    // \(...\) (inline)
    out = out.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => renderTex(tex, false))
    // $...$ (inline) — avoid matching across $$ which we already replaced,
    // and don't match lone $ signs (require no whitespace next to delimiters).
    out = out.replace(/(?<![\\$])\$(?!\s)([^\n$]+?)(?<!\s)\$(?!\d)/g, (_, tex) =>
        renderTex(tex, false)
    )
    return out
}

// ─── Walk an HTML string and apply math processing only to text segments ─────
// We can do this with a simple DOM parse. Since we're in a browser env.
const processHtmlWithMath = (html) => {
    if (!html) return ''

    // If the whole string is raw LaTeX (no HTML tags, no $ delimiters, has commands)
    const stripped = html.replace(/<[^>]+>/g, '').trim()
    const hasDelims = /\$|\\\(|\\\[/.test(stripped)
    const hasRawLatex = RAW_LATEX_RE.test(stripped)

    if (!hasDelims && hasRawLatex) {
        // Treat the entire stripped text as a single LaTeX expression
        return renderTex(stripped, false)
    }

    if (!hasDelims) {
        // No math at all — return as-is
        return html
    }

    // Parse as HTML and walk text nodes, replacing math in each
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
        const root = doc.body.firstChild

        const walk = (node) => {
            // Skip KaTeX-rendered nodes (already processed)
            if (
                node.nodeType === 1 &&
                (node.classList?.contains('katex') ||
                    node.classList?.contains('katex-display'))
            ) {
                return
            }
            if (node.nodeType === 3) {
                // Text node
                const text = node.textContent || ''
                if (/\$|\\\(|\\\[/.test(text)) {
                    const replaced = processMath(text)
                    if (replaced !== text) {
                        const span = doc.createElement('span')
                        span.innerHTML = replaced
                        node.parentNode.replaceChild(span, node)
                    }
                }
                return
            }
            // Element — walk children (snapshot list since we may mutate)
            if (node.childNodes) {
                Array.from(node.childNodes).forEach(walk)
            }
        }
        walk(root)
        return root.innerHTML
    } catch {
        // Fallback: just process the string as-is (may double-render HTML)
        return processMath(html)
    }
}

/**
 * Renders an HTML string with inline math support.
 * Supports: $$...$$ (display), $...$ (inline), \(...\), \[...\]
 * Also handles raw LaTeX strings without delimiters (e.g. "\frac{a}{b}").
 *
 * Math is rendered synchronously via katex.renderToString, so the output
 * is stable and unaffected by React re-renders.
 */
const MathContent = ({ html, className = '', as: Tag = 'div' }) => {
    const rendered = useMemo(() => processHtmlWithMath(html), [html])

    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    )
}

export default MathContent
