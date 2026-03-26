import { Wallet } from 'lucide-react';

export function Header() {
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
    </header>
  );
}
