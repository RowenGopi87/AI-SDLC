"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { ResizeHandle } from '@/components/ui/resize-handle';
import { MODULES, WORKFLOW_STEPS, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Settings,
  TestTube,
  Play,
  Bug,
  GitBranch,
  BarChart3,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Palette,
  Code2
} from 'lucide-react';

// Version 1 specific modules (legacy SDLC modules) - dashboard moved to bottom
const V1_MODULES = [
  { id: "use-cases", name: "Idea", path: "/v1/use-cases", icon: FileText },
  { id: "requirements", name: "Work Items", path: "/v1/requirements", icon: Settings },
  { id: "design", name: "Design", path: "/v1/design", icon: Palette },
  { id: "code", name: "Code", path: "/v1/code", icon: Code2 },
  { id: "test-cases", name: "Test Cases", path: "/v1/test-cases", icon: TestTube },
  { id: "execution", name: "Execution", path: "/v1/execution", icon: Play },
  { id: "defects", name: "Defects", path: "/v1/defects", icon: Bug },
  { id: "traceability", name: "Traceability", path: "/v1/traceability", icon: GitBranch },
  { id: "dashboard", name: "Dashboard", path: "/v1/dashboard", icon: BarChart3 },
];

export function Version1Sidebar() {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleSidebarCollapsed, 
    currentWorkflowStep, 
    getWorkflowProgress,
    getSidebarWidth,
    setSidebarWidth 
  } = useAppStore();

  const workflowProgress = getWorkflowProgress();

  const getStepStatus = (stepId: number) => {
    if (stepId < currentWorkflowStep) return 'completed';
    if (stepId === currentWorkflowStep) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'current': return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const handleResize = (delta: number) => {
    if (sidebarCollapsed) return;
    const currentWidth = getSidebarWidth();
    setSidebarWidth(currentWidth + delta);
  };

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r-2 border-gray-300 shadow-sm transition-all duration-300 ease-in-out overflow-y-auto",
        "md:block",
        sidebarCollapsed && "w-20",
        !sidebarOpen && "md:block hidden"
      )}
      style={{
        width: sidebarOpen ? `${getSidebarWidth()}px` : '0px'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{APP_NAME} v1</div>
                <div className="text-xs text-gray-500">Traditional SDLC</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A1</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarCollapsed}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Progress Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Workflow Progress</span>
                <span>{workflowProgress}%</span>
              </div>
              <Progress value={workflowProgress} className="h-2" />
              <div className="text-xs text-gray-500">
                Step {currentWorkflowStep} of {WORKFLOW_STEPS.length}
              </div>
            </div>
          </div>
        )}



        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {V1_MODULES.map((module) => {
              const Icon = module.icon;
              const isActive = pathname === module.path;
              
              return (
                <Link key={module.id} href={module.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10 px-3",
                      sidebarCollapsed && "justify-center px-2",
                      isActive && "bg-blue-600 text-white hover:bg-blue-700",
                      !isActive && "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span className="ml-3 font-medium">{module.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>



        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      {/* Resize Handle */}
      {sidebarOpen && !sidebarCollapsed && (
        <div className="fixed top-0 bottom-0 z-50 flex items-center" 
             style={{ left: `${getSidebarWidth()}px` }}>
          <ResizeHandle
            direction="horizontal"
            onResize={handleResize}
            className="h-full border-r-2 border-gray-300"
          />
        </div>
      )}
    </>
  );
}
