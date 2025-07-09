"use client";

import { useState } from 'react';
import { useTestCaseStore } from '@/store/test-case-store';
import { useWorkItemStore } from '@/store/work-item-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Edit,
  Trash2,
  User,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

export default function TestCasesPage() {
  const { testCases, addTestCase, updateTestCase, deleteTestCase, executeTestCase } = useTestCaseStore();
  const { workItems, getWorkItemById } = useWorkItemStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    workItemId: '',
    title: '',
    description: '',
    type: 'positive' as const,
    preconditions: '',
    steps: '',
    expectedResult: '',
    priority: 'medium' as const,
    createdBy: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preconditionsArray = formData.preconditions
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const stepsArray = formData.steps
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const testCaseData = {
      ...formData,
      preconditions: preconditionsArray,
      steps: stepsArray,
      status: 'not_run' as const,
    };

    if (editingTestCase) {
      updateTestCase(editingTestCase.id, testCaseData);
    } else {
      addTestCase(testCaseData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      workItemId: '',
      title: '',
      description: '',
      type: 'positive',
      preconditions: '',
      steps: '',
      expectedResult: '',
      priority: 'medium',
      createdBy: '',
    });
    setEditingTestCase(null);
  };

  const handleEdit = (testCase: any) => {
    setEditingTestCase(testCase);
    setFormData({
      workItemId: testCase.workItemId,
      title: testCase.title,
      description: testCase.description,
      type: testCase.type,
      preconditions: testCase.preconditions.join('\n'),
      steps: testCase.steps.join('\n'),
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
      createdBy: testCase.createdBy,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(id);
    }
  };

  const handleExecute = (id: string, result: 'passed' | 'failed' | 'blocked') => {
    executeTestCase(id, result);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle size={16} className="text-green-600" />;
      case 'negative': return <XCircle size={16} className="text-red-600" />;
      case 'edge': return <AlertTriangle size={16} className="text-yellow-600" />;
      default: return <TestTube size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'edge': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-yellow-100 text-yellow-800';
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

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || testCase.type === filterType;
    const matchesStatus = filterStatus === 'all' || testCase.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const testCasesByType = {
    positive: filteredTestCases.filter(tc => tc.type === 'positive'),
    negative: filteredTestCases.filter(tc => tc.type === 'negative'),
    edge: filteredTestCases.filter(tc => tc.type === 'edge'),
  };

  const renderTestCaseCard = (testCase: any) => {
    const workItem = getWorkItemById(testCase.workItemId);
    
    return (
      <Card key={testCase.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getTypeIcon(testCase.type)}
              <CardTitle className="text-lg">{testCase.title}</CardTitle>
            </div>
            <div className="flex flex-col space-y-1">
              <Badge className={getStatusColor(testCase.status)}>
                {testCase.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
                {testCase.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{testCase.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <TestTube size={14} className="mr-2" />
              Work Item: {workItem?.title || 'Unknown'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <User size={14} className="mr-2" />
              Created by: {testCase.createdBy}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-2" />
              Created: {testCase.createdAt.toLocaleDateString()}
            </div>
            {testCase.lastExecuted && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-2" />
                Last executed: {testCase.lastExecuted.toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Expected Result:</p>
            <p className="text-sm text-gray-600 line-clamp-2">{testCase.expectedResult}</p>
          </div>

          {testCase.actualResult && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Actual Result:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{testCase.actualResult}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExecute(testCase.id, 'passed')}
                disabled={testCase.status === 'passed'}
              >
                <CheckCircle size={14} className="mr-1" />
                Pass
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExecute(testCase.id, 'failed')}
                disabled={testCase.status === 'failed'}
              >
                <XCircle size={14} className="mr-1" />
                Fail
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExecute(testCase.id, 'blocked')}
                disabled={testCase.status === 'blocked'}
              >
                <AlertTriangle size={14} className="mr-1" />
                Block
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(testCase)}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(testCase.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
          <p className="text-gray-600 mt-1">Generate and manage test cases for work items</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={resetForm}>
              <Plus size={16} />
              <span>New Test Case</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestCase ? 'Edit Test Case' : 'Create New Test Case'}
              </DialogTitle>
              <DialogDescription>
                Define test case details and steps
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Item *
                  </label>
                  <Select value={formData.workItemId} onValueChange={(value) => setFormData({ ...formData, workItemId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work item" />
                    </SelectTrigger>
                    <SelectContent>
                      {workItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title} ({item.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
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
                  placeholder="Enter test case title"
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
                  placeholder="Describe the test case"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions *
                </label>
                <Textarea
                  value={formData.preconditions}
                  onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
                  placeholder="List preconditions (one per line)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Steps *
                </label>
                <Textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="List test steps (one per line)"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result *
                </label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Describe the expected result"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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
                    Created By *
                  </label>
                  <Input
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTestCase ? 'Update' : 'Create'} Test Case
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
            placeholder="Search test cases..."
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
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="edge">Edge</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_run">Not Run</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Test Cases Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredTestCases.length})</TabsTrigger>
          <TabsTrigger value="positive">Positive ({testCasesByType.positive.length})</TabsTrigger>
          <TabsTrigger value="negative">Negative ({testCasesByType.negative.length})</TabsTrigger>
          <TabsTrigger value="edge">Edge ({testCasesByType.edge.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestCases.map(renderTestCaseCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="positive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCasesByType.positive.map(renderTestCaseCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="negative" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCasesByType.negative.map(renderTestCaseCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="edge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCasesByType.edge.map(renderTestCaseCard)}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTestCases.length === 0 && (
        <div className="text-center py-12">
          <TestTube size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first test case to get started'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Test Cases', value: testCases.length, color: 'bg-blue-100 text-blue-800' },
          { label: 'Passed', value: testCases.filter(tc => tc.status === 'passed').length, color: 'bg-green-100 text-green-800' },
          { label: 'Failed', value: testCases.filter(tc => tc.status === 'failed').length, color: 'bg-red-100 text-red-800' },
          { label: 'Blocked', value: testCases.filter(tc => tc.status === 'blocked').length, color: 'bg-yellow-100 text-yellow-800' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Badge className={stat.color}>{stat.value}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 