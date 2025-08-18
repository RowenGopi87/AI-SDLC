"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { RightPanel } from './right-panel';
import { ResizeHandle } from '@/components/ui/resize-handle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    rightPanelOpen,
    rightPanelCollapsed,
    getSidebarWidth, 
    getRightPanelWidth,
    setRightPanelWidth
  } = useAppStore();
  
  const sidebarWidth = getSidebarWidth();
  const rightPanelWidth = getRightPanelWidth();
  
  // Check if we're on Version 1 routes
  const isVersion1 = pathname.startsWith('/v1');

  const handleRightPanelResize = (delta: number) => {
    if (rightPanelCollapsed) return;
    const currentWidth = getRightPanelWidth();
    setRightPanelWidth(currentWidth - delta); // Subtract because we're resizing from the left edge
  };
  
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar - Don't render for Version 1 routes */}
      {!isVersion1 && <Sidebar />}
      
      {/* Center Content Area */}
      <div 
        className="flex-1 h-screen flex flex-col transition-all duration-300 ease-in-out border-l border-r border-gray-200 bg-gray-50"
        style={{
          marginLeft: !isVersion1 && sidebarOpen ? `${sidebarWidth}px` : '0',
          marginRight: rightPanelOpen ? `${rightPanelWidth + (rightPanelCollapsed ? 0 : 8)}px` : '0', // Add resize handle width
          borderLeftWidth: !isVersion1 && sidebarOpen ? '1px' : '0px',
          borderRightWidth: rightPanelOpen ? '1px' : '0px',
        }}
      >
        {!isVersion1 && <Header />}
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={cn(
            "flex-1 overflow-auto",
            isVersion1 ? "p-0" : "px-6 py-6"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel Resize Handle - Don't render for Version 1 routes */}
      {!isVersion1 && rightPanelOpen && !rightPanelCollapsed && (
        <div className="fixed top-0 bottom-0 z-50 flex items-center" 
             style={{ right: `${rightPanelWidth}px` }}>
          <ResizeHandle
            direction="horizontal"
            onResize={handleRightPanelResize}
            className="h-full border-l-2 border-gray-300"
          />
        </div>
      )}
      
      {/* Right Panel - Don't render for Version 1 routes */}
      {!isVersion1 && <RightPanel />}
      
      {/* Mobile sidebar overlay - Don't render for Version 1 routes */}
      {!isVersion1 && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile right panel overlay - Don't render for Version 1 routes */}
      {!isVersion1 && rightPanelOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => useAppStore.getState().setRightPanelOpen(false)}
        />
      )}
    </div>
  );
} 