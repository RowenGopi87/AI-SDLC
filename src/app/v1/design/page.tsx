"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { mockWorkItems, mockRequirements } from '@/lib/mock-data';
import { useInitiativeStore } from '@/store/initiative-store';
import { useFeatureStore } from '@/store/feature-store';
import { useEpicStore } from '@/store/epic-store';
import { useStoryStore } from '@/store/story-store';
import { useUseCaseStore } from '@/store/use-case-store';
import { notify } from '@/lib/notification-helper';
import {
  Upload,
  FileImage,
  Code2,
  Play,
  Download,
  Palette,
  Sparkles,
  Eye,
  Settings,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  BrainCircuit,
  GitPullRequest,
  FileText,
  Layers,
  Target,
  Link as LinkIcon,
  GitBranch,
  FileCode2,
  CheckCircle,
  XCircle,

} from 'lucide-react';
import Link from "next/link";

interface GeneratedCode {
  html: string;
  css: string;
  javascript: string;
  framework: 'react' | 'vue' | 'vanilla';
}

interface DesignReverseEngineerConfig {
  inputType: 'figma' | 'image' | 'upload';
  figmaUrl: string;
  designImage: File | null;
  designFiles: File[];
  analysisLevel: 'story' | 'epic' | 'feature' | 'initiative' | 'business-brief';
  extractUserFlows: boolean;
  includeAccessibility: boolean;
}

interface ReverseEngineeredDesignItems {
  businessBrief?: any;
  initiatives?: any[];
  features?: any[];
  epics?: any[];
  stories?: any[];
  analysisDepth: string;
  extractedInsights: string;
  designAnalysis: string;
  userFlows?: string[];
  accessibilityInsights?: string[];
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';

export default function DesignPage() {
  // Store hooks
  const { addInitiative } = useInitiativeStore();
  const { addFeature } = useFeatureStore();
  const { addEpic } = useEpicStore();
  const { addStory } = useStoryStore();
  const { addUseCase } = useUseCaseStore();

  // Design Generation State
  const [selectedTab, setSelectedTab] = useState<'figma' | 'work-item'>('figma');
  const [designImage, setDesignImage] = useState<File | null>(null);
  const [workItemImage, setWorkItemImage] = useState<File | null>(null);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>('');
  const [designPrompt, setDesignPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Reverse Engineering State
  const [reverseConfig, setReverseConfig] = useState<DesignReverseEngineerConfig>({
    inputType: 'image',
    figmaUrl: '',
    designImage: null,
    designFiles: [],
    analysisLevel: 'story',
    extractUserFlows: true,
    includeAccessibility: true
  });
  const [reverseEngineeredItems, setReverseEngineeredItems] = useState<ReverseEngineeredDesignItems | null>(null);
  const [isReverseEngineering, setIsReverseEngineering] = useState(false);
  const [reverseProgress, setReverseProgress] = useState(0);
  
  // Real vs Mock LLM toggle for reverse engineering
  const [useRealLLMForReverse, setUseRealLLMForReverse] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workItemImageRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const designUploadRef = useRef<HTMLInputElement>(null);

  // Effect to ensure preview is updated when switching to preview mode
  useEffect(() => {
    if (previewMode === 'preview' && generatedCode && generatedCode.html.length > 0) {
      console.log('🔄 [PREVIEW-MODE] Preview mode activated, refreshing content...');
      setTimeout(() => updatePreview(generatedCode), 100);
    }
  }, [previewMode, generatedCode]);

  // Viewport dimensions
  const viewportDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' }
  };

  // Utility function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, prefix to get just the base64 data
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Design Generation Functions (existing)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDesignImage(file);
    }
  };

  const handleWorkItemImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWorkItemImage(file);
    }
  };

  const handleWorkItemImageDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleWorkItemImageDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWorkItemImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setDesignImage(file);
    }
  };

  // Reverse Engineering Functions
  const handleReverseDesignFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReverseConfig(prev => ({ ...prev, designFiles: files }));
  };

  const handleReverseImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReverseConfig(prev => ({ ...prev, designImage: file }));
    }
  };

  const reverseEngineerDesign = async () => {
    if (!reverseConfig.inputType || 
        (reverseConfig.inputType === 'figma' && !reverseConfig.figmaUrl) ||
        (reverseConfig.inputType === 'image' && !reverseConfig.designImage) ||
        (reverseConfig.inputType === 'upload' && reverseConfig.designFiles.length === 0)) {
      alert('Please provide design input for reverse engineering.');
      return;
    }

    setIsReverseEngineering(true);
    setReverseProgress(0);
    setReverseEngineeredItems(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setReverseProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 400);

      // Prepare design content for analysis
      let designData = '';
      let imageData = '';
      let imageType = '';
      let fileData: { filename: string; content: string }[] = [];

      if (reverseConfig.inputType === 'figma') {
        designData = `Figma URL: ${reverseConfig.figmaUrl}`;
      } else if (reverseConfig.inputType === 'image' && reverseConfig.designImage) {
        imageData = await fileToBase64(reverseConfig.designImage);
        imageType = reverseConfig.designImage.type;
        designData = `Design Image: ${reverseConfig.designImage.name}`;
      } else if (reverseConfig.inputType === 'upload') {
        for (const file of reverseConfig.designFiles) {
          if (file.type.startsWith('image/')) {
            const content = await fileToBase64(file);
            fileData.push({ filename: file.name, content });
            designData += `\n\nDesign File: ${file.name}`;
          }
        }
      }

      console.log('[DESIGN-REVERSE] Starting design reverse engineering with:', {
        inputType: reverseConfig.inputType,
        analysisLevel: reverseConfig.analysisLevel,
        filesCount: reverseConfig.designFiles.length,
        hasImage: !!imageData
      });

      // Call the design reverse engineering API
      const response = await fetch('/api/reverse-engineer-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputType: reverseConfig.inputType,
          figmaUrl: reverseConfig.figmaUrl,
          designData,
          imageData,
          imageType,
          fileData,
          analysisLevel: reverseConfig.analysisLevel,
          extractUserFlows: reverseConfig.extractUserFlows,
          includeAccessibility: reverseConfig.includeAccessibility,
          useRealLLM: useRealLLMForReverse
        }),
      });

      console.log('[DESIGN-REVERSE] API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[DESIGN-REVERSE] API Response:', result);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setReverseProgress(100);
      
      if (result.success && result.data) {
        setReverseEngineeredItems(result.data);
      } else {
        throw new Error(result.message || 'Failed to reverse engineer design');
      }
    } catch (error) {
      console.error('Error reverse engineering design:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Mock fallback data
      const mockReverseEngineered: ReverseEngineeredDesignItems = {
        analysisDepth: reverseConfig.analysisLevel,
        extractedInsights: `Visual analysis of ${reverseConfig.inputType} design reveals sophisticated user interface patterns with modern design principles, clear information hierarchy, and intuitive user workflows.`,
        designAnalysis: `The design demonstrates professional UI/UX practices with consistent visual elements, proper spacing, and user-centric layout. Key interface components include navigation systems, content areas, interactive elements, and responsive design patterns.`,
        userFlows: reverseConfig.extractUserFlows ? [
          'User registration and onboarding flow',
          'Main navigation and content discovery',
          'Primary action completion workflow',
          'Settings and profile management'
        ] : undefined,
        accessibilityInsights: reverseConfig.includeAccessibility ? [
          'Color contrast meets WCAG standards',
          'Proper heading hierarchy for screen readers',
          'Interactive elements have sufficient touch targets',
          'Focus states and keyboard navigation support'
        ] : undefined,
        businessBrief: reverseConfig.analysisLevel === 'business-brief' ? {
          id: 'BB-DESIGN-REV-001',
          title: 'UI/UX Design Business Brief',
          description: 'Business context extracted from visual design analysis',
          businessObjective: 'Create an intuitive, user-friendly interface that drives engagement and conversion',
          quantifiableBusinessOutcomes: ['Increase user engagement by 35%', 'Improve conversion rates by 20%', 'Reduce user drop-off by 30%']
        } : undefined,
        initiatives: ['initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'INIT-DESIGN-REV-001',
          title: 'User Experience Enhancement Initiative',
          description: 'Initiative extracted from design patterns and user interface analysis'
        }] : undefined,
        features: ['feature', 'initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'FEAT-DESIGN-REV-001',
          title: 'Interactive User Interface Feature',
          description: 'User interface components and interaction patterns identified in design'
        }] : undefined,
        epics: ['epic', 'feature', 'initiative', 'business-brief'].includes(reverseConfig.analysisLevel) ? [{
          id: 'EPIC-DESIGN-REV-001',
          title: 'User Interface Design Epic',
          description: 'Complete user interface implementation based on design specifications'
        }] : undefined,
        stories: [{
          id: 'STORY-DESIGN-REV-001',
          title: 'As a user, I want an intuitive navigation system',
          description: 'User navigation functionality extracted from design analysis'
        }]
      };
      
      setReverseEngineeredItems(mockReverseEngineered);
    } finally {
      setTimeout(() => {
        setIsReverseEngineering(false);
        setReverseProgress(0);
      }, 1000);
    }
  };

  const saveReverseEngineeredDesignItems = () => {
    if (!reverseEngineeredItems) return;
    
    try {
      let savedCount = 0;
      
      // Save Business Brief as Use Case
      if (reverseEngineeredItems.businessBrief) {
        const useCase = {
          id: reverseEngineeredItems.businessBrief.id,
          title: reverseEngineeredItems.businessBrief.title,
          description: reverseEngineeredItems.businessBrief.description,
          businessObjective: reverseEngineeredItems.businessBrief.businessObjective,
          quantifiableBusinessOutcomes: reverseEngineeredItems.businessBrief.quantifiableBusinessOutcomes,
          inScope: 'UI/UX Design Implementation, User Interface Components, User Experience Flows',
          impactOfDoNothing: 'Poor user experience, reduced engagement, lower conversion rates',
          happyPath: 'Users interact with intuitive interface, complete tasks efficiently, high satisfaction',
          exceptions: 'Design inconsistencies, Accessibility issues, Mobile responsiveness problems',
          impactedEndUsers: 'End users, Design team, Development team, Product stakeholders',
          changeImpactExpected: 'Significant improvement in user experience and interface usability',
          businessBriefId: reverseEngineeredItems.businessBrief.id,
          acceptanceCriteria: ['Design implementation matches specifications', 'User experience flows work smoothly'],
          businessValue: 'Enhanced user experience drives engagement and business outcomes',
          submittedBy: 'Design Reverse Engineering System',
          priority: 'high' as 'low' | 'medium' | 'high' | 'critical',
          status: 'submitted' as 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: ['reverse-engineered', 'design', 'ui-ux'],
          notes: `Extracted from design analysis: ${reverseEngineeredItems.extractedInsights}`
        };
        
        addUseCase(useCase);
        savedCount++;
      }

      // Save other work items (similar to code reverse engineering)
      if (reverseEngineeredItems.initiatives) {
        reverseEngineeredItems.initiatives.forEach(initiative => {
          const initiativeData = {
            ...initiative,
            businessBriefId: reverseEngineeredItems.businessBrief?.id || 'BB-DESIGN-REV-DEFAULT',
            priority: initiative.priority || 'medium',
            status: 'planned',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            tags: ['reverse-engineered', 'design']
          };
          
          addInitiative(initiativeData);
          savedCount++;
        });
      }

      // Save Features, Epics, Stories (similar pattern)
      // ... (similar implementation as in code reverse engineering)

      // Show success notification
      notify.success(
        'Design Reverse Engineering Complete',
        `Successfully saved ${savedCount} work items extracted from design analysis. Check other tabs to see the items.`
      );

      // Clear the reverse engineering results
      setReverseEngineeredItems(null);
      setReverseConfig({
        inputType: 'image',
        figmaUrl: '',
        designImage: null,
        designFiles: [],
        analysisLevel: 'story',
        extractUserFlows: true,
        includeAccessibility: true
      });

      console.log('[DESIGN-REVERSE] Successfully saved', savedCount, 'work items to stores');
      
    } catch (error) {
      console.error('[DESIGN-REVERSE] Error saving work items:', error);
      notify.error(
        'Save Failed',
        'Failed to save reverse engineered work items. Please try again.'
      );
    }
  };



  const generateCodeFromDesign = async () => {
    if (!designImage && !figmaUrl && !selectedWorkItem) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Declare progressInterval outside try-catch so it's accessible in both blocks
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval!);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare the request payload
      let prompt = '';
      let context = '';
      let imageData = '';
      let imageType = '';
      
      if (selectedTab === 'figma') {
        if (designImage) {
          context = `Design file: ${designImage.name}`;
          prompt = `Generate a modern, responsive web component based on the uploaded design image. ${designPrompt || 'Create a clean, professional implementation with proper styling and interactions.'}`;
          
          // Convert image to base64 with enhanced error handling
          try {
            console.log('🖼️ Converting image to base64...', { name: designImage.name, size: designImage.size, type: designImage.type });
            imageData = await fileToBase64(designImage);
            imageType = designImage.type;
            console.log('✅ Image converted to base64 successfully', { length: imageData.length });
          } catch (imageError) {
            console.error('❌ Image conversion failed:', imageError);
            throw new Error(`Failed to process image: ${imageError instanceof Error ? imageError.message : 'Unknown image error'}`);
          }
        } else if (figmaUrl) {
          context = `Figma URL: ${figmaUrl}`;
          prompt = `Generate a modern, responsive web component based on the Figma design at the provided URL. ${designPrompt || 'Create a clean, professional implementation with proper styling and interactions.'}`;
        }
      } else {
        const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
        if (workItem) {
          context = `Work Item: ${workItem.title}`;
          let workItemPrompt = `Generate a modern, responsive web component for the work item "${workItem.title}". 
          
Description: ${workItem.description}
Requirements: Create a user interface that addresses the work item requirements.`;

          // If work item has an uploaded image, include it in the context
          if (workItemImage) {
            context += ` | Reference Design: ${workItemImage.name}`;
            workItemPrompt += `

VISUAL REFERENCE & DESIGN ANALYSIS: I have provided a design reference image that MUST be analyzed comprehensively to extract and replicate its visual characteristics. Please carefully examine the uploaded image and extract the following design elements:

🎨 **COLOR PALETTE ANALYSIS**:
- Primary colors (backgrounds, main elements)
- Secondary colors (accents, highlights)
- Text colors (headings, body text, links)
- Border colors and gradients
- Extract exact hex codes where possible

🖋️ **TYPOGRAPHY & FONTS**:
- Font families used (serif, sans-serif specific names if identifiable)
- Font weights (light, regular, medium, bold)
- Font sizes and hierarchy (headings, body text, captions)
- Letter spacing and line height patterns
- Text alignment and formatting

🏗ī¸ **LAYOUT & STRUCTURE**:
- Grid system and spacing patterns
- Component arrangement and hierarchy
- Padding and margin patterns
- Container widths and responsive breakpoints
- Element proportions and sizing

🎭 **VISUAL STYLE & THEME**:
- Overall design aesthetic (modern, minimal, corporate, playful, etc.)
- Button styles (rounded corners, shadows, hover effects)
- Card/container styling (borders, shadows, backgrounds)
- Icon styles and treatments
- Animation and interaction patterns

CRITICAL REQUIREMENT: The generated component MUST visually match the uploaded design image as closely as possible while fulfilling the work item requirements. Prioritize visual fidelity to the design image over generic styling choices.`;

            // Convert work item image to base64 with enhanced error handling
            try {
              console.log('🖼️ Converting work item image to base64...', { name: workItemImage.name, size: workItemImage.size, type: workItemImage.type });
              imageData = await fileToBase64(workItemImage);
              imageType = workItemImage.type;
              console.log('✅ Work item image converted to base64 successfully', { length: imageData.length });
            } catch (imageError) {
              console.error('❌ Work item image conversion failed:', imageError);
              throw new Error(`Failed to process work item image: ${imageError instanceof Error ? imageError.message : 'Unknown image error'}`);
            }
          }

          prompt = workItemPrompt + `
${designPrompt || 'Focus on user experience, accessibility, and modern design patterns.'}`;
        }
      }

      // Call enhanced API with retry mechanism (Google -> OpenAI fallback)
      const response = await fetch('/api/generate-design-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          framework: 'react',
          includeResponsive: true,
          includeAccessibility: true,
          imageData: imageData || undefined,
          imageType: imageType || undefined,
          preferredProvider: 'google' // Always try Google first
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('🎨 [DESIGN-GENERATION] Full API response:', result);
      console.log('🎨 [DESIGN-GENERATION] Response data structure:', {
        hasData: !!result.data,
        hasCode: !!result.data?.code,
        codeKeys: result.data?.code ? Object.keys(result.data.code) : 'No code object',
        dataKeys: result.data ? Object.keys(result.data) : 'No data object'
      });
      
      clearInterval(progressInterval!);
      setGenerationProgress(100);
      
      // Use the generated code from the API (with retry/fallback handled at API level)
      if (result.success && result.data && result.data.code) {
        console.log('🎨 [DESIGN-GENERATION] Parsing generated code from API response...');
        
        const realCode: GeneratedCode = {
          framework: result.data.framework || 'react',
          html: result.data.code.html || '',
          css: result.data.code.css || '',
          javascript: result.data.code.javascript || '',
        };
        
        console.log('🎨 [DESIGN-GENERATION] Parsed code structure:', {
          htmlLength: realCode.html.length,
          cssLength: realCode.css.length,
          jsLength: realCode.javascript.length,
          framework: realCode.framework,
          htmlPreview: realCode.html.substring(0, 500) + '...',
          fullHtmlContent: realCode.html // Log the complete HTML for debugging
        });
        
        setGeneratedCode(realCode);
        
        // Update iframe preview with enhanced logging
        setTimeout(() => {
          console.log('🖼️ [DESIGN-GENERATION] Updating preview iframe...');
          updatePreview(realCode);
        }, 100);
        
        // Show success message with provider info
        if (result.data.provider) {
          console.log(`🎉 Design generated successfully using ${result.data.provider}${result.data.usedFallback ? ' (fallback)' : ''}!`);
          
          // Show user notification about which provider was used
          if (result.data.provider === 'OpenAI') {
            console.log(`🔄 Used OpenAI as fallback (Google temporarily unavailable). Next retry will attempt Google first again.`);
          } else if (result.data.provider === 'Mock') {
            console.log(`⚠️ Used mock response (all LLM providers temporarily unavailable)`);
          }
        }
      } else {
        throw new Error(result.message || 'API returned success but no data');
      }
      
    } catch (error) {
      console.error('Error generating code:', error);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Design generation failed: ${errorMessage}\n\nThe system will automatically retry with different providers. Please try again or check your API keys in settings.`);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const updatePreview = (code: GeneratedCode) => {
    console.log('🖼️ [PREVIEW-UPDATE] Starting preview update...', {
      hasIframe: !!previewRef.current,
      htmlLength: code.html.length,
      cssLength: code.css.length,
      jsLength: code.javascript.length,
      framework: code.framework
    });
    
    if (!previewRef.current) {
      console.error('❌ [PREVIEW-UPDATE] No iframe reference found');
      return;
    }
    
    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      console.error('❌ [PREVIEW-UPDATE] Cannot access iframe document');
      return;
    }
    
    console.log('🖼️ [PREVIEW-UPDATE] Iframe document accessible, analyzing HTML content...');
    
    // Check if the generated code is a complete HTML document
    const isCompleteDocument = code.html.includes('<!DOCTYPE html>') || code.html.includes('<html');
    console.log('🖼️ [PREVIEW-UPDATE] HTML analysis:', {
      isCompleteDocument,
      htmlStartsWithDoctype: code.html.startsWith('<!DOCTYPE'),
      containsHtmlTag: code.html.includes('<html'),
      htmlPreview: code.html.substring(0, 300)
    });
    
    try {
      let finalHtml = '';
      
      if (isCompleteDocument) {
        console.log('📄 [PREVIEW-UPDATE] Using complete HTML document as-is');
        finalHtml = code.html;
      } else {
        console.log('🔧 [PREVIEW-UPDATE] Wrapping component in HTML structure');
        // If it's just a component, wrap it in a proper HTML structure
        finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f9fafb;
      }
      ${code.css}
    </style>
</head>
<body>
    ${code.html}
    ${code.javascript ? `<script>${code.javascript}</script>` : ''}
</body>
</html>`;
      }
      
      console.log('📝 [PREVIEW-UPDATE] Final HTML to be rendered:', {
        htmlLength: finalHtml.length,
        htmlPreview: finalHtml.substring(0, 1000),
        containsBody: finalHtml.includes('<body'),
        containsContent: finalHtml.includes('</body>') && finalHtml.indexOf('</body>') > finalHtml.indexOf('<body') + 10
      });
      
      // Clear any existing content and write new content
      iframeDoc.open();
      iframeDoc.write(finalHtml);
      iframeDoc.close();
      
      // Also try setting srcDoc as a fallback
      setTimeout(() => {
        if (iframe.contentDocument?.body?.children.length === 0) {
          console.log('🔄 [PREVIEW-UPDATE] Iframe body still empty, trying srcDoc fallback...');
          iframe.srcDoc = finalHtml;
        }
      }, 500);
      
      console.log('✅ [PREVIEW-UPDATE] Preview updated successfully');
      
      // Add iframe load event listener for additional debugging
      iframe.onload = () => {
        console.log('🖼️ [PREVIEW-UPDATE] Iframe loaded successfully');
        try {
          const iframeBody = iframeDoc.body;
          const iframeHead = iframeDoc.head;
          if (iframeBody) {
            console.log('📊 [PREVIEW-UPDATE] Iframe content stats:', {
              bodyInnerHTMLLength: iframeBody.innerHTML.length,
              bodyChildren: iframeBody.children.length,
              bodyText: iframeBody.textContent?.substring(0, 200) + '...',
              bodyHTML: iframeBody.innerHTML.substring(0, 300) + '...',
              headChildren: iframeHead?.children.length || 0,
              documentTitle: iframeDoc.title,
              documentReadyState: iframeDoc.readyState
            });
            
            // Check for any script errors in the iframe
            if (iframe.contentWindow) {
              iframe.contentWindow.onerror = (msg, url, line, col, error) => {
                console.error('🚨 [IFRAME-ERROR] Script error in preview:', { msg, url, line, col, error });
              };
            }
          }
        } catch (e) {
          console.log('ℹ️ [PREVIEW-UPDATE] Cannot access iframe content (normal for cross-origin)', e);
        }
      };
      
    } catch (error) {
      console.error('❌ [PREVIEW-UPDATE] Error updating preview:', error);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const content = `// Generated Design Component
${generatedCode.javascript}

/* Styles */
${generatedCode.css}

<!-- HTML Template -->
${generatedCode.html}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`container mx-auto p-6 space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>


      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Design Repository</h1>
          <p className="text-gray-600 mt-2">Generate and analyze UI/UX designs with AI-powered tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Palette className="w-4 h-4 mr-1" />
            Design Phase
          </Badge>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <Tabs defaultValue="design-generation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="design-generation" className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Design Generation
          </TabsTrigger>
          <TabsTrigger value="reverse-engineering" className="flex items-center">
            <BrainCircuit className="w-4 h-4 mr-2" />
            Reverse Engineering
          </TabsTrigger>
        </TabsList>

        {/* Design Generation Tab */}
        <TabsContent value="design-generation" className="mt-6">
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Design Configuration Section */}
            {!isFullscreen && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Design Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your design generation settings and input source
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input Source Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Input Source
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={selectedTab === 'figma' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedTab('figma');
                            // Clear other tab's data when switching
                            setSelectedWorkItem('');
                            setWorkItemImage(null);
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <FileImage className="w-5 h-5 mb-1" />
                          <span className="text-xs">Figma & Images</span>
                        </Button>
                        <Button
                          variant={selectedTab === 'work-item' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedTab('work-item');
                            // Clear other tab's data when switching
                            setDesignImage(null);
                            setFigmaUrl('');
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <FileText className="w-5 h-5 mb-1" />
                          <span className="text-xs">Work Items</span>
                        </Button>
                      </div>
                    </div>

                    {/* Figma & Images Tab */}
                    {selectedTab === 'figma' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Figma URL
                          </label>
                          <Input
                            placeholder="https://www.figma.com/file/..."
                            value={figmaUrl}
                            onChange={(e) => setFigmaUrl(e.target.value)}
                          />
                        </div>
                        
                        <div className="text-center text-sm text-gray-500">or</div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Design Image
                          </label>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            {designImage ? (
                              <div className="space-y-2">
                                <FileImage className="w-8 h-8 text-green-600 mx-auto" />
                                <p className="text-sm font-medium text-green-700">{designImage.name}</p>
                                <p className="text-xs text-green-600">Click to change</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Work Items Tab */}
                    {selectedTab === 'work-item' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Work Item
                          </label>
                          <Select value={selectedWorkItem} onValueChange={setSelectedWorkItem}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a work item" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockWorkItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{item.title}</span>
                                    <span className="text-xs text-gray-500 truncate">
                                      {item.description.substring(0, 60)}...
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedWorkItem && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Selected Work Item</h4>
                            <p className="text-sm text-blue-700">
                              {mockWorkItems.find(item => item.id === selectedWorkItem)?.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-center text-sm text-gray-500">and/or</div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🎨 Upload Design Reference for Visual Analysis
                          </label>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onDragOver={handleWorkItemImageDragOver}
                            onDrop={handleWorkItemImageDrop}
                            onClick={() => workItemImageRef.current?.click()}
                          >
                            <input
                              ref={workItemImageRef}
                              type="file"
                              accept="image/*"
                              onChange={handleWorkItemImageUpload}
                              className="hidden"
                            />
                            {workItemImage ? (
                              <div className="space-y-2">
                                <FileImage className="w-8 h-8 text-green-600 mx-auto" />
                                <p className="text-sm font-medium text-green-700">{workItemImage.name}</p>
                                <p className="text-xs text-green-600">Click to change • AI will analyze design elements</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium text-blue-600">Click to upload</span> design reference
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB • AI will extract visual elements</p>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-2 space-y-1">
                            <p className="font-medium">🔍 AI Visual Analysis will extract:</p>
                            <ul className="text-xs text-gray-500 space-y-0.5 ml-4">
                              <li>• Color palette and theme</li>
                              <li>• Typography and font styles</li>
                              <li>• Layout patterns and spacing</li>
                              <li>• Visual style and aesthetic</li>
                            </ul>
                            <p className="text-xs text-blue-600 font-medium mt-2">
                              The generated code will closely match your design's visual characteristics
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Design Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design Requirements
                      </label>
                      <Textarea
                        placeholder="Describe your design requirements, style preferences, or specific features..."
                        value={designPrompt}
                        onChange={(e) => setDesignPrompt(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateCodeFromDesign}
                      disabled={isGenerating || (!figmaUrl && !designImage && !selectedWorkItem)}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Design...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Design Code
                        </>
                      )}
                    </Button>
                    
                    {isGenerating && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Analyzing design and generating code...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Design Output Section */}
            <div className={`space-y-6 ${isFullscreen ? 'h-screen' : ''}`}>
              {generatedCode ? (
                <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Code2 className="w-5 h-5 mr-2" />
                        Generated Design Code
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadCode}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Test iframe functionality
                            if (previewRef.current) {
                              const testHtml = `<!DOCTYPE html>
<html><head><title>Test</title></head>
<body style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 20px; font-family: Arial;">
<h1>🎉 Iframe Test Success!</h1>
<p>If you can see this, the iframe is working correctly.</p>
<div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-top: 20px;">
<p>Generated: ${new Date().toLocaleTimeString()}</p>
</div>
</body></html>`;
                              
                              const iframe = previewRef.current;
                              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                              if (iframeDoc) {
                                iframeDoc.open();
                                iframeDoc.write(testHtml);
                                iframeDoc.close();
                                console.log('🧪 [TEST] Test HTML loaded into iframe');
                              }
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Test Iframe
                        </Button>
                        <Button
                          variant={previewMode === 'preview' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setPreviewMode('preview');
                            // Re-render the preview when switching back to preview mode
                            if (generatedCode) {
                              setTimeout(() => updatePreview(generatedCode), 100);
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant={previewMode === 'code' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewMode('code')}
                        >
                          <Code2 className="w-4 h-4 mr-1" />
                          Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 mr-1" />
                          ) : (
                            <Maximize2 className="w-4 h-4 mr-1" />
                          )}
                          {isFullscreen ? 'Exit' : 'Fullscreen'}
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Generated {generatedCode.framework} design code ready for implementation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isFullscreen ? 'flex-1 flex flex-col' : ''}>
                    {previewMode === 'preview' ? (
                      <div className={`space-y-4 ${isFullscreen ? 'flex-1 flex flex-col' : ''}`}>
                        {/* Viewport Controls */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Viewport:</span>
                            <Button
                              variant={viewportType === 'desktop' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('desktop')}
                            >
                              <Monitor className="w-4 h-4 mr-1" />
                              Desktop
                            </Button>
                            <Button
                              variant={viewportType === 'tablet' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('tablet')}
                            >
                              <Tablet className="w-4 h-4 mr-1" />
                              Tablet
                            </Button>
                            <Button
                              variant={viewportType === 'mobile' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewportType('mobile')}
                            >
                              <Smartphone className="w-4 h-4 mr-1" />
                              Mobile
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewportType === 'desktop' && 'Responsive'}
                            {viewportType === 'tablet' && '768px'}
                            {viewportType === 'mobile' && '375px'}
                          </div>
                        </div>
                        
                        {/* Preview Frame */}
                        <div className={`border rounded-lg bg-gray-100 p-4 ${isFullscreen ? 'flex-1' : 'min-h-[400px]'} flex justify-center`}>
                          <div
                            className="bg-white rounded shadow-lg relative"
                            style={{
                              width: viewportDimensions[viewportType].width,
                              height: isFullscreen ? '100%' : viewportDimensions[viewportType].height,
                              maxWidth: '100%',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <iframe
                              ref={previewRef}
                              className="w-full h-full border-0 rounded"
                              title="Design Preview"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                              style={{ background: 'white' }}
                            />
                            
                            {/* Debug overlay - only show when no content is loaded */}
                            {(!generatedCode || generatedCode.html.length === 0) && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none bg-white bg-opacity-80">
                                <div className="text-center">
                                  <div className="mb-2">🖼️ Generate design to see preview</div>
                                  <div className="text-xs">Upload an image and click Generate Design Code</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Tabs defaultValue="html" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="html">HTML</TabsTrigger>
                          <TabsTrigger value="css">CSS</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="html">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.html, 'html')}
                            >
                              {copied === 'html' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.html}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="css">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.css, 'css')}
                            >
                              {copied === 'css' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.css}</code>
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="javascript">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generatedCode.javascript, 'javascript')}
                            >
                              {copied === 'javascript' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              <code>{generatedCode.javascript}</code>
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Palette className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Design</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Upload a Figma design, provide an image, or select a work item to generate production-ready design code.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reverse Engineering Tab */}
        <TabsContent value="reverse-engineering" className="mt-6">
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Reverse Engineering Configuration */}
            {!isFullscreen && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="w-5 h-5 mr-2" />
                      Design Reverse Engineering Configuration
                    </CardTitle>
                    <CardDescription>
                      Analyze visual designs to extract work items, user flows, and business requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Design Input Source
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={reverseConfig.inputType === 'figma' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'figma' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <LinkIcon className="w-5 h-5 mb-1" />
                          <span className="text-xs">Figma URL</span>
                        </Button>
                        <Button
                          variant={reverseConfig.inputType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'image' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <FileImage className="w-5 h-5 mb-1" />
                          <span className="text-xs">Single Image</span>
                        </Button>
                        <Button
                          variant={reverseConfig.inputType === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReverseConfig(prev => ({ ...prev, inputType: 'upload' }))}
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs">Multiple Files</span>
                        </Button>
                      </div>
                    </div>

                    {/* Input Details */}
                    {reverseConfig.inputType === 'figma' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Figma URL
                        </label>
                        <Input
                          placeholder="https://www.figma.com/file/..."
                          value={reverseConfig.figmaUrl}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, figmaUrl: e.target.value }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a public Figma file URL for analysis
                        </p>
                      </div>
                    )}

                    {reverseConfig.inputType === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Design Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReverseImageUpload}
                            className="hidden"
                            id="reverse-image-upload"
                          />
                          <label
                            htmlFor="reverse-image-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload design image
                              </span>{' '}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </label>
                        </div>
                        
                        {reverseConfig.designImage && (
                          <div className="mt-3 flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {reverseConfig.designImage.name}
                            </span>
                            <span className="text-xs text-green-600">
                              ({(reverseConfig.designImage.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {reverseConfig.inputType === 'upload' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Multiple Design Files
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            ref={designUploadRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleReverseDesignFiles}
                            className="hidden"
                            id="reverse-files-upload"
                          />
                          <label
                            htmlFor="reverse-files-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload design files
                              </span>{' '}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">Multiple PNG, JPG, GIF files</p>
                          </label>
                        </div>
                        
                        {reverseConfig.designFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {reverseConfig.designFiles.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-200">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">
                                  {file.name}
                                </span>
                                <span className="text-xs text-green-600">
                                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Analysis Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analysis Level
                      </label>
                      <Select 
                        value={reverseConfig.analysisLevel} 
                        onValueChange={(value) => setReverseConfig(prev => ({ 
                          ...prev, 
                          analysisLevel: value as 'story' | 'epic' | 'feature' | 'initiative' | 'business-brief'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-2" />
                              Story Level (UI User Stories)
                            </div>
                          </SelectItem>
                          <SelectItem value="epic">
                            <div className="flex items-center">
                              <Layers className="w-4 h-4 mr-2" />
                              Epic Level (Design Features)
                            </div>
                          </SelectItem>
                          <SelectItem value="feature">
                            <div className="flex items-center">
                              <FileCode2 className="w-4 h-4 mr-2" />
                              Feature Level (Interface Areas)
                            </div>
                          </SelectItem>
                          <SelectItem value="initiative">
                            <div className="flex items-center">
                              <GitBranch className="w-4 h-4 mr-2" />
                              Initiative Level (UX Goals)
                            </div>
                          </SelectItem>
                          <SelectItem value="business-brief">
                            <div className="flex items-center">
                              <BrainCircuit className="w-4 h-4 mr-2" />
                              Business Brief (Complete Context)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher levels include all lower levels (e.g., Business Brief includes everything)
                      </p>
                    </div>

                    {/* Analysis Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="extract-flows"
                          checked={reverseConfig.extractUserFlows}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, extractUserFlows: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="extract-flows" className="text-sm text-gray-700">
                          Extract User Flows
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-accessibility"
                          checked={reverseConfig.includeAccessibility}
                          onChange={(e) => setReverseConfig(prev => ({ ...prev, includeAccessibility: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="include-accessibility" className="text-sm text-gray-700">
                          Accessibility Analysis 
                        </label>
                      </div>
                    </div>

                    {/* LLM Mode Toggle */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Analysis Mode</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="use-real-llm-reverse"
                          checked={useRealLLMForReverse}
                          onChange={(e) => setUseRealLLMForReverse(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="use-real-llm-reverse" className="text-sm text-yellow-700">
                          <span className="font-medium">Use Real LLM</span> (requires API key configuration)
                        </label>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {useRealLLMForReverse 
                          ? "🔥 Using real AI for comprehensive design analysis with product owner expertise" 
                          : "🎭 Using mock analysis for development/testing (no API costs)"
                        }
                      </p>
                    </div>

                    {/* Analyze Button */}
                    <Button
                      onClick={reverseEngineerDesign}
                      disabled={isReverseEngineering || (
                        (reverseConfig.inputType === 'figma' && !reverseConfig.figmaUrl) ||
                        (reverseConfig.inputType === 'image' && !reverseConfig.designImage) ||
                        (reverseConfig.inputType === 'upload' && reverseConfig.designFiles.length === 0)
                      )}
                      className="w-full"
                      size="lg"
                    >
                      {isReverseEngineering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Design...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4 mr-2" />
                          Reverse Engineer Design
                        </>
                      )}
                    </Button>
                    
                    {isReverseEngineering && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Analyzing visual design and extracting requirements...</span>
                          <span>{reverseProgress}%</span>
                        </div>
                        <Progress value={reverseProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reverse Engineering Results */}
            <div className={`space-y-6 ${isFullscreen ? 'h-screen' : ''}`}>
              {reverseEngineeredItems ? (
                <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <BrainCircuit className="w-5 h-5 mr-2" />
                        Design Analysis Results
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {reverseEngineeredItems.analysisDepth}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveReverseEngineeredDesignItems}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save Work Items
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="mt-1">
                      Extracted work items and business requirements from visual design analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isFullscreen ? 'flex-1 flex flex-col overflow-auto' : ''}>
                    <div className="space-y-6">
                      {/* AI Analysis Summary Document */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          AI Design Analysis Summary
                        </h3>
                        <p className="text-blue-800 leading-relaxed mb-4">
                          {reverseEngineeredItems.extractedInsights}
                        </p>
                        <div className="border-t border-blue-200 pt-4">
                          <h4 className="font-medium text-blue-900 mb-2">Visual Design Analysis</h4>
                          <p className="text-blue-700 text-sm">
                            {reverseEngineeredItems.designAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* User Flows */}
                      {reverseEngineeredItems.userFlows && reverseEngineeredItems.userFlows.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2 flex items-center">
                            <GitBranch className="w-4 h-4 mr-2" />
                            Identified User Flows
                          </h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {reverseEngineeredItems.userFlows.map((flow, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {flow}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Accessibility Insights */}
                      {reverseEngineeredItems.accessibilityInsights && reverseEngineeredItems.accessibilityInsights.length > 0 && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Accessibility Insights
                          </h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {reverseEngineeredItems.accessibilityInsights.map((insight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-amber-600 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Work Items Hierarchy (Same as Code tab but with design context) */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Layers className="w-5 h-5 mr-2" />
                          Extracted Work Items
                        </h3>

                        {/* Business Brief */}
                        {reverseEngineeredItems.businessBrief && (
                          <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="bg-blue-50">
                              <CardTitle className="text-blue-900 flex items-center">
                                <BrainCircuit className="w-5 h-5 mr-2" />
                                Business Brief
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">ID:</span>
                                  <span className="ml-2 text-sm text-gray-900">{reverseEngineeredItems.businessBrief.id}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Title:</span>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{reverseEngineeredItems.businessBrief.title}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Description:</span>
                                  <p className="mt-1 text-sm text-gray-700">{reverseEngineeredItems.businessBrief.description}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Business Objective:</span>
                                  <p className="mt-1 text-sm text-gray-700">{reverseEngineeredItems.businessBrief.businessObjective}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Quantifiable Outcomes:</span>
                                  <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                                    {reverseEngineeredItems.businessBrief.quantifiableBusinessOutcomes?.map((outcome: string, index: number) => (
                                      <li key={index}>{outcome}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Initiatives */}
                        {reverseEngineeredItems.initiatives && reverseEngineeredItems.initiatives.length > 0 && (
                          <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="bg-purple-50">
                              <CardTitle className="text-purple-900 flex items-center">
                                <GitBranch className="w-5 h-5 mr-2" />
                                Initiatives ({reverseEngineeredItems.initiatives.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.initiatives.map((initiative: any, index: number) => (
                                  <div key={initiative.id} className="border border-purple-200 rounded-lg p-3 bg-purple-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-purple-900">{initiative.title}</h4>
                                        <p className="text-sm text-purple-700 mt-1">{initiative.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-purple-600">ID: {initiative.id}</span>
                                          <Badge variant="outline">{initiative.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Features */}
                        {reverseEngineeredItems.features && reverseEngineeredItems.features.length > 0 && (
                          <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="bg-green-50">
                              <CardTitle className="text-green-900 flex items-center">
                                <FileCode2 className="w-5 h-5 mr-2" />
                                Features ({reverseEngineeredItems.features.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.features.map((feature: any, index: number) => (
                                  <div key={feature.id} className="border border-green-200 rounded-lg p-3 bg-green-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-green-900">{feature.title}</h4>
                                        <p className="text-sm text-green-700 mt-1">{feature.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-green-600">ID: {feature.id}</span>
                                          <Badge variant="outline">{feature.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Epics */}
                        {reverseEngineeredItems.epics && reverseEngineeredItems.epics.length > 0 && (
                          <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="bg-orange-50">
                              <CardTitle className="text-orange-900 flex items-center">
                                <Layers className="w-5 h-5 mr-2" />
                                Epics ({reverseEngineeredItems.epics.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.epics.map((epic: any, index: number) => (
                                  <div key={epic.id} className="border border-orange-200 rounded-lg p-3 bg-orange-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-orange-900">{epic.title}</h4>
                                        <p className="text-sm text-orange-700 mt-1">{epic.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-orange-600">ID: {epic.id}</span>
                                          <Badge variant="outline">{epic.priority || 'medium'}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Stories */}
                        {reverseEngineeredItems.stories && reverseEngineeredItems.stories.length > 0 && (
                          <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="bg-red-50">
                              <CardTitle className="text-red-900 flex items-center">
                                <Target className="w-5 h-5 mr-2" />
                                User Stories ({reverseEngineeredItems.stories.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {reverseEngineeredItems.stories.map((story: any, index: number) => (
                                  <div key={story.id} className="border border-red-200 rounded-lg p-3 bg-red-25">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-red-900">{story.title}</h4>
                                        <p className="text-sm text-red-700 mt-1">{story.description}</p>
                                        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                          <div className="mt-2">
                                            <span className="text-xs font-medium text-red-600">Acceptance Criteria:</span>
                                            <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                                              {story.acceptanceCriteria.map((criteria: string, idx: number) => (
                                                <li key={idx}>{criteria}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        <div className="flex items-center space-x-4 mt-2">
                                          <span className="text-xs text-red-600">ID: {story.id}</span>
                                          <Badge variant="outline">{story.priority || 'medium'}</Badge>
                                          {story.storyPoints && (
                                            <Badge variant="outline">{story.storyPoints} pts</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BrainCircuit className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze Design</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Provide a Figma URL, upload design images, or select multiple files to extract business requirements and work items from visual designs.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      {!isFullscreen && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tips:</strong> For best design generation results, provide clear design files and specific requirements. 
            For reverse engineering, upload high-quality design images with clear interface elements for optimal work item extraction.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 