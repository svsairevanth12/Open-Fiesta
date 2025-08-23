"use client";
import Image from "next/image";
import GithubStar from "@/components/app/GithubStar";
import ThemeToggle from "@/components/ThemeToggle";
import CustomModels from "@/components/modals/CustomModels";
import Settings from "@/components/app/Settings";
import { Layers, Menu as MenuIcon } from "lucide-react";

type Props = {
  onOpenMenu: () => void;
  title?: string;
  authorName?: string;
  authorImageSrc?: string;
  authorLink?: string;
  githubOwner: string;
  githubRepo: string;
  className?: string;
  onOpenModelsModal?: () => void;
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
  onOpenModelsModal,
}: Props) {
  return (
    <div
      className={`flex items-center mb-3 gap-2 w-full ${className || ""}`}
    >
      {/* Left: author + menu */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center justify-center h-7 w-8 rounded-md
            bg-gray-200 border border-gray-300 text-gray-800 hover:bg-gray-300
            dark:bg-white/10 dark:border-white/15 dark:text-white dark:hover:bg-white/20"
          aria-label="Open menu"
          title="Menu"
        >
          <MenuIcon size={16} />
        </button>

        <a
          href={authorLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-black
            dark:text-zinc-300 dark:hover:text-white"
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

      {/* Center: title stays centered in available space (hidden on mobile) */}
      <div className="flex-1 text-center hidden sm:block">
        <h1
          className="text-xl md:text-2xl font-extrabold tracking-tight
            text-gray-900 select-none pointer-events-none
            dark:bg-gradient-to-r dark:from-white dark:via-white/90 dark:to-white/70 dark:bg-clip-text dark:text-transparent dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.12)]"
        >
          {title}
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 z-10 ml-auto">
        <button
          onClick={() => onOpenModelsModal && onOpenModelsModal()}
          className="inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md
            bg-gray-200 border border-gray-300 text-gray-800 hover:bg-gray-300
            dark:bg-white/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          title="Change models"
          aria-label="Change models"
        >
          <Layers size={14} />
        </button>

        <CustomModels compact />
        <ThemeToggle compact />
        <Settings compact />
        <GithubStar owner={githubOwner} repo={githubRepo} />
      </div>
    </div>
  );
}
