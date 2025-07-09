"use client";

import { useDashboardStore } from '@/store/dashboard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Bug,
  TestTube,
  Download
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    dashboardData, 
    getTestCoveragePercentage, 
    getDefectResolutionRate,
    getUseCaseCompletionRate,
    getWorkItemProgressRate 
  } = useDashboardStore();

  const stats = [
    {
      title: "Test Coverage",
      value: `${getTestCoveragePercentage()}%`,
      icon: TestTube,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${dashboardData.testCoverage.passed} of ${dashboardData.testCoverage.total} tests passed`
    },
    {
      title: "Use Case Completion",
      value: `${getUseCaseCompletionRate()}%`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${dashboardData.useCaseStatus.approved} of ${dashboardData.useCaseStatus.total} approved`
    },
    {
      title: "Defect Resolution",
      value: `${getDefectResolutionRate()}%`,
      icon: Bug,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: `${dashboardData.defectTrends.resolved + dashboardData.defectTrends.closed} resolved/closed`
    },
    {
      title: "Work Item Progress",
      value: `${getWorkItemProgressRate()}%`,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: `${dashboardData.workItemProgress.done} of ${dashboardData.workItemProgress.total} completed`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your SDLC workflow progress</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Download size={16} />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Coverage Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube size={18} />
              <span>Test Coverage Breakdown</span>
            </CardTitle>
            <CardDescription>Current test execution status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">Passed</span>
                </div>
                <Badge variant="secondary">{dashboardData.testCoverage.passed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-sm">Failed</span>
                </div>
                <Badge variant="destructive">{dashboardData.testCoverage.failed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-yellow-600" />
                  <span className="text-sm">Blocked</span>
                </div>
                <Badge variant="outline">{dashboardData.testCoverage.blocked}</Badge>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{getTestCoveragePercentage()}%</span>
              </div>
              <Progress value={getTestCoveragePercentage()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Use Case Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText size={18} />
              <span>Use Case Status</span>
            </CardTitle>
            <CardDescription>Current state of use case reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">Approved</span>
                </div>
                <Badge variant="secondary">{dashboardData.useCaseStatus.approved}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-sm">In Review</span>
                </div>
                <Badge variant="outline">{dashboardData.useCaseStatus.inReview}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-gray-600" />
                  <span className="text-sm">Draft</span>
                </div>
                <Badge variant="outline">{dashboardData.useCaseStatus.draft}</Badge>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span>{getUseCaseCompletionRate()}%</span>
              </div>
              <Progress value={getUseCaseCompletionRate()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Defect Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug size={18} />
              <span>Defect Management</span>
            </CardTitle>
            <CardDescription>Current defect resolution status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-sm">Open</span>
                </div>
                <Badge variant="destructive">{dashboardData.defectTrends.open}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-yellow-600" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="outline">{dashboardData.defectTrends.inProgress}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">Resolved</span>
                </div>
                <Badge variant="secondary">{dashboardData.defectTrends.resolved}</Badge>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Resolution Rate</span>
                <span>{getDefectResolutionRate()}%</span>
              </div>
              <Progress value={getDefectResolutionRate()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Work Item Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>Work Item Progress</span>
            </CardTitle>
            <CardDescription>Development workflow status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm">Done</span>
                </div>
                <Badge variant="secondary">{dashboardData.workItemProgress.done}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="outline">{dashboardData.workItemProgress.inProgress}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-gray-600" />
                  <span className="text-sm">Backlog</span>
                </div>
                <Badge variant="outline">{dashboardData.workItemProgress.backlog}</Badge>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress Rate</span>
                <span>{getWorkItemProgressRate()}%</span>
              </div>
              <Progress value={getWorkItemProgressRate()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common workflow operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText size={16} />
              <span>New Use Case</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <TestTube size={16} />
              <span>Run Tests</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Bug size={16} />
              <span>Report Defect</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 