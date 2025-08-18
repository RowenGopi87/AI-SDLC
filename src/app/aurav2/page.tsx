"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSelector } from "@/components/ui/role-selector";
import { 
  Lightbulb, 
  Search, 
  ListOrdered, 
  FileText, 
  Settings, 
  ArrowRight,
  Workflow,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';
import { useRoleStore } from '@/store/role-store';

interface WorkflowStats {
  totalBusinessBriefs: number;
  activeWorkflows: number;
  completedStages: number;
  pendingApprovals: number;
}

export default function AuraV2HomePage() {
  const { currentRole, isRoleSelected, getCurrentRole, hasAccess } = useRoleStore();
  const [stats, setStats] = useState<WorkflowStats>({
    totalBusinessBriefs: 0,
    activeWorkflows: 0,
    completedStages: 0,
    pendingApprovals: 0
  });
  const [showRoleSelector, setShowRoleSelector] = useState(!isRoleSelected);

  const workflowStages = [
    {
      id: 'idea',
      icon: Lightbulb,
      title: "Capture Idea as Business Brief",
      description: "Outline new business ideas and facilitate effective decision-making",
      status: "active",
      path: "/aurav2/idea",
      permission: 'idea_stage'
    },
    {
      id: 'qualify',
      icon: Search,
      title: "Qualify the Idea", 
      description: "Research, filter and assess business ideas against available products",
      status: "available",
      path: "/aurav2/qualify",
      permission: 'qualify_stage'
    },
    {
      id: 'prioritize',
      icon: ListOrdered,
      title: "Prioritise the Initiative",
      description: "Business & IT prioritization to pull from Portfolio funnel",
      status: "available", 
      path: "/aurav2/prioritize",
      permission: 'prioritize_stage'
    }
  ];

  // Filter workflow stages based on role permissions
  const accessibleWorkflowStages = workflowStages.filter(stage => 
    hasAccess('aurav2', stage.permission)
  );

  const quickActions = [
    {
      title: "Create New Business Brief",
      description: "Start the workflow with a new business idea",
      icon: FileText,
      action: "create",
      path: "/aurav2/idea/create",
      permission: 'idea_stage',
      section: 'aurav2' as const
    },
    {
      title: "Review Active Workflows",
      description: "Check progress on existing initiatives",
      icon: BarChart3,
      action: "review",
      path: "/aurav2/dashboard",
      permission: 'dashboard',
      section: 'aurav2' as const
    },
    {
      title: "Manage Workflow Settings",
      description: "Configure stages and access controls",
      icon: Settings,
      action: "settings",
      path: "/aurav2/settings",
      permission: 'settings',
      section: 'aurav2' as const
    }
  ];

  // Filter quick actions based on role permissions
  const accessibleQuickActions = quickActions.filter(action => 
    hasAccess(action.section, action.permission)
  );

  // Load stats on component mount (mock data for now)
  useEffect(() => {
    // TODO: Replace with actual API call
    setStats({
      totalBusinessBriefs: 12,
      activeWorkflows: 8,
      completedStages: 34,
      pendingApprovals: 5
    });
  }, []);

  // If no role is selected, show role selector
  if (showRoleSelector || !isRoleSelected) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Workflow size={16} />
            <span>{APP_CONFIG.APP_FULL_NAME}</span>
            <Badge variant="secondary" className="ml-2">
              v{APP_CONFIG.VERSION}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">Welcome to {APP_CONFIG.APP_NAME}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please select your role to access the appropriate features and workflows
          </p>
        </div>

        {/* Role Selection */}
        <RoleSelector 
          onRoleSelected={() => setShowRoleSelector(false)} 
        />
      </div>
    );
  }

  const currentRoleData = getCurrentRole();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Workflow size={16} />
          <span>{APP_CONFIG.APP_FULL_NAME}</span>
          <Badge variant="secondary" className="ml-2">
            v{APP_CONFIG.VERSION}
          </Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">Welcome to {APP_CONFIG.APP_NAME}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {APP_CONFIG.APP_DESCRIPTION}
        </p>

        {/* Current Role Indicator */}
        {currentRoleData && (
          <div className="flex items-center justify-center space-x-3 bg-white border border-gray-400 rounded-lg p-3 shadow-md max-w-md mx-auto">
            <UserCheck size={20} className={`text-${currentRoleData.color}-600`} />
            <div>
              <div className="text-sm font-semibold">Current Role: {currentRoleData.name}</div>
              <div className="text-xs text-gray-600">{currentRoleData.description}</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRoleSelector(true)}
              className="text-xs"
            >
              Change Role
            </Button>
          </div>
        )}

        {/* Dashboard Access */}
       
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center border border-gray-400 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBusinessBriefs}</div>
            <div className="text-sm text-gray-600">Total Business Briefs</div>
          </CardContent>
        </Card>
        <Card className="text-center border border-gray-400 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.activeWorkflows}</div>
            <div className="text-sm text-gray-600">Active Workflows</div>
          </CardContent>
        </Card>
        <Card className="text-center border border-gray-400 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.completedStages}</div>
            <div className="text-sm text-gray-600">Completed Stages</div>
          </CardContent>
        </Card>
        <Card className="text-center border border-gray-400 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <div className="text-sm text-gray-600">Pending Approvals</div>
          </CardContent>
        </Card>
      </div>



      {/* Workflow Stages */}
      <Card className="border border-gray-400 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow size={20} className="text-blue-600" />
            <span>Workflow Stages - Idea, Discovery & Funding</span>
          </CardTitle>
          <CardDescription>
            Follow the structured workflow for business ideas and initiatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accessibleWorkflowStages.map((stage, index) => (
              <Link key={stage.id} href={stage.path}>
                <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer h-full shadow-md ${
                  stage.status === 'active' 
                    ? 'border border-blue-400 bg-blue-50' 
                    : 'border border-gray-400 bg-white hover:border-blue-400'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          stage.status === 'active' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-50'
                        }`}>
                          <stage.icon size={20} className={
                            stage.status === 'active' 
                              ? 'text-blue-600' 
                              : 'text-gray-600'
                          } />
                        </div>
                        <div className="text-sm text-gray-500">Stage {index + 1}</div>
                      </div>
                      {stage.status === 'active' && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{stage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {stage.description}
                    </CardDescription>
                    <div className="flex items-center mt-4 text-sm text-blue-600">
                      <span>Start Stage</span>
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
