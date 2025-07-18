"use client";

import { useState } from 'react';
import { useDefectStore } from '@/store/defect-store';
import { useTestCaseStore } from '@/store/test-case-store';
import { useWorkItemStore } from '@/store/work-item-store';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { formatDateTimeForDisplay } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bug, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function DefectsPage() {
  const { defects, addDefect, updateDefect, deleteDefect } = useDefectStore();
  const { testCases, getTestCaseById } = useTestCaseStore();
  const { getWorkItemById } = useWorkItemStore();
  const { getRequirementById } = useRequirementStore();
  const { getUseCaseById } = useUseCaseStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const [selectedDefect, setSelectedDefect] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [formData, setFormData] = useState<{
    testCaseId: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee: string;
    reporter: string;
  }>({
    testCaseId: '',
    title: '',
    description: '',
    severity: 'medium',
    priority: 'medium',
    assignee: '',
    reporter: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDefect) {
      updateDefect(editingDefect.id, formData);
    } else {
      addDefect({
        ...formData,
        status: 'open' as const,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      testCaseId: '',
      title: '',
      description: '',
      severity: 'medium',
      priority: 'medium',
      assignee: '',
      reporter: '',
    });
    setEditingDefect(null);
  };

  const handleEdit = (defect: any) => {
    setEditingDefect(defect);
    setFormData({
      testCaseId: defect.testCaseId,
      title: defect.title,
      description: defect.description,
      severity: defect.severity,
      priority: defect.priority,
      assignee: defect.assignee || '',
      reporter: defect.reporter,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this defect?')) {
      deleteDefect(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateDefect(id, { status: newStatus as 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle size={16} className="text-green-600" />;
      case 'closed': return <CheckCircle size={16} className="text-gray-600" />;
      case 'in_progress': return <Clock size={16} className="text-blue-600" />;
      case 'reopened': return <AlertCircle size={16} className="text-orange-600" />;
      default: return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'reopened': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
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

  const filteredDefects = defects.filter(defect => {
    const matchesSearch = defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || defect.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const defectStats = {
    total: defects.length,
    open: defects.filter(d => d.status === 'open').length,
    inProgress: defects.filter(d => d.status === 'in_progress').length,
    resolved: defects.filter(d => d.status === 'resolved').length,
    closed: defects.filter(d => d.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Defect Management</h1>
          <p className="text-gray-600 mt-1">Track and manage software defects</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={resetForm}>
              <Plus size={16} />
              <span>New Defect</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDefect ? 'Edit Defect' : 'Report New Defect'}
              </DialogTitle>
              <DialogDescription>
                Provide details about the defect for tracking and resolution
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Case *
                </label>
                <Select value={formData.testCaseId} onValueChange={(value) => setFormData({ ...formData, testCaseId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test case" />
                  </SelectTrigger>
                  <SelectContent>
                    {testCases.map((testCase) => (
                      <SelectItem key={testCase.id} value={testCase.id}>
                        {testCase.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter defect title"
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
                  placeholder="Describe the defect in detail"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity *
                  </label>
                  <Select value={formData.severity} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({ ...formData, severity: value })}>
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
                    Priority *
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <Input
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assign to team member"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reporter *
                  </label>
                  <Input
                    value={formData.reporter}
                    onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
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
                  {editingDefect ? 'Update' : 'Report'} Defect
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Defect Summary - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Defect Summary</CardTitle>
              <CardDescription>Defect tracking metrics and status overview</CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Defects', value: defectStats.total, color: 'bg-blue-100 text-blue-800' },
                { label: 'Open', value: defectStats.open, color: 'bg-red-100 text-red-800' },
                { label: 'In Progress', value: defectStats.inProgress, color: 'bg-blue-100 text-blue-800' },
                { label: 'Resolved', value: defectStats.resolved, color: 'bg-green-100 text-green-800' },
                { label: 'Closed', value: defectStats.closed, color: 'bg-gray-100 text-gray-800' },
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
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search defects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="reopened">Reopened</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Defects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug size={18} />
            <span>Defects ({filteredDefects.length})</span>
          </CardTitle>
          <CardDescription>Track and manage software defects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Defect</TableHead>
                <TableHead>Test Case</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDefects.map((defect) => {
                const testCase = getTestCaseById(defect.testCaseId);
                return (
                  <TableRow key={defect.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{defect.title}</div>
                        <div className="text-sm text-gray-500">
                          Reported by {defect.reporter}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{testCase?.title || 'Unknown'}</div>
                        {testCase && (() => {
                          const workItem = getWorkItemById(testCase.workItemId);
                          const requirement = workItem ? getRequirementById(workItem.requirementId) : null;
                          const useCase = requirement ? getUseCaseById(requirement.useCaseId) : null;
                          return useCase ? (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs font-mono">
                                {useCase.businessBriefId}
                              </Badge>
                              <span>{useCase.title}</span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(defect.severity)} variant="secondary">
                        {defect.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(defect.priority)} variant="outline">
                        {defect.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(defect.status)}
                        <Select
                          value={defect.status}
                          onValueChange={(value) => handleStatusChange(defect.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="reopened">Reopened</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{defect.assignee || 'Unassigned'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedDefect(defect)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(defect)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(defect.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredDefects.length === 0 && (
            <div className="text-center py-8">
              <Bug size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No defects found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No defects have been reported yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Defect Details Modal */}
      {selectedDefect && (
        <Dialog open={!!selectedDefect} onOpenChange={() => setSelectedDefect(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Bug size={18} />
                <span>Defect Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected defect
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Title</p>
                    <p className="text-sm text-gray-600">{selectedDefect.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Test Case</p>
                    <p className="text-sm text-gray-600">
                      {getTestCaseById(selectedDefect.testCaseId)?.title || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Severity</p>
                    <Badge className={getSeverityColor(selectedDefect.severity)} variant="secondary">
                      {selectedDefect.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Priority</p>
                    <Badge className={getPriorityColor(selectedDefect.priority)} variant="outline">
                      {selectedDefect.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedDefect.status)}
                      <Badge className={getStatusColor(selectedDefect.status)}>
                        {selectedDefect.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assignee</p>
                    <p className="text-sm text-gray-600">{selectedDefect.assignee || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-sm text-gray-600">{selectedDefect.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Reporter</p>
                  <p className="text-sm text-gray-600">{selectedDefect.reporter}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">{formatDateTimeForDisplay(selectedDefect.createdAt)}</p>
                </div>
              </div>

              {selectedDefect.resolvedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Resolved</p>
                  <p className="text-sm text-gray-600">{formatDateTimeForDisplay(selectedDefect.resolvedAt)}</p>
                </div>
              )}

              {selectedDefect.aiSummary && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles size={16} className="text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">AI Summary</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-800">{selectedDefect.aiSummary}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 