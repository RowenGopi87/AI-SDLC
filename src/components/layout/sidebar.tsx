"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { MODULES, WORKFLOW_STEPS, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockTraceabilityData, mockUseCases, mockRequirements, mockWorkItems, mockTestCases, mockDefects } from '@/lib/mock-data';
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
  Target,
  Link as LinkIcon,
  TrendingUp,
  Palette,
  Code2,
} from 'lucide-react';

// Global state for selected item traceability
let selectedItemState = {
  id: '',
  type: '',
  data: null as any
};

export function setSelectedItem(id: string, type: string, data: any) {
  selectedItemState = { id, type, data };
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed, currentWorkflowStep, getWorkflowProgress } = useAppStore();
  const [selectedItem, setSelectedItemLocal] = useState(selectedItemState);

  const workflowProgress = getWorkflowProgress();

  useEffect(() => {
    // Check for updates to selected item every second
    const interval = setInterval(() => {
      if (selectedItemState.id !== selectedItem.id || selectedItemState.type !== selectedItem.type) {
        setSelectedItemLocal({ ...selectedItemState });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedItem]);

  const getModuleIcon = (moduleId: string) => {
    const icons = {
      'use-cases': FileText,
      'requirements': Settings,
      'design': Palette,
      'decomposition': GitBranch,
      'test-cases': TestTube,
      'execution': Play,
      'defects': Bug,
      'traceability': GitBranch,
      'dashboard': BarChart3,
      'code': Code2,
    };
    return icons[moduleId as keyof typeof icons] || Home;
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentWorkflowStep) return 'completed';
    if (stepId === currentWorkflowStep) return 'current';
    return 'pending';
  };

  const getItemSpecificWorkflowSteps = () => {
    if (!selectedItem.id || !selectedItem.type) return WORKFLOW_STEPS;

    const itemData = selectedItem.data;
    if (!itemData) return WORKFLOW_STEPS;

    // Define item-specific workflow steps based on type
    switch (selectedItem.type) {
      case 'workItem':
        return [
          { id: 1, name: 'Planning', description: 'Item in backlog' },
          { id: 2, name: 'Development', description: 'Item in progress' },
          { id: 3, name: 'Testing', description: 'Testing phase' },
          { id: 4, name: 'Done', description: 'Item completed' }
        ];
      case 'requirement':
        return [
          { id: 1, name: 'Analysis', description: 'Requirement analysis' },
          { id: 2, name: 'Enhancement', description: 'AI enhancement' },
          { id: 3, name: 'Review', description: 'Human review' },
          { id: 4, name: 'Approved', description: 'Requirement approved' }
        ];
      case 'testCase':
        return [
          { id: 1, name: 'Design', description: 'Test case design' },
          { id: 2, name: 'Ready', description: 'Ready for execution' },
          { id: 3, name: 'Execution', description: 'Test execution' },
          { id: 4, name: 'Completed', description: 'Testing completed' }
        ];
      case 'useCase':
        return [
          { id: 1, name: 'Idea', description: 'Business brief idea' },
          { id: 2, name: 'Discovery', description: 'Discovery phase' },
          { id: 3, name: 'Design', description: 'Solution design' },
          { id: 4, name: 'Execution', description: 'Implementation' }
        ];
      default:
        return WORKFLOW_STEPS;
    }
  };

  const getItemSpecificStepStatus = (stepId: number) => {
    if (!selectedItem.id || !selectedItem.data) {
      return getStepStatus(stepId);
    }

    const itemData = selectedItem.data;
    let currentStep = 1;

    // Determine current step based on item status/stage
    switch (selectedItem.type) {
      case 'workItem':
        const workItemStatus = itemData.status as string;
        if (workItemStatus === 'backlog') currentStep = 1;
        else if (workItemStatus === 'in_progress') currentStep = 2;
        else if (workItemStatus === 'testing') currentStep = 3;
        else if (workItemStatus === 'done') currentStep = 4;
        else currentStep = 1;
        break;
      case 'requirement':
        const reqStatus = itemData.status as string;
        if (reqStatus === 'pending') currentStep = 1;
        else if (reqStatus === 'enhanced') currentStep = 2;
        else if (reqStatus === 'in_review') currentStep = 3;
        else if (reqStatus === 'approved') currentStep = 4;
        else currentStep = 1;
        break;
      case 'testCase':
        const testStatus = itemData.status as string;
        if (testStatus === 'design') currentStep = 1;
        else if (testStatus === 'ready') currentStep = 2;
        else if (testStatus === 'execution') currentStep = 3;
        else if (testStatus === 'completed') currentStep = 4;
        else currentStep = 1;
        break;
      case 'useCase':
        const useCaseStage = itemData.workflowStage as string;
        if (useCaseStage === 'idea') currentStep = 1;
        else if (useCaseStage === 'discovery') currentStep = 2;
        else if (useCaseStage === 'design') currentStep = 3;
        else if (useCaseStage === 'execution') currentStep = 4;
        else currentStep = 1;
        break;
      default:
        return getStepStatus(stepId);
    }

    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
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

  const getTraceabilityInfo = () => {
    if (!selectedItem.id || !selectedItem.type) return null;

    const { id, type } = selectedItem;
    let traceInfo = null;

    switch (type) {
      case 'useCase':
        traceInfo = mockTraceabilityData[id as keyof typeof mockTraceabilityData];
        break;
      
      case 'requirement':
        for (const [ucId, trace] of Object.entries(mockTraceabilityData)) {
          if (trace.requirements.includes(id)) {
            traceInfo = {
              useCase: ucId,
              requirements: mockRequirements.filter(r => r.id === id),
              workItems: mockWorkItems.filter(w => w.requirementId === id),
              testCases: mockTestCases.filter(tc => {
                const workItem = mockWorkItems.find(w => w.id === tc.workItemId);
                return workItem?.requirementId === id;
              }),
              defects: mockDefects.filter(def => {
                const testCase = mockTestCases.find(t => t.id === def.testCaseId);
                const workItem = mockWorkItems.find(w => w.id === testCase?.workItemId);
                return workItem?.requirementId === id;
              })
            };
            break;
          }
        }
        break;
      
      case 'workItem':
        for (const [ucId, trace] of Object.entries(mockTraceabilityData)) {
          if (trace.workItems.includes(id)) {
            const workItem = mockWorkItems.find(w => w.id === id);
            traceInfo = {
              useCase: ucId,
              requirement: mockRequirements.find(r => r.id === workItem?.requirementId),
              workItems: [workItem],
              testCases: mockTestCases.filter(tc => tc.workItemId === id),
              defects: mockDefects.filter(def => {
                const testCase = mockTestCases.find(t => t.id === def.testCaseId);
                return testCase?.workItemId === id;
              })
            };
            break;
          }
        }
        break;
      
      case 'testCase':
        const testCase = mockTestCases.find(t => t.id === id);
        if (testCase) {
          for (const [ucId, trace] of Object.entries(mockTraceabilityData)) {
            if (trace.testCases.includes(id)) {
              const workItem = mockWorkItems.find(w => w.id === testCase.workItemId);
              traceInfo = {
                useCase: ucId,
                requirement: mockRequirements.find(r => r.id === workItem?.requirementId),
                workItem: workItem,
                testCases: [testCase],
                defects: mockDefects.filter(def => def.testCaseId === id)
              };
              break;
            }
          }
        }
        break;
      
      case 'defect':
        const defect = mockDefects.find(d => d.id === id);
        if (defect) {
          const relatedTestCase = mockTestCases.find(t => t.id === defect.testCaseId);
          if (relatedTestCase) {
            for (const [ucId, trace] of Object.entries(mockTraceabilityData)) {
              if (trace.defects.includes(id)) {
                const workItem = mockWorkItems.find(w => w.id === relatedTestCase.workItemId);
                traceInfo = {
                  useCase: ucId,
                  requirement: mockRequirements.find(r => r.id === workItem?.requirementId),
                  workItem: workItem,
                  testCase: relatedTestCase,
                  defects: [defect]
                };
                break;
              }
            }
          }
        }
        break;
    }

    return traceInfo;
  };

  const renderTraceabilitySection = () => {
    if (sidebarCollapsed || !selectedItem.id) return null;

    const traceInfo = getTraceabilityInfo();
    if (!traceInfo) return null;

    return (
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <LinkIcon size={14} className="mr-2" />
          Traceability
        </h3>
        
        <div className="space-y-3">
          {/* Use Case */}
          {traceInfo.useCase && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Business Brief</p>
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-xs font-mono bg-white">
                    {mockUseCases.find(uc => uc.id === traceInfo.useCase)?.businessBriefId}
                  </Badge>
                </div>
                <div className="font-medium text-blue-900">
                  {mockUseCases.find(uc => uc.id === traceInfo.useCase)?.title}
                </div>
                <div className="text-blue-700 mt-1">
                  Stage: {mockUseCases.find(uc => uc.id === traceInfo.useCase)?.workflowStage}
                </div>
                <div className="text-blue-700">
                  Progress: {mockUseCases.find(uc => uc.id === traceInfo.useCase)?.completionPercentage}%
                </div>
              </div>
            </div>
          )}

          {/* Requirements */}
          {traceInfo.requirements && traceInfo.requirements.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Requirements ({traceInfo.requirements.length})</p>
              <div className="space-y-1">
                {traceInfo.requirements.slice(0, 2).map((req: any) => (
                  <div key={req.id} className="bg-green-50 p-2 rounded text-xs">
                    <div className="font-medium text-green-900">{req.originalText}</div>
                    <div className="text-green-700">Status: {req.status}</div>
                  </div>
                ))}
                {traceInfo.requirements.length > 2 && (
                  <div className="text-xs text-gray-500">+{traceInfo.requirements.length - 2} more...</div>
                )}
              </div>
            </div>
          )}

          {/* Work Items */}
          {traceInfo.workItems && traceInfo.workItems.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Work Items ({traceInfo.workItems.length})</p>
              <div className="space-y-1">
                {traceInfo.workItems.slice(0, 2).map((wi: any) => (
                  <div key={wi.id} className="bg-yellow-50 p-2 rounded text-xs">
                    <div className="font-medium text-yellow-900">{wi.title}</div>
                    <div className="text-yellow-700">Status: {wi.status}</div>
                    <div className="text-yellow-700">Progress: {wi.completionPercentage}%</div>
                  </div>
                ))}
                {traceInfo.workItems.length > 2 && (
                  <div className="text-xs text-gray-500">+{traceInfo.workItems.length - 2} more...</div>
                )}
              </div>
            </div>
          )}

          {/* Test Cases */}
          {traceInfo.testCases && traceInfo.testCases.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Test Cases ({traceInfo.testCases.length})</p>
              <div className="space-y-1">
                {traceInfo.testCases.slice(0, 2).map((tc: any) => (
                  <div key={tc.id} className="bg-purple-50 p-2 rounded text-xs">
                    <div className="font-medium text-purple-900">{tc.title}</div>
                    <div className="text-purple-700">Status: {tc.status}</div>
                  </div>
                ))}
                {traceInfo.testCases.length > 2 && (
                  <div className="text-xs text-gray-500">+{traceInfo.testCases.length - 2} more...</div>
                )}
              </div>
            </div>
          )}

          {/* Defects */}
          {traceInfo.defects && traceInfo.defects.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Defects ({traceInfo.defects.length})</p>
              <div className="space-y-1">
                {traceInfo.defects.slice(0, 2).map((def: any) => (
                  <div key={def.id} className="bg-red-50 p-2 rounded text-xs">
                    <div className="font-medium text-red-900">{def.title}</div>
                    <div className="text-red-700">Severity: {def.severity}</div>
                    <div className="text-red-700">Status: {def.status}</div>
                  </div>
                ))}
                {traceInfo.defects.length > 2 && (
                  <div className="text-xs text-gray-500">+{traceInfo.defects.length - 2} more...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Always render on desktop, handle mobile via CSS classes

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto",
      "md:block",
      sidebarCollapsed ? "w-16" : "w-80",
      !sidebarOpen && "md:block hidden"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!sidebarCollapsed && (
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
        {MODULES.map((module) => {
          const Icon = getModuleIcon(module.id);
          const isActive = pathname === module.path;
          
          return (
            <Link key={module.id} href={module.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span className="ml-3">{module.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Selected Item Info */}
      {!sidebarCollapsed && selectedItem.id && (
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Target size={14} className="mr-2" />
            Selected Item
          </h3>
          <div className="bg-gray-50 p-3 rounded">
            {selectedItem.type === 'useCase' && selectedItem.data?.businessBriefId && (
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedItem.data.businessBriefId}
                </Badge>
              </div>
            )}
            <div className="text-sm font-medium text-gray-900">{selectedItem.data?.title || selectedItem.id}</div>
            <div className="text-xs text-gray-600 mt-1">Type: {selectedItem.type}</div>
            {selectedItem.data?.workflowStage && (
              <div className="text-xs text-gray-600">Stage: {selectedItem.data.workflowStage}</div>
            )}
            {selectedItem.data?.completionPercentage && (
              <div className="text-xs text-gray-600">Progress: {selectedItem.data.completionPercentage}%</div>
            )}
          </div>
        </div>
      )}

      {/* Traceability Section */}
      {renderTraceabilitySection()}

      {/* Workflow Steps */}
      {!sidebarCollapsed && (
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {selectedItem.id ? `${selectedItem.type} Workflow` : 'Workflow Steps'}
          </h3>
          <div className="space-y-2">
            {getItemSpecificWorkflowSteps().map((step) => {
              const status = selectedItem.id ? getItemSpecificStepStatus(step.id) : getStepStatus(step.id);
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