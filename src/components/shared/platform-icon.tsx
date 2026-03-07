import type { Platform } from "@/constants/platforms";

export function PlatformIcon({ platform }: { platform: Platform }) {
  return (
    <div className={`flex size-4 items-center justify-center rounded-full ${platform.badgeColor} `}>
      <span className="text-xs font-bold text-white">{platform.iconLetter}</span>
    </div>
  );
}
