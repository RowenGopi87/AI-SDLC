"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { MODULES, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { MobileSidebarToggle } from './sidebar';
import { Search, Settings, User } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { currentWorkflowStep, getWorkflowStepById } = useAppStore();
  
  const currentModule = MODULES.find(module => module.path === pathname);
  const currentStep = getWorkflowStepById(currentWorkflowStep);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <MobileSidebarToggle />
          
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              {currentModule?.name || APP_NAME}
            </h1>
            
            {currentStep && (
              <Badge variant="outline" className="whitespace-nowrap">
                Step {currentStep.id}: {currentStep.name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="ghost" size="sm" className="p-2">
            <Search size={18} />
          </Button>
          
          <NotificationDropdown />
          
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings size={18} />
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" className="p-2">
            <User size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
} 