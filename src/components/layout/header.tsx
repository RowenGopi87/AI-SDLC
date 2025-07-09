"use client";

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { MODULES, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileSidebarToggle } from './sidebar';
import { Bell, Search, Settings, User } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { currentWorkflowStep, getWorkflowStepById } = useAppStore();
  
  const currentModule = MODULES.find(module => module.path === pathname);
  const currentStep = getWorkflowStepById(currentWorkflowStep);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <MobileSidebarToggle />
          
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">
              {currentModule?.name || APP_NAME}
            </h1>
            
            {currentStep && (
              <Badge variant="outline" className="ml-2">
                Step {currentStep.id}: {currentStep.name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Search size={18} />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2">
            <Bell size={18} />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2">
            <Settings size={18} />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2">
            <User size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
} 