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
  const { sidebarOpen, sidebarCollapsed, getSidebarWidth } = useAppStore();
  const sidebarWidth = getSidebarWidth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div 
        className="transition-all duration-300 ease-in-out min-h-screen"
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0',
        }}
      >
        <Header />
        
        <main className="flex-1 h-full">
          <div className="h-full px-6 py-6 max-w-none">
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