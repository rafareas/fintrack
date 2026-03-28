import { Wallet, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300">
          <Wallet className="w-6 h-6 text-neon-green drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-sm">
          FinTrack<span className="text-neon-green text-4xl leading-none">.</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs font-medium text-secondary">
          <UserIcon className="w-3.5 h-3.5" />
          {user?.email}
        </div>
        
        <ThemeToggle />
        
        <button 
          onClick={() => signOut()}
          className="p-2.5 rounded-xl glass-panel hover:bg-neon-pink/10 hover:border-neon-pink/30 text-secondary hover:text-neon-pink transition-all group"
          title="Sair"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}
