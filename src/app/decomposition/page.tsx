"use client";

import { useState } from 'react';
import { useWorkItemStore } from '@/store/work-item-store';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { CURRENT_WORKFLOW, getWorkflowLevel, getWorkflowHierarchy } from '@/lib/workflow-config';
import { setSelectedItem } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit, 
  Trash2, 
  GitBranch,
  FileText,
  Layers,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronUp
} from 'lucide-react';

interface WorkItemWithChildren {
  id: string;
  type: 'initiative' | 'feature' | 'epic' | 'story';
  title: string;
  description: string;
  parentId?: string;
  requirementId: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'done';
  assignee?: string;
  children?: WorkItemWithChildren[];
}

export default function DecompositionPage() {
  const { workItems, addWorkItem, updateWorkItem, deleteWorkItem, getWorkItemHierarchy } = useWorkItemStore();
  const { requirements, getRequirementById } = useRequirementStore();
  const { getUseCaseById } = useUseCaseStore();
  
  // Get workflow configuration
  const workflowHierarchy = getWorkflowHierarchy();
  const mappings = CURRENT_WORKFLOW.mappings;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItemLocal] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItemWithChildren | null>(null);
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [breakdownCardsVisible, setBreakdownCardsVisible] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    workflowLevel: string;
    type: 'initiative' | 'feature' | 'epic' | 'story';
    parentId: string;
    businessBriefId: string;
    requirementId: string;
    acceptanceCriteria: string;
    storyPoints: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'backlog' | 'in_progress' | 'done';
    assignee: string;
    businessValue: string;
    userStory: string;
  }>({
    title: '',
    description: '',
    workflowLevel: workflowHierarchy[workflowHierarchy.length - 1]?.id || 'story', // Default to lowest level
    type: 'story',
    parentId: '',
    businessBriefId: '',
    requirementId: '',
    acceptanceCriteria: '',
    storyPoints: '',
    priority: 'medium',
    status: 'backlog',
    assignee: '',
    businessValue: '',
    userStory: '',
  });

  const hierarchyData = getWorkItemHierarchy() as WorkItemWithChildren[];

  // Calculate summary stats
  const totalWorkItems = workItems.length;
  const completedWorkItems = workItems.filter(item => item.status === 'done').length;
  const inProgressWorkItems = workItems.filter(item => item.status === 'in_progress').length;
  const backlogWorkItems = workItems.filter(item => item.status === 'backlog').length;

  const initiativeCount = workItems.filter(item => item.type === 'initiative').length;
  const featureCount = workItems.filter(item => item.type === 'feature').length;
  const epicCount = workItems.filter(item => item.type === 'epic').length;
  const storyCount = workItems.filter(item => item.type === 'story').length;

  const totalStoryPoints = workItems.reduce((total, item) => total + (item.storyPoints || 0), 0);
  const completedStoryPoints = workItems.filter(item => item.status === 'done').reduce((total, item) => total + (item.storyPoints || 0), 0);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemSelect = (item: WorkItemWithChildren) => {
    const isSelected = selectedItem === item.id;
    const newSelectedId = isSelected ? null : item.id;
    setSelectedItemLocal(newSelectedId);
    
    if (newSelectedId) {
      // Update sidebar with selected work item
      setSelectedItem(item.id, 'workItem', {
        title: item.title,
        type: item.type,
        status: item.status,
        workflowStage: getWorkflowStage(item.status),
        completionPercentage: getCompletionPercentage(item.status)
      });
    } else {
      setSelectedItem('', '', null);
    }
  };

  const getWorkflowStage = (status: string) => {
    switch (status) {
      case 'backlog': return 'planning';
      case 'in_progress': return 'development';
      case 'done': return 'done';
      default: return 'planning';
    }
  };

  const getCompletionPercentage = (status: string) => {
    switch (status) {
      case 'backlog': return 0;
      case 'in_progress': return 50;
      case 'done': return 100;
      default: return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const acceptanceCriteriaArray = formData.acceptanceCriteria
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const workItemData = {
      ...formData,
      acceptanceCriteria: acceptanceCriteriaArray,
      storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
      parentId: formData.parentId || undefined,
    };

    if (editingItem) {
      updateWorkItem(editingItem.id, workItemData);
    } else {
      addWorkItem(workItemData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'story',
      parentId: '',
      requirementId: '',
      acceptanceCriteria: '',
      storyPoints: '',
      priority: 'medium',
      status: 'backlog',
      assignee: '',
    });
    setEditingItem(null);
  };

  const handleEdit = (item: WorkItemWithChildren) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      parentId: item.parentId || '',
      requirementId: item.requirementId,
      acceptanceCriteria: item.acceptanceCriteria.join('\n'),
      storyPoints: item.storyPoints?.toString() || '',
      priority: item.priority,
      status: item.status,
      assignee: item.assignee || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this work item?')) {
      deleteWorkItem(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initiative': return <Target size={16} className="text-purple-600" />;
      case 'feature': return <Layers size={16} className="text-blue-600" />;
      case 'epic': return <BookOpen size={16} className="text-green-600" />;
      case 'story': return <FileText size={16} className="text-orange-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'initiative': return 'bg-purple-100 text-purple-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-green-100 text-green-800';
      case 'story': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderWorkItem = (item: WorkItemWithChildren, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedItem === item.id;
    const requirement = getRequirementById(item.requirementId);

    return (
      <div key={item.id} className="space-y-2">
        <div
          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleItemSelect(item)}
        >
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpanded(item.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <div className="w-3 h-3" />
            )}
          </Button>

          {/* Type Icon */}
          <div className="flex items-center space-x-2">
            {getTypeIcon(item.type)}
            <Badge className={getTypeColor(item.type)} variant="secondary">
              {item.type}
            </Badge>
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 truncate">{item.description}</p>
          </div>

          {/* Story Points */}
          {item.storyPoints && (
            <Badge variant="outline" className="ml-2">
              {item.storyPoints} SP
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Selected Item Details */}
        {isSelected && (
          <div className="ml-8 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Acceptance Criteria</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {item.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Requirement</h4>
                  <p className="text-sm text-gray-600">{requirement?.id || 'N/A'}</p>
                  {requirement && (() => {
                    const useCase = getUseCaseById(requirement.useCaseId);
                    return useCase ? (
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 mb-1">Business Brief</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {useCase.businessBriefId}
                          </Badge>
                          <span className="text-sm text-gray-600">{useCase.title}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
                {item.assignee && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Assignee</h4>
                    <p className="text-sm text-gray-600">{item.assignee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {item.children?.map((child) => renderWorkItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Item Decomposition</h1>
          <p className="text-gray-600 mt-1">
            Break down {mappings.businessBrief}s into {workflowHierarchy.map(l => l.pluralName).join(' → ')}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Current Workflow: {CURRENT_WORKFLOW.name}
            </Badge>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={resetForm}>
              <Plus size={16} />
              <span>New Work Item</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Work Item' : 'Create New Work Item'}
              </DialogTitle>
              <DialogDescription>
                Define the work item details and hierarchy
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: 'initiative' | 'feature' | 'epic' | 'story') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initiative">Initiative</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Work Item
                  </label>
                  <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {workItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title} ({item.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter work item title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the work item"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirement *
                </label>
                <Select value={formData.requirementId} onValueChange={(value) => setFormData({ ...formData, requirementId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {requirements.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.id} - {req.originalText.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acceptance Criteria *
                </label>
                <Textarea
                  value={formData.acceptanceCriteria}
                  onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                  placeholder="List acceptance criteria (one per line)"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.type === 'story' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Story Points
                    </label>
                    <Input
                      type="number"
                      value={formData.storyPoints}
                      onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
                      placeholder="1-13"
                      min="1"
                      max="13"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value: 'backlog' | 'in_progress' | 'done') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Enter assignee name"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'} Work Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search work items..."
            className="pl-10"
          />
        </div>
        
        <Select>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="initiative">Initiatives</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
            <SelectItem value="epic">Epics</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Work Item Summary</CardTitle>
              <CardDescription>Overall work item metrics and progress</CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Work Items</p>
                      <p className="text-2xl font-bold text-gray-900">{totalWorkItems}</p>
                    </div>
                    <GitBranch className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{completedWorkItems}</p>
                      <p className="text-xs text-gray-500">{totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0}% of total</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{inProgressWorkItems}</p>
                      <p className="text-xs text-gray-500">{totalWorkItems > 0 ? Math.round((inProgressWorkItems / totalWorkItems) * 100) : 0}% of total</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Story Points</p>
                      <p className="text-2xl font-bold text-purple-600">{completedStoryPoints}/{totalStoryPoints}</p>
                      <p className="text-xs text-gray-500">{totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}% completed</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Work Item Type Breakdown - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Work Item Type Breakdown</CardTitle>
              <CardDescription>Distribution by initiative, feature, epic, and story</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBreakdownCardsVisible(!breakdownCardsVisible)}
              className="h-8 w-8 p-0"
            >
              {breakdownCardsVisible ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>
          </div>
        </CardHeader>
        {breakdownCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Initiatives</p>
                      <p className="text-2xl font-bold text-purple-600">{initiativeCount}</p>
                    </div>
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Features</p>
                      <p className="text-2xl font-bold text-blue-600">{featureCount}</p>
                    </div>
                    <Layers className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Epics</p>
                      <p className="text-2xl font-bold text-green-600">{epicCount}</p>
                    </div>
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stories</p>
                      <p className="text-2xl font-bold text-orange-600">{storyCount}</p>
                    </div>
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Work Item Hierarchy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch size={18} />
                <span>Work Item Hierarchy</span>
              </CardTitle>
              <CardDescription>Initiative → Feature → Epic → Story decomposition</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hierarchyData.length > 0 ? (
              hierarchyData.map((item) => renderWorkItem(item))
            ) : (
              <div className="text-center py-12">
                <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Items</h3>
                <p className="text-gray-600 mb-4">Start by creating your first work item to begin decomposition</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create First Work Item
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 