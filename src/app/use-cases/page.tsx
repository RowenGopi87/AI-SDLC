"use client";

import { useState } from 'react';
import { useUseCaseStore } from '@/store/use-case-store';
import { useSettingsStore } from '@/store/settings-store';
import { useRequirementStore } from '@/store/requirement-store';
import { setSelectedItem } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Building2,
  Target,
  Lightbulb,
  Upload,
  Users,
  Settings,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

export default function UseCasesPage() {
  const { useCases, addUseCase, updateUseCase, selectUseCase, selectedUseCase } = useUseCaseStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  const { addGeneratedRequirements, addGeneratedRequirementsFromJSON } = useRequirementStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  // Commented out workflow modal - using sidebar workflow steps instead
  // const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [viewingUseCase, setViewingUseCase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessValue: '',
    acceptanceCriteria: '',
    submittedBy: '',
    priority: 'medium' as const,
    status: 'draft' as const,
    // Business Brief fields
    businessOwner: '',
    leadBusinessUnit: '',
    additionalBusinessUnits: [] as string[],
    primaryStrategicTheme: '',
    businessObjective: '',
    quantifiableBusinessOutcomes: '',
    inScope: '',
    impactOfDoNothing: '',
    happyPath: '',
    exceptions: '',
    // End users and stakeholders
    impactedEndUsers: '',
    changeImpactExpected: '',
    impactToOtherDepartments: '',
    otherDepartmentsImpacted: [] as string[],
    // Technology impact
    impactsExistingTechnology: false,
    technologySolutions: '',
    relevantBusinessOwners: '',
    otherTechnologyInfo: '',
    supportingDocuments: [] as string[],
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
      additionalBusinessUnits: formData.additionalBusinessUnits,
      otherDepartmentsImpacted: formData.otherDepartmentsImpacted,
      supportingDocuments: formData.supportingDocuments,
      workflowStage: 'idea' as const,
      completionPercentage: 10,
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
      businessOwner: '',
      leadBusinessUnit: '',
      additionalBusinessUnits: [],
      primaryStrategicTheme: '',
      businessObjective: '',
      quantifiableBusinessOutcomes: '',
      inScope: '',
      impactOfDoNothing: '',
      happyPath: '',
      exceptions: '',
      impactedEndUsers: '',
      changeImpactExpected: '',
      impactToOtherDepartments: '',
      otherDepartmentsImpacted: [],
      impactsExistingTechnology: false,
      technologySolutions: '',
      relevantBusinessOwners: '',
      otherTechnologyInfo: '',
      supportingDocuments: [],
    });
    
    setIsDialogOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateUseCase(id, { status: newStatus });
  };

  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateRequirements = async (useCaseId: string) => {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
      alert('Use case not found');
      return;
    }

    setIsGeneratingRequirements(useCaseId);
    setGenerationError(null);

    try {
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API (with settings in headers)
      const settingsResponse = await fetch('/api/settings/validate', {
        headers: {
          'x-llm-provider': llmSettings.provider,
          'x-llm-model': llmSettings.model,
          'x-llm-api-key': llmSettings.apiKey,
          'x-llm-temperature': llmSettings.temperature?.toString() || '0.7',
          'x-llm-max-tokens': llmSettings.maxTokens?.toString() || '4000',
        },
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Please configure LLM settings in the Settings page first');
      }

      const { isValid, settings } = await settingsResponse.json();
      if (!isValid) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Generate requirements using the configured LLM
      const response = await fetch('/api/generate-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessBriefId: useCase.id,
          businessBriefData: {
            title: useCase.title,
            businessObjective: useCase.businessObjective || useCase.description,
            quantifiableBusinessOutcomes: useCase.quantifiableBusinessOutcomes || '',
            inScope: useCase.inScope || '',
            impactOfDoNothing: useCase.impactOfDoNothing || '',
            happyPath: useCase.happyPath || '',
            exceptions: useCase.exceptions || '',
            acceptanceCriteria: Array.isArray(useCase.acceptanceCriteria) 
              ? useCase.acceptanceCriteria 
              : typeof useCase.acceptanceCriteria === 'string' 
                ? [useCase.acceptanceCriteria] 
                : [],
            impactedEndUsers: useCase.impactedEndUsers || '',
            changeImpactExpected: useCase.changeImpactExpected || '',
            impactToOtherDepartments: useCase.impactToOtherDepartments || '',
            businessOwner: useCase.businessOwner || '',
            leadBusinessUnit: useCase.leadBusinessUnit || '',
            primaryStrategicTheme: useCase.primaryStrategicTheme || '',
          },
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate requirements');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Requirements generation failed');
      }

      // Save generated requirements to the store
      const { requirements, metadata } = result.data;
      
      // Always attempt automatic JSON parsing first
      let parseSuccess = false;
      
      if (requirements.length === 1) {
        // Try to parse the first requirement's description as JSON
        const firstReq = requirements[0];
        const textToParse = firstReq.rawJsonContent || firstReq.description;
        
        if (textToParse) {
          console.log('Attempting automatic JSON parsing for OpenAI response...');
                     const parseResult = addGeneratedRequirementsFromJSON(useCaseId, textToParse);
           
           if (parseResult.success && parseResult.requirementsCount > 1) {
             console.log(`✅ Automatically parsed ${parseResult.requirementsCount} requirements from OpenAI response`);
             parseSuccess = true;
          } else {
            console.log('❌ Automatic JSON parsing failed or yielded single requirement, using standard processing');
          }
        }
      }
      
      // Fallback to standard processing if automatic parsing failed
      if (!parseSuccess) {
        console.log('Using standard requirements processing');
        addGeneratedRequirements(useCaseId, requirements);
      }

      // Save to backend (for persistence)
      try {
        const saveResponse = await fetch('/api/requirements/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessBriefId: useCaseId,
            requirements: requirements,
          }),
        });

        if (!saveResponse.ok) {
          const saveError = await saveResponse.json();
          console.warn('Save failed but continuing:', saveError);
          // Don't throw error - generation was successful, just save failed
        }
      } catch (saveError) {
        console.warn('Save error (non-critical):', saveError);
        // Continue anyway - the important part (generation) worked
      }

      // Show success message with details  
      const actualRequirementsCount = parseSuccess ? 
        `automatically parsed multiple requirements` : 
        `${requirements.length} requirements`;
      alert(`Successfully generated ${actualRequirementsCount} in ${metadata.iterationCount} iterations using ${metadata.llmProvider} ${metadata.llmModel}. Processing time: ${Math.round(metadata.processingTime / 1000)}s`);
      
      // Redirect to requirements page to view the generated requirements
      // Use setTimeout to ensure store is updated before redirect
      setTimeout(() => {
        window.location.href = `/requirements?filter=generated&businessBrief=${useCaseId}`;
      }, 100);

    } catch (error) {
      console.error('Error generating requirements:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setGenerationError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsGeneratingRequirements(null);
    }
  };

  const handleViewDetails = (useCase: any) => {
    setViewingUseCase(useCase);
    setIsViewDialogOpen(true);
    // Update sidebar with selected item for traceability
    setSelectedItem(useCase.id, 'useCase', useCase);
  };

  const handleWorkflowView = (useCase: any) => {
    setViewingUseCase(useCase);
    // Modal functionality commented out - using sidebar workflow steps instead
    // Update sidebar with selected item for traceability
    setSelectedItem(useCase.id, 'useCase', useCase);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // UI-only file upload for now
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`File "${files[0].name}" uploaded successfully. Business brief will be auto-populated.`);
    }
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

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case 'execution': return 'bg-green-100 text-green-800';
      case 'design': return 'bg-blue-100 text-blue-800';
      case 'discovery': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColorScheme = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'in_review': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'draft': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'submitted': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getWorkflowStages = () => [
    { name: 'Idea', key: 'idea', percentage: 25 },
    { name: 'Discovery & Funding', key: 'discovery', percentage: 50 },
    { name: 'Design', key: 'design', percentage: 75 },
    { name: 'Execution', key: 'execution', percentage: 100 },
  ];

  const filteredUseCases = useCases.filter(useCase => {
    const matchesSearch = useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         useCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         useCase.businessBriefId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || useCase.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Brief</h1>
          <p className="text-gray-600 mt-1">Submit and manage business brief use cases</p>
        </div>
        
        <div className="flex space-x-3">
          {/* File Upload Button */}
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={16} />
              <span>Upload Document</span>
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus size={16} />
                <span>New Business Brief</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Business Brief</DialogTitle>
                <DialogDescription>
                  NEW IDEA REQUEST BY Joshua Payne
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idea Name *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter idea name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sponsor *
                    </label>
                    <Select value={formData.businessOwner} onValueChange={(value) => setFormData({ ...formData, businessOwner: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joshua-payne">Joshua Payne</SelectItem>
                        <SelectItem value="john-doe">John Doe</SelectItem>
                        <SelectItem value="jane-smith">Jane Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Owner *
                    </label>
                    <Select value={formData.businessOwner} onValueChange={(value) => setFormData({ ...formData, businessOwner: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joshua-payne">Joshua Payne</SelectItem>
                        <SelectItem value="john-doe">John Doe</SelectItem>
                        <SelectItem value="jane-smith">Jane Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IT Portfolio *
                    </label>
                    <Select value={formData.primaryStrategicTheme} onValueChange={(value) => setFormData({ ...formData, primaryStrategicTheme: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital-transformation">Digital Transformation</SelectItem>
                        <SelectItem value="customer-experience">Customer Experience</SelectItem>
                        <SelectItem value="operational-efficiency">Operational Efficiency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Business Unit *
                    </label>
                    <Select value={formData.leadBusinessUnit} onValueChange={(value) => setFormData({ ...formData, leadBusinessUnit: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Business Units
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select additional units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Strategic Theme *
                  </label>
                  <Select value={formData.primaryStrategicTheme} onValueChange={(value) => setFormData({ ...formData, primaryStrategicTheme: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategic theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="efficiency">Efficiency</SelectItem>
                      <SelectItem value="innovation">Innovation</SelectItem>
                      <SelectItem value="customer-focus">Customer Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1. What would you like to change and why?
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Business Objective & Description of Change *</label>
                      <Textarea
                        value={formData.businessObjective}
                        onChange={(e) => setFormData({ ...formData, businessObjective: e.target.value })}
                        placeholder="Describe the business change, challenges/opportunities, and objective to ensure technology solutions proposed will directly support business objectives."
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Quantifiable Business Outcomes *</label>
                      <Textarea
                        value={formData.quantifiableBusinessOutcomes}
                        onChange={(e) => setFormData({ ...formData, quantifiableBusinessOutcomes: e.target.value })}
                        placeholder="Identify quantifiable/tangible benefits. Indicate the business value (ROI) that will be improved by this initiative."
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">In-scope</label>
                      <Textarea
                        value={formData.inScope}
                        onChange={(e) => setFormData({ ...formData, inScope: e.target.value })}
                        placeholder="Identify processes, capabilities or channels."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Impact of Do Nothing option</label>
                      <Textarea
                        value={formData.impactOfDoNothing}
                        onChange={(e) => setFormData({ ...formData, impactOfDoNothing: e.target.value })}
                        placeholder="Mention risk if demand is not done or key risks."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Happy Path</label>
                      <Textarea
                        value={formData.happyPath}
                        onChange={(e) => setFormData({ ...formData, happyPath: e.target.value })}
                        placeholder="Identify the happy path."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Exceptions</label>
                      <Textarea
                        value={formData.exceptions}
                        onChange={(e) => setFormData({ ...formData, exceptions: e.target.value })}
                        placeholder="Identify unhappy paths and exception cases."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Acceptance Criteria</label>
                      <Textarea
                        value={formData.acceptanceCriteria}
                        onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                        placeholder="Indicate the business acceptance criteria i.e. solution availability, performance, business volumes to manage, security, privacy etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: End Users and Stakeholders */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    2. Who are the end-users or stakeholders affected by this change?
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Impacted end-users / stakeholders *</label>
                      <Textarea
                        value={formData.impactedEndUsers}
                        onChange={(e) => setFormData({ ...formData, impactedEndUsers: e.target.value })}
                        placeholder="Indicate any impacted stakeholders, customers or end-users"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Change Impact Expected *</label>
                      <Textarea
                        value={formData.changeImpactExpected}
                        onChange={(e) => setFormData({ ...formData, changeImpactExpected: e.target.value })}
                        placeholder="Indicate expected changes for end users"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Impact to other Departments</label>
                      <Textarea
                        value={formData.impactToOtherDepartments}
                        onChange={(e) => setFormData({ ...formData, impactToOtherDepartments: e.target.value })}
                        placeholder="Identify the impact to other departments by function"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Other Departments Impacted</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Technology Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    3. What is the impact on existing technology solutions?
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-gray-600">Will this initiative impact or replace an existing technical solution?</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.impactsExistingTechnology}
                          onChange={(e) => setFormData({ ...formData, impactsExistingTechnology: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Yes</span>
                      </div>
                    </div>
                    
                    {formData.impactsExistingTechnology && (
                      <>
                        <div>
                          <label className="text-sm text-gray-600">Specify the technology solutions</label>
                          <Textarea
                            value={formData.technologySolutions}
                            onChange={(e) => setFormData({ ...formData, technologySolutions: e.target.value })}
                            placeholder="List the technology solutions that will be impacted"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Relevant Channeled Business Owners</label>
                          <Textarea
                            value={formData.relevantBusinessOwners}
                            onChange={(e) => setFormData({ ...formData, relevantBusinessOwners: e.target.value })}
                            placeholder="For products and services, what channels will be needed (business owners)"
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Other</label>
                          <Textarea
                            value={formData.otherTechnologyInfo}
                            onChange={(e) => setFormData({ ...formData, otherTechnologyInfo: e.target.value })}
                            placeholder="Any additional information to share (i.e. time considerations)"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Supporting Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Supporting documents (.pdf, .docx, .doc, .pptx, .ppt, .xls or .xlsx)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Attach supporting documents that justify your request. You can attach document or images files.
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        className="hidden"
                        id="supporting-docs"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setFormData({ 
                            ...formData, 
                            supportingDocuments: files.map(f => f.name) 
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById('supporting-docs')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  {formData.supportingDocuments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="text-sm text-gray-500">
                        {formData.supportingDocuments.map((file, index) => (
                          <li key={index}>• {file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                  <Button type="submit">Submit Business Brief</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search business briefs by title, description, or ID..."
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

      {/* Summary Cards - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Business Brief Summary</CardTitle>
              <CardDescription>Overall business brief metrics and status</CardDescription>
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
                      <p className="text-sm font-medium text-gray-600">Total Business Briefs</p>
                      <p className="text-2xl font-bold text-gray-900">{useCases.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{useCases.filter(uc => uc.status === 'approved').length}</p>
                      <p className="text-xs text-gray-500">{useCases.length > 0 ? Math.round((useCases.filter(uc => uc.status === 'approved').length / useCases.length) * 100) : 0}% of total</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Review</p>
                      <p className="text-2xl font-bold text-blue-600">{useCases.filter(uc => uc.status === 'in_review').length}</p>
                      <p className="text-xs text-gray-500">{useCases.length > 0 ? Math.round((useCases.filter(uc => uc.status === 'in_review').length / useCases.length) * 100) : 0}% of total</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {useCases.length > 0 
                          ? Math.round((useCases.filter(uc => uc.status === 'approved').length / useCases.length) * 100) 
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500">Overall progress</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Business Brief Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUseCases.map((useCase) => (
          <Card 
            key={useCase.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${getStatusColorScheme(useCase.status).border} ${getStatusColorScheme(useCase.status).bg}`}
            onClick={() => handleWorkflowView(useCase)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(useCase.status)}
                  <div>
                    <Badge variant="outline" className="text-xs mb-1 font-mono">
                      {useCase.businessBriefId}
                    </Badge>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(useCase.status)}>
                    {useCase.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(useCase.priority)}>
                    {useCase.priority}
                  </Badge>
                  {useCase.workflowStage && (
                    <Badge variant="outline" className={getWorkflowStageColor(useCase.workflowStage)}>
                      {useCase.workflowStage}
                    </Badge>
                  )}
                </div>
              </div>
              {useCase.completionPercentage && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{useCase.completionPercentage}%</span>
                  </div>
                  <Progress value={useCase.completionPercentage} className="h-2" />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{useCase.businessObjective || useCase.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <User size={14} className="mr-2" />
                  {useCase.businessOwner || useCase.submittedBy}
                </div>
                {useCase.leadBusinessUnit && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 size={14} className="mr-2" />
                    {useCase.leadBusinessUnit}
                  </div>
                )}
                {useCase.primaryStrategicTheme && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Target size={14} className="mr-2" />
                    {useCase.primaryStrategicTheme}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-2" />
                  {new Intl.DateTimeFormat('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }).format(useCase.submittedAt)}
                </div>
              </div>
              
              {useCase.quantifiableBusinessOutcomes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Business Outcomes:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{useCase.quantifiableBusinessOutcomes}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2" onClick={(e) => e.stopPropagation()}>
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
                
                <div className="flex space-x-2">
                  {useCase.status === 'approved' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateRequirements(useCase.id);
                      }}
                      disabled={isGeneratingRequirements === useCase.id}
                      className="flex items-center space-x-1"
                    >
                      {isGeneratingRequirements === useCase.id ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb size={14} />
                          <span>Generate Requirements</span>
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(useCase);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredUseCases.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No business briefs found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first business brief'
            }
          </p>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingUseCase?.title}</DialogTitle>
            <DialogDescription>
              Business Brief Details
            </DialogDescription>
          </DialogHeader>
          {viewingUseCase && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Business Owner</label>
                  <p className="text-sm text-gray-600">{viewingUseCase.businessOwner || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Lead Business Unit</label>
                  <p className="text-sm text-gray-600">{viewingUseCase.leadBusinessUnit || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Business Objective</label>
                <p className="text-sm text-gray-600 mt-1">{viewingUseCase.businessObjective || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Quantifiable Business Outcomes</label>
                <p className="text-sm text-gray-600 mt-1">{viewingUseCase.quantifiableBusinessOutcomes || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Impacted End Users</label>
                <p className="text-sm text-gray-600 mt-1">{viewingUseCase.impactedEndUsers || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Technology Impact</label>
                <p className="text-sm text-gray-600 mt-1">
                  {viewingUseCase.impactsExistingTechnology ? 'Yes' : 'No'}
                  {viewingUseCase.technologySolutions && ` - ${viewingUseCase.technologySolutions}`}
                </p>
              </div>
              
              {viewingUseCase.supportingDocuments && viewingUseCase.supportingDocuments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Supporting Documents</label>
                  <ul className="text-sm text-gray-600 mt-1">
                    {viewingUseCase.supportingDocuments.map((doc: string, index: number) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Workflow Progress Dialog - COMMENTED OUT: Using sidebar workflow steps instead */}
      {/* 
      <Dialog open={isWorkflowDialogOpen} onOpenChange={setIsWorkflowDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingUseCase?.title}</DialogTitle>
            <DialogDescription>
              End to End Workflow Progress
            </DialogDescription>
          </DialogHeader>
          {viewingUseCase && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <span className="text-2xl font-bold text-blue-600">{viewingUseCase.completionPercentage}%</span>
              </div>
              
              <Progress value={viewingUseCase.completionPercentage} className="h-3" />
              
              <div className="space-y-4">
                {getWorkflowStages().map((stage, index) => {
                  const isActive = viewingUseCase.workflowStage === stage.key;
                  const isCompleted = viewingUseCase.completionPercentage >= stage.percentage;
                  
                  return (
                    <div 
                      key={stage.key}
                      className={`flex items-center p-4 rounded-lg border-2 ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : isCompleted 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-gray-900">{stage.name}</h4>
                        <p className="text-sm text-gray-600">
                          {isCompleted 
                            ? 'Completed' 
                            : isActive 
                              ? 'In Progress' 
                              : 'Not Started'
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">{stage.percentage}%</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Stage: {viewingUseCase.workflowStage?.toUpperCase()}</h4>
                <p className="text-sm text-blue-800">
                  {viewingUseCase.workflowStage === 'execution' && 'Implementation in progress. Testing and deployment activities underway.'}
                  {viewingUseCase.workflowStage === 'discovery' && 'Conducting discovery activities. Analyzing requirements and technical feasibility.'}
                  {viewingUseCase.workflowStage === 'idea' && 'Initial idea capture phase. Awaiting review and approval for next steps.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> 
      */}
     </div>
   );
 } 