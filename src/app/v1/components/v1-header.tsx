"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { MobileSidebarToggle } from "@/components/layout/sidebar";
import { useAppStore } from '@/store/app-store';
import { Search, Settings, User, Bot } from "lucide-react";
import Link from "next/link";

export function Version1Header() {
  const { rightPanelOpen, toggleRightPanel } = useAppStore();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <MobileSidebarToggle />
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 hidden sm:flex">
          Version 1 - Traditional SDLC
        </Badge>
      </div>

      {/* Right side - Matching V2 Navigation Icons */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="p-2">
          <Search size={18} />
        </Button>
        
        <NotificationDropdown />
        
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="p-2">
            <Settings size={18} />
          </Button>
        </Link>
        
        <Button 
          variant={rightPanelOpen ? "default" : "ghost"} 
          size="sm" 
          className="p-2"
          onClick={toggleRightPanel}
          title="Toggle Aura Assistant"
        >
          <Bot size={18} />
        </Button>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <span>Switch Version</span>
          </Button>
        </Link>
        
        <Button variant="ghost" size="sm" className="p-2">
          <User size={18} />
        </Button>
      </div>
    </header>
  );
}
