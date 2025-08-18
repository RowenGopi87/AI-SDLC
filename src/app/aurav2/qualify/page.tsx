"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText,
  ArrowLeft,
  Filter,
  Eye,
  Edit3,
  TrendingUp,
  Brain,
  Target,
  DollarSign,
  Calendar,
  Zap,
  BarChart3,
  AlertTriangle,
  Star,
  Loader2,
  Building,
  Award
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

interface QualificationCriteria {
  marketDemand: number;
  technicalFeasibility: number;
  businessValue: number;
  resourceAvailability: number;
  strategicAlignment: number;
  riskLevel: number;
}

interface QualifiedIdea {
  id: string;
  businessBriefId: string;
  title: string;
  qualificationScore: number;
  criteria: QualificationCriteria;
  marketResearch?: string;
  competitorAnalysis?: string;
  technicalAssessment?: string;
  businessCase?: string;
  riskAssessment?: string;
  recommendedAction: 'proceed' | 'research_more' | 'decline' | 'defer';
  qualifiedAt: string;
  qualifiedBy: string;
}

export default function AuraV2QualifyPage() {
  const [businessBriefs, setBusinessBriefs] = useState<BusinessBrief[]>([]);
  const [qualifiedIdeas, setQualifiedIdeas] = useState<QualifiedIdea[]>([]);
  const [stageInfo, setStageInfo] = useState<WorkflowStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);

  useEffect(() => {
    loadStageInfo();
    loadBusinessBriefs();
    loadQualifiedIdeas();
  }, []);

  const loadStageInfo = async () => {
    try {
      const response = await fetch('/api/aurav2/workflow/stages');
      const data = await response.json();
      
      if (data.success && data.data) {
        const qualifyStage = data.data.find((stage: WorkflowStage) => stage.id === 'qualify');
        setStageInfo(qualifyStage || null);
      }
    } catch (error) {
      console.error('Failed to load stage info:', error);
    }
  };

  const loadBusinessBriefs = async () => {
    try {
      const response = await fetch('/api/business-briefs/list?status=approved');
      const data = await response.json();
      
      if (data.success && data.data) {
        setBusinessBriefs(data.data);
      }
    } catch (error) {
      console.error('Failed to load business briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQualifiedIdeas = async () => {
    try {
      const response = await fetch('/api/aurav2/qualify/ideas');
      const data = await response.json();
      
      if (data.success && data.data) {
        setQualifiedIdeas(data.data);
      }
    } catch (error) {
      console.log('No qualified ideas found or API not implemented yet');
      // Mock data for now
      setQualifiedIdeas([
        {
          id: 'QI-001',
          businessBriefId: 'BB-003',
          title: 'Customer Portal Enhancement',
          qualificationScore: 8.5,
          criteria: {
            marketDemand: 9,
            technicalFeasibility: 8,
            businessValue: 9,
            resourceAvailability: 7,
            strategicAlignment: 9,
            riskLevel: 3
          },
          recommendedAction: 'proceed',
          qualifiedAt: new Date().toISOString(),
          qualifiedBy: 'Jane Smith'
        }
      ]);
    }
  };

  const startQualification = async (businessBriefId: string) => {
    setQualifyingId(businessBriefId);
    
    try {
      // Simulate qualification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockQualification: QualifiedIdea = {
        id: `QI-${Date.now()}`,
        businessBriefId,
        title: businessBriefs.find(b => b.id === businessBriefId)?.title || 'Unknown',
        qualificationScore: Math.random() * 4 + 6, // 6-10 range
        criteria: {
          marketDemand: Math.floor(Math.random() * 4) + 7,
          technicalFeasibility: Math.floor(Math.random() * 4) + 6,
          businessValue: Math.floor(Math.random() * 4) + 7,
          resourceAvailability: Math.floor(Math.random() * 4) + 5,
          strategicAlignment: Math.floor(Math.random() * 4) + 7,
          riskLevel: Math.floor(Math.random() * 4) + 2
        },
        recommendedAction: 'proceed',
        qualifiedAt: new Date().toISOString(),
        qualifiedBy: 'AI Assistant'
      };
      
      setQualifiedIdeas(prev => [mockQualification, ...prev]);
      alert(`Qualification complete! Score: ${mockQualification.qualificationScore.toFixed(1)}/10`);
      
    } catch (error) {
      alert('Failed to run qualification');
    } finally {
      setQualifyingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getActionColor = (action: string) => {
    const colors = {
      proceed: 'bg-green-100 text-green-700',
      research_more: 'bg-yellow-100 text-yellow-700',
      defer: 'bg-blue-100 text-blue-700',
      decline: 'bg-red-100 text-red-700'
    };
    return colors[action as keyof typeof colors] || colors.proceed;
  };

  const filteredBriefs = businessBriefs.filter(brief => {
    const matchesSearch = brief.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brief.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || brief.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="animate-spin" size={16} />
          <span className="text-sm">Loading {APP_CONFIG.APP_NAME} Qualify Stage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-400 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded">
            <Search size={18} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Qualify Stage • Research & Assessment</h1>
            <p className="text-sm text-gray-500">Stage 2 of {APP_CONFIG.APP_NAME} Workflow</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 text-xs">Active</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/aurav2">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Dashboard
            </Button>
          </Link>
          <Link href="/aurav2/idea">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Back to Ideas
            </Button>
          </Link>
        </div>
      </div>

      {/* Stage Progress */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              2
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Current Stage: Qualify</div>
              <div className="text-xs text-gray-600">Research and assess approved ideas for feasibility</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {filteredBriefs.length} Ideas to Qualify
              </Badge>
              <Badge variant="outline" className="text-xs">
                {qualifiedIdeas.length} Qualified
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 text-xs">Stage 2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="unqualified" className="text-xs">Ideas to Qualify ({filteredBriefs.length})</TabsTrigger>
              <TabsTrigger value="qualified" className="text-xs">Qualified Ideas ({qualifiedIdeas.length})</TabsTrigger>
              <TabsTrigger value="research" className="text-xs">Research Tools</TabsTrigger>
              <TabsTrigger value="activities" className="text-xs">Activities</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-0">

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Qualification Metrics */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <BarChart3 size={14} className="text-purple-500" />
                      <span>Qualification Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">{qualifiedIdeas.length}</div>
                        <div className="text-xs text-gray-600">Qualified</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{filteredBriefs.length}</div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {qualifiedIdeas.filter(q => q.recommendedAction === 'proceed').length}
                        </div>
                        <div className="text-xs text-gray-600">Proceed</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {qualifiedIdeas.filter(q => q.recommendedAction === 'research_more').length}
                        </div>
                        <div className="text-xs text-gray-600">Research More</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Qualification Criteria */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Target size={14} className="text-green-500" />
                      <span>Assessment Criteria</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {[
                        { name: 'Market Demand', weight: '25%', icon: TrendingUp },
                        { name: 'Technical Feasibility', weight: '20%', icon: Zap },
                        { name: 'Business Value', weight: '20%', icon: DollarSign },
                        { name: 'Resource Availability', weight: '15%', icon: Users },
                        { name: 'Strategic Alignment', weight: '15%', icon: Target },
                        { name: 'Risk Level', weight: '5%', icon: AlertTriangle }
                      ].map((criteria, index) => {
                        const Icon = criteria.icon;
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon size={12} className="text-gray-500" />
                              <span className="text-xs">{criteria.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{criteria.weight}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Process Overview */}
              <Card className="border border-gray-400 bg-white shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <FileText size={14} className="text-blue-500" />
                    <span>Qualification Process</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { step: '1', title: 'Market Research', desc: 'Analyze market demand and competition' },
                      { step: '2', title: 'Technical Assessment', desc: 'Evaluate technical feasibility and complexity' },
                      { step: '3', title: 'Business Case', desc: 'Define value proposition and ROI' },
                      { step: '4', title: 'Decision', desc: 'Recommend proceed, defer, or decline' }
                    ].map((process, index) => (
                      <div key={index} className="text-center p-3 border border-gray-300 rounded">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-2">
                          {process.step}
                        </div>
                        <div className="font-medium text-xs mb-1">{process.title}</div>
                        <div className="text-xs text-gray-600">{process.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ideas to Qualify Tab */}
            <TabsContent value="unqualified" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Approved Ideas Awaiting Qualification</h3>
                  <p className="text-xs text-gray-600">Research and assess these approved business briefs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search ideas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-7 w-48 text-xs"
                  />
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Filter size={12} className="mr-1" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBriefs.map((brief) => {
                  const isQualifying = qualifyingId === brief.id;
                  
                  return (
                    <Card key={brief.id} className="hover:shadow-lg transition-all duration-200 border border-gray-400 bg-white shadow-md hover:border-purple-500">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className="bg-green-100 text-green-700" variant="outline">
                                APPROVED
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {brief.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">{brief.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{brief.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Owner: {brief.businessOwner || 'Unassigned'}</span>
                          <span>{new Date(brief.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              onClick={() => startQualification(brief.id)}
                              disabled={isQualifying}
                              className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                            >
                              {isQualifying ? (
                                <Loader2 size={10} className="animate-spin mr-1" />
                              ) : (
                                <Search size={10} className="mr-1" />
                              )}
                              {isQualifying ? 'Qualifying...' : 'Start Qualification'}
                            </Button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 px-2 text-xs"
                            >
                              <Eye size={10} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredBriefs.length === 0 && (
                <Card className="text-center py-6 border border-gray-400 bg-white shadow-md">
                  <CardContent>
                    <Search size={32} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No Ideas to Qualify</h3>
                    <p className="text-xs text-gray-500 mb-4">All approved ideas have been qualified or none match your search</p>
                    <Link href="/aurav2/idea">
                      <Button size="sm" variant="outline">
                        <ArrowLeft size={12} className="mr-1" />
                        Back to Ideas
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Qualified Ideas Tab */}
            <TabsContent value="qualified" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Qualified Ideas</h3>
                  <p className="text-xs text-gray-600">Ideas that have completed the qualification process</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {qualifiedIdeas.map((idea) => (
                  <Card key={idea.id} className="border border-gray-400 bg-white shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{idea.title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {idea.businessBriefId}
                            </Badge>
                            <Badge className={getActionColor(idea.recommendedAction)} variant="outline">
                              {idea.recommendedAction.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className={`text-right p-2 rounded border ${getScoreColor(idea.qualificationScore)}`}>
                          <div className="text-lg font-bold">{idea.qualificationScore.toFixed(1)}</div>
                          <div className="text-xs">Score</div>
                        </div>
                      </div>

                      {/* Criteria Breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-700">Assessment Breakdown:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(idea.criteria).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="flex items-center space-x-1">
                                <div className="w-8 bg-gray-200 rounded h-1">
                                  <div 
                                    className="bg-purple-600 h-1 rounded" 
                                    style={{ width: `${(value / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="font-medium">{value}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Qualified by {idea.qualifiedBy}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            <Eye size={10} className="mr-1" />
                            Details
                          </Button>
                          <Button size="sm" className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700">
                            <ArrowLeft size={10} className="mr-1" />
                            Prioritize
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {qualifiedIdeas.length === 0 && (
                <Card className="text-center py-6 border border-gray-400 bg-white shadow-md">
                  <CardContent>
                    <Award size={32} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No Qualified Ideas Yet</h3>
                    <p className="text-xs text-gray-500 mb-4">Start qualifying approved business briefs</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Research Tools Tab */}
            <TabsContent value="research" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Market Research */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <TrendingUp size={14} className="text-blue-500" />
                      <span>Market Research</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                      <Input placeholder="Market segment..." className="h-7 text-xs" />
                      <Input placeholder="Target audience..." className="h-7 text-xs" />
                      <Input placeholder="Market size estimate..." className="h-7 text-xs" />
                    </div>
                    <Button size="sm" className="w-full h-6 text-xs">
                      <Search size={10} className="mr-1" />
                      Research Market
                    </Button>
                  </CardContent>
                </Card>

                {/* Competitor Analysis */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Building size={14} className="text-orange-500" />
                      <span>Competitor Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                      <Input placeholder="Competitor name..." className="h-7 text-xs" />
                      <Input placeholder="Solution category..." className="h-7 text-xs" />
                      <Input placeholder="Market position..." className="h-7 text-xs" />
                    </div>
                    <Button size="sm" className="w-full h-6 text-xs">
                      <Search size={10} className="mr-1" />
                      Analyze Competition
                    </Button>
                  </CardContent>
                </Card>

                {/* Technical Assessment */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Zap size={14} className="text-green-500" />
                      <span>Technical Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                      <Input placeholder="Technology stack..." className="h-7 text-xs" />
                      <Input placeholder="Complexity level..." className="h-7 text-xs" />
                      <Input placeholder="Integration points..." className="h-7 text-xs" />
                    </div>
                    <Button size="sm" className="w-full h-6 text-xs">
                      <Zap size={10} className="mr-1" />
                      Assess Feasibility
                    </Button>
                  </CardContent>
                </Card>

                {/* Business Case Builder */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <DollarSign size={14} className="text-purple-500" />
                      <span>Business Case</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                      <Input placeholder="ROI estimate..." className="h-7 text-xs" />
                      <Input placeholder="Investment required..." className="h-7 text-xs" />
                      <Input placeholder="Timeline..." className="h-7 text-xs" />
                    </div>
                    <Button size="sm" className="w-full h-6 text-xs">
                      <DollarSign size={10} className="mr-1" />
                      Build Case
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="space-y-3">
                {stageInfo?.activities ? (
                  stageInfo.activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border border-gray-300 shadow-sm">
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-purple-600">{activity.owner}</span>
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
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
