"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderIcon, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo, FileText, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { getTemplates } from '@/app/actions/templates'
import { useTranslation } from "@/lib/i18n"

interface RichTextEditorProps {
    content: string
    onChange: (html: string) => void
    editable?: boolean
    placeholder?: string
    minHeight?: string
    templateCategory?: 'REPORT' | 'CASE' | 'KOMPENDIUM'
}

export default function RichTextEditor({ content, onChange, editable = true, placeholder = 'Enter content...', minHeight = '300px', templateCategory }: RichTextEditorProps) {
    const { dict } = useTranslation()
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [templates, setTemplates] = useState<any[]>([])

    useEffect(() => {
        if (templateCategory && isTemplateModalOpen) {
            getTemplates(templateCategory).then(setTemplates)
        }
    }, [templateCategory, isTemplateModalOpen])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: placeholder,
            }),
        ],
        content: content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[${minHeight}] p-4 bg-transparent text-foreground/90 font-mono leading-relaxed`
            }
        },
        immediatelyRender: false,
    })

    // Update content if it changes externally (e.g. loading initial data)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if content is different to avoid cursor jumps or loops
            // A simple check might not be enough if HTML formatting changes slightly, but for initial load it's fine.
            // Better: only set content if editor is empty or specifically reset.
            // For now, let's rely on the initial content passed to useEditor, but that only works once.
            // If we are editing, content prop might update after fetch.
            if (editor.isEmpty && content) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    const insertTemplate = (templateContent: string) => {
        if (editor) {
            editor.commands.setContent(templateContent)
            setIsTemplateModalOpen(false)
        }
    }

    if (!editor) return null

    if (!editable) {
        return <div className="prose prose-sm dark:prose-invert max-w-none p-4 font-mono leading-relaxed opacity-90" dangerouslySetInnerHTML={{ __html: content }} />
    }

    const ToolbarButton = ({ onClick, isActive, Icon, label }: any) => (
        <button
            onClick={onClick}
            className={`p-1.5 rounded transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
            title={label}
            type="button"
        >
            <Icon size={16} />
        </button>
    )

    return (
        <div className="flex flex-col h-full border border-border rounded bg-card/30 backdrop-blur-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-card/60 overflow-x-auto">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} Icon={Bold} label="Bold" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} Icon={Italic} label="Italic" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} Icon={UnderIcon} label="Underline" />

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} Icon={Heading1} label="Heading 1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} Icon={Heading2} label="Heading 2" />

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} Icon={List} label="Bullet List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} Icon={ListOrdered} label="Ordered List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} Icon={Quote} label="Quote" />

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} Icon={Undo} label="Undo" />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} Icon={Redo} label="Redo" />

                <div className="flex-1" />

                {templateCategory && (
                    <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors"
                    >
                        <FileText size={14} />
                        {dict.admin.templates.insert}
                        <ChevronDown size={12} className="opacity-50" />
                    </button>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                <EditorContent editor={editor} className="h-full" />
            </div>

            {/* Template Modal */}
            <Modal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title={dict.admin.templates.insert}
            >
                <div className="grid gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {templates.length > 0 ? templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => insertTemplate(t.content)}
                            className="text-left p-4 rounded border border-border bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-primary group-hover:text-primary-foreground">{t.name}</span>
                                <FileText size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                        </button>
                    )) : <p className="text-center text-muted-foreground p-4 italic">{dict.admin.templates.no_templates}</p>}
                </div>
                <p className="text-[10px] text-red-500 mt-4 text-center uppercase tracking-widest opacity-70">
                    {dict.admin.templates.warning}
                </p>
            </Modal>
        </div>
    )
}
