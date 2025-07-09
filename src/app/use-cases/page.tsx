"use client";

import { useState } from 'react';
import { useUseCaseStore } from '@/store/use-case-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Search,
  Filter
} from 'lucide-react';

export default function UseCasesPage() {
  const { useCases, addUseCase, updateUseCase, selectUseCase, selectedUseCase } = useUseCaseStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessValue: '',
    acceptanceCriteria: '',
    submittedBy: '',
    priority: 'medium' as const,
    status: 'draft' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const acceptanceCriteriaArray = formData.acceptanceCriteria
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    addUseCase({
      ...formData,
      acceptanceCriteria: acceptanceCriteriaArray,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      businessValue: '',
      acceptanceCriteria: '',
      submittedBy: '',
      priority: 'medium',
      status: 'draft',
    });
    
    setIsDialogOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateUseCase(id, { status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'in_review': return <Clock size={16} className="text-blue-600" />;
      case 'rejected': return <AlertCircle size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  const filteredUseCases = useCases.filter(useCase => {
    const matchesSearch = useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || useCase.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Use Cases</h1>
          <p className="text-gray-600 mt-1">Submit and manage business use cases</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>New Use Case</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit New Use Case</DialogTitle>
              <DialogDescription>
                Provide details about your business use case for review and processing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter use case title"
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
                  placeholder="Describe the use case in detail"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Value *
                </label>
                <Textarea
                  value={formData.businessValue}
                  onChange={(e) => setFormData({ ...formData, businessValue: e.target.value })}
                  placeholder="Explain the business value and impact"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acceptance Criteria *
                </label>
                <Textarea
                  value={formData.acceptanceCriteria}
                  onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                  placeholder="List acceptance criteria (one per line)"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted By *
                  </label>
                  <Input
                    value={formData.submittedBy}
                    onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                
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
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Use Case</Button>
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
            placeholder="Search use cases..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Use Cases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUseCases.map((useCase) => (
          <Card key={useCase.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(useCase.status)}
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(useCase.status)}>
                    {useCase.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(useCase.priority)}>
                    {useCase.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">{useCase.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <User size={14} className="mr-2" />
                  {useCase.submittedBy}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-2" />
                  {useCase.submittedAt.toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Business Value:</p>
                <p className="text-sm text-gray-600 line-clamp-2">{useCase.businessValue}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Acceptance Criteria:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {useCase.acceptanceCriteria.slice(0, 2).map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="line-clamp-1">{criteria}</span>
                    </li>
                  ))}
                  {useCase.acceptanceCriteria.length > 2 && (
                    <li className="text-gray-400 text-xs">
                      +{useCase.acceptanceCriteria.length - 2} more...
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Select
                  value={useCase.status}
                  onValueChange={(value) => handleStatusChange(useCase.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredUseCases.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No use cases found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first use case'
            }
          </p>
        </div>
      )}
    </div>
  );
} 