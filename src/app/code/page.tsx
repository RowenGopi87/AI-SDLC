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
import { Input } from '@/components/ui/input';
import { mockWorkItems } from '@/lib/mock-data';
import {
  Code2,
  GitBranch,
  Play,
  Download,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  FileCode2,
  Server,
  Globe,
  Database,
  Sparkles,
  FolderTree,
  Terminal,
  Package,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface GeneratedCode {
  language: string;
  codeType: 'frontend' | 'backend' | 'fullstack';
  files: CodeFile[];
  projectStructure?: string;
  dependencies?: string[];
  runInstructions?: string;
}

interface CodeFile {
  filename: string;
  content: string;
  type: 'main' | 'component' | 'config' | 'test' | 'style';
  language: string;
}

interface CodeReview {
  id: string;
  suggestions: CodeSuggestion[];
  overallScore: number;
  summary: string;
}

interface CodeSuggestion {
  id: string;
  file: string;
  line?: number;
  type: 'improvement' | 'bug' | 'security' | 'performance' | 'style';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  accepted?: boolean;
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';
type CodeType = 'frontend' | 'backend' | 'fullstack';

export default function CodePage() {
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>('');
  const [codeType, setCodeType] = useState<CodeType>('frontend');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [framework, setFramework] = useState<string>('auto');
  const [designReference, setDesignReference] = useState<string>('');
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code' | 'structure'>('code');
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [codeReview, setCodeReview] = useState<CodeReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Viewport dimensions
  const viewportDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' }
  };

  // Language options
  const languageOptions = [
    { value: 'auto', label: 'Auto Detect', icon: Sparkles },
    { value: 'javascript', label: 'JavaScript', icon: FileCode2 },
    { value: 'typescript', label: 'TypeScript', icon: FileCode2 },
    { value: 'python', label: 'Python', icon: FileCode2 },
    { value: 'java', label: 'Java', icon: FileCode2 },
    { value: 'csharp', label: 'C#', icon: FileCode2 },
    { value: 'go', label: 'Go', icon: FileCode2 },
    { value: 'rust', label: 'Rust', icon: FileCode2 },
    { value: 'php', label: 'PHP', icon: FileCode2 },
  ];

  // Framework options based on language and type
  const getFrameworkOptions = (lang: string, type: CodeType) => {
    const frameworks: Record<string, Record<CodeType, string[]>> = {
      javascript: {
        frontend: ['React', 'Vue.js', 'Angular', 'Vanilla JS', 'Next.js'],
        backend: ['Node.js', 'Express.js', 'Fastify', 'Koa.js'],
        fullstack: ['Next.js', 'Nuxt.js', 'SvelteKit', 'T3 Stack']
      },
      typescript: {
        frontend: ['React', 'Vue.js', 'Angular', 'Next.js', 'Svelte'],
        backend: ['Node.js', 'Express.js', 'NestJS', 'Fastify'],
        fullstack: ['Next.js', 'Nuxt.js', 'SvelteKit', 'T3 Stack']
      },
      python: {
        frontend: ['Streamlit', 'Dash', 'Flask (Templates)', 'Django (Templates)'],
        backend: ['FastAPI', 'Django', 'Flask', 'Starlette'],
        fullstack: ['Django', 'FastAPI + React', 'Flask + Vue']
      },
      java: {
        frontend: ['JavaFX', 'Swing', 'JSF'],
        backend: ['Spring Boot', 'Quarkus', 'Micronaut'],
        fullstack: ['Spring Boot + React', 'Spring Boot + Vue']
      },
      csharp: {
        frontend: ['Blazor', 'WPF', 'WinForms'],
        backend: ['ASP.NET Core', '.NET 8', 'Minimal APIs'],
        fullstack: ['Blazor Server', 'ASP.NET Core + React']
      }
    };
    
    return frameworks[lang]?.[type] || ['Auto'];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file for design reference.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      setDesignFile(file);
      setDesignReference(`Uploaded: ${file.name}`);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix to get just the base64 string
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const generateCode = async () => {
    if (!selectedWorkItem) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCodeReview(null);
    setShowReview(false);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
      if (!workItem) return;

      // Prepare image data if file is uploaded
      let imageData = '';
      let imageType = '';
      if (designFile) {
        imageData = await fileToBase64(designFile);
        imageType = designFile.type;
      }

      // Prepare the request payload
      const prompt = `Generate ${codeType} code for the following work item:

Title: ${workItem.title}
Description: ${workItem.description}

Code Type: ${codeType}
Language: ${selectedLanguage === 'auto' ? 'Best choice for this project' : selectedLanguage}
Framework: ${framework === 'auto' ? 'Best choice for this project' : framework}

${designReference ? `Design Reference: ${designReference}` : ''}
${designFile ? 'Design file has been attached for visual reference.' : ''}

Additional Requirements: ${additionalRequirements || 'Follow best practices and include proper error handling, comments, and documentation'}

Please provide:
1. Complete, production-ready code
2. Project structure
3. Dependencies list
4. Run instructions
5. Multiple files if needed (main, components, configs, tests)

Make sure the code is well-structured, follows best practices, and includes proper error handling.`;

      console.log('[CODE] Calling API with payload:', {
        workItemId: selectedWorkItem,
        codeType,
        language: selectedLanguage,
        framework,
        hasImage: !!imageData
      });

      // Call the API
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          workItemId: selectedWorkItem,
          codeType,
          language: selectedLanguage,
          framework,
          designReference: designFile ? 'Image file attached' : designReference,
          additionalRequirements,
          imageData,
          imageType
        }),
      });

      console.log('[CODE] API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[CODE] API Response:', result);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setGenerationProgress(100);
      
      if (result.success && result.data) {
        setGeneratedCode(result.data);
        setSelectedFile(result.data.files?.[0]?.filename || '');
        
        // Update preview if frontend code
        if (codeType === 'frontend' || codeType === 'fullstack') {
          setTimeout(() => updatePreview(result.data), 100);
        }
      } else {
        throw new Error(result.message || 'Failed to generate code');
      }
      
    } catch (error) {
      console.error('Error generating code:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Continue with fallback...
      const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
      const mockGeneratedCode: GeneratedCode = {
        language: selectedLanguage === 'auto' ? 'typescript' : selectedLanguage,
        codeType,
        files: [
          {
            filename: codeType === 'backend' ? 'server.ts' : 'App.tsx',
                          content: codeType === 'backend' 
                ? generateBackendCode(workItem)
                : generateFrontendCode(workItem),
            type: 'main',
            language: selectedLanguage === 'auto' ? 'typescript' : selectedLanguage,
          },
          ...(codeType === 'frontend' || codeType === 'fullstack' ? [{
            filename: 'App.css',
            content: `/* Modern Styles for ${workItem?.title} */\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n:root {\n  --primary-color: #3b82f6;\n  --primary-hover: #2563eb;\n  --secondary-color: #64748b;\n  --bg-color: #f8fafc;\n  --card-bg: #ffffff;\n  --text-primary: #1e293b;\n  --text-secondary: #64748b;\n  --border-color: #e2e8f0;\n  --border-radius: 12px;\n  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  line-height: 1.6;\n  color: var(--text-primary);\n  background-color: var(--bg-color);\n}\n\n.app-container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n  min-height: 100vh;\n}\n\n.app-header {\n  text-align: center;\n  margin-bottom: 3rem;\n  padding: 2rem;\n  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);\n  color: white;\n  border-radius: var(--border-radius);\n  box-shadow: var(--shadow);\n}\n\n.app-header h1 {\n  font-size: 2.5rem;\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n}\n\n.app-header p {\n  font-size: 1.125rem;\n  opacity: 0.9;\n}\n\n.app-main {\n  background: var(--card-bg);\n  border-radius: var(--border-radius);\n  padding: 2rem;\n  box-shadow: var(--shadow);\n  border: 1px solid var(--border-color);\n}\n\n.loading {\n  text-align: center;\n  padding: 4rem;\n  color: var(--text-secondary);\n  font-size: 1.125rem;\n}\n\n.feature-section {\n  margin-bottom: 2rem;\n}\n\n.feature-section h2 {\n  font-size: 1.875rem;\n  font-weight: 600;\n  margin-bottom: 1.5rem;\n  color: var(--text-primary);\n  border-bottom: 2px solid var(--primary-color);\n  padding-bottom: 0.5rem;\n}\n\n.feature-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\n.feature-card {\n  background: var(--bg-color);\n  border: 1px solid var(--border-color);\n  border-radius: var(--border-radius);\n  padding: 1.5rem;\n  transition: all 0.3s ease;\n}\n\n.feature-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);\n  border-color: var(--primary-color);\n}\n\n.feature-card h3 {\n  font-size: 1.25rem;\n  font-weight: 600;\n  margin-bottom: 0.75rem;\n  color: var(--text-primary);\n}\n\n.feature-card p {\n  color: var(--text-secondary);\n  margin-bottom: 1rem;\n  line-height: 1.5;\n}\n\n.btn-primary, .btn-secondary {\n  padding: 0.75rem 1.5rem;\n  border-radius: 8px;\n  border: none;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 0.875rem;\n}\n\n.btn-primary {\n  background-color: var(--primary-color);\n  color: white;\n}\n\n.btn-primary:hover {\n  background-color: var(--primary-hover);\n  transform: translateY(-1px);\n}\n\n.btn-secondary {\n  background-color: var(--secondary-color);\n  color: white;\n}\n\n.btn-secondary:hover {\n  background-color: #475569;\n  transform: translateY(-1px);\n}\n\n@media (max-width: 768px) {\n  .app-container {\n    padding: 1rem;\n  }\n  \n  .app-header {\n    padding: 1.5rem;\n  }\n  \n  .app-header h1 {\n    font-size: 2rem;\n  }\n  \n  .feature-grid {\n    grid-template-columns: 1fr;\n  }\n}`,
            type: 'style' as const,
            language: 'css',
          }] : []),
          {
            filename: 'package.json',
            content: JSON.stringify({
              name: workItem?.title.toLowerCase().replace(/\s+/g, '-'),
              version: '1.0.0',
              description: workItem?.description,
              scripts: codeType === 'backend' ? {
                start: 'node dist/server.js',
                dev: 'ts-node server.ts',
                build: 'tsc'
              } : {
                start: 'react-scripts start',
                build: 'react-scripts build',
                test: 'react-scripts test'
              },
              dependencies: codeType === 'backend' ? {
                express: '^4.18.2',
                cors: '^2.8.5',
                '@types/express': '^4.17.17',
                '@types/cors': '^2.8.13'
              } : {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                '@types/react': '^18.2.0',
                '@types/react-dom': '^18.2.0'
              }
            }, null, 2),
            type: 'config' as const,
            language: 'json',
          }
        ],
        projectStructure: codeType === 'backend' 
          ? `backend/\n├── src/\n│   ├── server.ts\n│   ├── routes/\n│   ├── controllers/\n│   └── models/\n├── package.json\n├── tsconfig.json\n└── README.md`
          : `frontend/\n├── src/\n│   ├── App.tsx\n│   ├── App.css\n│   ├── components/\n│   └── pages/\n├── public/\n├── package.json\n└── README.md`,
        dependencies: codeType === 'backend' 
          ? ['express', 'cors', 'typescript', 'ts-node']
          : ['react', 'react-dom', 'typescript'],
        runInstructions: codeType === 'backend'
          ? 'npm install && npm run dev'
          : 'npm install && npm start'
      };
      
      setGeneratedCode(mockGeneratedCode);
      setSelectedFile(mockGeneratedCode.files[0].filename);
      
      // Update preview for frontend code
      if (codeType === 'frontend' || codeType === 'fullstack') {
        setTimeout(() => updatePreview(mockGeneratedCode), 100);
      }
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const updatePreview = (code: GeneratedCode) => {
    if (!previewRef.current || (codeType !== 'frontend' && codeType !== 'fullstack')) return;
    
    console.log('[PREVIEW] Updating preview with code:', code);
    
    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      const htmlFile = code.files.find(f => f.filename.endsWith('.tsx') || f.filename.endsWith('.jsx') || f.filename.endsWith('.html'));
      const cssFile = code.files.find(f => f.filename.endsWith('.css'));
      
      console.log('[PREVIEW] Found files:', { htmlFile: htmlFile?.filename, cssFile: cssFile?.filename });
      
      if (htmlFile || cssFile) {
        // Create a functional HTML page that demonstrates the component
        const wrappedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Preview</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      ${cssFile?.content || ''}
    </style>
</head>
<body>
    <div id="app">
      ${codeType === 'frontend' || codeType === 'fullstack' ? `
        <div class="app-container">
          <header class="app-header">
            <h1>Live Preview</h1>
            <p>This is a preview of the generated frontend code</p>
          </header>
          
          <main class="app-main">
            <div class="content">
              <div class="feature-section">
                <h2>Generated Component Preview</h2>
                <div class="feature-grid">
                  <div class="feature-card">
                    <h3>Component Ready</h3>
                    <p>Your React component has been generated and is ready for development.</p>
                    <button class="btn-primary" onclick="alert('This is a preview. Implement your logic here.')">Test Action</button>
                  </div>
                  <div class="feature-card">
                    <h3>Responsive Design</h3>
                    <p>The generated code includes responsive CSS for all screen sizes.</p>
                    <button class="btn-secondary" onclick="document.body.style.transform = document.body.style.transform ? '' : 'scale(0.8)'">Toggle Scale</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      ` : `
        <div style="padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Backend Code Generated</h2>
          <p style="color: #64748b; margin-bottom: 30px;">Backend services don't have a visual preview, but your API is ready to deploy!</p>
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 500px; margin: 0 auto;">
            <h3 style="color: #3b82f6; margin-bottom: 15px;">✅ Server Code Ready</h3>
            <p style="color: #64748b;">Your backend implementation is complete with proper error handling, routing, and best practices.</p>
          </div>
        </div>
      `}
    </div>
    
    <script>
      // Add some interactivity for demo
      console.log('Preview loaded successfully');
    </script>
</body>
</html>`;
        
        console.log('[PREVIEW] Writing HTML to iframe');
        iframeDoc.open();
        iframeDoc.write(wrappedHtml);
        iframeDoc.close();
        
        console.log('[PREVIEW] Preview updated successfully');
      }
    }
  };

  const reviewCodeWithAI = async () => {
    if (!generatedCode) return;

    setIsReviewing(true);
    
    try {
      // Call AI to review the generated code
      const response = await fetch('/api/review-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: generatedCode,
          language: generatedCode.language,
          codeType: generatedCode.codeType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review code');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setCodeReview(result.data);
        setShowReview(true);
      } else {
        // Fallback mock review
        const mockReview: CodeReview = {
          id: 'review-' + Date.now(),
          overallScore: 85,
          summary: 'Good code structure with room for improvements in error handling and performance optimization.',
          suggestions: [
            {
              id: 'suggestion-1',
              file: generatedCode.files[0].filename,
              line: 15,
              type: 'improvement',
              severity: 'medium',
              message: 'Consider adding proper error boundaries',
              suggestion: 'Wrap components with error boundaries to handle runtime errors gracefully.',
              accepted: undefined
            },
            {
              id: 'suggestion-2',
              file: generatedCode.files[0].filename,
              line: 28,
              type: 'performance',
              severity: 'low',
              message: 'Optimize re-renders with useMemo',
              suggestion: 'Use useMemo for expensive calculations to prevent unnecessary re-renders.',
              accepted: undefined
            },
            {
              id: 'suggestion-3',
              file: generatedCode.files[0].filename,
              type: 'security',
              severity: 'high',
              message: 'Input validation needed',
              suggestion: 'Add proper input validation and sanitization for user inputs.',
              accepted: undefined
            }
          ]
        };
        setCodeReview(mockReview);
        setShowReview(true);
      }
    } catch (error) {
      console.error('Error reviewing code:', error);
      // Still show mock review on error
      const mockReview: CodeReview = {
        id: 'review-' + Date.now(),
        overallScore: 75,
        summary: 'Code review completed. Several areas for improvement identified.',
        suggestions: [
          {
            id: 'suggestion-1',
            file: generatedCode.files[0].filename,
            type: 'improvement',
            severity: 'medium',
            message: 'Add comprehensive error handling',
            suggestion: 'Implement try-catch blocks and proper error messaging for better user experience.',
            accepted: undefined
          }
        ]
      };
      setCodeReview(mockReview);
      setShowReview(true);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSuggestionAction = (suggestionId: string, accepted: boolean) => {
    if (!codeReview) return;
    
    setCodeReview({
      ...codeReview,
      suggestions: codeReview.suggestions.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, accepted }
          : suggestion
      )
    });
  };

  const applySuggestions = () => {
    if (!codeReview || !generatedCode) return;
    
    const acceptedSuggestions = codeReview.suggestions.filter(s => s.accepted === true);
    
    if (acceptedSuggestions.length === 0) {
      alert('No suggestions accepted to apply.');
      return;
    }
    
    alert(`Applied ${acceptedSuggestions.length} suggestion(s). In a real implementation, this would modify the generated code.`);
    // In a real implementation, you would modify the generatedCode based on accepted suggestions
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
    
    // Create zip-like structure as a single file for now
    const content = `# ${generatedCode.files[0].filename.split('.')[0]} - Generated Code

## Project Structure
\`\`\`
${generatedCode.projectStructure}
\`\`\`

## Dependencies
${generatedCode.dependencies?.join(', ')}

## Run Instructions
${generatedCode.runInstructions}

## Files

${generatedCode.files.map(file => `### ${file.filename}
\`\`\`${file.language}
${file.content}
\`\`\`

`).join('')}
`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedWorkItem}-generated-code.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const generateBackendCode = (workItem: any) => {
    return `// Generated Backend Code
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes for ${workItem?.title}
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: '${workItem?.title}' });
});

app.get('/api/${workItem?.title.toLowerCase().replace(/\\s+/g, '-')}', (req, res) => {
  // Implementation for ${workItem?.description}
  res.json({ 
    message: 'Feature implemented',
    data: [] 
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  };

  const generateFrontendCode = (workItem: any) => {
    return `// Generated Frontend Code
import React, { useState, useEffect } from 'react';
import './App.css';

interface ${workItem?.title.replace(/\\s+/g, '')}Props {
  // Add props based on requirements
}

const ${workItem?.title.replace(/\\s+/g, '')}Component: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Implementation for ${workItem?.description}
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API call implementation
      console.log('Fetching data for ${workItem?.title}');
      setData([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>${workItem?.title}</h1>
        <p>${workItem?.description}</p>
      </header>
      
      <main className="app-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="content">
            {/* Implementation based on requirements */}
            <div className="feature-section">
              <h2>Core Features</h2>
              <div className="feature-grid">
                <div className="feature-card">
                  <h3>Feature 1</h3>
                  <p>Implementation based on work item requirements</p>
                  <button className="btn-primary">Action</button>
                </div>
                <div className="feature-card">
                  <h3>Feature 2</h3>
                  <p>Additional functionality as specified</p>
                  <button className="btn-secondary">Configure</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ${workItem?.title.replace(/\\s+/g, '')}Component;`;
  };

  const selectedWorkItemData = mockWorkItems.find(item => item.id === selectedWorkItem);

  return (
    <div className={`container mx-auto p-6 space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Repository</h1>
          <p className="text-gray-600 mt-2">Generate production-ready code from work items using AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code2 className="w-4 h-4 mr-1" />
            Development Phase
          </Badge>
        </div>
      </div>

      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Configuration Section */}
        {!isFullscreen && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-2" />
                  Code Configuration
                </CardTitle>
                <CardDescription>
                  Configure your code generation settings and work item selection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Work Item Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Work Item
                  </label>
                  <Select value={selectedWorkItem} onValueChange={setSelectedWorkItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a work item to implement" />
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
                  
                  {selectedWorkItemData && (
                    <div className="mt-3 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Selected Work Item</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedWorkItemData.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Code Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Code Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={codeType === 'frontend' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeType('frontend')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Globe className="w-5 h-5 mb-1" />
                      <span className="text-xs">Frontend</span>
                    </Button>
                    <Button
                      variant={codeType === 'backend' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeType('backend')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Server className="w-5 h-5 mb-1" />
                      <span className="text-xs">Backend</span>
                    </Button>
                    <Button
                      variant={codeType === 'fullstack' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeType('fullstack')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Database className="w-5 h-5 mb-1" />
                      <span className="text-xs">Full Stack</span>
                    </Button>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programming Language
                    </label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center">
                              <lang.icon className="w-4 h-4 mr-2" />
                              {lang.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Framework
                    </label>
                    <Select value={framework} onValueChange={setFramework}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Select</SelectItem>
                        {getFrameworkOptions(selectedLanguage, codeType).map((fw) => (
                          <SelectItem key={fw} value={fw.toLowerCase()}>
                            {fw}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Design Reference with File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Reference
                  </label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter design notes or requirements..."
                      value={designReference}
                      onChange={(e) => setDesignReference(e.target.value)}
                    />
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="design-file-upload"
                      />
                      <label
                        htmlFor="design-file-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Upload design file
                          </span>{' '}
                          or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </label>
                    </div>
                    
                    {designFile && (
                      <div className="flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          {designFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDesignFile(null);
                            setDesignReference('');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload design mockups or wireframes to provide visual context to the AI
                  </p>
                </div>

                {/* Additional Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <Textarea
                    placeholder="Specify any additional requirements, architecture preferences, or constraints..."
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateCode}
                  disabled={isGenerating || !selectedWorkItem}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Code with AI
                    </>
                  )}
                </Button>
                
                {isGenerating && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Analyzing requirements and generating code...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Code Output Section */}
        <div className={`space-y-6 ${isFullscreen ? 'h-screen' : ''}`}>
          {generatedCode ? (
            <Card className={isFullscreen ? 'h-full flex flex-col' : ''}>
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FileCode2 className="w-5 h-5 mr-2" />
                    Generated Code
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
                    {generatedCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reviewCodeWithAI}
                        disabled={isReviewing}
                      >
                        {isReviewing ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        Review with AI
                      </Button>
                    )}
                    {(codeType === 'frontend' || codeType === 'fullstack') && (
                      <Button
                        variant={previewMode === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('preview')}
                      >
                        <Monitor className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant={previewMode === 'code' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('code')}
                    >
                      <Code2 className="w-4 h-4 mr-1" />
                      Code
                    </Button>
                    <Button
                      variant={previewMode === 'structure' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('structure')}
                    >
                      <FolderTree className="w-4 h-4 mr-1" />
                      Structure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
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
                  Generated {generatedCode.language} {generatedCode.codeType} code ready for implementation
                </CardDescription>
              </CardHeader>
              <CardContent className={isFullscreen ? 'flex-1 flex flex-col' : ''}>
                {previewMode === 'preview' && (codeType === 'frontend' || codeType === 'fullstack') ? (
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
                        className="bg-white rounded shadow-lg"
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
                          title="Code Preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                ) : previewMode === 'structure' ? (
                  <div className="space-y-4">
                    {/* Project Structure */}
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <FolderTree className="w-5 h-5 mr-2" />
                        Project Structure
                      </h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedCode.projectStructure}</code>
                      </pre>
                    </div>
                    
                    {/* Dependencies */}
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Dependencies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedCode.dependencies?.map((dep, index) => (
                          <Badge key={index} variant="outline">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Run Instructions */}
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <Terminal className="w-5 h-5 mr-2" />
                        Run Instructions
                      </h3>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <code>{generatedCode.runInstructions}</code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Tabs */}
                    <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                      {generatedCode.files.map((file) => (
                        <Button
                          key={file.filename}
                          variant={selectedFile === file.filename ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFile(file.filename)}
                        >
                          <FileCode2 className="w-4 h-4 mr-1" />
                          {file.filename}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Code Content */}
                    {selectedFile && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => {
                            const file = generatedCode.files.find(f => f.filename === selectedFile);
                            if (file) copyToClipboard(file.content, selectedFile);
                          }}
                        >
                          {copied === selectedFile ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                          <code>
                            {generatedCode.files.find(f => f.filename === selectedFile)?.content}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Code2 className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Code</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Select a work item and configure your preferences to generate production-ready code with AI assistance.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Code Review Panel */}
      {showReview && codeReview && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                AI Code Review
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={codeReview.overallScore >= 80 ? 'default' : codeReview.overallScore >= 60 ? 'secondary' : 'destructive'}>
                  Score: {codeReview.overallScore}/100
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReview(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {codeReview.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {codeReview.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        suggestion.severity === 'high' ? 'destructive' :
                        suggestion.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {suggestion.type}
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.severity}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {suggestion.file}
                        {suggestion.line && ` : Line ${suggestion.line}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {suggestion.accepted === undefined ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionAction(suggestion.id, true)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionAction(suggestion.id, false)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge variant={suggestion.accepted ? 'default' : 'secondary'}>
                          {suggestion.accepted ? 'Accepted' : 'Rejected'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.message}
                    </p>
                    <p className="text-sm text-gray-600">
                      {suggestion.suggestion}
                    </p>
                  </div>
                </div>
              ))}
              
              {codeReview.suggestions.some(s => s.accepted === true) && (
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button onClick={applySuggestions} className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Apply Accepted Suggestions
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      {!isFullscreen && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tips:</strong> Upload design files for visual context, choose your preferred language and framework, or let AI auto-select the best options. 
            Use the "Review with AI" feature to get code improvement suggestions after generation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 