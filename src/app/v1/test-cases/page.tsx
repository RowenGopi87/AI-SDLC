/*
// ORIGINAL TEST CASES PAGE - COMMENTED OUT FOR BACKUP
// This is the original implementation - keeping for potential rollback

"use client";

import { useState } from 'react';
import { useTestCaseStore } from '@/store/test-case-store';
import { useWorkItemStore } from '@/store/work-item-store';
import { useRequirementStore } from '@/store/requirement-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { CURRENT_WORKFLOW, getWorkflowLevel } from '@/lib/workflow-config';
import { setSelectedItem } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Edit,
  Trash2,
  User,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Original test cases page implementation was here...
// Removed for brevity but can be restored if needed

// END OF ORIGINAL TEST CASES PAGE
*/

// NEW HIERARCHICAL TEST CASES PAGE WITH FOLDER STRUCTURE

"use client";

import React, { useState, useCallback } from 'react';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useStoryStore } from '@/store/story-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { useSettingsStore } from '@/store/settings-store';
import { useTestCaseStore, TestCase } from '@/store/test-case-store';
import { formatDateForDisplay } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Edit,
  Trash2,
  User,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderOpen,
  Folder,
  Target,
  Layers,
  BookOpen,
  FileText,
  Wand2,
  Loader2,
  GripVertical,
  Save,
  X
} from 'lucide-react';



export default function TestCasesPage() {
  const { initiatives } = useInitiativeStore();
  const { features, getFeaturesByInitiative } = useFeatureStore();
  const { epics, getEpicsByFeature } = useEpicStore();
  const { stories, getStoriesByEpic } = useStoryStore();
  const { useCases } = useUseCaseStore();
  const { llmSettings, validateSettings } = useSettingsStore();
  const { 
    testCases, 
    addTestCase, 
    addGeneratedTestCases, 
    updateTestCase, 
    deleteTestCase, 
    updateTestCaseStatus,
    getTestCasesByWorkItemId 
  } = useTestCaseStore();

  // State management - Start with everything collapsed
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedBusinessBriefs, setExpandedBusinessBriefs] = useState<Set<string>>(new Set());
  const [selectedWorkItem, setSelectedWorkItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'work_items' | 'test_cases'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [selectedWorkItemForGeneration, setSelectedWorkItemForGeneration] = useState<any>(null);
  const [generatingItems, setGeneratingItems] = useState<Record<string, boolean>>({});
  const [panelWidth, setPanelWidth] = useState(50); // Percentage width for left panel
  const [isResizing, setIsResizing] = useState(false);
  const [executingTestCases, setExecutingTestCases] = useState<Record<string, boolean>>({});
  const [testExecutionResults, setTestExecutionResults] = useState<Record<string, any>>({});

  // Debug mode toggle (hidden by default, accessible via debug menu)
  const [useMockLLM, setUseMockLLM] = useState(false);
  const [showDebugControls, setShowDebugControls] = useState(false);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);

  // All work items start collapsed by default - users can expand manually

  // Load test cases from database when component mounts
  const loadTestCasesFromDatabase = async () => {
    if (isLoadingTestCases) return;
    
    setIsLoadingTestCases(true);
    try {
      console.log('📊 Loading test cases from database...');
      
      const response = await fetch('/api/test-cases/list');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Clear existing test cases first
        testCases.forEach(tc => deleteTestCase(tc.id));
        
        // Add test cases from database
        data.data.forEach((tc: any) => {
          addTestCase({
            id: tc.id,
            workItemId: tc.work_item_id,
            workItemType: tc.work_item_type as 'feature' | 'epic' | 'story',
            title: tc.description, // Use description as title
            summary: tc.description,
            description: tc.description,
            type: tc.test_type as 'positive' | 'negative' | 'edge',
            testPyramidType: 'system' as const,
            status: tc.status === 'pass' ? 'passed' : tc.status === 'fail' ? 'failed' : 'not_run' as const,
            priority: 'medium' as const,
            preconditions: [],
            steps: JSON.parse(tc.steps || '[]'),
            expectedResult: tc.expected_result,
            assignee: tc.assigned_to || 'Team',
            createdBy: 'Database',
            estimatedTime: 5,
            tags: ['database']
          });
        });
        
        console.log(`✅ Loaded ${data.data.length} test cases from database`);
      }
    } catch (error) {
      console.error('❌ Failed to load test cases from database:', error);
    } finally {
      setIsLoadingTestCases(false);
    }
  };

  // Initialize with database test cases (replace sample data logic)
  React.useEffect(() => {
    // Load test cases from database instead of using sample data
    loadTestCasesFromDatabase();
  }, []); // Run once on mount

  // Original sample data initialization (commented out)
  /*
  React.useEffect(() => {
    // Add a small delay to ensure store hydration is complete
    const timer = setTimeout(() => {
      if (testCases.length === 0) {
        console.log('🔧 Initializing test cases store with sample data');
        // Add some sample test cases
        const sampleTestCases = [
          {
            workItemId: 'init-123',
            workItemType: 'initiative' as const,
            title: 'Login Functionality Test',
            summary: 'Verify user can login with valid credentials',
            description: 'Test the login functionality with valid username and password',
            type: 'positive' as const,
            testPyramidType: 'system' as const,
            status: 'passed' as const,
            priority: 'high' as const,
            preconditions: ['User account exists', 'Application is running'],
            steps: ['Navigate to login page', 'Enter valid username', 'Enter valid password', 'Click login button'],
            expectedResult: 'User should be successfully logged in and redirected to dashboard',
            assignee: 'John Doe',
            createdBy: 'Test Team',
            estimatedTime: 5,
            tags: ['authentication', 'login']
          },
          {
            workItemId: 'STORY-004',
            workItemType: 'story' as const,
            title: 'Navigate to Manage Bookings from Emirates Website',
            summary: 'Verify navigation to Manage Bookings from emrets.com works correctly',
            description: 'Test that users can successfully navigate from the Emirates website to the Manage Bookings interface using Chrome browser',
            type: 'positive' as const,
            testPyramidType: 'system' as const,
            status: 'not_run' as const,
            priority: 'high' as const,
            preconditions: [
              'Windows Chrome browser is installed and updated',
              'Internet connection is available',
              'emrets.com website is accessible'
            ],
            steps: [
              'Open Windows Chrome browser',
              'Navigate to emrets.com',
              'Locate and click on "Manage Bookings" link',
              'Verify the Manage Bookings page loads successfully'
            ],
            expectedResult: 'The Manage Bookings interface should open successfully and display the booking management page',
            assignee: 'QA Team',
            createdBy: 'Test Team',
            estimatedTime: 3,
            tags: ['navigation', 'booking', 'web-interface', 'chrome']
          },
          {
            workItemId: 'STORY-004',
            workItemType: 'story' as const,
            title: 'Manage Bookings Link Visibility Test',
            summary: 'Verify Manage Bookings link is visible and accessible on emrets.com',
            description: 'Test that the Manage Bookings link is prominently displayed and easily accessible on the Emirates website homepage',
            type: 'positive' as const,
            testPyramidType: 'acceptance' as const,
            status: 'not_run' as const,
            priority: 'high' as const,
            preconditions: [
              'Windows Chrome browser is installed',
              'emrets.com website is accessible',
              'No browser cache issues'
            ],
            steps: [
              'Open Windows Chrome browser',
              'Navigate to emrets.com',
              'Scan the homepage for Manage Bookings link',
              'Verify link is visible without scrolling',
              'Verify link text is clear and readable'
            ],
            expectedResult: 'The Manage Bookings link should be clearly visible, properly labeled, and accessible on the homepage',
            assignee: 'QA Team',
            createdBy: 'Test Team',
            estimatedTime: 2,
            tags: ['visibility', 'accessibility', 'homepage', 'chrome']
          },
          {
            workItemId: 'STORY-004',
            workItemType: 'story' as const,
            title: 'Manage Bookings Page Load Performance Test',
            summary: 'Verify Manage Bookings page loads within acceptable time limits',
            description: 'Test that the Manage Bookings page loads within 3 seconds when accessed from emrets.com',
            type: 'positive' as const,
            testPyramidType: 'performance' as const,
            status: 'not_run' as const,
            priority: 'medium' as const,
            preconditions: [
              'Windows Chrome browser is installed',
              'Standard internet connection (minimum 10 Mbps)',
              'emrets.com website is accessible'
            ],
            steps: [
              'Open Windows Chrome browser',
              'Open Chrome Developer Tools (F12)',
              'Navigate to emrets.com',
              'Click on "Manage Bookings" link',
              'Measure page load time using Network tab',
              'Verify total load time is under 3 seconds'
            ],
            expectedResult: 'The Manage Bookings page should load completely within 3 seconds of clicking the link',
            assignee: 'Performance Team',
            createdBy: 'Test Team',
            estimatedTime: 5,
            tags: ['performance', 'loading', 'timing', 'chrome']
          }
        ];

        sampleTestCases.forEach(tc => addTestCase(tc));
      }
    }, 100); // Small delay to allow hydration

    return () => clearTimeout(timer);
  }, [testCases.length, addTestCase]);
  */

  // Form data for test case creation/editing
  const [formData, setFormData] = useState<{
    title: string;
    summary: string;
    description: string;
    type: 'positive' | 'negative' | 'edge';
    priority: 'low' | 'medium' | 'high' | 'critical';
    preconditions: string;
    steps: string;
    expectedResult: string;
    assignee: string;
    estimatedTime: number;
    tags: string;
  }>({
    title: '',
    summary: '',
    description: '',
    type: 'positive',
    priority: 'medium',
    preconditions: '',
    steps: '',
    expectedResult: '',
    assignee: '',
    estimatedTime: 5,
    tags: ''
  });

  // Handle panel resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    
    // Limit between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

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

  // Toggle business brief expanded state
  const toggleBusinessBriefExpanded = (id: string) => {
    const newExpanded = new Set(expandedBusinessBriefs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBusinessBriefs(newExpanded);
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initiative': return <Target size={16} style={{color: '#D4A843'}} />;
      case 'feature': return <Layers size={16} style={{color: '#5B8DB8'}} />;
      case 'epic': return <BookOpen size={16} style={{color: '#8B7A9B'}} />;
      case 'story': return <FileText size={16} style={{color: '#7FB37C'}} />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'initiative': return 'text-yellow-800 border-yellow-300';
      case 'feature': return 'text-blue-800 border-blue-300';
      case 'epic': return 'text-purple-800 border-purple-300';
      case 'story': return 'text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get test case type icon
  const getTestCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle size={14} className="text-green-600" />;
      case 'negative': return <XCircle size={14} className="text-red-600" />;
      case 'edge': return <AlertTriangle size={14} className="text-yellow-600" />;
      default: return <TestTube size={14} className="text-gray-600" />;
    }
  };

  // Get test pyramid type icon
  const getTestPyramidTypeIcon = (testType: string) => {
    switch (testType) {
      case 'unit': return <div title="Unit Test"><FileText size={14} className="text-blue-600" /></div>;
      case 'integration': return <div title="Integration Test"><Layers size={14} className="text-purple-600" /></div>;
      case 'system': return <div title="System Test"><Target size={14} className="text-orange-600" /></div>;
      case 'acceptance': return <div title="Acceptance Test"><CheckCircle size={14} className="text-green-600" /></div>;
      case 'performance': return <div title="Performance Test"><TrendingUp size={14} className="text-red-600" /></div>;
      case 'security': return <div title="Security Test"><AlertTriangle size={14} className="text-yellow-600" /></div>;
      default: return <div title="Test"><TestTube size={14} className="text-gray-600" /></div>;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Test generation form data
  const [generateFormData, setGenerateFormData] = useState({
    testType: 'unit' as 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security',
    count: 5,
    includeNegative: true,
    includeEdge: true
  });

  // Handle test case generation
  const handleGenerateTestCases = async (workItem: any, type: string) => {
    setSelectedWorkItemForGeneration({ ...workItem, workflowLevel: type });
    setIsGenerateDialogOpen(true);
  };

  // Build hierarchical context for LLM
  const buildHierarchicalContext = (workItem: any, workflowLevel: string) => {
    const context: any = {
      currentItem: {
        id: workItem.id,
        title: workItem.title,
        description: workItem.description,
        rationale: workItem.rationale,
        businessValue: workItem.businessValue,
        acceptanceCriteria: workItem.acceptanceCriteria,
        level: workflowLevel
      }
    };

    // Build hierarchy based on current level
    switch (workflowLevel) {
      case 'story':
        // For story: include epic, feature, initiative, business brief
        const story = workItem;
        const epic = epics.find(e => e.id === story.epicId);
        if (epic) {
          context.epic = {
            id: epic.id,
            title: epic.title,
            description: epic.description,
            rationale: epic.rationale,
            businessValue: epic.businessValue
          };
          
          const feature = features.find(f => f.id === epic.featureId);
          if (feature) {
            context.feature = {
              id: feature.id,
              title: feature.title,
              description: feature.description,
              rationale: feature.rationale,
              businessValue: feature.businessValue
            };
            
            const initiative = initiatives.find(i => i.id === feature.initiativeId);
            if (initiative) {
              context.initiative = {
                id: initiative.id,
                title: initiative.title,
                description: initiative.description,
                rationale: initiative.rationale,
                businessValue: initiative.businessValue
              };
              
              const useCase = useCases.find(uc => uc.id === initiative.businessBriefId);
        if (useCase) {
                context.businessBrief = {
                  id: useCase.id,
            title: useCase.title,
                  description: useCase.description
          };
        }
      }
    }
        }
        break;
        
      case 'epic':
        // For epic: include feature, initiative, business brief
        const epicItem = workItem;
        const epicFeature = features.find(f => f.id === epicItem.featureId);
        if (epicFeature) {
          context.feature = {
            id: epicFeature.id,
            title: epicFeature.title,
            description: epicFeature.description,
            rationale: epicFeature.rationale,
            businessValue: epicFeature.businessValue
          };
          
          const epicInitiative = initiatives.find(i => i.id === epicFeature.initiativeId);
          if (epicInitiative) {
            context.initiative = {
              id: epicInitiative.id,
              title: epicInitiative.title,
              description: epicInitiative.description,
              rationale: epicInitiative.rationale,
              businessValue: epicInitiative.businessValue
            };
            
            const epicUseCase = useCases.find(uc => uc.id === epicInitiative.businessBriefId);
            if (epicUseCase) {
              context.businessBrief = {
                id: epicUseCase.id,
                title: epicUseCase.title,
                description: epicUseCase.description
              };
            }
          }
        }
        break;
        
      case 'feature':
        // For feature: include initiative, business brief
        const featureItem = workItem;
        const featureInitiative = initiatives.find(i => i.id === featureItem.initiativeId);
        if (featureInitiative) {
          context.initiative = {
            id: featureInitiative.id,
            title: featureInitiative.title,
            description: featureInitiative.description,
            rationale: featureInitiative.rationale,
            businessValue: featureInitiative.businessValue
          };
          
          const featureUseCase = useCases.find(uc => uc.id === featureInitiative.businessBriefId);
          if (featureUseCase) {
            context.businessBrief = {
              id: featureUseCase.id,
              title: featureUseCase.title,
              description: featureUseCase.description
            };
          }
        }
        break;
        
      case 'initiative':
        // For initiative: include business brief
        const initiativeItem = workItem;
        const initiativeUseCase = useCases.find(uc => uc.id === initiativeItem.businessBriefId);
        if (initiativeUseCase) {
          context.businessBrief = {
            id: initiativeUseCase.id,
            title: initiativeUseCase.title,
            description: initiativeUseCase.description
          };
        }
        break;
    }

    return context;
  };

  // Generate system prompt for LLM
  const generateSystemPrompt = (context: any, testType: string, includeNegative: boolean, includeEdge: boolean) => {
    const currentLevel = context.currentItem.level;
    let hierarchyInfo = '';

    // Build hierarchy description
    if (context.businessBrief) {
      hierarchyInfo += `Business Brief: "${context.businessBrief.title}" - ${context.businessBrief.description}\n\n`;
    }
    if (context.initiative) {
      hierarchyInfo += `Initiative: "${context.initiative.title}" - ${context.initiative.description}\nRationale: ${context.initiative.rationale}\nBusiness Value: ${context.initiative.businessValue}\n\n`;
    }
    if (context.feature) {
      hierarchyInfo += `Feature: "${context.feature.title}" - ${context.feature.description}\nRationale: ${context.feature.rationale}\nBusiness Value: ${context.feature.businessValue}\n\n`;
    }
    if (context.epic) {
      hierarchyInfo += `Epic: "${context.epic.title}" - ${context.epic.description}\nRationale: ${context.epic.rationale}\nBusiness Value: ${context.epic.businessValue}\n\n`;
    }

    const testTypeDescriptions = {
      unit: 'Unit tests focus on testing individual components or functions in isolation',
      integration: 'Integration tests verify that different components work together correctly',
      system: 'System tests validate the complete integrated system meets requirements',
      acceptance: 'Acceptance tests verify the system meets business requirements and user needs',
      performance: 'Performance tests assess system speed, responsiveness, and stability under load',
      security: 'Security tests identify vulnerabilities and ensure data protection'
    };

    return `You are an expert test case generator. Generate comprehensive ${testType} test cases for the following ${currentLevel}.

HIERARCHY CONTEXT:
${hierarchyInfo}

CURRENT ${currentLevel.toUpperCase()}:
Title: "${context.currentItem.title}"
Description: ${context.currentItem.description}
Rationale: ${context.currentItem.rationale}
Business Value: ${context.currentItem.businessValue}
Acceptance Criteria: ${context.currentItem.acceptanceCriteria?.join(', ') || 'Not specified'}

TEST TYPE: ${testType.toUpperCase()}
${testTypeDescriptions[testType as keyof typeof testTypeDescriptions]}

REQUIREMENTS:
- Generate test cases that are specific to ${testType} testing
- Each test case must have clear, actionable steps
- Include explicit prerequisites/preconditions
- Provide detailed expected results
- Assign appropriate priority levels
- Include relevant tags for categorization
${includeNegative ? '- Include negative test cases to verify error handling' : ''}
${includeEdge ? '- Include edge cases to test boundary conditions' : ''}

RESPONSE FORMAT:
Return a JSON array of test cases with this exact structure:
{
  "testCases": [
    {
      "title": "Clear, descriptive test case title",
      "summary": "Brief one-line summary of what this test verifies",
      "description": "Detailed description of the test purpose and scope",
      "type": "positive|negative|edge",
      "priority": "low|medium|high|critical",
      "preconditions": ["List of prerequisites", "Each as separate string"],
      "steps": ["Step 1: Action to take", "Step 2: Next action", "..."],
      "expectedResult": "Clear description of expected outcome",
      "estimatedTime": 5,
      "tags": ["${testType}", "relevant", "category", "tags"]
    }
  ]
}

Generate comprehensive test cases that thoroughly validate the ${currentLevel} within the context of the provided hierarchy.`;
  };

  // Execute test case generation
  const executeTestCaseGeneration = async () => {
    if (!selectedWorkItemForGeneration) return;

    const key = `${selectedWorkItemForGeneration.workflowLevel}-${selectedWorkItemForGeneration.id}`;
    setGeneratingItems(prev => ({ ...prev, [key]: true }));
    setIsGenerateDialogOpen(false);

    try {
      // Build hierarchical context
      const context = buildHierarchicalContext(
        selectedWorkItemForGeneration, 
        selectedWorkItemForGeneration.workflowLevel
      );

      // Generate system prompt
      const systemPrompt = generateSystemPrompt(
        context,
        generateFormData.testType,
        generateFormData.includeNegative,
        generateFormData.includeEdge
      );

      console.log('System Prompt:', systemPrompt);

      if (useMockLLM) {
        // Mock response for development
        setTimeout(() => {
          const mockResponse = {
            testCases: [
              {
                title: selectedWorkItemForGeneration.title,
                summary: `Verify ${selectedWorkItemForGeneration.title} functionality works correctly`,
                description: `Test the core functionality of ${selectedWorkItemForGeneration.title} to ensure it meets the specified requirements and behaves as expected`,
    type: 'positive' as const,
                priority: 'high' as const,
                preconditions: [
                  'System is running and accessible',
                  'User has appropriate permissions',
                  'Test data is available'
                ],
                steps: [
                  'Navigate to the relevant section',
                  'Perform the primary action',
                  'Verify the response',
                  'Check for side effects'
                ],
                expectedResult: `The ${selectedWorkItemForGeneration.title} should function correctly and produce the expected outcome`,
                estimatedTime: 10,
                tags: [generateFormData.testType, 'automated', 'core-functionality']
              }
            ]
          };

          // Create test cases from mock response
          const newTestCases: TestCase[] = mockResponse.testCases.map((tc, index) => ({
            id: `TC-${String(testCases.length + index + 1).padStart(3, '0')}`,
            workItemId: selectedWorkItemForGeneration.id,
            workItemType: selectedWorkItemForGeneration.workflowLevel as any,
            title: tc.title,
            summary: tc.summary,
            description: tc.description,
            type: tc.type,
            testPyramidType: generateFormData.testType,
            status: 'not_run' as const,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expectedResult,
            estimatedTime: tc.estimatedTime,
            tags: tc.tags,
            createdBy: 'AI Generator',
            createdAt: new Date(),
          }));

          // Add to test cases list using store
          addGeneratedTestCases(selectedWorkItemForGeneration.id, newTestCases.map(tc => ({
            workItemType: tc.workItemType,
            title: tc.title,
            summary: tc.summary,
            description: tc.description,
            type: tc.type,
            testPyramidType: tc.testPyramidType,
            status: tc.status,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expectedResult,
            estimatedTime: tc.estimatedTime,
            tags: tc.tags,
            createdBy: tc.createdBy,
            assignee: tc.assignee,
            actualResult: tc.actualResult,
            lastExecuted: tc.lastExecuted
          })));
          
          setGeneratingItems(prev => ({ ...prev, [key]: false }));
          setIsGenerateDialogOpen(false);

          // Show success message
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          notification.textContent = `✅ Generated ${newTestCases.length} mock test cases successfully`;
          document.body.appendChild(notification);
          setTimeout(() => document.body.removeChild(notification), 3000);
        }, 2000);
        return;
      }

      // Real LLM integration
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

      // Generate test cases using the configured LLM
      const response = await fetch('/api/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workItemId: selectedWorkItemForGeneration.id,
          workItemType: selectedWorkItemForGeneration.workflowLevel,
          workItemData: {
            title: selectedWorkItemForGeneration.title,
            description: selectedWorkItemForGeneration.description,
            rationale: selectedWorkItemForGeneration.rationale,
            businessValue: selectedWorkItemForGeneration.businessValue,
            acceptanceCriteria: selectedWorkItemForGeneration.acceptanceCriteria,
          },
          contextData: context,
          testType: generateFormData.testType,
          includeNegative: generateFormData.includeNegative,
          includeEdge: generateFormData.includeEdge,
          llmSettings: settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate test cases');
      }

      const { data } = await response.json();
      
      // Create test cases from LLM response
      const newTestCases: TestCase[] = data.testCases.map((tc: any, index: number) => ({
        id: `TC-${String(testCases.length + index + 1).padStart(3, '0')}`,
        workItemId: selectedWorkItemForGeneration.id,
        workItemType: selectedWorkItemForGeneration.workflowLevel as any,
        title: tc.title,
        summary: tc.summary,
        description: tc.description,
        type: tc.type,
        testPyramidType: generateFormData.testType,
        status: 'not_run' as const,
        priority: tc.priority,
        preconditions: tc.preconditions,
        steps: tc.steps,
        expectedResult: tc.expectedResult,
        estimatedTime: tc.estimatedTime,
        tags: tc.tags,
        createdBy: 'AI Generator',
        createdAt: new Date(),
      }));

      // Add to test cases list using store
      addGeneratedTestCases(selectedWorkItemForGeneration.id, newTestCases.map(tc => ({
        workItemType: tc.workItemType,
        title: tc.title,
        summary: tc.summary,
        description: tc.description,
        type: tc.type,
        testPyramidType: tc.testPyramidType,
        status: tc.status,
        priority: tc.priority,
        preconditions: tc.preconditions,
        steps: tc.steps,
        expectedResult: tc.expectedResult,
        estimatedTime: tc.estimatedTime,
        tags: tc.tags,
        createdBy: tc.createdBy,
        assignee: tc.assignee,
        actualResult: tc.actualResult,
        lastExecuted: tc.lastExecuted
      })));
      
      setGeneratingItems(prev => ({ ...prev, [key]: false }));
      setIsGenerateDialogOpen(false);

      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Generated ${newTestCases.length} test cases successfully`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Error generating test cases:', error);
      setGeneratingItems(prev => ({ ...prev, [key]: false }));
    }
  };



  // Handle test case form submission
  const handleTestCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preconditionsArray = formData.preconditions
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const stepsArray = formData.steps
      .split('\n')
      .filter(item => item.trim())
      .map(item => item.trim());

    const tagsArray = formData.tags
      .split(',')
      .filter(item => item.trim())
      .map(item => item.trim());

    const testCaseData: TestCase = {
      id: selectedTestCase ? selectedTestCase.id : `TC-${String(testCases.length + 1).padStart(3, '0')}`,
      workItemId: selectedWorkItem?.id || '',
      workItemType: selectedWorkItem?.workflowLevel || 'initiative',
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      type: formData.type,
      testPyramidType: selectedTestCase ? selectedTestCase.testPyramidType : 'unit',
      status: 'not_run',
      priority: formData.priority,
      preconditions: preconditionsArray,
      steps: stepsArray,
      expectedResult: formData.expectedResult,
      assignee: formData.assignee,
      estimatedTime: formData.estimatedTime,
      tags: tagsArray,
      createdBy: 'Current User',
      createdAt: selectedTestCase ? selectedTestCase.createdAt : new Date(),
    };

    if (selectedTestCase) {
      updateTestCase(selectedTestCase.id, testCaseData);
    } else {
      addTestCase(testCaseData);
    }

    resetForm();
    setIsDialogOpen(false);
    setIsDetailModalOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      description: '',
      type: 'positive',
      priority: 'medium',
      preconditions: '',
      steps: '',
      expectedResult: '',
      assignee: '',
      estimatedTime: 5,
      tags: ''
    });
    setSelectedTestCase(null);
  };

  // Open test case detail modal
  const openTestCaseDetail = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setFormData({
      title: testCase.title,
      summary: testCase.summary,
      description: testCase.description,
      type: testCase.type,
      priority: testCase.priority,
      preconditions: testCase.preconditions.join('\n'),
      steps: testCase.steps.join('\n'),
      expectedResult: testCase.expectedResult,
      assignee: testCase.assignee || '',
      estimatedTime: testCase.estimatedTime || 5,
      tags: testCase.tags.join(', ')
    });
    setIsDetailModalOpen(true);
  };



  // Execute test case with MCP
  const executeTestCase = async (testCase: TestCase) => {
    const testCaseId = testCase.id;
    
    // Set executing state
    setExecutingTestCases(prev => ({ ...prev, [testCaseId]: true }));
    
    try {
      console.log('🎭 Executing test case:', testCase.title);
      
      // Call API to execute test case
      const response = await fetch('/api/execute-test-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCase: {
            id: testCase.id,
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions,
            steps: testCase.steps,
            expectedResult: testCase.expectedResult,
            type: testCase.type,
            priority: testCase.priority,
            tags: testCase.tags
          },
          llmProvider: 'google',
          model: 'gemini-2.5-pro'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update test case status based on result
        const resultLower = result.result.toLowerCase();
        let newStatus: 'passed' | 'failed' | 'blocked' = 'passed';
        
        if (resultLower.includes('fail') || resultLower.includes('error')) {
          newStatus = 'failed';
        } else if (resultLower.includes('block') || resultLower.includes('unable')) {
          newStatus = 'blocked';
        }
        
        // Update test case status
        updateTestCaseStatus(testCaseId, newStatus);
        
        // Store execution result
        setTestExecutionResults(prev => ({
          ...prev,
          [testCaseId]: {
            result: result.result,
            success: result.success,
            screenshots: result.screenshots,
            executionTime: result.execution_time,
            timestamp: new Date()
          }
        }));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `✅ Test case executed successfully (${newStatus})`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 5000);
        
        console.log('✅ Test case execution completed:', {
          testCase: testCase.title,
          status: newStatus,
          screenshots: result.screenshots,
          executionTime: result.execution_time
        });
      } else {
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = `❌ Test execution failed: ${result.error}`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 5000);
        
        console.error('❌ Test case execution failed:', result.error);
      }
      
    } catch (error) {
      console.error('Error executing test case:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Test execution error: ${error}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 5000);
      
    } finally {
      // Clear executing state
      setExecutingTestCases(prev => ({ ...prev, [testCaseId]: false }));
    }
  };

  // Enhance test case with AI
  const enhanceTestCaseWithAI = async (testCase: TestCase) => {
    // TODO: Implement AI enhancement logic
    // This would send the test case to LLM for enhancement
    console.log('Enhancing test case with AI:', testCase.id);
    
    // For now, just show a placeholder message
    alert(`AI enhancement for test case ${testCase.id} will be implemented. This will send the test case details to the LLM for improvement suggestions.`);
  };

  // Render folder structure
  const renderWorkItemFolder = (item: any, level: number = 0, type: string = 'initiative') => {
    const isExpanded = expandedItems.has(item.id);
    const itemTestCases = getTestCasesByWorkItemId(item.id);
    
    // Get children based on type
    const children = (() => {
    switch (type) {
        case 'initiative': return getFeaturesByInitiative(item.id);
        case 'feature': return getEpicsByFeature(item.id);
        case 'epic': return getStoriesByEpic(item.id);
        default: return [];
      }
    })();

    const hasChildren = children.length > 0;
    const generatingKey = `${type}-${item.id}`;
    const isGenerating = generatingItems[generatingKey];

    return (
      <div key={item.id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedWorkItem?.id === item.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedWorkItem(item)}
        >
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren || itemTestCases.length > 0) toggleExpanded(item.id);
            }}
          >
            {hasChildren || itemTestCases.length > 0 ? (
              isExpanded ? (
                <FolderOpen size={12} className="text-blue-600" />
              ) : (
                <Folder size={12} className="text-gray-500" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </Button>

          {/* Type Icon */}
          <div className="flex items-center space-x-2">
            {getTypeIcon(type)}
            <Badge 
              className={getTypeBadgeColor(type)} 
              variant="secondary"
              style={{
                backgroundColor: type === 'initiative' ? '#FFECAD' : 
                               type === 'feature' ? '#D4E1EC' : 
                               type === 'epic' ? '#D6D0DD' : 
                               type === 'story' ? '#CDE1CC' : undefined
              }}
            >
              {type}
            </Badge>
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              {itemTestCases.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  {itemTestCases.length} test{itemTestCases.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {hasChildren && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {children.length} {type === 'initiative' ? 'features' : 
                                   type === 'feature' ? 'epics' : 
                                   type === 'epic' ? 'stories' : 'items'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{item.description}</p>
          </div>

          {/* Generate Test Cases Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateTestCases(item, type);
            }}
            disabled={isGenerating}
            title="Generate Test Cases"
          >
            {isGenerating ? (
              <Loader2 size={12} className="animate-spin text-green-600" />
            ) : (
              <TestTube size={12} className="text-green-600" />
            )}
          </Button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-1">
            {/* Child Work Items */}
            {children.map((child) => {
              const childType = type === 'initiative' ? 'feature' : 
                              type === 'feature' ? 'epic' : 
                              type === 'epic' ? 'story' : 'item';
              return renderWorkItemFolder(child, level + 1, childType);
            })}
          </div>
        )}
      </div>
    );
  };

  // Search functionality
  const searchInWorkItem = (item: any, term: string): boolean => {
    const searchLower = term.toLowerCase();
    return item.title?.toLowerCase().includes(searchLower) ||
           item.description?.toLowerCase().includes(searchLower) ||
           item.rationale?.toLowerCase().includes(searchLower);
  };

  const searchInTestCase = (testCase: TestCase, term: string): boolean => {
    const searchLower = term.toLowerCase();
    return testCase.title.toLowerCase().includes(searchLower) ||
           testCase.summary.toLowerCase().includes(searchLower) ||
           testCase.description.toLowerCase().includes(searchLower) ||
           testCase.id.toLowerCase().includes(searchLower) ||
           testCase.tags.some(tag => tag.toLowerCase().includes(searchLower));
  };

  // Filter work items based on search
  const filterWorkItemsBySearch = (item: any): boolean => {
    if (!searchTerm) return true;
    
    if (searchType === 'test_cases') return true; // Don't filter work items when searching test cases
    if (searchType === 'work_items' || searchType === 'all') {
      return searchInWorkItem(item, searchTerm);
    }
    return true;
  };

  // Group initiatives by business brief
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

  // Filter business brief groups based on search
  const filteredBusinessBriefGroups = Object.values(initiativesByBusinessBrief).map(group => ({
    ...group,
    initiatives: group.initiatives.filter(filterWorkItemsBySearch)
  })).filter(group => {
    // Keep groups that have matching initiatives or matching business brief title
    if (!searchTerm) return true;
    
    if (searchType === 'test_cases') return true;
    if (searchType === 'work_items' || searchType === 'all') {
      const briefMatches = group.businessBriefTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return briefMatches || group.initiatives.length > 0;
    }
    return true;
  });

  // Get filtered test cases for current selection
  const currentTestCases = selectedWorkItem ? getTestCasesByWorkItemId(selectedWorkItem.id) : [];
  const filteredTestCases = currentTestCases.filter(testCase => {
    // Search filtering
    let matchesSearch = true;
    if (searchTerm) {
      if (searchType === 'work_items') {
        matchesSearch = true; // Don't filter test cases when searching work items
      } else if (searchType === 'test_cases' || searchType === 'all') {
        matchesSearch = searchInTestCase(testCase, searchTerm);
      }
    }
    
    const matchesType = filterType === 'all' || testCase.type === filterType;
    const matchesStatus = filterStatus === 'all' || testCase.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });
    
    return (
    <div className="space-y-6">
      {/* Debug controls (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Controls</h3>
          <div className="space-x-2 mb-2">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={useMockLLM}
                onChange={(e) => setUseMockLLM(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-yellow-700">Use Mock LLM (no API costs)</span>
            </label>
          </div>
          <div className="space-x-2">
            <button 
              onClick={() => {
                console.log('🔍 Test Cases in Store:', testCases);
                console.log('🔍 LocalStorage test-case-storage:', localStorage.getItem('test-case-storage'));
                console.log('🔍 LocalStorage use-case-storage:', localStorage.getItem('use-case-storage'));
                console.log('🔍 LocalStorage work-item-storage:', localStorage.getItem('work-item-storage'));
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Debug Storage
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Clear all test cases from storage?')) {
                  localStorage.removeItem('test-case-storage');
                  window.location.reload();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear Test Cases
            </button>
            </div>
            </div>
      )}

      <div className="flex h-full bg-gray-50">
        {/* Left Panel - Folder Structure */}
      <div 
        className="bg-white border-r border-gray-200 flex flex-col"
        style={{ width: `${panelWidth}%`, minWidth: '300px' }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test Cases</h1>
              <p className="text-sm text-gray-600 mt-1">Hierarchical test case management</p>
          </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 space-y-2">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={
                  searchType === 'work_items' ? "Search work items..." :
                  searchType === 'test_cases' ? "Search test cases..." :
                  "Search work items and test cases..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="work_items">Work Items</SelectItem>
                <SelectItem value="test_cases">Test Cases</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {searchTerm && (
            <div className="text-xs text-gray-500">
              Searching {searchType === 'all' ? 'work items and test cases' : searchType.replace('_', ' ')} for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Folder Structure */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {filteredBusinessBriefGroups.map((group) => {
              const isBusinessBriefExpanded = expandedBusinessBriefs.has(group.businessBriefId);
              
              return (
                <div key={group.businessBriefId} className="space-y-2">
                  {/* Business Brief Header */}
                  <div 
                    className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => toggleBusinessBriefExpanded(group.businessBriefId)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBusinessBriefExpanded(group.businessBriefId);
                      }}
                    >
                      {isBusinessBriefExpanded ? (
                        <ChevronDown size={12} className="text-gray-600" />
                      ) : (
                        <ChevronRight size={12} className="text-gray-600" />
                      )}
                    </Button>
                    <Target className="h-5 w-5" style={{color: '#B8957A'}} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{group.businessBriefTitle}</h3>
                      <p className="text-sm text-gray-600">{group.initiatives.length} initiatives</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.businessBriefId}
                  </Badge>
                </div>
                  
                  {/* Initiatives */}
                  {isBusinessBriefExpanded && (
                    <div className="space-y-1 ml-4">
                      {group.initiatives.map((initiative) => renderWorkItemFolder(initiative, 0, 'initiative'))}
            </div>
                  )}
            </div>
              );
            })}
          </div>

          {filteredBusinessBriefGroups.length === 0 && (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work items found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by creating initiatives in the Work Items page'}
              </p>
              </div>
            )}
        </div>
          </div>
          
      {/* Resizer */}
      <div
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <GripVertical size={16} className="text-gray-500" />
          </div>

      {/* Right Panel - Test Cases List */}
      <div 
        className="flex flex-col bg-white flex-1"
        style={{ minWidth: '400px' }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {selectedWorkItem ? `Test Cases - ${selectedWorkItem.title.length > 40 ? selectedWorkItem.title.substring(0, 40) + '...' : selectedWorkItem.title}` : 'Test Cases'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWorkItem ? `${filteredTestCases.length} test cases` : 'Select a work item to view test cases'}
              </p>
            </div>
            <div className="flex space-x-2">
              {selectedWorkItem && (
                <Button
                  variant="outline"
                  onClick={() => handleGenerateTestCases(selectedWorkItem, selectedWorkItem.workflowLevel)}
                  disabled={generatingItems[`${selectedWorkItem.workflowLevel}-${selectedWorkItem.id}`]}
                >
                  <Wand2 size={16} className="mr-2" />
                  Generate Tests
                </Button>
              )}
              <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedWorkItem}>
                <Plus size={16} className="mr-2" />
                Create Test Case
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {selectedWorkItem && (
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_run">Not Run</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Test Cases Table */}
        <div className="flex-1 overflow-y-auto p-2">
          {selectedWorkItem ? (
            filteredTestCases.length > 0 ? (
              <div style={{ width: 'calc(3/5 * 100%)' }}>
                <Table>
                  <TableHeader>
                   <TableRow>
                     <TableHead className="w-12 text-xs p-1">ID</TableHead>
                     <TableHead className="w-32 text-xs p-1">Title</TableHead>
                     <TableHead className="w-12 text-xs p-1">Type</TableHead>
                     <TableHead className="w-16 text-xs p-1">Status</TableHead>
                     <TableHead className="w-16 text-xs p-1">Priority</TableHead>
                     <TableHead className="w-16 text-xs p-1">Assignee</TableHead>
                     <TableHead className="w-24 text-xs p-1">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredTestCases.map((testCase) => (
                    <TableRow 
                      key={testCase.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => openTestCaseDetail(testCase)}
                    >
                      <TableCell className="font-mono text-xs p-1">
                        <div className="flex items-center space-x-1">
                          <span className="truncate">{testCase.id}</span>
                          {getTestPyramidTypeIcon(testCase.testPyramidType)}
                          {testCase.createdBy === 'AI Generator' && (
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" title="Generated by AI"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-32 p-1">
                        <div className="min-w-0 space-y-0.5">
                          <div className="font-medium text-xs truncate" title={testCase.title}>
                            {testCase.title.length > 25 ? `${testCase.title.substring(0, 25)}...` : testCase.title}
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={testCase.summary}>
                            {testCase.summary.length > 30 ? `${testCase.summary.substring(0, 30)}...` : testCase.summary}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex items-center justify-center">
                          {getTestCaseTypeIcon(testCase.type)}
                        </div>
                      </TableCell>
                      <TableCell className="p-1">
                        <Badge className={`${getStatusColor(testCase.status)} text-xs h-4 px-1`} variant="secondary">
                          {testCase.status.replace('_', ' ').substr(0, 4).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-1">
                        <Badge className={`${getPriorityColor(testCase.priority)} text-xs h-4 px-1`} variant="outline">
                          {testCase.priority.substr(0, 3).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs p-1 truncate w-16">{testCase.assignee || 'Unassigned'}</TableCell>
                      <TableCell className="p-1">
                        <div className="flex space-x-0.5 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              executeTestCase(testCase);
                            }}
                            disabled={executingTestCases[testCase.id]}
                            title="Execute Test Case"
                          >
                            {executingTestCases[testCase.id] ? (
                              <Loader2 size={10} className="animate-spin text-blue-600" />
                            ) : (
                              <Play size={10} className="text-blue-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTestCaseStatus(testCase.id, testCase.status === 'passed' ? 'not_run' : 'passed');
                            }}
                            title={testCase.status === 'passed' ? 'Clear Status' : 'Mark as Passed'}
                          >
                            <CheckCircle size={10} className={testCase.status === 'passed' ? 'text-green-600' : 'text-gray-400'} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTestCaseStatus(testCase.id, testCase.status === 'failed' ? 'not_run' : 'failed');
                            }}
                            title={testCase.status === 'failed' ? 'Clear Status' : 'Mark as Failed'}
                          >
                            <XCircle size={10} className={testCase.status === 'failed' ? 'text-red-600' : 'text-gray-400'} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTestCase(testCase.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TestTube size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
                  <p className="text-gray-600 mb-4">
                    {filteredTestCases.length !== currentTestCases.length
                      ? 'Try adjusting your filters'
                      : 'Create your first test case for this work item'
                    }
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Test Case
                  </Button>
          </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Work Item</h3>
                <p className="text-gray-600">
                  Choose a work item from the folder structure to view and manage its test cases
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
        
      {/* Create Test Case Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Create New Test Case</DialogTitle>
              <DialogDescription>
              Create a test case for {selectedWorkItem?.title}
              </DialogDescription>
            </DialogHeader>
          <form onSubmit={handleTestCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                  </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter test case title"
                  required
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary *
                </label>
                <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of what this test case verifies"
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
                placeholder="Detailed description of the test case"
                  rows={3}
                  required
                />
              </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Assigned tester"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Time (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 5 })}
                  min="1"
                />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions *
                </label>
                <Textarea
                  value={formData.preconditions}
                  onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
                  placeholder="List preconditions (one per line)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Steps *
                </label>
                <Textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="List test steps (one per line)"
                rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result *
                </label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Describe the expected result"
                  rows={3}
                  required
                />
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
                  </label>
                  <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g., authentication, ui, api)"
              />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                Create Test Case
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Test Case Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
          style={{ 
            width: '90vw', 
            maxWidth: '90vw',
            minWidth: '1200px'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>Test Case Details - {selectedTestCase?.id}</span>
              {selectedTestCase?.createdBy === 'AI Generator' && (
                <div className="flex items-center space-x-1" title="Generated by AI">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm text-purple-600 font-normal">Generated by AI</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              View and edit test case details
            </DialogDescription>
          </DialogHeader>
          {selectedTestCase && (
            <form onSubmit={handleTestCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
          <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter test case title"
                    required
          />
        </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="edge">Edge</SelectItem>
          </SelectContent>
        </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary *
                </label>
                <Input
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary of what this test case verifies"
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
                  placeholder="Detailed description of the test case"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <Input
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Assigned tester"
                  />
            </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 5 })}
                    min="1"
                  />
                    </div>
                  </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions *
                </label>
                <Textarea
                  value={formData.preconditions}
                  onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
                  placeholder="List preconditions (one per line)"
                  rows={3}
                  required
                />
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Steps *
                </label>
                <Textarea
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="List test steps (one per line)"
                  rows={5}
                  required
                />
                  </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result *
                </label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Describe the expected result"
                  rows={3}
                  required
                />
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Comma-separated tags (e.g., authentication, ui, api)"
                />
                  </div>

              {/* Test Case Metadata */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Test Case Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <span className="text-gray-600">Created:</span> {formatDateForDisplay(selectedTestCase.createdAt)}
                    </div>
                  <div>
                    <span className="text-gray-600">Created by:</span> {selectedTestCase.createdBy}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span> 
                    <Badge className={getStatusColor(selectedTestCase.status)} variant="secondary">
                      {selectedTestCase.status.replace('_', ' ')}
                    </Badge>
            </div>
                  {selectedTestCase.lastExecuted && (
            <div>
                      <span className="text-gray-600">Last executed:</span> {formatDateForDisplay(selectedTestCase.lastExecuted)}
            </div>
                  )}
          </div>
                    </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  onClick={() => selectedTestCase && enhanceTestCaseWithAI(selectedTestCase)}
                >
                  <Wand2 size={16} className="mr-2" />
                  Enhance with AI
                </Button>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => { setIsDetailModalOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                    </div>
                  </div>
            </form>
          )}
                 </DialogContent>
       </Dialog>

       {/* Test Case Generation Dialog */}
       <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Generate Test Cases</DialogTitle>
             <DialogDescription>
               Generate test cases for: {selectedWorkItemForGeneration?.title}
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-6">
             {/* Test Type Selection */}
                    <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">
                 Test Type *
               </label>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { value: 'unit', label: 'Unit Tests', desc: 'Test individual components in isolation' },
                   { value: 'integration', label: 'Integration Tests', desc: 'Test component interactions' },
                   { value: 'system', label: 'System Tests', desc: 'Test complete system functionality' },
                   { value: 'acceptance', label: 'Acceptance Tests', desc: 'Test business requirements' },
                   { value: 'performance', label: 'Performance Tests', desc: 'Test speed and scalability' },
                   { value: 'security', label: 'Security Tests', desc: 'Test for vulnerabilities' }
                 ].map((type) => (
                   <div
                     key={type.value}
                     className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                       generateFormData.testType === type.value
                         ? 'border-blue-500 bg-blue-50'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => setGenerateFormData({ ...generateFormData, testType: type.value as any })}
                   >
                     <div className="font-medium text-sm">{type.label}</div>
                     <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                    </div>
                 ))}
                  </div>
            </div>

             {/* Additional Options */}
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="includeNegative"
                   checked={generateFormData.includeNegative}
                   onChange={(e) => setGenerateFormData({ ...generateFormData, includeNegative: e.target.checked })}
                   className="rounded border-gray-300"
                 />
                 <label htmlFor="includeNegative" className="text-sm font-medium text-gray-700">
                   Include negative test cases (error handling)
                 </label>
          </div>

               <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="includeEdge"
                   checked={generateFormData.includeEdge}
                   onChange={(e) => setGenerateFormData({ ...generateFormData, includeEdge: e.target.checked })}
                   className="rounded border-gray-300"
                 />
                 <label htmlFor="includeEdge" className="text-sm font-medium text-gray-700">
                   Include edge cases (boundary conditions)
                 </label>
          </div>
          </div>

             {/* Hierarchy Preview */}
             {selectedWorkItemForGeneration && (
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-medium text-gray-900 mb-2">Context Hierarchy</h4>
                 <div className="text-sm text-gray-600 space-y-1">
                   {(() => {
                     const context = buildHierarchicalContext(
                       selectedWorkItemForGeneration,
                       selectedWorkItemForGeneration.workflowLevel
                     );
                     const hierarchy = [];
                     
                     if (context.businessBrief) hierarchy.push(`📋 Business Brief: ${context.businessBrief.title}`);
                     if (context.initiative) hierarchy.push(`🎯 Initiative: ${context.initiative.title}`);
                     if (context.feature) hierarchy.push(`⚡ Feature: ${context.feature.title}`);
                     if (context.epic) hierarchy.push(`📖 Epic: ${context.epic.title}`);
                     hierarchy.push(`📝 ${context.currentItem.level}: ${context.currentItem.title}`);
                     
                     return hierarchy.map((item, index) => (
                       <div key={index} style={{ marginLeft: `${index * 16}px` }}>
                         {item}
                       </div>
                     ));
                   })()}
                 </div>
        </div>
      )}

             <div className="flex justify-end space-x-2 pt-4">
               <Button 
                 type="button" 
                 variant="outline" 
                 onClick={() => setIsGenerateDialogOpen(false)}
               >
                 Cancel
               </Button>
               <Button 
                 onClick={executeTestCaseGeneration}
                 disabled={!generateFormData.testType}
               >
                 <Wand2 size={16} className="mr-2" />
                 Generate Test Cases
               </Button>
             </div>
           </div>
         </DialogContent>
              </Dialog>
       </div>
    </div>
  );
} 
