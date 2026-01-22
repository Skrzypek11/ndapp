import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function Input({ label, error, className = "", ...props }: InputProps) {
    return (
        <div className="w-full space-y-1">
            {label && (
                <label className="block text-small font-medium uppercase text-muted-foreground tracking-wide ml-1">
                    {label}
                </label>
            )}
            <input
                className={`flex h-[36px] w-full rounded border border-border bg-background/50 px-3 py-2 text-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''} ${className}`}
                {...props}
            />
            {error && (
                <span className="text-small text-destructive mt-1">{error}</span>
            )}
        </div>
    )
}
