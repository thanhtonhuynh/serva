import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <main className={cn(`mt-6 flex flex-col gap-6 p-3 py-4`, className)}>{children}</main>;
}
