import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";

export function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading: boolean;
  }) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {props.children}
    </Button>
  );
}
