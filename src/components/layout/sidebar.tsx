"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
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
  Users,
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
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, currentWorkflowStep, getWorkflowProgress } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  const getModuleIcon = (moduleId: string) => {
    const icons = {
      'use-cases': FileText,
      'requirements': Settings,
      'decomposition': GitBranch,
      'test-cases': TestTube,
      'execution': Play,
      'defects': Bug,
      'traceability': GitBranch,
      'dashboard': BarChart3,
    };
    return icons[moduleId as keyof typeof icons] || Home;
  };

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

  if (!sidebarOpen) return null;

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900">{APP_NAME}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Progress Section */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Workflow Progress</span>
              <span>{getWorkflowProgress()}%</span>
            </div>
            <Progress value={getWorkflowProgress()} className="h-2" />
            <div className="text-xs text-gray-500">
              Step {currentWorkflowStep} of {WORKFLOW_STEPS.length}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {MODULES.map((module) => {
          const Icon = getModuleIcon(module.id);
          const isActive = pathname === module.path;
          
          return (
            <Link key={module.id} href={module.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon size={18} />
                {!collapsed && <span className="ml-3">{module.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Workflow Steps */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Workflow Steps</h3>
          <div className="space-y-2">
            {WORKFLOW_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const StatusIcon = getStatusIcon(status);
              
              return (
                <div key={step.id} className="flex items-center space-x-3 text-sm">
                  <StatusIcon size={16} className={getStatusColor(status)} />
                  <span className={cn(
                    "flex-1",
                    status === 'completed' && "line-through text-gray-500",
                    status === 'current' && "font-medium text-blue-600"
                  )}>
                    {step.name}
                  </span>
                  {status === 'completed' && (
                    <Badge variant="secondary" className="text-xs">
                      Done
                    </Badge>
                  )}
                  {status === 'current' && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
  );
}

export function MobileSidebarToggle() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="md:hidden p-2"
    >
      <Menu size={18} />
    </Button>
  );
} 