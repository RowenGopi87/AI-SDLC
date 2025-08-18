"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Eye, 
  Edit3, 
  Save, 
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Building,
  Target,
  FileText,
  Brain
} from "lucide-react";

interface BusinessBrief {
  id: string;
  title: string;
  description: string;
  businessOwner?: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  workflowStage?: string;
  submittedAt?: string;
  createdAt: string;
  leadBusinessUnit?: string;
  primaryStrategicTheme?: string;
  businessObjective?: string;
  quantifiableBusinessOutcomes?: string;
  inScope?: string;
  outOfScope?: string;
  impactOfDoNothing?: string;
}

interface BusinessBriefViewModalProps {
  brief: BusinessBrief | null;
  isOpen: boolean;
  onClose: () => void;
  aiAssessment?: any;
}

interface BusinessBriefEditModalProps {
  brief: BusinessBrief | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBrief: BusinessBrief) => void;
}

interface BusinessBriefDeleteModalProps {
  brief: BusinessBrief | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function BusinessBriefViewModal({ brief, isOpen, onClose, aiAssessment }: BusinessBriefViewModalProps) {
  if (!isOpen || !brief) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      in_review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      critical: 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full m-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getStatusColor(brief.status)} variant="outline">
                    {brief.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className={`text-xs ${getPriorityColor(brief.priority)}`}>
                    {brief.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    {brief.id}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{brief.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {brief.description}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* AI Assessment Summary */}
            {aiAssessment && aiAssessment.summary && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Brain size={16} className="text-purple-600" />
                    <span>AI Grading Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {(aiAssessment.summary.score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Overall Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {aiAssessment.summary.level}
                      </div>
                      <div className="text-xs text-gray-600">Quality Level</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {aiAssessment.summary.recommendations}
                      </div>
                      <div className="text-xs text-gray-600">Recommendations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <User size={14} />
                    <span>Business Owner</span>
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">{brief.businessOwner || 'Not specified'}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Building size={14} />
                    <span>Lead Business Unit</span>
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">{brief.leadBusinessUnit || 'Not specified'}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Target size={14} />
                    <span>Strategic Theme</span>
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">{brief.primaryStrategicTheme || 'Not specified'}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Created</span>
                  </Label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(brief.createdAt).toLocaleString()}
                  </div>
                </div>
                
                {brief.submittedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <CheckCircle size={14} />
                      <span>Submitted</span>
                    </Label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(brief.submittedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Workflow Stage</Label>
                  <div className="mt-1 text-sm text-gray-900">{brief.workflowStage || 'Idea'}</div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            {brief.businessObjective && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Business Objective</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-900">
                  {brief.businessObjective}
                </div>
              </div>
            )}

            {brief.quantifiableBusinessOutcomes && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Quantifiable Business Outcomes</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-900">
                  {brief.quantifiableBusinessOutcomes}
                </div>
              </div>
            )}

            {/* Scope Information */}
            {(brief.inScope || brief.outOfScope) && (
              <div className="grid grid-cols-2 gap-4">
                {brief.inScope && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">In Scope</Label>
                    <div className="mt-1 p-3 bg-green-50 rounded border text-sm text-gray-900">
                      {brief.inScope}
                    </div>
                  </div>
                )}
                
                {brief.outOfScope && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Out of Scope</Label>
                    <div className="mt-1 p-3 bg-red-50 rounded border text-sm text-gray-900">
                      {brief.outOfScope}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Impact Assessment */}
            {brief.impactOfDoNothing && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Impact of Do Nothing</Label>
                <div className="mt-1 p-3 bg-orange-50 rounded border text-sm text-gray-900">
                  {brief.impactOfDoNothing}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BusinessBriefEditModal({ brief, isOpen, onClose, onSave }: BusinessBriefEditModalProps) {
  const [formData, setFormData] = useState<BusinessBrief | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brief && isOpen) {
      setFormData({ ...brief });
    }
  }, [brief, isOpen]);

  const handleInputChange = (field: keyof BusinessBrief, value: string) => {
    if (formData) {
      setFormData(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/business-briefs/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave(formData);
        onClose();
      } else {
        alert('Failed to update business brief');
      }
    } catch (error) {
      console.error('Error updating business brief:', error);
      alert('An error occurred while updating the business brief');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full m-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 size={20} className="text-blue-600" />
                  <span>Edit Business Brief</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Update business brief information
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-businessOwner" className="text-sm font-medium">Business Owner</Label>
                <Input
                  id="edit-businessOwner"
                  value={formData.businessOwner || ''}
                  onChange={(e) => handleInputChange('businessOwner', e.target.value)}
                  className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority" className="text-sm font-medium">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                  <SelectTrigger className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm">
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                  <SelectTrigger className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm">
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
              </div>
            </div>

            {/* Business Unit and Strategic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-leadBusinessUnit" className="text-sm font-medium">Lead Business Unit</Label>
                <Input
                  id="edit-leadBusinessUnit"
                  value={formData.leadBusinessUnit || ''}
                  onChange={(e) => handleInputChange('leadBusinessUnit', e.target.value)}
                  className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-primaryStrategicTheme" className="text-sm font-medium">Primary Strategic Theme</Label>
                <Input
                  id="edit-primaryStrategicTheme"
                  value={formData.primaryStrategicTheme || ''}
                  onChange={(e) => handleInputChange('primaryStrategicTheme', e.target.value)}
                  className="border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Business Objective */}
            <div className="space-y-2">
              <Label htmlFor="edit-businessObjective" className="text-sm font-medium">Business Objective</Label>
              <Textarea
                id="edit-businessObjective"
                value={formData.businessObjective || ''}
                onChange={(e) => handleInputChange('businessObjective', e.target.value)}
                className="min-h-[80px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                placeholder="Describe the business objective..."
              />
            </div>

            {/* Quantifiable Business Outcomes */}
            <div className="space-y-2">
              <Label htmlFor="edit-quantifiableBusinessOutcomes" className="text-sm font-medium">Quantifiable Business Outcomes</Label>
              <Textarea
                id="edit-quantifiableBusinessOutcomes"
                value={formData.quantifiableBusinessOutcomes || ''}
                onChange={(e) => handleInputChange('quantifiableBusinessOutcomes', e.target.value)}
                className="min-h-[80px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                placeholder="What measurable outcomes are expected..."
              />
            </div>

            {/* Scope Definition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-inScope" className="text-sm font-medium">In Scope</Label>
                <Textarea
                  id="edit-inScope"
                  value={formData.inScope || ''}
                  onChange={(e) => handleInputChange('inScope', e.target.value)}
                  className="min-h-[80px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  placeholder="What is included in this initiative..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-outOfScope" className="text-sm font-medium">Out of Scope</Label>
                <Textarea
                  id="edit-outOfScope"
                  value={formData.outOfScope || ''}
                  onChange={(e) => handleInputChange('outOfScope', e.target.value)}
                  className="min-h-[80px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  placeholder="What is explicitly excluded..."
                />
              </div>
            </div>

            {/* Impact Assessment */}
            <div className="space-y-2">
              <Label htmlFor="edit-impactOfDoNothing" className="text-sm font-medium">Impact of Do Nothing</Label>
              <Textarea
                id="edit-impactOfDoNothing"
                value={formData.impactOfDoNothing || ''}
                onChange={(e) => handleInputChange('impactOfDoNothing', e.target.value)}
                className="min-h-[80px] border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                placeholder="What happens if this initiative is not pursued..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save All Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BusinessBriefDeleteModal({ brief, isOpen, onClose, onConfirm, isDeleting }: BusinessBriefDeleteModalProps) {
  if (!isOpen || !brief) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Delete Business Brief</CardTitle>
                <CardDescription>
                  This action cannot be undone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded border border-red-200">
              <div className="text-sm text-red-800">
                <div className="font-medium mb-1">You are about to delete:</div>
                <div className="font-semibold">{brief.title}</div>
                <div className="text-xs text-red-600 mt-1">ID: {brief.id}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              This will permanently remove the business brief and all associated data including:
            </div>
            
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <CheckCircle size={12} className="text-red-500" />
                <span>Business brief details</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={12} className="text-red-500" />
                <span>AI quality assessments</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle size={12} className="text-red-500" />
                <span>Workflow progress data</span>
              </li>
            </ul>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={onConfirm} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Business Brief'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
