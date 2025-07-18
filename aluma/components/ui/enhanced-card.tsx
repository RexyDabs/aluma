import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        ghost: "border-transparent shadow-none",
        outline: "border-border bg-transparent",
        elevated: "shadow-lg hover:shadow-xl",
        interactive:
          "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    size: {
      default: "pb-4",
      sm: "pb-3",
      lg: "pb-6",
      xl: "pb-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const cardContentVariants = cva("", {
  variants: {
    size: {
      default: "",
      sm: "text-sm",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const cardFooterVariants = cva("flex items-center", {
  variants: {
    size: {
      default: "pt-4",
      sm: "pt-3",
      lg: "pt-6",
      xl: "pt-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardHeaderVariants({ size, className }))}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardContentVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardContentVariants({ size, className }))}
    {...props}
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardFooterVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardFooterVariants({ size, className }))}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
};
