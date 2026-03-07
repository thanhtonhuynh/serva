import Image from "next/image";
import Link from "next/link";

export async function Footer() {
  return (
    <footer className="mt-6 flex items-center gap-4 border-t px-3 py-6">
      <Link href="/" className="flex items-center font-bold">
        <Image
          priority
          src="/serva-logo-full.svg"
          alt="Serva"
          width={240}
          height={80}
          className="h-8 w-fit"
        />
        <span className="sr-only">Serva home</span>
      </Link>

      <div className="text-sm">
        <p>&copy; {new Date().getFullYear()}, Serva. All rights reserved.</p>
      </div>
    </footer>
  );
}
