import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@serva/ui/lib/utils";

const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "border-primary text-primary bg-primary-1 [a]:hover:bg-primary-2",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-muted",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // default:
        //   "bg-primary/10 text-primary dark:bg-primary/60 dark:text-primary-foreground [a]:hover:bg-primary/80",
        // secondary:
        //   "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        // destructive:
        //   "bg-destructive/10 text-destructive dark:bg-destructive/20 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // outline:
        //   "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/30",
        // ghost:
        //   "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        // link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success/10 text-success dark:bg-success/20 [a]:hover:bg-success/20 focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, className })),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
