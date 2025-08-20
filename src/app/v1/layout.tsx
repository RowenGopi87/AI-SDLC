"use client";

import { ReactNode } from 'react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Version1Sidebar } from './components/v1-sidebar';
import { Version1Header } from './components/v1-header';
import { RightPanel } from '@/components/layout/right-panel';

interface Version1LayoutProps {
  children: ReactNode;
}

export default function Version1Layout({ children }: Version1LayoutProps) {
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    getSidebarWidth 
  } = useAppStore();
  
  const sidebarWidth = getSidebarWidth();
  
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar - Version 1 Specific */}
      <Version1Sidebar />
      
      {/* Center Content Area */}
      <div 
        className="flex-1 h-screen flex flex-col transition-all duration-300 ease-in-out border-l border-gray-200 bg-white"
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0',
          borderLeftWidth: sidebarOpen ? '1px' : '0px',
        }}
      >
        <Version1Header />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Right Panel - Assistant */}
      <RightPanel />
      
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
