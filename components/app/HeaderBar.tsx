'use client';
import Image from 'next/image';
import GithubStar from '@/components/app/GithubStar';
import ThemeToggle from '@/components/ThemeToggle';
import CustomModels from '@/components/modals/CustomModels';
import Settings from '@/components/app/Settings';
import { Layers } from 'lucide-react';
import { Menu as MenuIcon } from 'lucide-react';

type Props = {
  onOpenMenu: () => void;
  title?: string;
  githubOwner: string;
  githubRepo: string;
  className?: string;
  onOpenModelsModal?: () => void;
};

export default function HeaderBar({
  onOpenMenu,
  title = 'Open Fiesta',
  githubOwner,
  githubRepo,
  className,
  onOpenModelsModal,
}: Props) {
  return (
    <div className={['flex items-center mb-3 gap-2 w-full', className || ''].join(' ')}>
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
          href="https://x.com/byteHumi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          title="Made by Niladri"
        >
          <Image
            src="/image.png"
            alt="Niladri profile"
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-200">Made by Niladri</span>
        </a>
      </div>

      {/* Center: title stays centered in available space (hidden on mobile) */}
      <div className="flex-1 text-center hidden sm:block">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-black via-black/90 to-black/70 dark:from-white dark:via-white/90 dark:to-white/70 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.12)] dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.12)] select-none pointer-events-none">
          {title}
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 z-10 ml-auto">
        <button
          onClick={() => onOpenModelsModal && onOpenModelsModal()}
          className="inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 shadow accent-focus"
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
