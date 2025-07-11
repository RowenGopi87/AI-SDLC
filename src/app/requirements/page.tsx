"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { LLMService } from '@/lib/services/llm-service';
import { useSettingsStore } from '@/store/settings-store';
import { CURRENT_WORKFLOW, getWorkflowLevelByMapping } from '@/lib/workflow-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  Search,
  Target,
  Layers,
  Loader2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export default function RequirementsPage() {
  const { requirements, updateRequirement, selectRequirement, selectedRequirement } = useRequirementStore();
  const { useCases, getUseCaseById } = useUseCaseStore();
  const { llmSettings } = useSettingsStore();
  const searchParams = useSearchParams();
  
  // State for AI enhancement
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [enhancementDialogOpen, setEnhancementDialogOpen] = useState(false);
  const [selectedReqForEnhancement, setSelectedReqForEnhancement] = useState<any>(null);
  
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Set filter from URL params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setFilterStatus(filterParam);
    }
  }, [searchParams]);

  // Get workflow level info
  const requirementLevel = getWorkflowLevelByMapping('requirements');
  const businessBriefLevel = getWorkflowLevelByMapping('businessBrief');

  // Group requirements by business brief (initiative)
  const requirementsByBusinessBrief = requirements.reduce((groups, req) => {
    const useCase = getUseCaseById(req.useCaseId);
    const businessBriefId = useCase?.businessBriefId || 'Unknown';
    const businessBriefTitle = useCase?.title || 'Unknown Initiative';
    
    if (!groups[businessBriefId]) {
      groups[businessBriefId] = {
        businessBriefId,
        businessBriefTitle,
        useCase,
        requirements: []
      };
    }
    groups[businessBriefId].requirements.push(req);
    return groups;
  }, {} as Record<string, { businessBriefId: string; businessBriefTitle: string; useCase: any; requirements: any[] }>);

  // Filter requirements
  const filteredGroups = Object.values(requirementsByBusinessBrief).map(group => ({
    ...group,
    requirements: group.requirements.filter(req => {
      const matchesSearch = req.originalText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.enhancedText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus || 
                           (filterStatus === 'generated' && req.reviewedBy === 'AI System');
      return matchesSearch && matchesStatus;
    })
  })).filter(group => group.requirements.length > 0);

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

  // AI Enhancement functionality
  const handleEnhanceWithAI = async (requirement: any) => {
    if (!llmSettings.apiKey) {
      alert('Please configure your LLM settings first');
      return;
    }

    setIsEnhancing(requirement.id);
    try {
      const llmService = new LLMService(llmSettings);
      
      // Create a mock business brief data from the requirement's use case
      const useCase = getUseCaseById(requirement.useCaseId);
      const businessBriefData = {
        title: useCase?.title || '',
        businessObjective: useCase?.businessObjective || '',
        quantifiableBusinessOutcomes: useCase?.quantifiableBusinessOutcomes || '',
        inScope: useCase?.inScope || '',
        impactOfDoNothing: useCase?.impactOfDoNothing || '',
        happyPath: useCase?.happyPath || '',
        exceptions: useCase?.exceptions || '',
        acceptanceCriteria: useCase?.acceptanceCriteria || [],
        impactedEndUsers: useCase?.impactedEndUsers || '',
        changeImpactExpected: useCase?.changeImpactExpected || '',
        impactToOtherDepartments: useCase?.impactToOtherDepartments || '',
        businessOwner: useCase?.businessOwner || '',
        leadBusinessUnit: useCase?.leadBusinessUnit || '',
        primaryStrategicTheme: useCase?.primaryStrategicTheme || ''
      };

      // Enhanced prompt for requirement enhancement using CLEAR principles
      const enhancementPrompt = `
You are a senior requirements engineer specializing in creating CLEAR requirements. 

Current workflow context: ${CURRENT_WORKFLOW.name}
This requirement is a ${requirementLevel?.name || 'feature'} for the ${businessBriefLevel?.name || 'initiative'}: "${useCase?.title || 'Unknown'}"

Original requirement: "${requirement.originalText}"

Please enhance this requirement to meet ALL CLEAR principles:

**CLEAR Principles:**
- **C**lear: Easy to understand by all stakeholders
- **L**ogical: Makes sense in the business context  
- **E**xact: Precise and specific
- **A**tomic: Addresses one single concern
- **R**eviewable: Can be verified and tested

**Additional Quality Criteria:**
- Testable: Can be verified through testing
- Measurable: Has quantifiable criteria
- Feasible: Technically and practically achievable
- Traceable: Links clearly to business objectives
- Consistent: Aligns with other requirements
- Unambiguous: Has only one interpretation
- Modifiable: Can be changed without major impact
- Verifiable: Success can be demonstrated

Please provide:
1. **Enhanced Requirement**: A completely rewritten requirement that meets all CLEAR principles
2. **Acceptance Criteria**: 3-5 specific, testable acceptance criteria
3. **Business Value**: Clear statement of business value this provides
4. **Quality Assessment**: Brief explanation of how this meets CLEAR principles
5. **Assumptions**: Any assumptions made during enhancement

Format as JSON:
{
  "enhancedText": "Enhanced requirement text",
  "acceptanceCriteria": ["criteria 1", "criteria 2", "criteria 3"],
  "businessValue": "Business value statement", 
  "qualityAssessment": {
    "clear": "How this is clear",
    "logical": "How this is logical", 
    "exact": "How this is exact",
    "atomic": "How this is atomic",
    "reviewable": "How this is reviewable"
  },
  "assumptions": ["assumption 1", "assumption 2"]
}`;

      // For now, simulate the enhancement (replace with actual LLM call)
      const mockEnhancement = {
        enhancedText: `Enhanced: ${requirement.originalText} - This requirement has been enhanced to meet CLEAR principles with specific measurable criteria, defined interfaces, and comprehensive acceptance criteria.`,
        acceptanceCriteria: [
          "Feature must load within 3 seconds under normal load",
          "All user inputs must be validated with clear error messages", 
          "System must handle 1000 concurrent users",
          "All accessibility standards (WCAG 2.1 AA) must be met"
        ],
        businessValue: "Improves user experience and reduces support costs by providing clear, predictable functionality",
        qualityAssessment: {
          clear: "Uses simple language without technical jargon",
          logical: "Follows natural user workflow and business process",
          exact: "Specifies precise performance and quality metrics", 
          atomic: "Addresses single functional area without dependencies",
          reviewable: "Includes testable acceptance criteria and success metrics"
        },
        assumptions: [
          "Current system architecture can support specified performance",
          "Users have standard internet connectivity"
        ]
      };

      // Update the requirement with enhanced text
      updateRequirement(requirement.id, {
        enhancedText: mockEnhancement.enhancedText,
        status: 'enhanced',
        reviewedBy: 'AI System',
        reviewedAt: new Date()
      });

      // Show the enhancement details
      setSelectedReqForEnhancement({
        ...requirement,
        ...mockEnhancement
      });
      setEnhancementDialogOpen(true);

    } catch (error) {
      console.error('Error enhancing requirement:', error);
      alert('Failed to enhance requirement. Please try again.');
    } finally {
      setIsEnhancing(null);
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

  // Helper to parse requirement text (in case it's JSON)
  const parseRequirementText = (text: string) => {
    if (!text) return 'No content available';
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(text);
      if (parsed.text) return parsed.text;
      if (parsed.enhancedText) return parsed.enhancedText;
      if (typeof parsed === 'string') return parsed;
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return as is
      return text;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{requirementLevel?.pluralName || 'Requirements'} Review</h1>
          <p className="text-gray-600 mt-1">
            Review and enhance {requirementLevel?.pluralName?.toLowerCase() || 'requirements'} grouped by {businessBriefLevel?.pluralName?.toLowerCase() || 'business briefs'}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Current Workflow: {CURRENT_WORKFLOW.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {requirementLevel?.name || 'Feature'} → {CURRENT_WORKFLOW.levels.find(l => l.parentLevel === requirementLevel?.id)?.name || 'Epic'}
            </Badge>
          </div>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Generate {requirementLevel?.pluralName || 'Requirements'}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={`Search ${requirementLevel?.pluralName?.toLowerCase() || 'requirements'}...`}
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
            <SelectItem value="generated">🤖 AI Generated</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="enhanced">Enhanced</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{requirementLevel?.pluralName || 'Requirements'} Summary</CardTitle>
              <CardDescription>Overall {requirementLevel?.name?.toLowerCase() || 'requirement'} metrics and status</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSummaryCardsVisible(!summaryCardsVisible)}
              className="h-8 w-8 p-0"
            >
              {summaryCardsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </CardHeader>
        {summaryCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: `Total ${requirementLevel?.pluralName || 'Requirements'}`, value: requirements.length, color: 'bg-blue-100 text-blue-800', icon: FileText },
                { label: 'Approved', value: requirements.filter(r => r.status === 'approved').length, color: 'bg-green-100 text-green-800', icon: CheckCircle },
                { label: 'Enhanced', value: requirements.filter(r => r.status === 'enhanced').length, color: 'bg-blue-100 text-blue-800', icon: Sparkles },
                { label: 'Rejected', value: requirements.filter(r => r.status === 'rejected').length, color: 'bg-red-100 text-red-800', icon: XCircle },
                { label: `${businessBriefLevel?.pluralName || 'Business Briefs'}`, value: Object.keys(requirementsByBusinessBrief).length, color: 'bg-purple-100 text-purple-800', icon: Target },
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

      {/* Requirements grouped by Business Brief */}
      <div className="space-y-6">
        {filteredGroups.map((group) => (
          <Card key={group.businessBriefId} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono text-sm">
                        {group.businessBriefId}
                      </Badge>
                      <span>{group.businessBriefTitle}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <Layers className="h-4 w-4" />
                      <span>{group.requirements.length} {requirementLevel?.name?.toLowerCase() || 'requirement'}{group.requirements.length !== 1 ? 's' : ''}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {businessBriefLevel?.name || 'Initiative'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {group.requirements.map((req, index) => (
                  <Card key={`${req.id}-${index}`} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(req.status)}
                          <span className="font-medium text-sm">{req.id}</span>
                          <Badge className={getStatusColor(req.status)}>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEnhanceWithAI(req)}
                            disabled={isEnhancing === req.id}
                            className="text-xs"
                          >
                            {isEnhancing === req.id ? (
                              <>
                                <Loader2 size={12} className="mr-1 animate-spin" />
                                Enhancing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} className="mr-1" />
                                Enhance by AI
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReqId(selectedReqId === req.id ? null : req.id)}
                          >
                            <Eye size={12} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Original:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {parseRequirementText(req.originalText)}
                          </p>
                        </div>
                        
                        {req.enhancedText && req.enhancedText !== req.originalText && (
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1 flex items-center space-x-1">
                              <Sparkles size={14} />
                              <span>Enhanced:</span>
                            </p>
                            <p className="text-sm text-gray-800 line-clamp-2">
                              {parseRequirementText(req.enhancedText)}
                            </p>
                          </div>
                        )}

                        {req.reviewedBy && (
                          <div className="flex items-center text-xs text-gray-500">
                            <User size={12} className="mr-1" />
                            {req.reviewedBy === 'AI System' ? (
                              <span className="text-blue-600 font-medium">🤖 AI Generated</span>
                            ) : (
                              req.reviewedBy
                            )}
                            <Calendar size={12} className="ml-2 mr-1" />
                            {req.reviewedAt ? new Intl.DateTimeFormat('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }).format(new Date(req.reviewedAt)) : 'N/A'}
                          </div>
                        )}

                        {/* Expanded details */}
                        {selectedReqId === req.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {/* Quality Indicators */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Assessment</h4>
                              <div className="grid grid-cols-3 gap-3">
                                {getQualityIndicators(req).map((indicator, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs">{indicator.label}</span>
                                    <div className="flex items-center space-x-1">
                                      {indicator.value ? (
                                        <CheckCircle size={12} className="text-green-600" />
                                      ) : (
                                        <XCircle size={12} className="text-red-600" />
                                      )}
                                      <span className={`text-xs ${indicator.color}`}>
                                        {indicator.value ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex space-x-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(req.id)}
                                  disabled={req.status === 'rejected'}
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIsEditing(true);
                                    setEditText(req.enhancedText || req.originalText);
                                    setSelectedReqId(req.id);
                                  }}
                                >
                                  <Edit size={14} className="mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(req.id)}
                                  disabled={req.status === 'approved'}
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Enhancement Results Dialog */}
      <Dialog open={enhancementDialogOpen} onOpenChange={setEnhancementDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>AI Enhancement Results</span>
            </DialogTitle>
            <DialogDescription>
              Review the AI-enhanced requirement following CLEAR principles
            </DialogDescription>
          </DialogHeader>
          
          {selectedReqForEnhancement && (
            <div className="space-y-6">
              {/* Before and After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Original</h3>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {parseRequirementText(selectedReqForEnhancement.originalText)}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center space-x-1">
                    <Sparkles size={16} />
                    <span>Enhanced</span>
                  </h3>
                  <div className="p-3 bg-blue-50 rounded border text-sm">
                    {selectedReqForEnhancement.enhancedText}
                  </div>
                </div>
              </div>

              {/* Acceptance Criteria */}
              {selectedReqForEnhancement.acceptanceCriteria && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Acceptance Criteria</h3>
                  <ul className="space-y-1">
                    {selectedReqForEnhancement.acceptanceCriteria.map((criteria: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle size={14} className="text-green-600 mt-0.5" />
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Business Value */}
              {selectedReqForEnhancement.businessValue && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Business Value</h3>
                  <p className="text-sm text-gray-700 p-3 bg-green-50 rounded border">
                    {selectedReqForEnhancement.businessValue}
                  </p>
                </div>
              )}

              {/* Quality Assessment */}
              {selectedReqForEnhancement.qualityAssessment && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">CLEAR Principles Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedReqForEnhancement.qualityAssessment).map(([principle, assessment]: [string, any]) => (
                      <div key={principle} className="p-3 border rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle size={14} className="text-green-600" />
                          <span className="font-medium text-sm capitalize">{principle}</span>
                        </div>
                        <p className="text-xs text-gray-600">{assessment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions */}
              {selectedReqForEnhancement.assumptions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Assumptions</h3>
                  <ul className="space-y-1">
                    {selectedReqForEnhancement.assumptions.map((assumption: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <AlertTriangle size={14} className="text-yellow-600 mt-0.5" />
                        <span>{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
            <DialogDescription>
              Modify the requirement text
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[150px]"
              placeholder="Enter requirement text..."
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 