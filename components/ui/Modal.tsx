"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative z-50 w-full max-w-lg bg-card border border-border rounded-md shadow-2xl scale-100 opacity-100 transition-all overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <h2 className="text-small font-semibold uppercase tracking-wider text-primary">{title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
