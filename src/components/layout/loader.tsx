import { Typography } from "@/components/shared";
import { Loading } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function Loader() {
  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-6 text-blue-950">
      <HugeiconsIcon icon={Loading} className="animate-spin duration-1000" />
      <Typography
        variant="p"
        className="animate-pulse text-base font-normal tracking-widest duration-1000"
      >
        LOADING
      </Typography>
    </div>
  );
}
