"use client";

import { useState } from 'react';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  FileText, 
  ArrowRight,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';

export default function RequirementsPage() {
  const { requirements, updateRequirement, selectRequirement, selectedRequirement } = useRequirementStore();
  const { useCases, getUseCaseById } = useUseCaseStore();
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedReq = selectedReqId ? requirements.find(r => r.id === selectedReqId) : null;
  const selectedUseCase = selectedReq ? getUseCaseById(selectedReq.useCaseId) : null;

  const handleApprove = (id: string) => {
    updateRequirement(id, { 
      status: 'approved', 
      reviewedBy: 'Current User', 
      reviewedAt: new Date() 
    });
  };

  const handleReject = (id: string) => {
    updateRequirement(id, { 
      status: 'rejected', 
      reviewedBy: 'Current User', 
      reviewedAt: new Date() 
    });
  };

  const handleEditSave = () => {
    if (selectedReqId && editText.trim()) {
      updateRequirement(selectedReqId, { 
        enhancedText: editText,
        status: 'enhanced'
      });
      setIsEditing(false);
      setEditText('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected': return <XCircle size={16} className="text-red-600" />;
      case 'enhanced': return <Sparkles size={16} className="text-blue-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getQualityIndicators = (req: any) => [
    { label: 'Unambiguous', value: req.isUnambiguous, color: req.isUnambiguous ? 'text-green-600' : 'text-red-600' },
    { label: 'Testable', value: req.isTestable, color: req.isTestable ? 'text-green-600' : 'text-red-600' },
    { label: 'Has Acceptance Criteria', value: req.hasAcceptanceCriteria, color: req.hasAcceptanceCriteria ? 'text-green-600' : 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requirements Review</h1>
          <p className="text-gray-600 mt-1">Review and enhance requirements for clarity and testability</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Generate Requirements</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search requirements..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="enhanced">Enhanced</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Requirements Summary</CardTitle>
              <CardDescription>Overall requirement metrics and status</CardDescription>
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
                { label: 'Total Requirements', value: requirements.length, color: 'bg-blue-100 text-blue-800', icon: FileText },
                { label: 'Approved', value: requirements.filter(r => r.status === 'approved').length, color: 'bg-green-100 text-green-800', icon: CheckCircle },
                { label: 'Enhanced', value: requirements.filter(r => r.status === 'enhanced').length, color: 'bg-blue-100 text-blue-800', icon: Sparkles },
                { label: 'Rejected', value: requirements.filter(r => r.status === 'rejected').length, color: 'bg-red-100 text-red-800', icon: XCircle },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Requirements List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText size={18} />
                <span>Requirements ({requirements.length})</span>
              </CardTitle>
              <CardDescription>Select a requirement to review and enhance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((req) => {
                const useCase = getUseCaseById(req.useCaseId);
                const isSelected = selectedReqId === req.id;
                
                return (
                  <div
                    key={req.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReqId(req.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(req.status)}
                        <span className="font-medium text-sm">{req.id}</span>
                      </div>
                      <Badge className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Use Case:</strong> {useCase?.title || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {req.originalText}
                      </p>
                      
                      {req.reviewedBy && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <User size={12} className="mr-1" />
                          {req.reviewedBy}
                          <Calendar size={12} className="ml-2 mr-1" />
                          {req.reviewedAt?.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Side-by-Side Review */}
        <div className="space-y-4">
          {selectedReq ? (
            <>
              {/* Quality Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quality Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {getQualityIndicators(selectedReq).map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{indicator.label}</span>
                        <div className="flex items-center space-x-2">
                          {indicator.value ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-600" />
                          )}
                          <span className={`text-sm ${indicator.color}`}>
                            {indicator.value ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Side-by-Side Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowRight size={18} />
                    <span>Original vs Enhanced</span>
                  </CardTitle>
                  <CardDescription>
                    Use Case: {selectedUseCase?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Text */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-gray-600" />
                        <span className="font-medium text-sm">Original Requirement</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-800">{selectedReq.originalText}</p>
                      </div>
                    </div>

                    {/* Enhanced Text */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-blue-600" />
                        <span className="font-medium text-sm">AI Enhanced</span>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[100px] text-sm"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleEditSave}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <p className="text-sm text-gray-800">{selectedReq.enhancedText}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-0 right-0 p-1"
                              onClick={() => {
                                setIsEditing(true);
                                setEditText(selectedReq.enhancedText);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Human in the Loop Approval</CardTitle>
                  <CardDescription>
                    Review the enhanced requirement and take action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <Badge className={getStatusColor(selectedReq.status)}>
                        {selectedReq.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(selectedReq.id)}
                        disabled={selectedReq.status === 'rejected'}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setEditText(selectedReq.enhancedText);
                        }}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(selectedReq.id)}
                        disabled={selectedReq.status === 'approved'}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Requirement
                  </h3>
                  <p className="text-gray-600">
                    Choose a requirement from the list to review and enhance
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>


    </div>
  );
} 