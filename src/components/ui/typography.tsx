import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
    variants: {
        variant: {
            h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
            h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight",
            h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
            h4: "scroll-m-20 text-xl font-semibold tracking-tight",
            h5: "scroll-m-20 text-lg font-semibold tracking-tight",
            h6: "scroll-m-20 text-base font-semibold tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6",
            blockquote: "mt-6 border-l-2 pl-6 italic",
            list: "my-6 ml-6 list-disc [&>li]:mt-2",
            inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
            lead: "text-xl text-muted-foreground",
            large: "text-lg font-semibold",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground",
        },
    },
    defaultVariants: {
        variant: "p",
    },
})

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
    as?: React.ElementType
}

// Individual components for each variant
export const Typography = React.forwardRef<any, TypographyProps>(
    ({ className, variant, as, children, ...props }, ref) => {
        const baseClasses = cn(typographyVariants({ variant }), className);

        if (variant === "h1") {
            return <h1 className={baseClasses} ref={ref as any} {...props}>{children}</h1>;
        }
        if (variant === "h2") {
            return <h2 className={baseClasses} ref={ref as any} {...props}>{children}</h2>;
        }
        if (variant === "h3") {
            return <h3 className={baseClasses} ref={ref as any} {...props}>{children}</h3>;
        }
        if (variant === "h4") {
            return <h4 className={baseClasses} ref={ref as any} {...props}>{children}</h4>;
        }
        if (variant === "h5") {
            return <h5 className={baseClasses} ref={ref as any} {...props}>{children}</h5>;
        }
        if (variant === "h6") {
            return <h6 className={baseClasses} ref={ref as any} {...props}>{children}</h6>;
        }
        if (variant === "inlineCode") {
            return <code className={baseClasses} ref={ref as any} {...props}>{children}</code>;
        }
        if (variant === "blockquote") {
            return <blockquote className={baseClasses} ref={ref as any} {...props}>{children}</blockquote>;
        }
        if (variant === "list") {
            return <ul className={baseClasses} ref={ref as any} {...props}>{children}</ul>;
        }
        if (variant === "lead") {
            return <p className={baseClasses} ref={ref as any} {...props}>{children}</p>;
        }
        if (variant === "large") {
            return <p className={baseClasses} ref={ref as any} {...props}>{children}</p>;
        }
        if (variant === "small") {
            return <small className={baseClasses} ref={ref as any} {...props}>{children}</small>;
        }
        if (variant === "muted") {
            return <p className={baseClasses} ref={ref as any} {...props}>{children}</p>;
        }

        // Default to p tag
        return <p className={baseClasses} ref={ref as any} {...props}>{children}</p>;
    }
)
Typography.displayName = "Typography"

export { typographyVariants }
