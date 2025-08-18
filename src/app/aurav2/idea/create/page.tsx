"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  ArrowLeft, 
  Save, 
  Users, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Target,
  Building,
  Zap,
  TestTube,
  Settings,
  Brain,
  Plus
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';

interface BusinessBriefForm {
  title: string;
  description: string;
  businessOwner: string;
  leadBusinessUnit: string;
  additionalBusinessUnits: string[];
  primaryStrategicTheme: string;
  businessObjective: string;
  quantifiableBusinessOutcomes: string;
  inScope: string;
  outOfScope: string;
  impactOfDoNothing: string;
  happyPath: string;
  exceptions: string;
  impactedEndUsers: string;
  changeImpactExpected: string;
  impactToOtherDepartments: string;
  otherDepartmentsImpacted: string[];
  impactsExistingTechnology: boolean;
  technologySolutions: string;
  relevantBusinessOwners: string;
  otherTechnologyInfo: string;
  supportingDocuments: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  workflowType: 'new_system' | 'enhancement';
}

export default function CreateBusinessBriefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<BusinessBriefForm>({
    title: '',
    description: '',
    businessOwner: '',
    leadBusinessUnit: '',
    additionalBusinessUnits: [],
    primaryStrategicTheme: '',
    businessObjective: '',
    quantifiableBusinessOutcomes: '',
    inScope: '',
    outOfScope: '',
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
    priority: 'medium',
    workflowType: 'new_system'
  });

  // Professional test data sets (Emirates-style)
  const testDataSets = {
    'Customer Portal Enhancement': {
      title: 'Customer Portal Enhancement - Self-Service Capabilities',
      description: 'Enhance the existing customer portal to provide comprehensive self-service capabilities, reducing customer service workload and improving user satisfaction.',
      businessOwner: 'Sarah Johnson',
      leadBusinessUnit: 'Digital Customer Experience',
      additionalBusinessUnits: ['Customer Service', 'IT Operations', 'Marketing'],
      primaryStrategicTheme: 'Digital Transformation & Customer Experience',
      businessObjective: 'Reduce customer service calls by 40% while improving customer satisfaction scores by 25%.',
      quantifiableBusinessOutcomes: '40% reduction in support tickets (10K→6K/month), $2.4M annual savings, NPS increase 7.2→9.0, 95% uptime.',
      inScope: 'Account management, billing inquiries, service requests, document downloads, appointment scheduling, chat support.',
      outOfScope: 'Complex technical support, account setup verification, payment processing changes, third-party integrations.',
      impactOfDoNothing: 'Continued high costs, declining satisfaction, competitive disadvantage, agent burnout, scaling issues.',
      happyPath: 'Login → Find function → Complete task → Receive confirmation → Optional feedback',
      exceptions: 'System downtime, auth failures, incomplete data, payment issues, complex cases requiring human help.',
      impactedEndUsers: 'Primary: 45,000 customers; Secondary: 150 agents, 12 supervisors; Tertiary: 8 IT support staff.',
      changeImpactExpected: 'High - Staff training, new procedures, customer communication, updated docs, modified KPIs.',
      impactToOtherDepartments: 'Customer Service: escalation procedures; Marketing: communication; Finance: billing integration; IT: scaling.',
      otherDepartmentsImpacted: ['Finance', 'Marketing', 'IT Infrastructure', 'Quality Assurance'],
      impactsExistingTechnology: true,
      technologySolutions: 'React/Next.js, Node.js, PostgreSQL, Redis, AWS cloud, Stripe payments.',
      relevantBusinessOwners: 'Mike Chen (VP Customer Experience), Lisa Rodriguez (Head Digital), Tom Wilson (CS Manager)',
      otherTechnologyInfo: 'Salesforce CRM integration, Zendesk, payment gateway APIs, rate limiting, mobile responsive.',
      supportingDocuments: ['Customer Survey 2024', 'Support Ticket Analysis', 'Competitive Analysis', 'Architecture Overview'],
      priority: 'high' as const,
      workflowType: 'enhancement' as const
    },
    'AI Analytics Platform': {
      title: 'AI-Powered Business Intelligence & Analytics Platform',
      description: 'Comprehensive AI-driven analytics platform for real-time insights, predictive analytics, and automated reporting.',
      businessOwner: 'David Park',
      leadBusinessUnit: 'Business Intelligence & Analytics',
      additionalBusinessUnits: ['Data Science', 'IT Architecture', 'Operations'],
      primaryStrategicTheme: 'Data-Driven Decision Making & AI Innovation',
      businessObjective: 'Enable org-wide data-driven decisions, reduce manual reporting 70%, improve forecast accuracy 35%.',
      quantifiableBusinessOutcomes: 'ROI: 250% in 18mo, 70% less manual work (240h/week saved), 35% better forecasts, 15% efficiency gain.',
      inScope: 'Data pipelines, ML models, dashboards, automated reports, predictive analytics, mobile access, training.',
      outOfScope: 'Legacy replacement, external data purchases, AI research projects, custom hardware.',
      impactOfDoNothing: 'Manual processes continue, delayed decisions, missed opportunities, competitive gap, analyst burnout.',
      happyPath: 'Access dashboard → View KPIs → Drill down → Get AI insights → Take action',
      exceptions: 'Data quality issues, model degradation, outages, access problems, prediction errors.',
      impactedEndUsers: 'Primary: 85 analysts; Secondary: 200+ managers/execs; Tertiary: 500+ report users.',
      changeImpactExpected: 'Very High - New processes, analyst retraining, culture change, governance frameworks.',
      impactToOtherDepartments: 'IT: scaling; Finance: budget; HR: training; Operations: processes; Marketing: metrics.',
      otherDepartmentsImpacted: ['Finance', 'Marketing', 'Operations', 'Sales', 'HR', 'IT Infrastructure'],
      impactsExistingTechnology: true,
      technologySolutions: 'Python/TensorFlow, Kafka streaming, Snowflake warehouse, React, Docker/K8s, AWS/Azure.',
      relevantBusinessOwners: 'Jennifer Liu (CDO), Robert Martinez (VP Strategy), Emily Chang (Head Analytics)',
      otherTechnologyInfo: 'ERP/CRM integration, real-time streaming, MLOps pipeline, A/B testing, data governance.',
      supportingDocuments: ['Data Maturity Assessment', 'AI Strategy Roadmap', 'Tech Evaluation', 'ROI Analysis', 'Vendor Matrix'],
      priority: 'critical' as const,
      workflowType: 'new_system' as const
    },
    'Mobile Workforce Solution': {
      title: 'Mobile Workforce Management & Field Service Optimization',
      description: 'Mobile-first workforce management solution to optimize field operations and improve technician productivity.',
      businessOwner: 'Amanda Foster',
      leadBusinessUnit: 'Field Operations',
      additionalBusinessUnits: ['Human Resources', 'Customer Service', 'IT Support'],
      primaryStrategicTheme: 'Operational Excellence & Mobile-First Strategy',
      businessObjective: 'Increase technician productivity 30%, reduce service time 20%, improve first-call resolution to 85%.',
      quantifiableBusinessOutcomes: '30% productivity gain (+2 jobs/day/tech), 20% faster service, 85% resolution rate (up from 65%), $1.8M savings.',
      inScope: 'Mobile app, GPS tracking, scheduling optimization, inventory management, customer communication, offline functionality.',
      outOfScope: 'Vehicle tracking hardware, payroll integration, union negotiations, equipment procurement.',
      impactOfDoNothing: 'Continued inefficiencies, poor customer experience, technician frustration, lost revenue, scaling issues.',
      happyPath: 'Receive assignment → Navigate → Access details → Complete work → Update status → Customer notification',
      exceptions: 'No connectivity, equipment failures, customer unavailable, emergency changes, incomplete job info.',
      impactedEndUsers: 'Primary: 120 technicians; Secondary: 15 dispatchers, 25 supervisors; Tertiary: 8,000+ customers/month.',
      changeImpactExpected: 'Medium-High - Mobile workflows, GPS tracking, scheduling changes, device training.',
      impactToOtherDepartments: 'HR: device policies; Finance: equipment costs; Customer Service: communication; IT: MDM.',
      otherDepartmentsImpacted: ['Human Resources', 'Finance', 'Customer Service', 'Procurement'],
      impactsExistingTechnology: true,
      technologySolutions: 'React Native, Node.js, MongoDB, Google Maps API, Microsoft Intune MDM, Azure cloud.',
      relevantBusinessOwners: 'Carlos Rodriguez (VP Operations), Susan Kim (Director Field), James Murphy (CS Director)',
      otherTechnologyInfo: 'CRM/ERP integration, offline-first architecture, GPS optimization, push notifications, biometric auth.',
      supportingDocuments: ['Field Operations Analysis', 'Mobile Tech Assessment', 'Customer Journey Map', 'ROI Projections'],
      priority: 'high' as const,
      workflowType: 'new_system' as const
    }
  };

  const loadTestData = (dataSetName: keyof typeof testDataSets) => {
    const testData = testDataSets[dataSetName];
    setFormData(testData);
  };

  const handleInputChange = (field: keyof BusinessBriefForm, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'additionalBusinessUnits' | 'otherDepartmentsImpacted' | 'supportingDocuments', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setLoading(true);
    
    try {
      // Create business brief using existing API
      const businessBriefData = {
        ...formData,
        additionalBusinessUnits: formData.additionalBusinessUnits,
        otherDepartmentsImpacted: formData.otherDepartmentsImpacted,
        supportingDocuments: formData.supportingDocuments,
        status: saveAsDraft ? 'draft' : 'submitted',
        submittedBy: 'current_user',
      };

      const response = await fetch('/api/business-briefs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessBriefData),
      });

      const result = await response.json();

      if (result.success) {
        // Create AuraV2 extension
        const extensionData = {
          businessBriefId: result.data.id,
          workflowType: formData.workflowType,
        };

        const extensionResponse = await fetch('/api/aurav2/business-brief/extensions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(extensionData),
        });

        if (extensionResponse.ok) {
          // Initialize workflow progress
          const progressData = {
            action: 'initialize',
            businessBriefId: result.data.id,
            workflowType: formData.workflowType,
            userId: 'current_user'
          };

          await fetch('/api/aurav2/workflow/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(progressData),
          });

          // Automatically run AI quality assessment if not a draft
          if (!saveAsDraft && APP_CONFIG.AI_FEATURES.AUTO_QUALITY_ASSESSMENT) {
            console.log('🤖 Running automatic AI quality assessment...');
            try {
              const aiAssessmentResponse = await fetch('/api/aurav2/ai/assess-quality', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  businessBriefId: result.data.id, 
                  userId: 'current_user' 
                }),
              });

              const aiResult = await aiAssessmentResponse.json();
              if (aiResult.success) {
                console.log('✅ Automatic AI assessment completed');
                
                // Show detailed success notification
                const score = (aiResult.data.summary.score * 100).toFixed(0);
                const level = aiResult.data.summary.level;
                const recommendations = aiResult.data.summary.recommendations || 0;
                const actions = aiResult.data.summary.actions || 0;
                
                alert(`🎉 Business Brief Created Successfully!\n\n` +
                      `🤖 AI Quality Assessment Complete:\n` +
                      `• Score: ${score}% (${level})\n` +
                      `• Recommendations: ${recommendations}\n` +
                      `• Required Actions: ${actions}\n\n` +
                      `${parseInt(score) >= 80 ? '🚀 Excellent quality - ready for qualification stage!' : 
                        parseInt(score) >= 60 ? '✅ Good quality - minor improvements suggested' :
                        '⚠️ Needs improvement - review recommendations'}\n\n` +
                      `View detailed feedback in the Idea stage.`);
              } else {
                console.log('⚠️ AI assessment failed:', aiResult.message);
                alert(`✅ Business Brief Created!\n\n⚠️ AI assessment could not be completed automatically.\nYou can run it manually from the Idea stage.`);
              }
            } catch (aiError) {
              console.log('⚠️ AI assessment failed, continuing with workflow:', aiError);
            }
          }
        }

        // Redirect to idea stage
        router.push(`/aurav2/idea?businessBriefId=${result.data.id}`);
      } else {
        console.error('Failed to create business brief:', result.message);
        alert('Failed to create business brief: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating business brief:', error);
      alert('An error occurred while creating the business brief');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.businessOwner.trim();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Compact Header - Azure DevOps Style */}
      <div className="flex items-center justify-between bg-white border border-gray-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded">
            <Lightbulb size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">New Business Brief</h1>
            <p className="text-sm text-gray-500">{APP_CONFIG.APP_NAME} • Idea Stage</p>
          </div>
          
          {/* Quick Test Data Buttons */}
          <div className="flex items-center space-x-2 ml-8">
            <span className="text-xs text-gray-500">Quick Fill:</span>
            {Object.keys(testDataSets).map((key, index) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => loadTestData(key as keyof typeof testDataSets)}
                className="text-xs px-2 py-1 h-6"
              >
                {['Portal', 'AI Platform', 'Mobile'][index]}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isFormValid ? "default" : "secondary"} className="text-xs">
            {isFormValid ? 'Ready' : 'Incomplete'}
          </Badge>
          <Link href="/aurav2/idea">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} className="mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow Type Selection - Compact */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-blue-600" />
              <CardTitle className="text-sm font-medium">Workflow Type</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">Required</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'new_system', label: 'New System', desc: 'Full discovery & funding' },
              { value: 'enhancement', label: 'Enhancement', desc: 'Existing system improvements' }
            ].map(option => (
              <div 
                key={option.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-gray-500 hover:shadow-md ${
                  formData.workflowType === option.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-400 bg-gray-100'
                }`}
                onClick={() => handleInputChange('workflowType', option.value as any)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    formData.workflowType === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Tabs - Compact Azure Style */}
      <Card className="border border-gray-400 shadow-lg bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="basic" className="text-xs">Basics</TabsTrigger>
              <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
              <TabsTrigger value="scope" className="text-xs">Scope</TabsTrigger>
              <TabsTrigger value="impact" className="text-xs">Impact</TabsTrigger>
              <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="space-y-4">
            
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center space-x-1">
                    <span>Title</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Clear, descriptive title"
                    className="h-8 text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessOwner" className="text-sm font-medium flex items-center space-x-1">
                    <span>Business Owner</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessOwner"
                    value={formData.businessOwner}
                    onChange={(e) => handleInputChange('businessOwner', e.target.value)}
                    placeholder="Owner name"
                    className="h-8 text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center space-x-1">
                  <span>Description</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the business idea or requirement"
                  className="min-h-[80px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadBusinessUnit" className="text-sm font-medium">Lead Business Unit</Label>
                  <Input
                    id="leadBusinessUnit"
                    value={formData.leadBusinessUnit}
                    onChange={(e) => handleInputChange('leadBusinessUnit', e.target.value)}
                    placeholder="Primary business unit"
                    className="h-8 text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                    <SelectTrigger className="h-8 text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm">
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

              <div className="space-y-2">
                <Label htmlFor="additionalBusinessUnits" className="text-sm font-medium">Additional Business Units</Label>
                <Input
                  id="additionalBusinessUnits"
                  value={formData.additionalBusinessUnits.join(', ')}
                  onChange={(e) => handleArrayInputChange('additionalBusinessUnits', e.target.value)}
                  placeholder="Marketing, Finance, IT Operations"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-gray-500">Comma-separated list</p>
              </div>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="space-y-2">
                <Label htmlFor="primaryStrategicTheme" className="text-sm font-medium">Primary Strategic Theme</Label>
                <Input
                  id="primaryStrategicTheme"
                  value={formData.primaryStrategicTheme}
                  onChange={(e) => handleInputChange('primaryStrategicTheme', e.target.value)}
                  placeholder="Strategic alignment theme"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessObjective" className="text-sm font-medium">Business Objective</Label>
                <Textarea
                  id="businessObjective"
                  value={formData.businessObjective}
                  onChange={(e) => handleInputChange('businessObjective', e.target.value)}
                  placeholder="What business objective does this initiative support?"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantifiableBusinessOutcomes" className="text-sm font-medium">Quantifiable Business Outcomes</Label>
                <Textarea
                  id="quantifiableBusinessOutcomes"
                  value={formData.quantifiableBusinessOutcomes}
                  onChange={(e) => handleInputChange('quantifiableBusinessOutcomes', e.target.value)}
                  placeholder="KPIs, ROI targets, cost savings, measurable benefits"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relevantBusinessOwners" className="text-sm font-medium">Relevant Business Owners</Label>
                <Input
                  id="relevantBusinessOwners"
                  value={formData.relevantBusinessOwners}
                  onChange={(e) => handleInputChange('relevantBusinessOwners', e.target.value)}
                  placeholder="Key stakeholders and decision makers"
                  className="h-8 text-sm"
                />
              </div>
            </TabsContent>

            {/* Scope Tab */}
            <TabsContent value="scope" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inScope" className="text-sm font-medium">In Scope</Label>
                  <Textarea
                    id="inScope"
                    value={formData.inScope}
                    onChange={(e) => handleInputChange('inScope', e.target.value)}
                    placeholder="What is included in this initiative?"
                    className="min-h-[80px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outOfScope" className="text-sm font-medium">Out of Scope</Label>
                  <Textarea
                    id="outOfScope"
                    value={formData.outOfScope}
                    onChange={(e) => handleInputChange('outOfScope', e.target.value)}
                    placeholder="What is explicitly excluded?"
                    className="min-h-[80px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="happyPath" className="text-sm font-medium">Happy Path</Label>
                  <Textarea
                    id="happyPath"
                    value={formData.happyPath}
                    onChange={(e) => handleInputChange('happyPath', e.target.value)}
                    placeholder="Ideal user journey or process flow"
                    className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exceptions" className="text-sm font-medium">Exceptions</Label>
                  <Textarea
                    id="exceptions"
                    value={formData.exceptions}
                    onChange={(e) => handleInputChange('exceptions', e.target.value)}
                    placeholder="Error scenarios and edge cases"
                    className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="space-y-2">
                <Label htmlFor="impactOfDoNothing" className="text-sm font-medium">Impact of Do Nothing</Label>
                <Textarea
                  id="impactOfDoNothing"
                  value={formData.impactOfDoNothing}
                  onChange={(e) => handleInputChange('impactOfDoNothing', e.target.value)}
                  placeholder="Consequences if this initiative is not pursued"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactedEndUsers" className="text-sm font-medium">Impacted End Users</Label>
                <Textarea
                  id="impactedEndUsers"
                  value={formData.impactedEndUsers}
                  onChange={(e) => handleInputChange('impactedEndUsers', e.target.value)}
                  placeholder="Who will be affected? Include numbers and roles."
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="changeImpactExpected" className="text-sm font-medium">Change Impact Expected</Label>
                <Textarea
                  id="changeImpactExpected"
                  value={formData.changeImpactExpected}
                  onChange={(e) => handleInputChange('changeImpactExpected', e.target.value)}
                  placeholder="Level and nature of organizational change required"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactToOtherDepartments" className="text-sm font-medium">Impact to Other Departments</Label>
                <Textarea
                  id="impactToOtherDepartments"
                  value={formData.impactToOtherDepartments}
                  onChange={(e) => handleInputChange('impactToOtherDepartments', e.target.value)}
                  placeholder="How will other departments be affected?"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherDepartmentsImpacted" className="text-sm font-medium">Other Departments Impacted</Label>
                <Input
                  id="otherDepartmentsImpacted"
                  value={formData.otherDepartmentsImpacted.join(', ')}
                  onChange={(e) => handleArrayInputChange('otherDepartmentsImpacted', e.target.value)}
                  placeholder="Finance, Marketing, HR, IT Infrastructure"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-gray-500">Comma-separated list</p>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4 mt-0 bg-gray-50 p-3 rounded border border-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="impactsExistingTechnology"
                    checked={formData.impactsExistingTechnology}
                    onChange={(e) => handleInputChange('impactsExistingTechnology', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-200"
                  />
                  <Label htmlFor="impactsExistingTechnology" className="text-sm font-medium">
                    Impacts Existing Technology
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologySolutions" className="text-sm font-medium">Technology Solutions</Label>
                <Textarea
                  id="technologySolutions"
                  value={formData.technologySolutions}
                  onChange={(e) => handleInputChange('technologySolutions', e.target.value)}
                  placeholder="Proposed technology stack, platforms, tools"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherTechnologyInfo" className="text-sm font-medium">Other Technology Information</Label>
                <Textarea
                  id="otherTechnologyInfo"
                  value={formData.otherTechnologyInfo}
                  onChange={(e) => handleInputChange('otherTechnologyInfo', e.target.value)}
                  placeholder="Integration requirements, constraints, dependencies"
                  className="min-h-[60px] text-sm border border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportingDocuments" className="text-sm font-medium">Supporting Documents</Label>
                <Input
                  id="supportingDocuments"
                  value={formData.supportingDocuments.join(', ')}
                  onChange={(e) => handleArrayInputChange('supportingDocuments', e.target.value)}
                  placeholder="Document names separated by commas"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-gray-500">Reference documents, analyses, reports</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Action Bar - Compact Azure DevOps Style */}
      <div className="sticky bottom-0 bg-white border border-gray-500 rounded-lg p-4 shadow-lg border-t-2 border-t-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isFormValid ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Ready for submission</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Complete required fields: Title, Description, Business Owner</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={loading || !formData.title.trim()}
              className="h-8 px-3 text-xs"
            >
              {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
              Save Draft
            </Button>
            
            <Button 
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={loading || !isFormValid}
              className="h-8 px-3 text-xs"
            >
              {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : <CheckCircle size={12} className="mr-1" />}
              Submit Brief
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}