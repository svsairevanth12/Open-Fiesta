"use client";
import Image from "next/image";
import GithubStar from "@/components/GithubStar";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu as MenuIcon } from "lucide-react";

type Props = {
  onOpenMenu: () => void;
  title?: string;
  authorName?: string;
  authorImageSrc?: string;
  authorLink?: string;
  githubOwner: string;
  githubRepo: string;
  className?: string;
};

export default function HeaderBar({
  onOpenMenu,
  title = "Open Fiesta",
  authorName = "Niladri",
  authorImageSrc = "/image.png",
  authorLink = "https://x.com/byteHumi",
  githubOwner,
  githubRepo,
  className,
}: Props) {
  return (
    <div
      className={["flex items-center mb-3 gap-2", className || ""].join(" ")}
    >
      {/* Left: author + menu */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center justify-center h-7 w-8 rounded-md bg-white/10 border border-white/15 text-white hover:bg-white/15"
          aria-label="Open menu"
          title="Menu"
        >
          <MenuIcon size={16} />
        </button>
        <a
          href={authorLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-white"
          title={`Open ${authorName} on X`}
        >
          <Image
            src={authorImageSrc}
            alt={`${authorName} avatar`}
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover"
          />
          <span className="opacity-90 hidden sm:inline text-sm">
            Made by{" "}
            <span className="font-semibold underline decoration-dotted">
              {authorName}
            </span>
          </span>
        </a>
      </div>

      {/* Center: title stays centered in available space */}
      <div className="flex-1 text-center">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.12)] select-none pointer-events-none">
          {title}
        </h1>
      </div>

      {/* Right: theme + github */}
      <div className="flex items-center gap-2 z-10">
        <ThemeToggle />
        <GithubStar owner={githubOwner} repo={githubRepo} className="ml-1" />
      </div>
    </div>
  );
}
