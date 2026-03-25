import { useEffect, useCallback } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mathematics from '@tiptap/extension-mathematics'
import Image from '@tiptap/extension-image'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Placeholder from '@tiptap/extension-placeholder'
import 'katex/dist/katex.min.css'
import classNames from '@/utils/classNames'
import { apiUploadImage } from '@/services/MediaService'
import {
    TbBold, TbItalic, TbList, TbListNumbers, TbMath, TbCode,
    TbArrowBackUp, TbArrowForwardUp, TbSubscript, TbSuperscript,
    TbPhoto,
} from 'react-icons/tb'

const ToolBtn = ({ onClick, active, title, children, disabled }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={classNames(
            'p-1.5 rounded text-sm transition-colors',
            active
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
            disabled && 'opacity-40 cursor-not-allowed',
        )}
    >
        {children}
    </button>
)

const uploadImageFile = async (file) => {
    try {
        const res = await apiUploadImage(file)
        // API should return { url: '...' } or { data: { url: '...' } }
        return res?.url || res?.data?.url || null
    } catch {
        return null
    }
}

const MathRichTextEditor = ({ content = '', onChange, invalid, placeholder: placeholderText, compact = false }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Mathematics,
            Superscript,
            Subscript,
            Image.configure({ inline: true, allowBase64: true }),
            Placeholder.configure({
                placeholder: placeholderText || 'Type here... Use $math$ for inline or $$math$$ for display formulas',
            }),
        ],
        editorProps: {
            attributes: {
                class: classNames(
                    'm-2 focus:outline-none',
                    compact ? 'min-h-[48px]' : 'min-h-[80px]',
                ),
            },
            handlePaste(view, event) {
                const items = Array.from(event.clipboardData?.items || [])
                const imageItem = items.find((i) => i.type.startsWith('image/'))
                if (!imageItem) return false

                event.preventDefault()
                const file = imageItem.getAsFile()
                if (!file) return true

                // Insert base64 immediately as preview, then replace with uploaded URL
                const reader = new FileReader()
                reader.onload = async (e) => {
                    const base64 = e.target?.result
                    // Insert base64 preview
                    view.dispatch(
                        view.state.tr.replaceSelectionWith(
                            view.state.schema.nodes.image.create({ src: base64 })
                        )
                    )

                    // Upload to server and replace base64 with real URL
                    const url = await uploadImageFile(file)
                    if (url) {
                        // Find and replace the base64 node with the real URL
                        const { state, dispatch } = view
                        const { doc, tr } = state
                        doc.descendants((node, pos) => {
                            if (node.type.name === 'image' && node.attrs.src === base64) {
                                dispatch(tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url }))
                                return false
                            }
                        })
                    }
                }
                reader.readAsDataURL(file)
                return true
            },
            handleDrop(view, event, slice, moved) {
                if (moved) return false
                const files = Array.from(event.dataTransfer?.files || [])
                const imageFile = files.find((f) => f.type.startsWith('image/'))
                if (!imageFile) return false

                event.preventDefault()
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

                uploadImageFile(imageFile).then((url) => {
                    if (!url) return
                    const node = schema.nodes.image.create({ src: url })
                    const transaction = view.state.tr.insert(coordinates?.pos || 0, node)
                    view.dispatch(transaction)
                })
                return true
            },
        },
        content,
        onUpdate({ editor }) {
            onChange?.({
                text: editor.getText(),
                html: editor.getHTML(),
            })
        },
    })

    // Sync external content changes (edit mode load)
    useEffect(() => {
        if (!editor || !content) return
        if (editor.getHTML() !== content) {
            editor.commands.setContent(content, false)
        }
    }, [content, editor])

    const insertImageFromUrl = useCallback(() => {
        const url = window.prompt('Image URL:')
        if (url) editor?.chain().focus().setImage({ src: url }).run()
    }, [editor])

    const triggerImageUpload = useCallback(() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
            const file = e.target.files?.[0]
            if (!file || !editor) return
            const url = await uploadImageFile(file)
            if (url) {
                editor.chain().focus().setImage({ src: url }).run()
            } else {
                // Fallback: base64
                const reader = new FileReader()
                reader.onload = (ev) => {
                    editor.chain().focus().setImage({ src: ev.target.result }).run()
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }, [editor])

    if (!editor) return null

    return (
        <div
            className={classNames(
                'rounded-xl ring-1 border bg-white dark:bg-gray-800',
                invalid
                    ? 'ring-red-400 border-red-400'
                    : editor.isFocused
                    ? 'ring-primary border-primary'
                    : 'ring-gray-200 border-gray-200 dark:ring-gray-600 dark:border-gray-600',
            )}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap gap-0.5 px-2 pt-2 pb-1 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
                <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <TbBold />
                </ToolBtn>
                <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <TbItalic />
                </ToolBtn>
                <ToolBtn title="Superscript (e.g. x²)" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                    <TbSuperscript />
                </ToolBtn>
                <ToolBtn title="Subscript (e.g. H₂O)" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
                    <TbSubscript />
                </ToolBtn>

                {!compact && (
                    <>
                        <ToolBtn title="Inline Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                            <TbCode />
                        </ToolBtn>
                        <ToolBtn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                            <TbList />
                        </ToolBtn>
                        <ToolBtn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                            <TbListNumbers />
                        </ToolBtn>
                    </>
                )}

                <div className="w-px bg-gray-200 dark:bg-gray-600 mx-1" />

                {/* Math buttons */}
                <ToolBtn
                    title="Insert Inline Math ($...$)"
                    onClick={() => editor.chain().focus().insertContent('$x^2$').run()}
                >
                    <TbMath />
                </ToolBtn>
                <ToolBtn
                    title="Insert Display Math ($$...$$)"
                    onClick={() => editor.chain().focus().insertContent('$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$').run()}
                >
                    <span className="text-xs font-bold px-0.5">∑</span>
                </ToolBtn>

                <div className="w-px bg-gray-200 dark:bg-gray-600 mx-1" />

                {/* Image */}
                <ToolBtn title="Upload Image (or paste/drop)" onClick={triggerImageUpload}>
                    <TbPhoto />
                </ToolBtn>

                <div className="w-px bg-gray-200 dark:bg-gray-600 mx-1" />

                <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
                    <TbArrowBackUp />
                </ToolBtn>
                <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
                    <TbArrowForwardUp />
                </ToolBtn>

                <span className="ml-auto self-center text-xs text-gray-400 hidden md:block">
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">$x^2$</code> inline · <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">$$...$$</code> block · paste image
                </span>
            </div>

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className={classNames(
                    'px-2 py-1 prose prose-sm dark:prose-invert max-w-full overflow-auto',
                    compact ? 'min-h-[48px] max-h-[200px]' : 'min-h-[100px] max-h-[500px]',
                )}
            />
        </div>
    )
}

export default MathRichTextEditor
