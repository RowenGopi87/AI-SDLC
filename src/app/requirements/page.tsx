"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useSettingsStore } from '@/store/settings-store';
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
  ChevronUp,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Target,
  Layers,
  BookOpen,
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  Loader2,
  Filter,
  Search,
  Wand2,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function RequirementsPage() {
  const searchParams = useSearchParams();
  const { requirements, updateRequirement } = useRequirementStore();
  const { useCases } = useUseCaseStore();
  const { initiatives, addInitiative, updateInitiative, deleteInitiative } = useInitiativeStore();
  const { features, addGeneratedFeatures, getFeaturesByInitiative } = useFeatureStore();
  const { epics, addGeneratedEpics, getEpicsByFeature } = useEpicStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  
  // State management
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form state - using Initiative interface types
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'on-hold',
    businessBriefId: '',
    acceptanceCriteria: '',
    businessValue: '',
    rationale: '',
    assignee: ''
  });

  // Set filter from URL params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setFilterStatus(filterParam);
    }
  }, [searchParams]);

  // Auto-expand initiative groups when initiatives are loaded
  useEffect(() => {
    console.log('🔍 Requirements page - Current initiatives:', initiatives);
    console.log('🔍 Requirements page - Initiatives count:', initiatives.length);
    if (initiatives.length > 0) {
      console.log('🔍 Requirements page - First initiative:', initiatives[0]);
      const businessBriefIds = [...new Set(initiatives.map(init => init.businessBriefId))];
      setExpandedItems(new Set(businessBriefIds));
    }
  }, [initiatives]);

  // Debug helper for the browser console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugInitiatives = () => {
        console.log('🔍 Debug: Current initiatives from store:', initiatives);
        console.log('🔍 Debug: Store state:', { 
          count: initiatives.length, 
          businessBriefs: [...new Set(initiatives.map(init => init.businessBriefId))],
          statuses: [...new Set(initiatives.map(init => init.status))]
        });
        return initiatives;
      };
      (window as any).debugFeatures = () => {
        console.log('🔍 Debug: Current features from store:', features);
        console.log('🔍 Debug: Features by initiative:', features.reduce((acc, feat) => {
          if (!acc[feat.initiativeId]) acc[feat.initiativeId] = [];
          acc[feat.initiativeId].push(feat);
          return acc;
        }, {} as Record<string, any[]>));
        return features;
      };
      (window as any).debugEpics = () => {
        console.log('🔍 Debug: Current epics from store:', epics);
        console.log('🔍 Debug: Epics by feature:', epics.reduce((acc, epic) => {
          if (!acc[epic.featureId]) acc[epic.featureId] = [];
          acc[epic.featureId].push(epic);
          return acc;
        }, {} as Record<string, any[]>));
        return epics;
      };
    }
  }, [initiatives, features, epics]);

  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Handle item selection
  const handleItemSelect = (item: any) => {
    const isSelected = selectedItem === item.id;
    setSelectedItem(isSelected ? null : item.id);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initiative': return <Target size={16} className="text-purple-600" />;
      case 'feature': return <Layers size={16} className="text-blue-600" />;
      case 'epic': return <BookOpen size={16} className="text-green-600" />;
      case 'story': return <FileText size={16} className="text-orange-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // AI Generation functions
  const handleGenerateFeatures = async (initiativeId: string) => {
    const initiative = initiatives.find(init => init.id === initiativeId);
    if (!initiative) {
      console.error('Initiative not found:', initiativeId);
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating features for initiative:', initiativeId);
      
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API
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

      // Generate features using the configured LLM
      const response = await fetch('/api/generate-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initiativeId: initiative.id,
          businessBriefId: initiative.businessBriefId,
          initiativeData: {
            title: initiative.title,
            description: initiative.description,
            category: initiative.category,
            priority: initiative.priority,
            rationale: initiative.rationale,
            acceptanceCriteria: initiative.acceptanceCriteria,
            businessValue: initiative.businessValue,
            workflowLevel: initiative.workflowLevel,
          },
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate features');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Feature generation failed');
      }

      // Save generated features to the store
      const { features: generatedFeatures, metadata } = result.data;
      
      console.log('💾 Saving features to store...');
      const savedFeatures = addGeneratedFeatures(initiativeId, initiative.businessBriefId, generatedFeatures);
      console.log(`✅ Successfully saved ${savedFeatures.length} features to store`);

      // Show success message
      console.log('Features generated successfully:', savedFeatures.length);
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${savedFeatures.length} features successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating features:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Feature Generation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Epic Generation function
  const handleGenerateEpics = async (featureId: string) => {
    const feature = features.find(feat => feat.id === featureId);
    if (!feature) {
      console.error('Feature not found:', featureId);
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating epics for feature:', featureId);
      
      // Check if settings are valid
      if (!validateSettings()) {
        throw new Error('Please configure your LLM provider and API key in Settings');
      }

      // Validate settings via API
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

      // Generate epics using the configured LLM
      const response = await fetch('/api/generate-epics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureId: feature.id,
          initiativeId: feature.initiativeId,
          businessBriefId: feature.businessBriefId,
          featureData: {
            title: feature.title,
            description: feature.description,
            category: feature.category,
            priority: feature.priority,
            rationale: feature.rationale,
            acceptanceCriteria: feature.acceptanceCriteria,
            businessValue: feature.businessValue,
            workflowLevel: feature.workflowLevel,
          },
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate epics');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Epic generation failed');
      }

      // Save generated epics to the store
      const { epics: generatedEpics, metadata } = result.data;
      
      console.log('💾 Saving epics to store...');
      const savedEpics = addGeneratedEpics(featureId, feature.initiativeId, feature.businessBriefId, generatedEpics);
      console.log(`✅ Successfully saved ${savedEpics.length} epics to store`);

      // Show success message
      console.log('Epics generated successfully:', savedEpics.length);
      
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${savedEpics.length} epics successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating epics:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Create a temporary error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Epic Generation Failed: ${errorMessage}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual entry functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const acceptanceCriteriaArray = formData.acceptanceCriteria
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const newInitiative = {
      id: `init-${Date.now()}`,
      businessBriefId: formData.businessBriefId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      rationale: formData.rationale,
      acceptanceCriteria: acceptanceCriteriaArray,
      businessValue: formData.businessValue,
      workflowLevel: 'initiative',
      status: formData.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Manual Entry'
    };

    if (editingItem) {
      updateInitiative(editingItem.id, newInitiative);
    } else {
      addInitiative(newInitiative);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'draft',
      businessBriefId: '',
      acceptanceCriteria: '',
      businessValue: '',
      rationale: '',
      assignee: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category || '',
      priority: item.priority,
      status: item.status,
      businessBriefId: item.businessBriefId,
      acceptanceCriteria: item.acceptanceCriteria.join('\n'),
      businessValue: item.businessValue || '',
      rationale: item.rationale || '',
      assignee: item.assignee || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInitiative(id);
    }
  };

  // Calculate stats
  const totalInitiatives = initiatives.length;
  const activeInitiatives = initiatives.filter(item => item.status === 'active').length;
  const completedInitiatives = initiatives.filter(item => item.status === 'completed').length;
  const totalFeatures = features.length;
  const totalEpics = epics.length;

  // Group initiatives by business brief for better organization
  const initiativesByBusinessBrief = initiatives.reduce((groups, initiative) => {
    const useCase = useCases.find(uc => uc.id === initiative.businessBriefId);
    const businessBriefId = initiative.businessBriefId;
    const businessBriefTitle = useCase?.title || 'Unknown Business Brief';
    
    if (!groups[businessBriefId]) {
      groups[businessBriefId] = {
        businessBriefId,
        businessBriefTitle,
        useCase,
        initiatives: []
      };
    }
    groups[businessBriefId].initiatives.push(initiative);
    return groups;
  }, {} as Record<string, { businessBriefId: string; businessBriefTitle: string; useCase: any; initiatives: any[] }>);

  const businessBriefGroups = Object.values(initiativesByBusinessBrief);

  // Render work item with hierarchical structure
  const renderWorkItem = (item: any, level: number = 0, type: string = 'initiative') => {
    const isSelected = selectedItem === item.id;
    const initiativeFeatures = type === 'initiative' ? getFeaturesByInitiative(item.id) : [];
    const featureEpics = type === 'feature' ? getEpicsByFeature(item.id) : [];

    // Get appropriate badge color for type
    const getTypeBadgeColor = (type: string) => {
      switch (type) {
        case 'initiative': return 'bg-purple-100 text-purple-800';
        case 'feature': return 'bg-blue-100 text-blue-800';
        case 'epic': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div key={item.id} className="space-y-2">
        <div
          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleItemSelect(item)}
        >
          {/* Type Icon */}
          <div className="flex items-center space-x-2">
            {getTypeIcon(type)}
            <Badge className={getTypeBadgeColor(type)} variant="secondary">
              {type}
            </Badge>
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {type === 'initiative' && initiativeFeatures.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {initiativeFeatures.length} features
                </Badge>
              )}
              {type === 'feature' && featureEpics.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  {featureEpics.length} epics
                </Badge>
              )}
              {type === 'epic' && item.sprintEstimate && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                  {item.sprintEstimate} sprint{item.sprintEstimate !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{item.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {type === 'initiative' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateFeatures(item.id);
                }}
                disabled={isGenerating}
                title="Generate Features"
              >
                {isGenerating ? (
                  <Loader2 size={12} className="animate-spin text-blue-600" />
                ) : (
                  <Wand2 size={12} className="text-blue-600" />
                )}
              </Button>
            )}
            {type === 'feature' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateEpics(item.id);
                }}
                disabled={isGenerating}
                title="Generate Epics"
              >
                {isGenerating ? (
                  <Loader2 size={12} className="animate-spin text-green-600" />
                ) : (
                  <Wand2 size={12} className="text-green-600" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
              title="Edit"
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
              title="Delete"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Selected Item Details */}
        {isSelected && (
          <div className="ml-8 p-4 bg-gray-50 rounded-lg border space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            
            {item.rationale && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rationale</h4>
                <p className="text-sm text-gray-600">{item.rationale}</p>
              </div>
            )}
            
            {item.businessValue && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Value</h4>
                <p className="text-sm text-gray-600">{item.businessValue}</p>
              </div>
            )}

            {type === 'epic' && item.estimatedEffort && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estimated Effort</h4>
                <p className="text-sm text-gray-600">{item.estimatedEffort}</p>
              </div>
            )}

            {type === 'epic' && item.sprintEstimate && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sprint Estimate</h4>
                <p className="text-sm text-gray-600">{item.sprintEstimate} sprint{item.sprintEstimate !== 1 ? 's' : ''}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Acceptance Criteria</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {item.acceptanceCriteria.map((criteria: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Render Features under Initiative */}
        {type === 'initiative' && initiativeFeatures.length > 0 && (
          <div className="ml-8 space-y-2">
            {initiativeFeatures.map((feature) => renderWorkItem(feature, level + 1, 'feature'))}
          </div>
        )}

        {/* Render Epics under Feature */}
        {type === 'feature' && featureEpics.length > 0 && (
          <div className="ml-8 space-y-2">
            {featureEpics.map((epic) => renderWorkItem(epic, level + 1, 'epic'))}
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
          <h1 className="text-3xl font-bold text-gray-900">Requirements Management</h1>
          <p className="text-gray-600 mt-1">
            Hierarchical breakdown: Initiative → Feature → Epic → Story
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Enterprise Workflow
            </Badge>
            <Badge variant="secondary" className="text-xs">
              AI-Powered Generation
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2" onClick={resetForm}>
                <Plus size={16} />
                <span>Manual Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Initiative' : 'Create New Initiative'}
                </DialogTitle>
                <DialogDescription>
                  Define the initiative details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Brief *
                  </label>
                  <Select value={formData.businessBriefId} onValueChange={(value) => setFormData({ ...formData, businessBriefId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business brief" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.id} value={useCase.id}>
                          {useCase.businessBriefId} - {useCase.title}
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
                    placeholder="Enter initiative title"
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
                    placeholder="Describe the initiative"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'completed' | 'on-hold') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., strategic, operational"
                    />
                  </div>
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

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Create'} Initiative
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button className="flex items-center space-x-2" disabled={isGenerating}>
            <Sparkles size={16} />
            <span>AI Generate</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search initiatives..."
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
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="initiative">Initiatives</SelectItem>
            <SelectItem value="feature">Features</SelectItem>
            <SelectItem value="epic">Epics</SelectItem>
            <SelectItem value="story">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
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
              {summaryCardsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </CardHeader>
        {summaryCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Initiatives</p>
                      <p className="text-2xl font-bold text-purple-600">{totalInitiatives}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-blue-600">{activeInitiatives}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{completedInitiatives}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Features</p>
                      <p className="text-2xl font-bold text-blue-600">{totalFeatures}</p>
                    </div>
                    <Layers className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Epics</p>
                      <p className="text-2xl font-bold text-green-600">{totalEpics}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Hierarchical Work Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target size={18} />
                <span>Work Item Hierarchy</span>
              </CardTitle>
              <CardDescription>Initiative → Feature → Epic → Story breakdown</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessBriefGroups.length > 0 ? (
              businessBriefGroups.map((group) => (
                <div key={group.businessBriefId} className="space-y-2">
                  {/* Business Brief Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{group.businessBriefTitle}</h3>
                        <p className="text-sm text-gray-600">{group.initiatives.length} initiatives</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.businessBriefId}
                    </Badge>
                  </div>
                  
                  {/* Initiatives */}
                  <div className="ml-4 space-y-2">
                    {group.initiatives.map((initiative) => renderWorkItem(initiative))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Items</h3>
                <p className="text-gray-600 mb-4">Start by creating initiatives from business briefs</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create First Initiative
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 