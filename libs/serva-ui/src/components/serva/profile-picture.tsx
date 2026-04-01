import Image from "next/image";

const TEXT_SIZE_THRESHOLDS = [
  { minSize: 256, className: "text-6xl" },
  { minSize: 128, className: "text-4xl" },
  { minSize: 64, className: "text-2xl" },
  { minSize: 32, className: "text-sm" },
] as const;

function getTextSizeClass(size: number): string {
  return TEXT_SIZE_THRESHOLDS.find((t) => size >= t.minSize)?.className ?? "text-xs";
}

type ProfilePictureProps = {
  image?: string | null;
  size: number;
  name?: string;
};

export function ProfilePicture({ image, size, name }: ProfilePictureProps) {
  if (!image) {
    return (
      <div
        className={`bg-primary text-primary-50 flex items-center justify-center rounded-full border font-medium ${getTextSizeClass(size)}`}
        style={{ width: size, height: size }}
      >
        {name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={"User profile picture"}
      width={size}
      height={size}
      className="aspect-square rounded-full border object-cover shadow-xs"
    />
  );
}
