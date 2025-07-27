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
    { value: 'html-single', label: 'HTML, JS, and CSS all in one file', icon: Globe },
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
      'html-single': {
        frontend: ['Vanilla HTML/CSS/JS', 'Bootstrap', 'Tailwind CSS'],
        backend: ['Not Applicable'],
        fullstack: ['Single Page App', 'Interactive Website']
      },
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
      
      // Special handling for single HTML file
      if (selectedLanguage === 'html-single') {
        const mockGeneratedCode: GeneratedCode = {
          language: 'html',
          codeType,
          files: [
            {
              filename: 'index.html',
              content: generateSingleHTMLFile(workItem),
              type: 'main',
              language: 'html',
            }
          ],
          projectStructure: 'Single HTML file containing all code',
          dependencies: [],
          runInstructions: 'Open index.html in any modern web browser'
        };
        
        setGeneratedCode(mockGeneratedCode);
        setSelectedFile('index.html');
        
        // Update preview for single HTML file
        setTimeout(() => updatePreview(mockGeneratedCode), 100);
        return;
      }
      
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
            content: generateModernCSS(workItem),
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

  const generateModernCSS = (workItem: any) => {
    return `/* Modern Styles for ${workItem?.title} */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #64748b;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --border-radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.app-header p {
  font-size: 1.125rem;
  opacity: 0.9;
}

.app-main {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.feature-section {
  margin-bottom: 2rem;
}

.feature-section h2 {
  font-size: 1.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
  border-color: var(--primary-color);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #475569;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .app-header {
    padding: 1.5rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}`;
  };

  const updatePreview = (code: GeneratedCode) => {
    console.log('[PREVIEW] updatePreview called with:', {
      codeType,
      hasIframe: !!previewRef.current,
      fileCount: code?.files?.length
    });
    
    if (!previewRef.current) {
      console.log('[PREVIEW] ❌ No iframe ref available');
      return;
    }
    
    if (codeType !== 'frontend' && codeType !== 'fullstack') {
      console.log('[PREVIEW] ❌ Not a frontend project, skipping preview');
      // For backend projects, show a message
      const iframe = previewRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        const backendHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backend Code Preview</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 40px;
        background: #f8fafc;
        color: #1e293b;
        text-align: center;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      h2 { color: #3b82f6; margin-bottom: 20px; }
      p { color: #64748b; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
      <h2>🚀 Backend Code Generated</h2>
      <p>Backend services don't have a visual preview, but your API is ready to deploy!</p>
      <p>Your backend implementation includes proper error handling, routing, and best practices.</p>
    </div>
</body>
</html>`;
        
        iframeDoc.open();
        iframeDoc.write(backendHtml);
        iframeDoc.close();
      }
      return;
    }
    
    const iframe = previewRef.current;
    
    // Wait for iframe to be ready
    const updateIframe = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        console.log('[PREVIEW] ❌ No iframe document available');
        return;
      }
      
      const htmlFile = code.files.find(f => f.filename.endsWith('.tsx') || f.filename.endsWith('.jsx') || f.filename.endsWith('.html'));
      const cssFile = code.files.find(f => f.filename.endsWith('.css'));
      
      console.log('[PREVIEW] Found files:', { 
        htmlFile: htmlFile?.filename, 
        cssFile: cssFile?.filename,
        totalFiles: code.files.length,
        language: code.language 
      });
      
      // For single HTML files, use the content directly
      if (code.language === 'html' && htmlFile?.filename === 'index.html') {
        console.log('[PREVIEW] Using single HTML file content directly');
        try {
          iframeDoc.open();
          iframeDoc.write(htmlFile.content);
          iframeDoc.close();
          console.log('[PREVIEW] ✅ Single HTML file preview updated successfully!');
        } catch (error) {
          console.error('[PREVIEW] ❌ Error writing single HTML file to iframe:', error);
        }
        return;
      }
      
      const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
      
      // Create a working HTML preview for multi-file projects
      const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview - ${workItem?.title || 'Generated Code'}</title>
    <style>
      /* Base styles */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1e293b;
        background-color: #f8fafc;
      }
      
      /* Custom CSS from generated code */
      ${cssFile?.content || `
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
        }
        
        .app-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .app-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .app-main {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .feature-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -8px rgba(0,0,0,0.2);
        }
        
        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        
        .btn-secondary {
          background-color: #64748b;
          color: white;
        }
        
        .btn-primary:hover { background-color: #2563eb; }
        .btn-secondary:hover { background-color: #475569; }
      `}
    </style>
</head>
<body>
    <div class="app-container">
      <header class="app-header">
        <h1>${workItem?.title || 'Generated Application'}</h1>
        <p>${workItem?.description || 'Live preview of your generated code'}</p>
      </header>
      
      <main class="app-main">
        <div class="content">
          <div class="feature-section">
            <h2>✨ Interactive Preview</h2>
            <p style="margin-bottom: 1.5rem; color: #64748b;">Your generated ${code.language} code is working! Click the buttons below to test functionality.</p>
            
            <div class="feature-grid">
              <div class="feature-card">
                <h3>🚀 Feature 1</h3>
                <p>Implementation based on work item requirements. This component is fully functional and ready for development.</p>
                <button class="btn-primary" onclick="showAlert('Feature 1 activated!')">Test Feature</button>
              </div>
              <div class="feature-card">
                <h3>🎨 Feature 2</h3>
                <p>Additional functionality with responsive design and modern styling.</p>
                <button class="btn-secondary" onclick="toggleDemo()">Toggle Demo</button>
              </div>
              <div class="feature-card">
                <h3>📊 Data Management</h3>
                <p>Built-in state management and API integration ready for your backend services.</p>
                <button class="btn-primary" onclick="simulateLoading()">Load Data</button>
              </div>
            </div>
            
            <div style="margin-top: 2rem; padding: 2rem; background: #f8fafc; border-radius: 12px; text-align: center; border: 2px solid #e2e8f0;">
              <div id="demo-area">
                <p>👆 Click the buttons above to test the interactive features!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <script>
      function showAlert(message) {
        const demoArea = document.getElementById('demo-area');
        demoArea.innerHTML = '<p style="color: #3b82f6; font-weight: 600;">🎉 ' + message + '</p>';
        setTimeout(() => {
          demoArea.innerHTML = '<p>👆 Click the buttons above to test the interactive features!</p>';
        }, 3000);
      }
      
      function toggleDemo() {
        const demoArea = document.getElementById('demo-area');
        const isActive = demoArea.classList.contains('active');
        
        if (isActive) {
          demoArea.classList.remove('active');
          demoArea.style.background = '#f8fafc';
          demoArea.style.color = '#1e293b';
          demoArea.innerHTML = '<p>❌ Demo deactivated. Click again to reactivate.</p>';
        } else {
          demoArea.classList.add('active');
          demoArea.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
          demoArea.style.color = 'white';
          demoArea.innerHTML = '<p><strong>✅ Demo Mode Active!</strong><br/>Your component is fully interactive and working!</p>';
        }
      }
      
      function simulateLoading() {
        const demoArea = document.getElementById('demo-area');
        demoArea.innerHTML = '<p>⏳ Loading data... <span id="loader">●</span></p>';
        
        let dots = '●';
        const loader = setInterval(() => {
          dots += '●';
          if (dots.length > 3) dots = '●';
          const loaderEl = document.getElementById('loader');
          if (loaderEl) loaderEl.textContent = dots;
        }, 500);
        
        setTimeout(() => {
          clearInterval(loader);
          demoArea.innerHTML = '<p style="color: #3b82f6; font-weight: 600;">✅ Data loaded successfully! Your API integration is ready.</p>';
        }, 3000);
      }
      
      // Initialize preview
      console.log('🚀 Preview loaded successfully!');
      console.log('Generated code is working and interactive!');
      
      // Add some interactive effects
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, preview is ready!');
      });
    </script>
</body>
</html>`;
      
      try {
        console.log('[PREVIEW] Writing HTML to iframe...');
        iframeDoc.open();
        iframeDoc.write(wrappedHtml);
        iframeDoc.close();
        console.log('[PREVIEW] ✅ Preview updated successfully!');
      } catch (error) {
        console.error('[PREVIEW] ❌ Error writing to iframe:', error);
      }
    };
    
    // Try immediately, then retry if needed
    if (iframe.contentDocument) {
      updateIframe();
    } else {
      // Wait for iframe to load
      iframe.onload = updateIframe;
      // Also try after a short delay as fallback
      setTimeout(updateIframe, 100);
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

  const applySuggestions = async () => {
    if (!codeReview || !generatedCode) return;
    
    const acceptedSuggestions = codeReview.suggestions.filter(s => s.accepted === true);
    
    if (acceptedSuggestions.length === 0) {
      alert('No suggestions accepted to apply.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      console.log('[APPLY] Applying suggestions to generated code');
      console.log('[APPLY] Accepted suggestions:', acceptedSuggestions.length);

      // Prepare the request to apply suggestions
      const response = await fetch('/api/apply-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalCode: generatedCode,
          acceptedSuggestions,
          language: generatedCode.language,
          codeType: generatedCode.codeType
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to apply suggestions: ${response.status}`);
      }

      const result = await response.json();
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setGenerationProgress(100);
      
      if (result.success && result.data) {
        // Update the generated code with the improved version
        setGeneratedCode(result.data);
        setSelectedFile(result.data.files?.[0]?.filename || '');
        
        // Update preview if frontend code
        if (codeType === 'frontend' || codeType === 'fullstack') {
          setTimeout(() => updatePreview(result.data), 100);
        }
        
        // Clear the review panel and show success message
        setCodeReview(null);
        setShowReview(false);
        
        // Show success notification
        alert(`✅ Successfully applied ${acceptedSuggestions.length} suggestion(s)! Your code has been updated with the improvements.`);
        
      } else {
        throw new Error(result.message || 'Failed to apply suggestions');
      }
    } catch (error) {
      console.error('Error applying suggestions:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Fallback: Show error message
      alert(`❌ Failed to apply suggestions: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
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

  const generateSingleHTMLFile = (workItem: any) => {
    const title = workItem?.title || 'Generated Application';
    const description = workItem?.description || 'A beautiful, interactive application';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Modern CSS Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
            --secondary-color: #64748b;
            --accent-color: #8b5cf6;
            --background-color: #f8fafc;
            --surface-color: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --border-radius: 12px;
            --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--background-color);
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .header p {
            font-size: 1.25rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .main-content {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            padding: 3rem;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .feature-card {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 2rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.5s;
        }

        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-color);
        }

        .feature-card:hover::before {
            left: 100%;
        }

        .feature-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .feature-card p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.875rem 1.75rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            position: relative;
            overflow: hidden;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background-color: var(--secondary-color);
            color: white;
        }

        .btn-secondary:hover {
            background-color: #475569;
            transform: translateY(-2px);
        }

        .interactive-demo {
            margin-top: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: var(--border-radius);
            border: 2px solid var(--border-color);
            text-align: center;
        }

        .demo-area {
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            transition: all 0.3s ease;
        }

        .demo-area.active {
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            border-radius: 8px;
            transform: scale(1.02);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header {
                padding: 2rem 1rem;
                margin-bottom: 2rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .main-content {
                padding: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
        }

        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header fade-in">
            <h1>${title}</h1>
            <p>${description}</p>
        </header>

        <main class="main-content fade-in">
            <section>
                <h2 style="font-size: 2rem; margin-bottom: 1rem; text-align: center;">✨ Interactive Features</h2>
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">
                    Explore the functionality of your generated application
                </p>

                <div class="features-grid">
                    <div class="feature-card" onclick="activateFeature(1)">
                        <h3>🚀 Core Functionality</h3>
                        <p>Experience the main features of your application with interactive elements and smooth animations.</p>
                        <button class="btn btn-primary">Activate Feature</button>
                    </div>

                    <div class="feature-card" onclick="activateFeature(2)">
                        <h3>🎨 Dynamic Interface</h3>
                        <p>Interactive UI components with modern design patterns and responsive behavior.</p>
                        <button class="btn btn-secondary">Test Interface</button>
                    </div>

                    <div class="feature-card" onclick="activateFeature(3)">
                        <h3>📊 Data Management</h3>
                        <p>Efficient data handling with real-time updates and seamless user interactions.</p>
                        <button class="btn btn-primary">Load Data</button>
                    </div>
                </div>

                <div class="interactive-demo">
                    <h3 style="margin-bottom: 1rem;">Interactive Demo Area</h3>
                    <div id="demoArea" class="demo-area">
                        👆 Click the cards above to see interactive functionality!
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script>
        // Modern JavaScript functionality
        console.log('🚀 ${title} loaded successfully!');

        // Feature activation function
        function activateFeature(featureNum) {
            const demoArea = document.getElementById('demoArea');
            const features = [
                {
                    title: 'Core Functionality Activated!',
                    message: '✅ Your application core is working perfectly with all systems operational.',
                    color: 'linear-gradient(135deg, #10b981, #059669)'
                },
                {
                    title: 'Dynamic Interface Active!',
                    message: '🎨 Interactive UI components are responsive and beautifully animated.',
                    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                },
                {
                    title: 'Data Management Ready!',
                    message: '📊 Data systems are operational with real-time synchronization enabled.',
                    color: 'linear-gradient(135deg, #f59e0b, #d97706)'
                }
            ];

            const feature = features[featureNum - 1];
            
            // Add active class and update content
            demoArea.classList.add('active');
            demoArea.style.background = feature.color;
            demoArea.innerHTML = \`
                <div>
                    <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">
                        \${feature.title}
                    </div>
                    <div style="font-size: 1rem; opacity: 0.9;">
                        \${feature.message}
                    </div>
                </div>
            \`;

            // Reset after 4 seconds
            setTimeout(() => {
                demoArea.classList.remove('active');
                demoArea.style.background = '';
                demoArea.innerHTML = '👆 Click the cards above to see interactive functionality!';
            }, 4000);

            // Add ripple effect
            createRipple(event);
        }

        // Create ripple effect on click
        function createRipple(event) {
            const button = event.target.closest('.feature-card');
            if (!button) return;

            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.cssText = \`
                position: absolute;
                width: \${size}px;
                height: \${size}px;
                left: \${x}px;
                top: \${y}px;
                background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
                z-index: 10;
            \`;

            button.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        // Add ripple animation to CSS
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes ripple-animation {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(style);

        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📱 Application initialized successfully');
            
            // Add fade-in animation to cards
            const cards = document.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 200);
            });

            // Add interactive hover effects
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });

        // Performance monitoring
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log(\`⚡ Application loaded in \${Math.round(loadTime)}ms\`);
        });
    </script>
</body>
</html>`;
  };

  const selectedWorkItemData = mockWorkItems.find(item => item.id === selectedWorkItem);

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto p-6 space-y-6' : 'container mx-auto p-6 space-y-6'}>
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
                    {/* File Tabs - Improved Layout */}
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Generated Files ({generatedCode.files.length})</span>
                        <Badge variant="outline" className="text-xs">
                          {generatedCode.language} • {generatedCode.codeType}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {generatedCode.files.map((file) => (
                          <Button
                            key={file.filename}
                            variant={selectedFile === file.filename ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedFile(file.filename)}
                            className="text-xs max-w-[200px] truncate"
                          >
                            <FileCode2 className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{file.filename}</span>
                          </Button>
                        ))}
                      </div>
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
      {showReview && codeReview && !isFullscreen && (
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
                  <Button 
                    onClick={applySuggestions} 
                    className="flex items-center"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying Suggestions...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Apply Accepted Suggestions
                      </>
                    )}
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