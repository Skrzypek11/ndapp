import React from "react"
import { LucideIcon } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
    size?: "sm" | "md" | "lg" | "icon"
    icon?: LucideIcon
    isLoading?: boolean
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    icon: Icon,
    isLoading,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded transition-all font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-primary text-primary hover:bg-primary/5",
        ghost: "hover:bg-primary/10 text-primary/80 hover:text-primary",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90"
    }

    const sizes = {
        sm: "h-[32px] px-3 text-small",
        md: "h-[36px] px-4 text-small",
        lg: "h-[40px] px-6 text-body",
        icon: "h-[36px] w-[36px] p-2"
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin mr-2">⏳</span>
            ) : Icon ? (
                <Icon size={size === 'sm' ? 14 : 16} className={children ? "mr-2" : ""} />
            ) : null}
            {children}
        </button>
    )
}
