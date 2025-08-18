"use client";

import { useState } from 'react';
import { useUseCaseStore } from '@/store/use-case-store';
import { useRequirementStore } from '@/store/requirement-store';
import { useWorkItemStore } from '@/store/work-item-store';
import { useTestCaseStore } from '@/store/test-case-store';
import { useDefectStore } from '@/store/defect-store';
import { useDashboardStore } from '@/store/dashboard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { 
  GitBranch, 
  ArrowRight, 
  FileText, 
  Settings, 
  Target, 
  Layers, 
  BookOpen, 
  TestTube, 
  Bug,
  Eye,
  ChevronRight,
  Home,
  Search,
  Filter,
  BarChart3,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import Link from "next/link";

interface TraceabilityItem {
  id: string;
  title: string;
  type: 'use-case' | 'requirement' | 'initiative' | 'feature' | 'epic' | 'story' | 'test-case' | 'defect';
  status: string;
  children?: TraceabilityItem[];
}

export default function TraceabilityPage() {
  const { useCases } = useUseCaseStore();
  const { requirements } = useRequirementStore();
  const { workItems } = useWorkItemStore();
  const { testCases } = useTestCaseStore();
  const { defects } = useDefectStore();
  const { traceabilityData } = useDashboardStore();
  
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);

  const buildTraceabilityTree = (): TraceabilityItem[] => {
    return useCases.map(useCase => {
      const useCaseRequirements = requirements.filter(r => r.useCaseId === useCase.id);
      const useCaseWorkItems = workItems.filter(w => 
        useCaseRequirements.some(r => r.id === w.requirementId)
      );
      const useCaseTestCases = testCases.filter(t => 
        useCaseWorkItems.some(w => w.id === t.workItemId)
      );
      const useCaseDefects = defects.filter(d => 
        useCaseTestCases.some(t => t.id === d.testCaseId)
      );

      return {
        id: useCase.id,
        title: useCase.title,
        type: 'use-case',
        status: useCase.status,
        children: [
          ...useCaseRequirements.map(req => ({
            id: req.id,
            title: req.originalText.substring(0, 50) + '...',
            type: 'requirement' as const,
            status: req.status,
            children: useCaseWorkItems
              .filter(w => w.requirementId === req.id)
              .map(workItem => ({
                id: workItem.id,
                title: workItem.title,
                type: workItem.type as any,
                status: workItem.status,
                children: useCaseTestCases
                  .filter(t => t.workItemId === workItem.id)
                  .map(testCase => ({
                    id: testCase.id,
                    title: testCase.title,
                    type: 'test-case' as const,
                    status: testCase.status,
                    children: useCaseDefects
                      .filter(d => d.testCaseId === testCase.id)
                      .map(defect => ({
                        id: defect.id,
                        title: defect.title,
                        type: 'defect' as const,
                        status: defect.status,
                      }))
                  }))
              }))
          }))
        ]
      };
    });
  };

  const traceabilityTree = buildTraceabilityTree();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'use-case': return <FileText size={16} className="text-blue-600" />;
      case 'requirement': return <Settings size={16} className="text-purple-600" />;
      case 'initiative': return <Target size={16} className="text-purple-600" />;
      case 'feature': return <Layers size={16} className="text-blue-600" />;
      case 'epic': return <BookOpen size={16} className="text-green-600" />;
      case 'story': return <FileText size={16} className="text-orange-600" />;
      case 'test-case': return <TestTube size={16} className="text-teal-600" />;
      case 'defect': return <Bug size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'use-case': return 'bg-blue-100 text-blue-800';
      case 'requirement': return 'bg-purple-100 text-purple-800';
      case 'initiative': return 'bg-purple-100 text-purple-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-green-100 text-green-800';
      case 'story': return 'bg-orange-100 text-orange-800';
      case 'test-case': return 'bg-teal-100 text-teal-800';
      case 'defect': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': case 'passed': case 'done': 
        return 'bg-green-100 text-green-800';
      case 'in_review': case 'in_progress': case 'enhanced': 
        return 'bg-blue-100 text-blue-800';
      case 'rejected': case 'failed': case 'open': 
        return 'bg-red-100 text-red-800';
      case 'blocked': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentLevel = (): TraceabilityItem[] => {
    let current = traceabilityTree;
    
    for (const pathItem of selectedPath) {
      const found = current.find(item => item.id === pathItem);
      if (found && found.children) {
        current = found.children;
      } else {
        break;
      }
    }
    
    return current;
  };

  const navigateToItem = (itemId: string) => {
    setSelectedPath([...selectedPath, itemId]);
  };

  const navigateToLevel = (level: number) => {
    setSelectedPath(selectedPath.slice(0, level));
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ id: 'root', title: 'Traceability Matrix', type: 'root' }];
    
    let current = traceabilityTree;
    for (const pathItem of selectedPath) {
      const found = current.find(item => item.id === pathItem);
      if (found) {
        breadcrumbs.push({ id: found.id, title: found.title, type: found.type });
        if (found.children) {
          current = found.children;
        }
      }
    }
    
    return breadcrumbs;
  };

  const filteredItems = getCurrentLevel().filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getItemDetails = (item: TraceabilityItem) => {
    let details = {};
    
    switch (item.type) {
      case 'use-case':
        details = useCases.find(u => u.id === item.id) || {};
        break;
      case 'requirement':
        details = requirements.find(r => r.id === item.id) || {};
        break;
      case 'test-case':
        details = testCases.find(t => t.id === item.id) || {};
        break;
      case 'defect':
        details = defects.find(d => d.id === item.id) || {};
        break;
      default:
        details = workItems.find(w => w.id === item.id) || {};
    }
    
    return details;
  };

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traceability Matrix</h1>
          <p className="text-gray-600 mt-1">
            Drill-down view from Use Cases to Requirements, Work Items, Tests, and Defects
          </p>
        </div>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <BarChart3 size={16} />
          <span>Export Matrix</span>
        </Button>
      </div>

      {/* Summary Cards - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Traceability Summary</CardTitle>
              <CardDescription>Overview of traceability coverage across all items</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSummaryCardsVisible(!summaryCardsVisible)}
              className="h-8 w-8 p-0"
            >
              {summaryCardsVisible ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>
          </div>
        </CardHeader>
        {summaryCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Use Cases', value: useCases.length, color: 'bg-blue-100 text-blue-800', icon: FileText },
                { label: 'Requirements', value: requirements.length, color: 'bg-purple-100 text-purple-800', icon: Settings },
                { label: 'Work Items', value: workItems.length, color: 'bg-green-100 text-green-800', icon: GitBranch },
                { label: 'Test Cases', value: testCases.length, color: 'bg-teal-100 text-teal-800', icon: TestTube },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="use-case">Use Cases</SelectItem>
            <SelectItem value="requirement">Requirements</SelectItem>
            <SelectItem value="initiative">Initiatives</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
            <SelectItem value="epic">Epics</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
            <SelectItem value="test-case">Test Cases</SelectItem>
            <SelectItem value="defect">Defects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Breadcrumbs */}
      <Card>
        <CardContent className="p-4">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbs().map((crumb, index) => (
                <div key={crumb.id} className="flex items-center">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => navigateToLevel(index)}
                      className="cursor-pointer hover:text-blue-600"
                    >
                      <div className="flex items-center space-x-2">
                        {index === 0 ? (
                          <Home size={16} />
                        ) : (
                          getTypeIcon(crumb.type)
                        )}
                        <span>{crumb.title}</span>
                      </div>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {index < getBreadcrumbs().length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight size={16} />
                    </BreadcrumbSeparator>
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch size={18} />
                <span>Items ({filteredItems.length})</span>
              </CardTitle>
              <CardDescription>
                {selectedPath.length === 0 
                  ? 'Select a use case to drill down into its requirements and related items'
                  : 'Click on items to drill down further or use breadcrumbs to navigate back'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      hoveredItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => item.children && item.children.length > 0 && navigateToItem(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {item.type === 'use-case' && (() => {
                              const useCaseDetails = useCases.find(uc => uc.id === item.id);
                              return useCaseDetails?.businessBriefId ? (
                                <Badge variant="outline" className="text-xs font-mono">
                                  {useCaseDetails.businessBriefId}
                                </Badge>
                              ) : null;
                            })()}
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <Badge className={getTypeColor(item.type)} variant="secondary">
                              {item.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(item.status)} variant="outline">
                              {item.status.replace('_', ' ')}
                            </Badge>
                            {item.children && (
                              <Badge variant="outline" className="text-xs">
                                {item.children.length} items
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredItem(item.id);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                        {item.children && item.children.length > 0 && (
                          <ArrowRight size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPath.length === 0 ? 'No use cases available' : 'No items found'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : selectedPath.length === 0
                        ? 'Create some use cases to begin building traceability'
                        : 'No child items available at this level'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Item Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye size={18} />
                <span>Item Details</span>
              </CardTitle>
              <CardDescription>
                {hoveredItem ? 'Details about the selected item' : 'Hover over an item to see details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hoveredItem ? (
                (() => {
                  const item = filteredItems.find(i => i.id === hoveredItem);
                  if (!item) return null;
                  
                  const details = getItemDetails(item);
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type.replace('-', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(item.status)} variant="outline">
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {details.description && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                          <p className="text-sm text-gray-600">{details.description}</p>
                        </div>
                      )}
                      
                      {details.businessValue && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Business Value</p>
                          <p className="text-sm text-gray-600">{details.businessValue}</p>
                        </div>
                      )}
                      
                      {details.acceptanceCriteria && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Acceptance Criteria</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {details.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {details.submittedBy && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Submitted By</p>
                          <p className="text-sm text-gray-600">{details.submittedBy}</p>
                        </div>
                      )}
                      
                      {details.assignee && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Assignee</p>
                          <p className="text-sm text-gray-600">{details.assignee}</p>
                        </div>
                      )}
                      
                      {details.priority && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Priority</p>
                          <Badge variant="outline" className="text-xs">
                            {details.priority}
                          </Badge>
                        </div>
                      )}
                      
                      {item.children && item.children.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Child Items</p>
                          <p className="text-sm text-gray-600">
                            {item.children.length} related items
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No item selected</h3>
                  <p className="text-gray-600">
                    Hover over an item to see its details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
} 