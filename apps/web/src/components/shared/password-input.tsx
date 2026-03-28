"use client";

import { Input } from "@serva/ui/components/input";
import { cn } from "@serva/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pe-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        title={showPassword ? "Hide password" : "Show password"}
        className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
      >
        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export function PasswordInputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Input
        data-slot="input-group-control"
        type={showPassword ? "text" : "password"}
        className={cn(
          "ml-2 flex-1 rounded-xl border-0 bg-transparent pe-10 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        title={showPassword ? "Hide password" : "Show password"}
        className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
      >
        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </>
  );
}
