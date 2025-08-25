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
          href="https://discord.gg/Zb2Qter6Jn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
          title="Join our Discord community"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="opacity-90 hidden sm:inline text-sm">
            Join <span className="font-semibold underline decoration-dotted">Discord</span>
          </span>
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
