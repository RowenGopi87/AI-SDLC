"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ListOrdered, 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
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
  Award,
  Trophy,
  Medal,
  Crown,
  ChevronUp,
  ChevronDown,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';

interface QualifiedIdea {
  id: string;
  businessBriefId: string;
  title: string;
  description: string;
  qualificationScore: number;
  businessValue: number;
  complexity: number;
  effort: number;
  riskLevel: number;
  strategicAlignment: number;
  marketImpact: number;
  priority: number;
  recommendedAction: 'proceed' | 'research_more' | 'decline' | 'defer';
  qualifiedAt: string;
  qualifiedBy: string;
  estimatedROI?: string;
  timeToMarket?: string;
  resourceRequirement?: string;
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

interface PriorityMatrix {
  high_value_low_effort: QualifiedIdea[];
  high_value_high_effort: QualifiedIdea[];
  low_value_low_effort: QualifiedIdea[];
  low_value_high_effort: QualifiedIdea[];
}

export default function AuraV2PrioritizePage() {
  const [qualifiedIdeas, setQualifiedIdeas] = useState<QualifiedIdea[]>([]);
  const [stageInfo, setStageInfo] = useState<WorkflowStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [prioritizing, setPrioritizing] = useState(false);
  const [portfolioTheme, setPortfolioTheme] = useState('Q1 2024 Portfolio');

  useEffect(() => {
    loadStageInfo();
    loadQualifiedIdeas();
  }, []);

  const loadStageInfo = async () => {
    try {
      const response = await fetch('/api/aurav2/workflow/stages');
      const data = await response.json();
      
      if (data.success && data.data) {
        const prioritizeStage = data.data.find((stage: WorkflowStage) => stage.id === 'prioritize');
        setStageInfo(prioritizeStage || null);
      }
    } catch (error) {
      console.error('Failed to load stage info:', error);
    }
  };

  const loadQualifiedIdeas = async () => {
    try {
      const response = await fetch('/api/aurav2/qualify/ideas');
      const data = await response.json();
      
      if (data.success && data.data) {
        setQualifiedIdeas(data.data);
      } else {
        // Mock qualified ideas for demonstration
        const mockQualifiedIdeas: QualifiedIdea[] = [
          {
            id: 'QI-001',
            businessBriefId: 'BB-003',
            title: 'Customer Portal Enhancement',
            description: 'Enhance the customer self-service portal with AI-powered recommendations',
            qualificationScore: 8.5,
            businessValue: 9,
            complexity: 6,
            effort: 7,
            riskLevel: 3,
            strategicAlignment: 9,
            marketImpact: 8,
            priority: 1,
            recommendedAction: 'proceed',
            qualifiedAt: new Date().toISOString(),
            qualifiedBy: 'Jane Smith',
            estimatedROI: '300%',
            timeToMarket: '6 months',
            resourceRequirement: '2 FTE'
          },
          {
            id: 'QI-002',
            businessBriefId: 'BB-004',
            title: 'Mobile App Redesign',
            description: 'Complete redesign of mobile application with modern UX',
            qualificationScore: 7.8,
            businessValue: 8,
            complexity: 8,
            effort: 9,
            riskLevel: 5,
            strategicAlignment: 7,
            marketImpact: 9,
            priority: 2,
            recommendedAction: 'proceed',
            qualifiedAt: new Date().toISOString(),
            qualifiedBy: 'John Doe',
            estimatedROI: '250%',
            timeToMarket: '9 months',
            resourceRequirement: '4 FTE'
          },
          {
            id: 'QI-003',
            businessBriefId: 'BB-005',
            title: 'AI Analytics Dashboard',
            description: 'Real-time analytics dashboard with predictive insights',
            qualificationScore: 7.2,
            businessValue: 7,
            complexity: 7,
            effort: 6,
            riskLevel: 4,
            strategicAlignment: 8,
            marketImpact: 6,
            priority: 3,
            recommendedAction: 'proceed',
            qualifiedAt: new Date().toISOString(),
            qualifiedBy: 'AI Assistant',
            estimatedROI: '180%',
            timeToMarket: '4 months',
            resourceRequirement: '3 FTE'
          },
          {
            id: 'QI-004',
            businessBriefId: 'BB-006',
            title: 'Legacy System Migration',
            description: 'Migrate legacy CRM to cloud-based solution',
            qualificationScore: 6.5,
            businessValue: 6,
            complexity: 9,
            effort: 8,
            riskLevel: 7,
            strategicAlignment: 6,
            marketImpact: 4,
            priority: 4,
            recommendedAction: 'defer',
            qualifiedAt: new Date().toISOString(),
            qualifiedBy: 'Tech Team',
            estimatedROI: '120%',
            timeToMarket: '12 months',
            resourceRequirement: '6 FTE'
          }
        ];
        setQualifiedIdeas(mockQualifiedIdeas);
      }
    } catch (error) {
      console.log('No qualified ideas found, using mock data');
    } finally {
      setLoading(false);
    }
  };

  const generatePriorityMatrix = (): PriorityMatrix => {
    const matrix: PriorityMatrix = {
      high_value_low_effort: [],
      high_value_high_effort: [],
      low_value_low_effort: [],
      low_value_high_effort: []
    };

    qualifiedIdeas.forEach(idea => {
      const isHighValue = idea.businessValue >= 7;
      const isHighEffort = idea.effort >= 7;

      if (isHighValue && !isHighEffort) {
        matrix.high_value_low_effort.push(idea);
      } else if (isHighValue && isHighEffort) {
        matrix.high_value_high_effort.push(idea);
      } else if (!isHighValue && !isHighEffort) {
        matrix.low_value_low_effort.push(idea);
      } else {
        matrix.low_value_high_effort.push(idea);
      }
    });

    return matrix;
  };

  const runAutoPrioritization = async () => {
    setPrioritizing(true);
    
    try {
      // Simulate auto-prioritization algorithm
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const sortedIdeas = [...qualifiedIdeas].sort((a, b) => {
        // Weighted scoring: Business Value (40%) + Strategic Alignment (30%) + Market Impact (20%) - Risk (10%)
        const scoreA = (a.businessValue * 0.4) + (a.strategicAlignment * 0.3) + (a.marketImpact * 0.2) - (a.riskLevel * 0.1);
        const scoreB = (b.businessValue * 0.4) + (b.strategicAlignment * 0.3) + (b.marketImpact * 0.2) - (b.riskLevel * 0.1);
        return scoreB - scoreA;
      }).map((idea, index) => ({
        ...idea,
        priority: index + 1
      }));
      
      setQualifiedIdeas(sortedIdeas);
      alert('Auto-prioritization complete! Ideas have been ranked by strategic value and feasibility.');
      
    } catch (error) {
      alert('Failed to run auto-prioritization');
    } finally {
      setPrioritizing(false);
    }
  };

  const movePriority = (ideaId: string, direction: 'up' | 'down') => {
    setQualifiedIdeas(prev => {
      const ideas = [...prev];
      const currentIndex = ideas.findIndex(idea => idea.id === ideaId);
      
      if (currentIndex === -1) return ideas;
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex < 0 || targetIndex >= ideas.length) return ideas;
      
      // Swap the ideas
      [ideas[currentIndex], ideas[targetIndex]] = [ideas[targetIndex], ideas[currentIndex]];
      
      // Update priority numbers
      return ideas.map((idea, index) => ({
        ...idea,
        priority: index + 1
      }));
    });
  };

  const getPriorityIcon = (priority: number) => {
    if (priority === 1) return Crown;
    if (priority <= 3) return Trophy;
    if (priority <= 5) return Medal;
    return Star;
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (priority <= 3) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (priority <= 5) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getValueEffortColor = (quadrant: keyof PriorityMatrix) => {
    const colors = {
      high_value_low_effort: 'bg-green-100 border-green-300 text-green-800',
      high_value_high_effort: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      low_value_low_effort: 'bg-blue-100 border-blue-300 text-blue-800',
      low_value_high_effort: 'bg-red-100 border-red-300 text-red-800'
    };
    return colors[quadrant];
  };

  const getQuadrantTitle = (quadrant: keyof PriorityMatrix) => {
    const titles = {
      high_value_low_effort: 'Quick Wins',
      high_value_high_effort: 'Major Projects', 
      low_value_low_effort: 'Fill-ins',
      low_value_high_effort: 'Questionable'
    };
    return titles[quadrant];
  };

  const matrix = generatePriorityMatrix();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="animate-spin" size={16} />
          <span className="text-sm">Loading {APP_CONFIG.APP_NAME} Prioritize Stage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-400 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded">
            <ListOrdered size={18} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Prioritize Stage • Portfolio Planning</h1>
            <p className="text-sm text-gray-500">Stage 3 of {APP_CONFIG.APP_NAME} Workflow</p>
          </div>
          <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/aurav2">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Dashboard
            </Button>
          </Link>
          <Link href="/aurav2/qualify">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Back to Qualify
            </Button>
          </Link>
        </div>
      </div>

      {/* Portfolio Header */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Current Stage: Prioritize</div>
                <div className="text-xs text-gray-600">Strategic portfolio prioritization and planning</div>
              </div>
              <Input 
                value={portfolioTheme}
                onChange={(e) => setPortfolioTheme(e.target.value)}
                className="h-6 text-xs w-40"
                placeholder="Portfolio theme..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {qualifiedIdeas.length} Ideas
              </Badge>
              <Badge className="bg-green-100 text-green-700 text-xs">Stage 3</Badge>
              <Button 
                size="sm" 
                onClick={runAutoPrioritization}
                disabled={prioritizing}
                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
              >
                {prioritizing ? (
                  <Loader2 size={10} className="animate-spin mr-1" />
                ) : (
                  <Brain size={10} className="mr-1" />
                )}
                {prioritizing ? 'Auto-Prioritizing...' : 'Auto-Prioritize'}
              </Button>
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
              <TabsTrigger value="priority-list" className="text-xs">Priority List</TabsTrigger>
              <TabsTrigger value="value-effort-matrix" className="text-xs">Value/Effort Matrix</TabsTrigger>
              <TabsTrigger value="portfolio-planning" className="text-xs">Portfolio Planning</TabsTrigger>
              <TabsTrigger value="activities" className="text-xs">Activities</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-0">

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Portfolio Summary */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Trophy size={14} className="text-green-500" />
                      <span>Portfolio Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{qualifiedIdeas.length}</div>
                          <div className="text-xs text-gray-600">Total Ideas</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-600">
                            {qualifiedIdeas.filter(q => q.recommendedAction === 'proceed').length}
                          </div>
                          <div className="text-xs text-gray-600">Recommended</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>High Priority</span>
                          <span className="font-medium">{qualifiedIdeas.filter(q => q.priority <= 3).length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medium Priority</span>
                          <span className="font-medium">{qualifiedIdeas.filter(q => q.priority > 3 && q.priority <= 6).length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Low Priority</span>
                          <span className="font-medium">{qualifiedIdeas.filter(q => q.priority > 6).length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <BarChart3 size={14} className="text-blue-500" />
                      <span>Value Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {['High Value', 'Medium Value', 'Lower Value'].map((level, index) => {
                        const threshold = [8, 6, 4][index];
                        const count = qualifiedIdeas.filter(idea => 
                          index === 0 ? idea.businessValue >= threshold :
                          index === 1 ? idea.businessValue >= threshold && idea.businessValue < 8 :
                          idea.businessValue < threshold
                        ).length;
                        const percentage = qualifiedIdeas.length > 0 ? (count / qualifiedIdeas.length) * 100 : 0;
                        
                        return (
                          <div key={level} className="flex items-center justify-between">
                            <span className="text-xs font-medium">{level}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-green-600 h-1 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 min-w-[1rem]">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Planning */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Users size={14} className="text-purple-500" />
                      <span>Resource Planning</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Total Resource Need</span>
                        <span className="font-medium">
                          {qualifiedIdeas.reduce((sum, idea) => {
                            const fte = parseFloat(idea.resourceRequirement?.split(' ')[0] || '0');
                            return sum + fte;
                          }, 0)} FTE
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Avg. Time to Market</span>
                        <span className="font-medium">
                          {Math.round(qualifiedIdeas.reduce((sum, idea) => {
                            const months = parseFloat(idea.timeToMarket?.split(' ')[0] || '0');
                            return sum + months;
                          }, 0) / qualifiedIdeas.length || 0)} months
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Expected ROI Range</span>
                        <span className="font-medium text-green-600">120-300%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Priority List Tab */}
            <TabsContent value="priority-list" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Prioritized Ideas Ranking</h3>
                  <p className="text-xs text-gray-600">Drag to reorder or use auto-prioritization</p>
                </div>
              </div>

              <div className="space-y-2">
                {qualifiedIdeas
                  .sort((a, b) => a.priority - b.priority)
                  .map((idea) => {
                    const PriorityIcon = getPriorityIcon(idea.priority);
                    
                    return (
                      <Card key={idea.id} className="border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            {/* Priority Rank */}
                            <div className={`flex items-center space-x-2 p-2 rounded border ${getPriorityColor(idea.priority)}`}>
                              <PriorityIcon size={14} />
                              <span className="font-bold text-sm">#{idea.priority}</span>
                            </div>

                            {/* Idea Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-sm">{idea.title}</h3>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {idea.businessBriefId}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  Score: {idea.qualificationScore.toFixed(1)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="flex items-center space-x-1">
                                  <DollarSign size={10} className="text-green-500" />
                                  <span>Value: {idea.businessValue}/10</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap size={10} className="text-blue-500" />
                                  <span>Effort: {idea.effort}/10</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar size={10} className="text-purple-500" />
                                  <span>{idea.timeToMarket}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users size={10} className="text-orange-500" />
                                  <span>{idea.resourceRequirement}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => movePriority(idea.id, 'up')}
                                disabled={idea.priority === 1}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronUp size={10} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => movePriority(idea.id, 'down')}
                                disabled={idea.priority === qualifiedIdeas.length}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown size={10} />
                              </Button>
                              <GripVertical size={12} className="text-gray-400 cursor-move" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>

            {/* Value/Effort Matrix Tab */}
            <TabsContent value="value-effort-matrix" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold">Value vs Effort Matrix</h3>
                <p className="text-xs text-gray-600">Strategic positioning of qualified ideas</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* High Value, Low Effort - Quick Wins */}
                <Card className={`border-2 ${getValueEffortColor('high_value_low_effort')}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Star size={14} />
                      <span>{getQuadrantTitle('high_value_low_effort')}</span>
                      <Badge variant="secondary" className="text-xs">{matrix.high_value_low_effort.length}</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">High Value • Low Effort</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {matrix.high_value_low_effort.map(idea => (
                      <div key={idea.id} className="p-2 bg-white rounded text-xs">
                        <div className="font-medium">{idea.title}</div>
                        <div className="flex justify-between mt-1">
                          <span>ROI: {idea.estimatedROI}</span>
                          <span>#{idea.priority}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* High Value, High Effort - Major Projects */}
                <Card className={`border-2 ${getValueEffortColor('high_value_high_effort')}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Crown size={14} />
                      <span>{getQuadrantTitle('high_value_high_effort')}</span>
                      <Badge variant="secondary" className="text-xs">{matrix.high_value_high_effort.length}</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">High Value • High Effort</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {matrix.high_value_high_effort.map(idea => (
                      <div key={idea.id} className="p-2 bg-white rounded text-xs">
                        <div className="font-medium">{idea.title}</div>
                        <div className="flex justify-between mt-1">
                          <span>ROI: {idea.estimatedROI}</span>
                          <span>#{idea.priority}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Low Value, Low Effort - Fill-ins */}
                <Card className={`border-2 ${getValueEffortColor('low_value_low_effort')}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <CheckCircle size={14} />
                      <span>{getQuadrantTitle('low_value_low_effort')}</span>
                      <Badge variant="secondary" className="text-xs">{matrix.low_value_low_effort.length}</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">Low Value • Low Effort</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {matrix.low_value_low_effort.map(idea => (
                      <div key={idea.id} className="p-2 bg-white rounded text-xs">
                        <div className="font-medium">{idea.title}</div>
                        <div className="flex justify-between mt-1">
                          <span>ROI: {idea.estimatedROI}</span>
                          <span>#{idea.priority}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Low Value, High Effort - Questionable */}
                <Card className={`border-2 ${getValueEffortColor('low_value_high_effort')}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <AlertTriangle size={14} />
                      <span>{getQuadrantTitle('low_value_high_effort')}</span>
                      <Badge variant="secondary" className="text-xs">{matrix.low_value_high_effort.length}</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">Low Value • High Effort</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {matrix.low_value_high_effort.map(idea => (
                      <div key={idea.id} className="p-2 bg-white rounded text-xs">
                        <div className="font-medium">{idea.title}</div>
                        <div className="flex justify-between mt-1">
                          <span>ROI: {idea.estimatedROI}</span>
                          <span>#{idea.priority}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Portfolio Planning Tab */}
            <TabsContent value="portfolio-planning" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Portfolio Roadmap */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Portfolio Roadmap</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map((quarter, quarterIndex) => (
                        <div key={quarter} className="border border-gray-300 rounded p-2">
                          <div className="font-medium text-xs mb-2 text-blue-600">{quarter}</div>
                          <div className="space-y-1">
                            {qualifiedIdeas
                              .filter(idea => idea.priority <= (quarterIndex + 1) * 2)
                              .slice(quarterIndex * 2, (quarterIndex + 1) * 2)
                              .map(idea => (
                                <div key={idea.id} className="text-xs p-1 bg-gray-50 rounded">
                                  <div className="font-medium">{idea.title}</div>
                                  <div className="text-gray-600">{idea.resourceRequirement} • {idea.timeToMarket}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Analysis */}
                <Card className="border border-gray-400 bg-white shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <DollarSign size={14} className="text-green-500" />
                      <span>Investment Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">$2.4M</div>
                          <div className="text-gray-600">Expected Revenue</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">$800K</div>
                          <div className="text-gray-600">Investment Required</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Portfolio ROI</span>
                          <span className="font-medium text-green-600">200%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Break-even Timeline</span>
                          <span className="font-medium">8 months</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk-adjusted Return</span>
                          <span className="font-medium">165%</span>
                        </div>
                      </div>

                      <Button size="sm" className="w-full h-6 text-xs">
                        <FileText size={10} className="mr-1" />
                        Generate Business Case
                      </Button>
                    </div>
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
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">{activity.owner}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-xs mb-1">Owner: {activity.owner}</div>
                        <div className="text-xs text-gray-700">{activity.activity}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[
                      { owner: 'PM', activity: 'Define portfolio themes and strategic objectives' },
                      { owner: 'BA', activity: 'Conduct market research and competitive analysis' },
                      { owner: 'TL', activity: 'Assess technical feasibility and resource requirements' },
                      { owner: 'PO', activity: 'Prioritize ideas based on business value and strategic fit' },
                      { owner: 'SM', activity: 'Plan portfolio roadmap and release planning' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border border-gray-300 shadow-sm">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-green-600">{activity.owner}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-xs mb-1">Owner: {activity.owner}</div>
                          <div className="text-xs text-gray-700">{activity.activity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
