"use client";

import { ReactNode } from 'react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useAppStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 