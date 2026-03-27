import { Wallet, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neon-green/20 to-neon-blue/20 flex items-center justify-center border border-white/10 shadow-[0_0_25px_rgba(0,255,136,0.15)] ring-1 ring-white/5">
          <Wallet className="w-6 h-6 text-neon-green drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
          FinTrack<span className="text-neon-green text-4xl leading-none">.</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400">
          <UserIcon className="w-3.5 h-3.5" />
          {user?.email}
        </div>
        
        <button 
          onClick={() => signOut()}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-neon-pink/10 border border-white/10 hover:border-neon-pink/30 text-gray-400 hover:text-neon-pink transition-all group"
          title="Sair"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}
