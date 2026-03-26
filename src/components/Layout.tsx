import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col items-center relative overflow-hidden">
      {/* Background neon flares */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-pink/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-green/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Main Content */}
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 z-10 flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
