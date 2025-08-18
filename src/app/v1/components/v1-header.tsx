"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileSidebarToggle } from "@/components/layout/sidebar";
import { Menu, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";

export function Version1Header() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <MobileSidebarToggle />
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 hidden sm:flex">
          Version 1 - Traditional SDLC
        </Badge>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Help</span>
        </Button>
        
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <span>Switch Version</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
