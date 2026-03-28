import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import React from 'react';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex space-x-1.5 glass-panel p-1.5 rounded-2xl w-max mb-8 shadow-inner overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap",
              isActive ? "text-primary dark:text-white" : "text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-bubble"
                className="absolute inset-0 bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  );
}
