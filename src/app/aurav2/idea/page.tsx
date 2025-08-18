"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessBriefViewModal, BusinessBriefEditModal, BusinessBriefDeleteModal } from "@/components/ui/business-brief-modals";
import { 
  Lightbulb, 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit3,
  AlertCircle,
  Brain,
  Zap,
  TrendingUp,
  Star,
  Target,
  Loader2,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';

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

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  icon: string;
  definitionOfReady: string[];
  keyPlayers: Array<{role: string; name: string}>;
  definitionOfDone: string[];
  activities: Array<{owner: string; activity: string}>;
  referenceDocuments: string[];
}

export default function AuraV2IdeaPage() {
  const [businessBriefs, setBusinessBriefs] = useState<BusinessBrief[]>([]);
  const [stageInfo, setStageInfo] = useState<WorkflowStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAssessments, setAiAssessments] = useState<Record<string, any>>({});
  const [assessingQuality, setAssessingQuality] = useState<string | null>(null);
  const [assessmentFilter, setAssessmentFilter] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [applyingRecommendation, setApplyingRecommendation] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Record<string, string[]>>({});
  const [expandedDefinitions, setExpandedDefinitions] = useState<Record<string, boolean>>({});
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<BusinessBrief | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadStageInfo();
    loadBusinessBriefs();
  }, []);

  const loadStageInfo = async () => {
    try {
      const response = await fetch('/api/aurav2/workflow/stages');
      const data = await response.json();
      
      if (data.success && data.data) {
        const ideaStage = data.data.find((stage: WorkflowStage) => stage.id === 'idea');
        setStageInfo(ideaStage || null);
      }
    } catch (error) {
      console.error('Failed to load stage info:', error);
    }
  };

  const loadBusinessBriefs = async () => {
    try {
      const response = await fetch('/api/business-briefs/list');
      const data = await response.json();
      
      if (data.success && data.data) {
        const briefs = data.data.slice(0, 10);
        setBusinessBriefs(briefs);
        loadAIAssessments(briefs);
      }
    } catch (error) {
      console.error('Failed to load business briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIAssessments = async (briefs: BusinessBrief[]) => {
    const assessments: Record<string, any> = {};
    const appliedRecs: Record<string, string[]> = {};
    
    for (const brief of briefs) {
      try {
        const response = await fetch(`/api/aurav2/ai/assess-quality?businessBriefId=${brief.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          assessments[brief.id] = data.data;
          
          // Load applied recommendations from extension data if available
          try {
            const extensionResponse = await fetch(`/api/aurav2/business-brief/extensions?businessBriefId=${brief.id}`);
            const extensionData = await extensionResponse.json();
            
            if (extensionData.success && extensionData.data?.appliedRecommendations) {
              appliedRecs[brief.id] = extensionData.data.appliedRecommendations.map((ar: any) => ar.recommendation);
            }
          } catch (extError) {
            console.log(`No applied recommendations found for brief ${brief.id}`);
          }
        }
      } catch (error) {
        console.log(`No AI assessment found for brief ${brief.id}`);
      }
    }
    
    setAiAssessments(assessments);
    setAppliedRecommendations(appliedRecs);
  };

  const runQualityAssessment = async (businessBriefId: string) => {
    setAssessingQuality(businessBriefId);
    
    try {
      const response = await fetch('/api/aurav2/ai/assess-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessBriefId, userId: 'current_user' }),
      });

      const result = await response.json();

      if (result.success) {
        setAiAssessments(prev => ({
          ...prev,
          [businessBriefId]: result.data
        }));
        
        const score = (result.data.summary.score * 100).toFixed(0);
        const level = result.data.summary.level;
        const recommendations = result.data.summary.recommendations;
        
        // Reset applied recommendations count for this brief since it's a new assessment
        setAppliedRecommendations(prev => ({
          ...prev,
          [businessBriefId]: []
        }));

        alert(`🎯 AI Assessment Complete!\n\n` +
              `📊 Score: ${score}% (${level})\n` +
              `📋 Recommendations: ${recommendations}\n\n` +
              `${parseInt(score) >= 80 ? '🌟 Excellent quality!' : 
                parseInt(score) >= 60 ? '✅ Good quality - review recommendations' :
                '⚠️ Needs improvement - apply recommendations for better score'}`);
      } else {
        alert('AI assessment failed: ' + result.message);
      }
    } catch (error) {
      alert('An error occurred while running AI assessment');
    } finally {
      setAssessingQuality(null);
    }
  };

  // Modal handlers
  const handleViewBrief = (brief: BusinessBrief) => {
    setSelectedBrief(brief);
    setViewModalOpen(true);
  };

  const handleEditBrief = (brief: BusinessBrief) => {
    setSelectedBrief(brief);
    setEditModalOpen(true);
  };

  const handleDeleteBrief = (brief: BusinessBrief) => {
    setSelectedBrief(brief);
    setDeleteModalOpen(true);
  };

  const handleSaveBrief = (updatedBrief: BusinessBrief) => {
    setBusinessBriefs(prev => 
      prev.map(brief => 
        brief.id === updatedBrief.id ? updatedBrief : brief
      )
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedBrief) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/business-briefs/${selectedBrief.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBusinessBriefs(prev => prev.filter(brief => brief.id !== selectedBrief.id));
        setDeleteModalOpen(false);
        setSelectedBrief(null);
        
        // Remove from AI assessments as well
        setAiAssessments(prev => {
          const updated = { ...prev };
          delete updated[selectedBrief.id];
          return updated;
        });
        
        alert('Business brief deleted successfully');
      } else {
        alert('Failed to delete business brief');
      }
    } catch (error) {
      alert('An error occurred while deleting the business brief');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeAllModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedBrief(null);
  };

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

  // Function to apply recommendation to a brief
  const applyRecommendationToBrief = async (briefId: string, recommendation: string) => {
    setApplyingRecommendation(true);
    try {
      // Call API to apply the recommendation
      const response = await fetch('/api/aurav2/ai/apply-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessBriefId: briefId, 
          recommendations: [recommendation],
          userId: 'current_user'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with applied recommendation
        setAppliedRecommendations(prev => ({
          ...prev,
          [briefId]: [...(prev[briefId] || []), recommendation]
        }));

        // Update the brief data with the returned updated brief
        if (result.data.updatedBrief) {
          setBusinessBriefs(prev => 
            prev.map(b => b.id === briefId ? result.data.updatedBrief : b)
          );
        }

        alert(`✅ Recommendation applied successfully!\n\nRemaining: ${result.data.remainingRecommendations} recommendations`);
      } else {
        alert('Failed to apply recommendation: ' + result.message);
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
      alert('Error applying recommendation');
    } finally {
      setApplyingRecommendation(false);
    }
  };

  // Function to apply all recommendations at once
  const applyAllRecommendations = async (briefId: string, recommendations: string[]) => {
    setApplyingRecommendation(true);
    try {
      // Call API to apply all recommendations
      const response = await fetch('/api/aurav2/ai/apply-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessBriefId: briefId, 
          recommendations: recommendations,
          userId: 'current_user'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with all applied recommendations
        setAppliedRecommendations(prev => ({
          ...prev,
          [briefId]: [...(prev[briefId] || []), ...recommendations]
        }));

        // Update the brief data with the returned updated brief
        if (result.data.updatedBrief) {
          setBusinessBriefs(prev => 
            prev.map(b => b.id === briefId ? result.data.updatedBrief : b)
          );
        }

        alert(`🎉 Applied all ${recommendations.length} recommendations successfully!\n\nRemaining: ${result.data.remainingRecommendations} recommendations\n\nConsider re-grading to see improved score.`);
        
        setSelectedRecommendation(null);
      } else {
        alert('Failed to apply recommendations: ' + result.message);
      }
    } catch (error) {
      console.error('Error applying all recommendations:', error);
      alert('Error applying recommendations');
    } finally {
      setApplyingRecommendation(false);
    }
  };

  // Get remaining (unapplied) recommendations for a brief
  const getRemainingRecommendations = (briefId: string, allRecommendations: string[]) => {
    const applied = appliedRecommendations[briefId] || [];
    return allRecommendations.filter(rec => !applied.includes(rec));
  };

  // Check if brief meets Definition of Done criteria
  const checkDefinitionOfDone = (brief: BusinessBrief) => {
    const criteria = [
      { name: 'Title defined', met: !!brief.title?.trim() },
      { name: 'Description provided', met: !!brief.description?.trim() },
      { name: 'Business owner assigned', met: !!brief.businessOwner?.trim() },
      { name: 'Business objective clear', met: !!brief.businessObjective?.trim() },
      { name: 'Scope defined', met: !!brief.inScope?.trim() },
      { name: 'Impact assessed', met: !!brief.impactOfDoNothing?.trim() },
    ];
    
    const metCriteria = criteria.filter(c => c.met).length;
    const totalCriteria = criteria.length;
    const completionPercentage = Math.round((metCriteria / totalCriteria) * 100);
    
    return {
      criteria,
      metCriteria,
      totalCriteria,
      completionPercentage,
      isComplete: metCriteria === totalCriteria
    };
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

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 0.8) return Star;
    if (score >= 0.6) return TrendingUp;
    if (score >= 0.4) return Target;
    return AlertCircle;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="animate-spin" size={16} />
          <span className="text-sm">Loading {APP_CONFIG.APP_NAME} Idea Stage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Compact Header - Azure DevOps Style */}
      <div className="flex items-center justify-between bg-white border border-gray-400 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded">
            <Lightbulb size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Idea Stage • Business Brief</h1>
            <p className="text-sm text-gray-500">Stage 1 of {APP_CONFIG.APP_NAME} Workflow</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 text-xs">Active</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/aurav2">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Dashboard
            </Button>
          </Link>
          <Link href="/aurav2/idea/create">
            <Button size="sm">
              <Plus size={14} className="mr-1" />
              New Brief
            </Button>
          </Link>
        </div>
      </div>

      {/* Stage Progress Indicator - Compact */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              1
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Current Stage: Idea</div>
              <div className="text-xs text-gray-600">Capture and outline business ideas</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {businessBriefs.length} Active Briefs
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 text-xs">Stage 1</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs - Compact */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="business-briefs" className="text-xs">Briefs ({businessBriefs.length})</TabsTrigger>
              <TabsTrigger value="ai-assessment" className="text-xs flex items-center space-x-1">
                <Brain size={12} />
                <span>AI Grading</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-xs">Activities</TabsTrigger>
              <TabsTrigger value="reference" className="text-xs">Reference</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-0">

            {/* Stage Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Definition of Ready - Compact */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Clock size={14} className="text-orange-500" />
                      <span>Definition of Ready</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stageInfo?.definitionOfReady ? (
                      <ul className="space-y-1">
                        {stageInfo.definitionOfReady.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle size={12} className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-xs">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500 text-xs">Loading...</div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Players - Compact */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Users size={14} className="text-blue-500" />
                      <span>Key Players</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stageInfo?.keyPlayers ? (
                      <div className="space-y-2">
                        {stageInfo.keyPlayers.map((player, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users size={10} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-xs">{player.name}</div>
                              <div className="text-xs text-gray-500">{player.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">Loading...</div>
                    )}
                  </CardContent>
                </Card>

                {/* Definition of Done - Compact */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Definition of Done</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stageInfo?.definitionOfDone ? (
                      <ul className="space-y-1">
                        {stageInfo.definitionOfDone.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle size={12} className="text-orange-500 mt-1 flex-shrink-0" />
                            <span className="text-xs">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500 text-xs">Loading...</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Business Briefs Tab */}
            <TabsContent value="business-briefs" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Active Business Briefs</h3>
                  <p className="text-xs text-gray-600">Manage and track submissions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Filter size={12} className="mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Search size={12} className="mr-1" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessBriefs.map((brief) => {
                  const assessment = aiAssessments[brief.id];
                  const isAssessing = assessingQuality === brief.id;
                  
                  return (
                    <Card key={brief.id} className="hover:shadow-lg transition-all duration-200 border border-gray-400 bg-white shadow-md hover:border-blue-500">
                      <CardContent className="p-3">
                        {/* Header Row with Action Icons */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getStatusColor(brief.status)} variant="outline">
                                {brief.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="secondary" className={`text-xs ${getPriorityColor(brief.priority)}`}>
                                {brief.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">{brief.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{brief.description}</p>
                            
                            {/* Definition of Done Indicator - Collapsible */}
                            <div className="mb-2">
                              {(() => {
                                const dod = checkDefinitionOfDone(brief);
                                const isExpanded = expandedDefinitions[brief.id] || false;
                                
                                return (
                                  <div className={`rounded text-xs ${
                                    dod.isComplete 
                                      ? 'bg-green-50 border border-green-200 text-green-700' 
                                      : 'bg-orange-50 border border-orange-200 text-orange-700'
                                  }`}>
                                    {/* Clickable Header */}
                                    <div 
                                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-opacity-80"
                                      onClick={() => {
                                        setExpandedDefinitions(prev => ({
                                          ...prev,
                                          [brief.id]: !prev[brief.id]
                                        }));
                                      }}
                                    >
                                      <div className="flex items-center space-x-2">
                                        {dod.isComplete ? (
                                          <CheckCircle size={12} className="text-green-600" />
                                        ) : (
                                          <AlertCircle size={12} className="text-orange-600" />
                                        )}
                                        <span className="font-medium">
                                          Definition of Done: {dod.completionPercentage}% ({dod.metCriteria}/{dod.totalCriteria})
                                        </span>
                                      </div>
                                      {!dod.isComplete && (
                                        <div className="flex items-center space-x-1">
                                          <span className="text-xs opacity-75">
                                            {isExpanded ? 'Collapse' : 'Expand'}
                                          </span>
                                          {isExpanded ? (
                                            <ChevronDown size={12} className="opacity-75" />
                                          ) : (
                                            <ChevronRight size={12} className="opacity-75" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Expandable Content - Only show for incomplete briefs when expanded */}
                                    {!dod.isComplete && isExpanded && (
                                      <div className="px-2 pb-2 space-y-1">
                                        <div className="text-xs font-medium text-orange-800">Next Steps Required:</div>
                                        {dod.criteria.filter(c => !c.met).map((criterion, index) => (
                                          <div key={index} className="text-xs bg-orange-100 rounded p-1 ml-2">
                                            <div className="font-medium text-orange-800">• {criterion.name}</div>
                                            <div className="text-orange-600 ml-2 mt-0.5">
                                              {criterion.name === 'Title defined' && '→ Add a clear, descriptive title'}
                                              {criterion.name === 'Description provided' && '→ Add detailed description of the initiative'}
                                              {criterion.name === 'Business owner assigned' && '→ Assign responsible business owner'}
                                              {criterion.name === 'Business objective clear' && '→ Define specific business objective'}
                                              {criterion.name === 'Scope defined' && '→ Specify what is in/out of scope'}
                                              {criterion.name === 'Impact assessed' && '→ Describe impact of not proceeding'}
                                            </div>
                                          </div>
                                        ))}
                                        <div className="text-xs text-orange-600 mt-1 font-medium">
                                          Click "Edit" to complete these items
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          
                          {/* Quick Action Icons - Top Right */}
                          <div className="flex items-center space-x-1 ml-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleViewBrief(brief)}
                              title="View Details"
                            >
                              <Eye size={12} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditBrief(brief)}
                              title="Edit Brief"
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-60 hover:opacity-100"
                              onClick={() => handleDeleteBrief(brief)}
                              title="Delete Brief"
                            >
                              <Trash2 size={10} />
                            </Button>
                          </div>
                        </div>

                        {/* AI Quality Score - Compact */}
                        {assessment && assessment.summary && (
                          <div className={`flex items-center space-x-2 p-2 rounded border text-xs mb-2 ${getQualityColor(assessment.summary.score)}`}>
                            {(() => {
                              const QualityIcon = getQualityIcon(assessment.summary.score);
                              return <QualityIcon size={12} />;
                            })()}
                            <span className="font-medium">
                              AI: {(assessment.summary.score * 100).toFixed(0)}% ({assessment.summary.level})
                            </span>
                                                                        <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 px-2 text-xs hover:bg-white hover:bg-opacity-50"
                              onClick={() => {
                                const allRecs = assessment.assessment?.recommendations || [];
                                const remainingRecs = getRemainingRecommendations(brief.id, allRecs);
                                setSelectedRecommendation({ brief, recommendations: allRecs, assessment, showAll: true });
                              }}
                            >
                              {(() => {
                                const totalRecs = assessment.summary.recommendations || 0;
                                const appliedRecs = appliedRecommendations[brief.id]?.length || 0;
                                const remaining = totalRecs - appliedRecs;
                                return remaining > 0 ? `${remaining}/${totalRecs} Recommendations` : `${totalRecs} Recommendations ✓`;
                              })()}
                            </Button>
                          </div>
                        )}
                        
                        {/* Meta Information */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Owner: {brief.businessOwner || 'Unassigned'}</span>
                          <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Status Selector */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-700">Status:</span>
                            <Select 
                              value={brief.status} 
                              onValueChange={async (newStatus) => {
                                try {
                                  // Update locally first for immediate feedback
                                  const updatedBrief = { ...brief, status: newStatus as any };
                                  setBusinessBriefs(prev => 
                                    prev.map(b => b.id === brief.id ? updatedBrief : b)
                                  );

                                  // Update in database
                                  const response = await fetch(`/api/business-briefs/${brief.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...brief, status: newStatus })
                                  });

                                  if (!response.ok) {
                                    // Revert on failure
                                    setBusinessBriefs(prev => 
                                      prev.map(b => b.id === brief.id ? brief : b)
                                    );
                                    alert('Failed to update status');
                                  }
                                } catch (error) {
                                  // Revert on error
                                  setBusinessBriefs(prev => 
                                    prev.map(b => b.id === brief.id ? brief : b)
                                  );
                                  alert('Error updating status');
                                }
                              }}
                            >
                              <SelectTrigger className="h-6 w-32 text-xs border-gray-300">
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
                        
                        {/* AI Assessment Action */}
                        <div className="flex items-center justify-center mb-3">
                          {!assessment ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => runQualityAssessment(brief.id)}
                              disabled={isAssessing}
                              className="h-7 px-3 text-xs"
                            >
                              {isAssessing ? (
                                <Loader2 size={12} className="animate-spin mr-1" />
                              ) : (
                                <Brain size={12} className="mr-1" />
                              )}
                              {isAssessing ? 'Assessing...' : 'AI Assessment'}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => runQualityAssessment(brief.id)}
                              disabled={isAssessing}
                              className="h-7 px-3 text-xs"
                            >
                              {isAssessing ? (
                                <Loader2 size={12} className="animate-spin mr-1" />
                              ) : (
                                <Zap size={12} className="mr-1" />
                              )}
                              {isAssessing ? 'Grading...' : 'AI Grading'}
                            </Button>
                          )}
                        </div>


                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {businessBriefs.length === 0 && (
                <Card className="text-center py-6 border border-gray-400 bg-white shadow-md">
                  <CardContent>
                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No Business Briefs Yet</h3>
                    <p className="text-xs text-gray-500 mb-4">Create your first business brief to get started</p>
                    <Link href="/aurav2/idea/create">
                      <Button size="sm">
                        <Plus size={12} className="mr-1" />
                        Create Brief
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI Assessment Tab */}
            <TabsContent value="ai-assessment" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* AI Overview Card - Compact */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Brain size={16} className="text-purple-600" />
                      <span>AI Quality Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {Object.keys(aiAssessments).length}
                          </div>
                          <div className="text-xs text-gray-600">Assessed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {Object.values(aiAssessments).filter((a: any) => a.summary?.score >= 0.8).length}
                          </div>
                          <div className="text-xs text-gray-600">High Quality</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-xs">Assessment Criteria:</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Clarity (25%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Complete (20%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Value (20%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Feasible (15%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Risk (10%)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={10} className="text-green-500" />
                            <span>Alignment (10%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment Results Summary - Compact */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <TrendingUp size={16} className="text-blue-600" />
                      <span>Quality Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {Object.keys(aiAssessments).length > 0 ? (
                      <div className="space-y-2">
                        {['Excellent', 'Very Good', 'Good', 'Acceptable', 'Needs Improvement', 'Poor'].map(level => {
                          const count = Object.values(aiAssessments).filter((a: any) => 
                            a.summary?.level === level
                          ).length;
                          const percentage = Object.keys(aiAssessments).length > 0 
                            ? (count / Object.keys(aiAssessments).length) * 100 
                            : 0;
                          
                          return (
                            <div key={level} className="flex items-center justify-between">
                              <span className="text-xs font-medium">{level}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1">
                                  <div 
                                    className="bg-blue-600 h-1 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 min-w-[1rem]">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Brain size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No assessments yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Assessment Results */}
              {Object.keys(aiAssessments).length > 0 && (
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Assessment Details</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search assessments..."
                          className="h-7 w-48 text-xs"
                          value={assessmentFilter}
                          onChange={(e) => setAssessmentFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {businessBriefs
                        .filter(brief => aiAssessments[brief.id])
                        .filter(brief => 
                          assessmentFilter === '' || 
                          brief.title.toLowerCase().includes(assessmentFilter.toLowerCase()) ||
                          brief.id.toLowerCase().includes(assessmentFilter.toLowerCase()) ||
                          aiAssessments[brief.id].summary?.level.toLowerCase().includes(assessmentFilter.toLowerCase())
                        )
                        .map(brief => {
                          const assessment = aiAssessments[brief.id];
                          const QualityIcon = getQualityIcon(assessment.summary?.score || 0);
                          
                          return (
                            <div key={brief.id} className={`p-3 rounded border ${getQualityColor(assessment.summary?.score || 0)}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <QualityIcon size={16} />
                                  <div>
                                    <h3 className="font-medium text-sm">{brief.title}</h3>
                                    <p className="text-xs opacity-75">Score: {((assessment.summary?.score || 0) * 100).toFixed(0)}% - {assessment.summary?.level}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-current text-xs">
                                  {(() => {
                                    const totalRecs = assessment.summary?.recommendations || 0;
                                    const appliedRecs = appliedRecommendations[brief.id]?.length || 0;
                                    const remaining = totalRecs - appliedRecs;
                                    return remaining > 0 ? `${remaining}/${totalRecs} Recommendations` : `${totalRecs} Recommendations ✓`;
                                  })()}
                                </Badge>
                              </div>
                              
                              {assessment.assessment?.recommendations?.length > 0 && (
                                <div className="mt-2">
                                  {(() => {
                                    const allRecs = assessment.assessment.recommendations;
                                    const remainingRecs = getRemainingRecommendations(brief.id, allRecs);
                                    
                                    if (remainingRecs.length === 0) {
                                      return (
                                        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                                          <CheckCircle size={14} className="text-green-600 mx-auto mb-1" />
                                          <span className="text-xs text-green-700 font-medium">All recommendations applied!</span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div>
                                        <h4 className="font-medium text-xs mb-1">
                                          Remaining Recommendations ({remainingRecs.length}/{allRecs.length}):
                                        </h4>
                                        <div className="space-y-1">
                                          {remainingRecs.slice(0, 2).map((rec: string, index: number) => (
                                            <button
                                              key={index}
                                              onClick={() => setSelectedRecommendation({ brief, recommendation: rec, assessment })}
                                              className="block w-full text-left p-2 text-xs opacity-90 hover:opacity-100 hover:bg-white hover:bg-opacity-50 rounded border border-transparent hover:border-current transition-all cursor-pointer"
                                            >
                                              • {rec}
                                            </button>
                                          ))}
                                              {remainingRecs.length > 2 && (
                                            <button
                                              onClick={() => setSelectedRecommendation({ brief, recommendations: allRecs, assessment, showAll: true })}
                                              className="block w-full text-left p-2 text-xs font-medium bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-all cursor-pointer"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span>📋 View all {allRecs.length} recommendations</span>
                                                <Badge variant="outline" className="text-xs">
                                                  {remainingRecs.length} pending
                                                </Badge>
                                              </div>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="space-y-3">
                {stageInfo?.activities ? (
                  stageInfo.activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-gray-300 shadow-sm">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{activity.owner}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-xs mb-1">Owner: {activity.owner}</div>
                        <div className="text-xs text-gray-700">{activity.activity}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs">Loading activities...</div>
                )}
              </div>
            </TabsContent>

            {/* Reference Tab */}
            <TabsContent value="reference" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stageInfo?.referenceDocuments ? (
                  stageInfo.referenceDocuments.map((document, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border border-gray-300 rounded hover:bg-gray-50 shadow-sm">
                      <FileText size={14} className="text-blue-500" />
                      <div>
                        <div className="font-medium text-xs">{document}</div>
                        <div className="text-xs text-gray-500">Reference Document</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs">Loading reference documents...</div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Modals */}
      <BusinessBriefViewModal
        brief={selectedBrief}
        isOpen={viewModalOpen}
        onClose={closeAllModals}
        aiAssessment={selectedBrief ? aiAssessments[selectedBrief.id] : undefined}
      />

      <BusinessBriefEditModal
        brief={selectedBrief}
        isOpen={editModalOpen}
        onClose={closeAllModals}
        onSave={handleSaveBrief}
      />

      <BusinessBriefDeleteModal
        brief={selectedBrief}
        isOpen={deleteModalOpen}
        onClose={closeAllModals}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Recommendations Dialog */}
      {selectedRecommendation && (
        <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Brain size={20} className="text-purple-600" />
                <span>AI Grading Recommendations</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Brief Info */}
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    {selectedRecommendation.brief.id}
                  </Badge>
                  <Badge className={getStatusColor(selectedRecommendation.brief.status)} variant="outline">
                    {selectedRecommendation.brief.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-medium">{selectedRecommendation.brief.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedRecommendation.brief.description}</p>
              </div>

              {/* Definition of Done Status */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                  <Target size={16} className="text-blue-600" />
                  <span>Definition of Done Status</span>
                </h4>
                {(() => {
                  const dod = checkDefinitionOfDone(selectedRecommendation.brief);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completion Progress</span>
                        <span className="text-sm font-medium">{dod.completionPercentage}% ({dod.metCriteria}/{dod.totalCriteria})</span>
                      </div>
                      <div className="space-y-1">
                        {dod.criteria.map((criterion, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            {criterion.met ? (
                              <CheckCircle size={12} className="text-green-600" />
                            ) : (
                              <AlertCircle size={12} className="text-orange-600" />
                            )}
                            <span className={criterion.met ? 'text-green-700' : 'text-orange-700'}>
                              {criterion.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                {(() => {
                  const allRecs = selectedRecommendation.recommendations || [selectedRecommendation.recommendation];
                  const remainingRecs = getRemainingRecommendations(selectedRecommendation.brief.id, allRecs);
                  const appliedRecs = appliedRecommendations[selectedRecommendation.brief.id] || [];

                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg flex items-center space-x-2">
                            <Brain size={18} className="text-purple-600" />
                            <span>AI Recommendations</span>
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                {remainingRecs.length} Pending
                              </Badge>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {appliedRecs.length} Applied
                              </Badge>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                {allRecs.length} Total
                              </Badge>
                            </span>
                          </div>
                        </div>
                        {remainingRecs.length > 0 && (
                          <div className="flex items-center space-x-2">
                            {remainingRecs.length > 1 && (
                              <Button
                                size="sm"
                                onClick={() => applyAllRecommendations(selectedRecommendation.brief.id, remainingRecs)}
                                disabled={applyingRecommendation}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {applyingRecommendation ? (
                                  <Loader2 size={14} className="animate-spin mr-1" />
                                ) : (
                                  <CheckCircle size={14} className="mr-1" />
                                )}
                                Apply All ({remainingRecs.length})
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runQualityAssessment(selectedRecommendation.brief.id)}
                              disabled={applyingRecommendation}
                            >
                              <Zap size={14} className="mr-1" />
                              Re-Grade
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Applied Recommendations */}
                      {appliedRecs.length > 0 && (
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <h5 className="font-medium text-sm text-green-800 mb-2">✅ Applied Recommendations:</h5>
                          <div className="space-y-1">
                            {appliedRecs.map((rec: string, index: number) => (
                              <div key={index} className="text-xs text-green-700 bg-green-100 p-2 rounded">
                                • {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remaining Recommendations */}
                      {remainingRecs.length > 0 ? (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">📝 Pending Recommendations:</h5>
                          {remainingRecs.map((rec: string, index: number) => (
                            <div key={index} className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-sm mb-3">{rec}</p>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => applyRecommendationToBrief(selectedRecommendation.brief.id, rec)}
                                  disabled={applyingRecommendation}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {applyingRecommendation ? (
                                    <Loader2 size={14} className="animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle size={14} className="mr-1" />
                                  )}
                                  Apply This
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecommendation(null);
                                    handleEditBrief(selectedRecommendation.brief);
                                  }}
                                >
                                  <Edit3 size={14} className="mr-1" />
                                  Edit Manually
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-green-50 rounded border border-green-200">
                          <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-800">All recommendations have been applied!</p>
                          <p className="text-xs text-green-600 mt-1">Consider re-grading the brief to see improved score.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}