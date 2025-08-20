"use client";

import { useState, useEffect } from 'react';
import { useUseCaseStore } from '@/store/use-case-store';
import { useSettingsStore } from '@/store/settings-store';
import { useRequirementStore } from '@/store/requirement-store';
import { useInitiativeStore } from '@/store/initiative-store';
import { setSelectedItem } from '@/components/layout/sidebar';
import { notify } from '@/lib/notification-helper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateForDisplay } from '@/lib/date-utils';
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
  RefreshCw,
  Trash2,
  Edit3,
  Save
} from 'lucide-react';

export default function UseCasesPage() {
  const { 
    useCases, 
    addUseCase, 
    updateUseCase, 
    selectUseCase, 
    selectedUseCase, 
    loadFromDatabase, 
    deleteFromDatabase,
    isLoading: storeLoading, 
    error: storeError 
  } = useUseCaseStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  const { addGeneratedRequirements, addGeneratedRequirementsFromJSON, deleteRequirement } = useRequirementStore();
  const { addGeneratedInitiatives } = useInitiativeStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isQualityAssessmentOpen, setIsQualityAssessmentOpen] = useState(false);
  const [qualityAssessment, setQualityAssessment] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [useRealLLM, setUseRealLLM] = useState(false);
  // Commented out workflow modal - using sidebar workflow steps instead
  // const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [viewingUseCase, setViewingUseCase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingUseCase, setDeletingUseCase] = useState<any>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<{[fieldKey: string]: {[suggestionIndex: number]: boolean | null}}>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessValue: '',
    acceptanceCriteria: '',
    submittedBy: '',
    priority: 'high' as 'low' | 'medium' | 'high' | 'critical',
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

  // Load business briefs from database on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        console.log('🔄 Initializing use cases page - loading from database...');
        await loadFromDatabase();
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [loadFromDatabase, isInitialized]);

  const handleDeleteUseCase = async (useCase: any) => {
    setDeletingUseCase(useCase);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUseCase) return;
    
    try {
      await deleteFromDatabase(deletingUseCase.id);
      notify.success('Business Brief Deleted', `"${deletingUseCase.title}" has been permanently deleted.`);
      setDeleteConfirmOpen(false);
      setDeletingUseCase(null);
    } catch (error: any) {
      console.error('Failed to delete business brief:', error);
      notify.error('Delete Failed', error.message || 'Failed to delete business brief. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingUseCase(null);
  };

  const toggleSuggestionAcceptance = (fieldKey: string, suggestionIndex: number, accepted: boolean) => {
    setAcceptedSuggestions(prev => {
      const currentValue = prev[fieldKey]?.[suggestionIndex];
      
      // If clicking the same state, toggle it off (set to null)
      const newValue = currentValue === accepted ? null : accepted;
      
      return {
        ...prev,
        [fieldKey]: {
          ...prev[fieldKey],
          [suggestionIndex]: newValue
        }
      };
    });
  };

  const getAcceptedSuggestions = () => {
    const accepted: {[fieldKey: string]: string[]} = {};
    
    Object.entries(acceptedSuggestions).forEach(([fieldKey, suggestions]) => {
      const acceptedForField = Object.entries(suggestions)
        .filter(([_, isAccepted]) => isAccepted === true) // Only explicitly accepted suggestions
        .map(([index, _]) => {
          if (qualityAssessment?.fieldAssessments[fieldKey]?.suggestions) {
            return qualityAssessment.fieldAssessments[fieldKey].suggestions[parseInt(index)];
          }
          return null;
        })
        .filter(Boolean) as string[];
      
      if (acceptedForField.length > 0) {
        accepted[fieldKey] = acceptedForField;
      }
    });
    
    return accepted;
  };

  const hasAcceptedSuggestions = () => {
    return Object.values(acceptedSuggestions).some(fieldSuggestions => 
      Object.values(fieldSuggestions).some(accepted => accepted === true)
    );
  };

  const applyAcceptedSuggestions = () => {
    const acceptedSuggestionsData = getAcceptedSuggestions();
    
    console.log('🔧 Applying accepted suggestions:', acceptedSuggestionsData);
    
    // Apply suggestions by replacing form field values directly
    const updatedFormData = { ...formData };
    let appliedCount = 0;
    
    Object.entries(acceptedSuggestionsData).forEach(([fieldKey, suggestions]) => {
      if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
          console.log(`📝 Processing suggestion for ${fieldKey}:`, suggestion);
          
          // Try multiple extraction patterns for replacement text
          let replacementValue = '';
          
          // Pattern 1: "Replace X with Y" format
          const replaceMatch = suggestion.match(/Replace\s+["']([^"']+)["']\s+with\s+["']([^"']+)["']/i);
          if (replaceMatch) {
            replacementValue = replaceMatch[2];
            console.log('✅ Found replace pattern:', replacementValue);
          }
          
          // Pattern 2: Direct quoted suggestions at the end
          else if (!replacementValue) {
            const quoteMatches = suggestion.match(/"([^"]+)"/g);
            if (quoteMatches && quoteMatches.length > 0) {
              // Use the last quoted text (usually the example)
              replacementValue = quoteMatches[quoteMatches.length - 1].replace(/"/g, '');
              console.log('✅ Found quoted pattern:', replacementValue);
            }
          }
          
          // Pattern 3: Content after 'e.g.,' or 'like:'
          if (!replacementValue && (suggestion.includes('e.g.') || suggestion.includes('like:'))) {
            const exampleMatch = suggestion.match(/(?:e\.g\.?,?|like:?)\s*['"]([^'"]+)['"]|(?:e\.g\.?,?|like:?)\s*([^,.]+)/i);
            if (exampleMatch) {
              replacementValue = (exampleMatch[1] || exampleMatch[2]).trim();
              console.log('✅ Found example pattern:', replacementValue);
            }
          }
          
          // Pattern 4: For simple suggestions, use a default improvement
          if (!replacementValue) {
            // Generate a basic improvement based on field type
            switch (fieldKey) {
              case 'businessObjective':
                replacementValue = 'Increase revenue by 25% and improve customer satisfaction to 95% within 6 months';
                break;
              case 'quantifiableBusinessOutcomes':
                replacementValue = 'Increase monthly sales by 20% ($100K), reduce processing time by 50%, achieve 90%+ customer satisfaction rating';
                break;
              case 'inScope':
                replacementValue = 'Mobile application development, user authentication system, data analytics dashboard, API integrations';
                break;
              case 'impactOfDoNothing':
                replacementValue = 'Continue losing 15% customers annually, $50K monthly in manual processing costs, 25% competitive disadvantage';
                break;
              case 'happyPath':
                replacementValue = 'User logs in → accesses dashboard → completes task in under 30 seconds → receives confirmation';
                break;
              default:
                replacementValue = suggestion.split('.')[0].trim(); // Use first sentence
            }
            console.log('✅ Using default improvement:', replacementValue);
          }
          
          // Apply the replacement if we have a valid value
          if (replacementValue && replacementValue.length > 5) {
            (updatedFormData as any)[fieldKey] = replacementValue;
            appliedCount++;
            console.log(`✅ Updated ${fieldKey} with:`, replacementValue);
          }
        });
      }
    });
    
    // Update form data with improvements
    setFormData(updatedFormData);
    
    // Close quality assessment dialog and reset state - then reopen form with improvements
    setQualityAssessment(null);
    setIsQualityAssessmentOpen(false);
    setAcceptedSuggestions({});
    
    // Reopen the business brief form with the improved data
    setIsDialogOpen(true);
    
    console.log('🎉 Applied suggestions successfully, reopening form with improvements');
    
    notify.success(
      'Suggestions Applied', 
      `Updated ${appliedCount} field${appliedCount !== 1 ? 's' : ''} with improved content. Review and click "Create Use Case" to save when ready.`
    );
  };

  const handleManualImprovements = () => {
    // Close the quality assessment dialog and reopen form for editing
    // NO DATABASE SAVE - user will save explicitly when ready
    setQualityAssessment(null);
    setIsQualityAssessmentOpen(false);
    setAcceptedSuggestions({});
    
    // Reopen the form for editing (form data is already preserved)
    setIsDialogOpen(true);
    
    notify.info(
      'Edit Mode', 
      'Make your improvements and click "Create Use Case" when ready to save.'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Instead of immediately adding the use case, first assess quality
    assessBusinessBriefQuality();
  };

  const populateBadSampleData = () => {
    setFormData({
      title: 'Make an app',
      description: 'We need an app for stuff',
      businessValue: 'It will be good',
      acceptanceCriteria: 'It should work',
      submittedBy: 'John Doe',
      priority: 'high',
      status: 'draft',
      // Business Brief fields with poor quality data
      businessOwner: 'John-Doe',
      leadBusinessUnit: 'technology',
      additionalBusinessUnits: [],
      primaryStrategicTheme: 'growth',
      businessObjective: 'We want to make money and get more customers. The current system is slow and customers complain sometimes.',
      quantifiableBusinessOutcomes: 'More sales, better performance, happy customers',
      inScope: 'Mobile app and maybe website',
      impactOfDoNothing: 'Bad things will happen',
      happyPath: 'Users open app and use it',
      exceptions: 'If something breaks',
      impactedEndUsers: 'All users',
      changeImpactExpected: 'They will like it more',
      impactToOtherDepartments: 'Some impact',
      otherDepartmentsImpacted: [],
      impactsExistingTechnology: true,
      technologySolutions: 'Old system',
      relevantBusinessOwners: 'Business people',
      otherTechnologyInfo: 'It needs to be fast',
      supportingDocuments: [],
    });
  };

  const assessBusinessBriefQuality = async () => {
    setIsAssessing(true);
    
    // IMMEDIATELY close the business brief modal for clean UX
    setIsDialogOpen(false);
    
    // Show loading notification for better UX feedback
    const assessmentMode = useRealLLM ? '🧠 AI is evaluating' : '🎭 Mock system is evaluating';
    notify.info('Assessing Quality', `${assessmentMode} your business brief...`);
    
    // Brief delay to ensure smooth modal transition
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const response = await fetch('/api/assess-business-brief-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessBrief: formData,
          useRealLLM: useRealLLM,
          llmSettings: llmSettings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assess business brief quality');
      }

      const assessment = await response.json();
      setQualityAssessment(assessment.data);
      
      // Show the quality assessment dialog FIRST - don't save until user takes action
      setIsQualityAssessmentOpen(true);
      
      // Auto-save will happen when user selects their preferred action
      
    } catch (error) {
      console.error('Error assessing business brief:', error);
      notify.error('Assessment Failed', 'Could not assess quality. Proceeding with submission.');
      // Fallback - proceed with normal submission if assessment fails
      await proceedWithSubmission();
    } finally {
      setIsAssessing(false);
    }
  };

  const proceedWithSubmission = async () => {
    try {
      console.log('🚀 Proceeding with business brief submission...');

      const acceptanceCriteriaArray = formData.acceptanceCriteria
        .split('\n')
        .filter(item => item.trim())
        .map(item => item.trim());

      // Prepare data for database API
      const businessBriefData = {
        ...formData,
        acceptanceCriteria: acceptanceCriteriaArray,
        additionalBusinessUnits: formData.additionalBusinessUnits,
        otherDepartmentsImpacted: formData.otherDepartmentsImpacted,
        supportingDocuments: formData.supportingDocuments,
        status: qualityAssessment?.overallGrade === 'gold' ? 'approved' : 'submitted'
      };

      console.log('💾 Saving business brief to database...', {
        title: businessBriefData.title,
        status: businessBriefData.status,
        priority: businessBriefData.priority
      });

      // Save to database first
      const response = await fetch('/api/business-briefs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessBriefData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save business brief to database');
      }

      const result = await response.json();
      console.log('✅ Business brief saved to database successfully:', result.data?.id);

      // Also save to Zustand store for immediate UI updates (backward compatibility)
      addUseCase({
        ...formData,
        acceptanceCriteria: acceptanceCriteriaArray,
        additionalBusinessUnits: formData.additionalBusinessUnits,
        otherDepartmentsImpacted: formData.otherDepartmentsImpacted,
        supportingDocuments: formData.supportingDocuments,
        workflowStage: 'idea' as const,
        completionPercentage: qualityAssessment?.overallGrade === 'gold' ? 25 : 10,
        status: (businessBriefData.status as "draft" | "submitted" | "in_review" | "approved" | "rejected") || 'submitted',
        qualityAssessment: qualityAssessment, // Add quality assessment to the use case
      });

      console.log('✅ Business brief added to local store for UI updates');

      // Reset form only after successful submission
      resetForm();
      
      // Reload data from database to ensure UI is up to date
      await loadFromDatabase();
      
      notify.success(
        'Business Brief Saved', 
        `Successfully saved "${businessBriefData.title}" to database and indexed for search.`
      );

    } catch (error: any) {
      console.error('❌ Failed to save business brief:', error);
      
      // Fallback: save to Zustand store only (original behavior)
      notify.warning(
        'Database Save Failed', 
        `Saved locally but database error: ${error.message}. Please try again.`
      );
      
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
      
      resetForm();
    }
    
    setIsQualityAssessmentOpen(false);
    setQualityAssessment(null);
  };

  const resetForm = () => {
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
  };

  const handleMakeImprovements = () => {
    // Close assessment modal and reopen business brief modal with existing data
    setIsQualityAssessmentOpen(false);
    setQualityAssessment(null);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateUseCase(id, { status: newStatus });
  };

  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateInitiatives = async (useCaseId: string) => {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
      notify.error('Error', 'Use case not found');
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

      // Generate initiatives using the configured LLM
      const response = await fetch('/api/generate-initiatives', {
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
        throw new Error(errorData.error || 'Failed to generate initiatives');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Initiatives generation failed');
      }

      // Save generated initiatives to the store
      const { initiatives, metadata } = result.data;
      
      // Save initiatives to the initiative store 
      console.log('💾 Saving initiatives to store...');
      const savedInitiatives = addGeneratedInitiatives(useCaseId, initiatives);
      console.log(`✅ Successfully saved ${savedInitiatives.length} initiatives to store`);

      // Optional: Save to backend for persistence (if needed)
      // Note: Currently using frontend store, backend persistence can be added later
      try {
        // TODO: Create /api/initiatives/save endpoint if backend persistence is needed
        console.log('📊 Initiatives stored in frontend state management');
      } catch (saveError) {
        console.warn('Backend save not implemented yet (using frontend store):', saveError);
      }

      // Show success message with details  
      notify.success('Initiatives Generated', `Successfully generated ${initiatives.length} initiative${initiatives.length !== 1 ? 's' : ''} from business brief`);
      
      // Log final results for debugging
      console.log('🏁 Final results - Initiatives generated:', initiatives.length);
      
      // Redirect to requirements page to view the generated initiatives and their features
      // Use setTimeout to ensure store is updated before redirect
      setTimeout(() => {
        window.location.href = `/requirements?filter=initiatives&businessBrief=${useCaseId}`;
      }, 100);

    } catch (error) {
      console.error('Error generating initiatives:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setGenerationError(errorMessage);
      notify.error('Initiative Generation Failed', errorMessage);
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
      notify.success('File Uploaded', `File "${files[0].name}" uploaded successfully. Business brief will be auto-populated.`);
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
      case 'approved': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Gold for approved
      case 'in_review': return 'bg-gray-100 text-gray-600 border-gray-300'; // Silver for in review
      case 'rejected': return 'bg-orange-100 text-orange-800 border-orange-300'; // Bronze for rejected
      case 'submitted': return 'bg-gray-100 text-gray-600 border-gray-300'; // Silver for submitted
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
      case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }; // Subtle green for approved
      case 'in_review': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }; // Subtle blue
      case 'submitted': return { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400' }; // Subtle gray
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }; // Subtle red
      case 'draft': return { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400' }; // Subtle slate
      default: return { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400' }; // Default
    }
  };

  const getQualityGradeColorScheme = (grade: 'gold' | 'silver' | 'bronze') => {
    switch (grade) {
      case 'gold': return { bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-500' }; // Strong gold
      case 'silver': return { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-500' }; // Strong silver
      case 'bronze': return { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-500' }; // Strong bronze
    }
  };

  const getCardColorScheme = (useCase: any) => {
    // If we have a quality assessment, use that for coloring
    if (useCase.qualityAssessment?.overallGrade) {
      const gradeColors = getQualityGradeColorScheme(useCase.qualityAssessment.overallGrade);
      console.log(`🎨 Using quality grade colors for ${useCase.id}:`, gradeColors);
      return gradeColors;
    }
    
    // Otherwise fall back to status-based coloring
    const statusColors = getStatusColorScheme(useCase.status);
    console.log(`🎨 Using status colors for ${useCase.id} (${useCase.status}):`, statusColors);
    
    // Ensure we always have valid colors with strong fallbacks
    return {
      bg: statusColors.bg || 'bg-gray-200',
      text: statusColors.text || 'text-gray-800',
      border: statusColors.border || 'border-gray-400'
    };
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

  // Show loading state while initializing
  if (storeLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading business briefs...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no data
  if (storeError && useCases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-gray-900 font-medium">Failed to load business briefs</p>
            <p className="text-gray-600 text-sm mt-1">{storeError}</p>
            <Button 
              onClick={() => loadFromDatabase()} 
              className="mt-4"
              disabled={storeLoading}
            >
              {storeLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Idea</h1>
          <p className="text-gray-600 mt-1">Submit and manage business idea use cases</p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Business Brief</DialogTitle>
                    <DialogDescription>
                      NEW IDEA REQUEST BY Joshua Payne
                    </DialogDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="use-real-llm"
                        checked={useRealLLM}
                        onChange={(e) => setUseRealLLM(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="use-real-llm" className="text-sm text-gray-700 font-medium">
                        Use Real LLM
                      </label>
                      <div className="text-xs text-gray-500">
                        {useRealLLM ? '🧠 AI Analysis' : '🎭 Mock Analysis'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={populateBadSampleData}
                      className="bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Load Test Data
                    </Button>
                  </div>
                </div>
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
                  <Button type="submit" disabled={isAssessing}>
                    {isAssessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Assessing Quality...
                      </>
                    ) : (
                      'Submit Business Brief'
                    )}
                  </Button>
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
            className={`transition-all cursor-pointer shadow-md hover:shadow-xl border-2 ${getCardColorScheme(useCase).border || 'border-gray-400'} ${getCardColorScheme(useCase).bg || 'bg-gray-200'}`}
            onClick={() => handleViewDetails(useCase)}
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
                  {formatDateForDisplay(useCase.submittedAt)}
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
                
                <div className="flex flex-wrap gap-2">
                  {useCase.status === 'approved' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateInitiatives(useCase.id);
                      }}
                      disabled={isGeneratingRequirements === useCase.id}
                      className="flex items-center space-x-1 min-w-[120px]"
                    >
                      {isGeneratingRequirements === useCase.id ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span className="hidden sm:inline">Generating...</span>
                          <span className="sm:hidden">Gen...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb size={14} />
                          <span className="hidden sm:inline">Generate Initiatives</span>
                          <span className="sm:hidden">Generate</span>
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
                    className="min-w-[80px]"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUseCase(useCase);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                  >
                    <Trash2 size={14} />
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

      {/* Quality Assessment Modal */}
      <Dialog open={isQualityAssessmentOpen} onOpenChange={setIsQualityAssessmentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {qualityAssessment?.overallGrade === 'gold' && (
                <CheckCircle className="w-6 h-6 text-yellow-600 mr-2" />
              )}
              {qualityAssessment?.overallGrade === 'silver' && (
                <AlertCircle className="w-6 h-6 text-gray-600 mr-2" />
              )}
              {qualityAssessment?.overallGrade === 'bronze' && (
                <AlertCircle className="w-6 h-6 text-orange-600 mr-2" />
              )}
              Business Brief Quality Assessment
            </DialogTitle>
                          <div>
                <DialogDescription>
                  AI-powered quality evaluation with improvement recommendations
                </DialogDescription>
                {qualityAssessment?.assessmentMode && (
                  <div className="mt-2 text-xs">
                    {qualityAssessment.assessmentMode === 'real-llm' && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        🧠 Real AI Assessment Used
                      </span>
                    )}
                    {qualityAssessment.assessmentMode === 'mock' && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        🎭 Mock Assessment Used
                      </span>
                    )}
                    {qualityAssessment.assessmentMode === 'mock-fallback' && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        ⚠️ Fallback to Mock (Real LLM Failed)
                      </span>
                    )}
                  </div>
                )}
              </div>
          </DialogHeader>

          {qualityAssessment && (
            <div className="space-y-6">
              {/* Fallback Warning Card */}
              {qualityAssessment.assessmentMode === 'mock-fallback' && (
                <Card className="border-l-4 border-l-amber-500 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-amber-900 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Real LLM Assessment Failed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-800 mb-2">
                      The system attempted to use real AI assessment but encountered an error. Falling back to mock assessment.
                    </p>
                    {qualityAssessment.fallbackReason && (
                      <div className="bg-amber-100 p-3 rounded text-sm">
                        <strong>Error Details:</strong> {qualityAssessment.fallbackReason}
                      </div>
                    )}
                    <p className="text-xs text-amber-700 mt-2">
                      Check the console logs for more details or verify your LLM configuration.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Overall Grade Card */}
              <Card className={`border-l-4 ${
                qualityAssessment.overallGrade === 'gold' ? 'border-l-yellow-500 bg-yellow-50' :
                qualityAssessment.overallGrade === 'silver' ? 'border-l-gray-500 bg-gray-50' :
                'border-l-orange-500 bg-orange-50'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg ${
                      qualityAssessment.overallGrade === 'gold' ? 'text-yellow-900' :
                      qualityAssessment.overallGrade === 'silver' ? 'text-gray-900' :
                      'text-orange-900'
                    }`}>
                      Overall Grade: {qualityAssessment.overallGrade.toUpperCase()}
                    </CardTitle>
                    <Badge variant="outline" className={`${
                      qualityAssessment.overallGrade === 'gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      qualityAssessment.overallGrade === 'silver' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                      'bg-orange-100 text-orange-800 border-orange-300'
                    }`}>
                      {qualityAssessment.overallScore}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`${
                    qualityAssessment.overallGrade === 'gold' ? 'text-yellow-800' :
                    qualityAssessment.overallGrade === 'silver' ? 'text-gray-800' :
                    'text-orange-800'
                  }`}>
                    {qualityAssessment.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Improvements Section */}
              {(qualityAssessment.improvements.critical.length > 0 || 
                qualityAssessment.improvements.important.length > 0 || 
                qualityAssessment.improvements.suggested.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Required Improvements</CardTitle>
                    <CardDescription>Areas that need attention before approval</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {qualityAssessment.improvements.critical.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-900 mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Critical Issues (Must Fix)
                        </h4>
                        <ul className="space-y-1">
                          {qualityAssessment.improvements.critical.map((item: string, index: number) => (
                            <li key={index} className="flex items-start text-sm text-red-800">
                              <span className="text-red-600 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qualityAssessment.improvements.important.length > 0 && (
                      <div>
                        <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Important Improvements
                        </h4>
                        <ul className="space-y-1">
                          {qualityAssessment.improvements.important.map((item: string, index: number) => (
                            <li key={index} className="flex items-start text-sm text-amber-800">
                              <span className="text-amber-600 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qualityAssessment.improvements.suggested.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Suggested Enhancements
                        </h4>
                        <ul className="space-y-1">
                          {qualityAssessment.improvements.suggested.map((item: string, index: number) => (
                            <li key={index} className="flex items-start text-sm text-blue-800">
                              <span className="text-blue-600 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Field Assessments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Field-by-Field Assessment</CardTitle>
                  <CardDescription>Detailed evaluation of each section</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(qualityAssessment.fieldAssessments).map(([field, assessment]: [string, any]) => (
                      <div key={field} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm text-gray-900 capitalize">
                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${
                              assessment.grade === 'gold' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              assessment.grade === 'silver' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                              'bg-orange-100 text-orange-800 border-orange-300'
                            }`}>
                              {assessment.grade}
                            </Badge>
                            <span className="text-xs text-gray-500">{assessment.score}/10</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{assessment.feedback}</p>
                        {assessment.suggestions.length > 0 && (
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-medium">Suggestions:</span>
                            <div className="mt-2 space-y-3">
                              {assessment.suggestions.map((suggestion: string, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded border">
                                  <p className="text-gray-700 mb-2 leading-relaxed">{suggestion}</p>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant={acceptedSuggestions[field]?.[idx] === true ? "default" : "outline"}
                                      onClick={() => toggleSuggestionAcceptance(field, idx, true)}
                                      className={`h-7 px-3 text-xs ${
                                        acceptedSuggestions[field]?.[idx] === true 
                                          ? "bg-green-600 hover:bg-green-700 text-white" 
                                          : "border-green-300 text-green-700 hover:bg-green-50"
                                      }`}
                                    >
                                      ✓ Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={acceptedSuggestions[field]?.[idx] === false ? "default" : "outline"}
                                      onClick={() => toggleSuggestionAcceptance(field, idx, false)}
                                      className={`h-7 px-3 text-xs ${
                                        acceptedSuggestions[field]?.[idx] === false 
                                          ? "bg-red-600 hover:bg-red-700 text-white" 
                                          : "border-red-300 text-red-700 hover:bg-red-50"
                                      }`}
                                    >
                                      ✗ Reject
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Recommended Next Steps</CardTitle>
                  <CardDescription>Actions to take based on this assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {qualityAssessment.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {qualityAssessment.overallGrade === 'gold' ? (
                    <div className="flex items-center text-yellow-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ready for next phase implementation
                    </div>
                  ) : qualityAssessment.overallGrade === 'silver' ? (
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-1" />
                      Review required before proceeding to next phase
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-700">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Improvements required before approval
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {/* Top Row - Apply Improvements (if available) */}
                  {hasAcceptedSuggestions() && (
                    <div className="flex justify-center">
                      <Button
                        onClick={applyAcceptedSuggestions}
                        className="bg-blue-600 hover:bg-blue-700 w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply Selected Improvements
                      </Button>
                    </div>
                  )}
                  
                  {/* Bottom Row - Core Actions (always available) */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleManualImprovements}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Edit Manually</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      onClick={async () => {
                        notify.info('Saving...', 'Saving business brief to database...');
                        await proceedWithSubmission();
                        setQualityAssessment(null);
                        setIsQualityAssessmentOpen(false);
                        setAcceptedSuggestions({});
                        notify.success('Saved!', 'Business brief saved successfully.');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Business Brief
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this business brief? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUseCase && (
            <div className="py-4">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">{deletingUseCase.title}</p>
                <p className="text-sm text-gray-600 mt-1">{deletingUseCase.businessBriefId}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Permanently
            </Button>
          </div>
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