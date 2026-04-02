import { cn } from "../../lib/utils";
import type { ComponentProps } from "react";

type Props = {
  position?: "default" | "center";
};

export function Container({
  children,
  className,
  position = "default",
}: Props & ComponentProps<"main">) {
  return (
    <main
      className={cn(
        `mt-10 flex flex-col gap-6 p-3`,
        position === "default" && "",
        position === "center" && "flex-1 items-center justify-center",
        className,
      )}
    >
      {children}
    </main>
  );
}
