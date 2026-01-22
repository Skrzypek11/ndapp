"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderIcon, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo, FileText, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface RichTextEditorProps {
    content: string
    onChange: (html: string) => void
    editable?: boolean
}

const TEMPLATES = [
    {
        id: 'surveillance',
        label: 'Surveillance Log',
        description: 'Standard observation log for suspect tracking.',
        content: `<h2>Surveillance Log</h2><p><strong>Target:</strong> [Name]</p><p><strong>Location:</strong> [Address]</p><p><strong>Start Time:</strong> 00:00</p><p><strong>End Time:</strong> 00:00</p><h3>Observations</h3><ul><li>entry 1...</li></ul>`
    },
    {
        id: 'arrest',
        label: 'Arrest Report',
        description: 'For documenting suspect apprehension and rights redaction.',
        content: `<h2>Arrest Report</h2><p><strong>Suspect:</strong> [Name]</p><p><strong>Charges:</strong> [List]</p><h3>Narrative</h3><p>Suspect was apprehended at...</p><h3>Miranda Rights</h3><p>Read at: [Time]</p>`
    },
    {
        id: 'seizure',
        label: 'Seizure Protocol',
        description: 'Chain of custody and itemized list of seized goods.',
        content: `<h2>Seizure Protocol</h2><p><strong>Location:</strong> [Address]</p><h3>Items Seized</h3><ul><li>Item 1 (Qty)</li><li>Item 2 (Qty)</li></ul><h3>Chain of Custody</h3><p>Evidence bagged and tagged by...</p>`
    },
    {
        id: 'incident',
        label: 'Incident Report',
        description: 'General purpose incident documentation.',
        content: `<h2>Incident Report</h2><p><strong>Type:</strong> [Type]</p><p><strong>Involved Parties:</strong> [Names]</p><h3>Description</h3><p>Detailed description of events...</p>`
    }
]

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: 'Enter report details here...',
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 bg-transparent text-foreground/90 font-mono leading-relaxed'
            }
        },
        immediatelyRender: false,
    })

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

                {/* Template Trigger */}
                <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors"
                >
                    <FileText size={14} />
                    Insert Template
                    <ChevronDown size={12} className="opacity-50" />
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                <EditorContent editor={editor} className="h-full" />
            </div>

            {/* Template Modal */}
            <Modal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title="Select Report Template"
            >
                <div className="grid gap-3">
                    {TEMPLATES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => insertTemplate(t.content)}
                            className="text-left p-4 rounded border border-border bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-primary group-hover:text-primary-foreground">{t.label}</span>
                                <FileText size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground">{t.description}</p>
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-red-500 mt-4 text-center uppercase tracking-widest opacity-70">
                    Warning: Inserting a template will overwrite current content.
                </p>
            </Modal>
        </div>
    )
}
