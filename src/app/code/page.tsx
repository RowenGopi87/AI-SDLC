"use client";

import { useState, useRef } from 'react';
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
  Package
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

type ViewportType = 'desktop' | 'tablet' | 'mobile';
type CodeType = 'frontend' | 'backend' | 'fullstack';

export default function CodePage() {
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>('');
  const [codeType, setCodeType] = useState<CodeType>('frontend');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [framework, setFramework] = useState<string>('auto');
  const [designReference, setDesignReference] = useState<string>('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code' | 'structure'>('code');
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  const previewRef = useRef<HTMLIFrameElement>(null);

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

  const generateCode = async () => {
    if (!selectedWorkItem) {
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
            clearInterval(progressInterval!);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
      if (!workItem) return;

      // Prepare the request payload
      const prompt = `Generate ${codeType} code for the following work item:

Title: ${workItem.title}
Description: ${workItem.description}

Code Type: ${codeType}
Language: ${selectedLanguage === 'auto' ? 'Best choice for this project' : selectedLanguage}
Framework: ${framework === 'auto' ? 'Best choice for this project' : framework}

${designReference ? `Design Reference: ${designReference}` : ''}

Additional Requirements: ${additionalRequirements || 'Follow best practices and include proper error handling, comments, and documentation'}

Please provide:
1. Complete, production-ready code
2. Project structure
3. Dependencies list
4. Run instructions
5. Multiple files if needed (main, components, configs, tests)

Make sure the code is well-structured, follows best practices, and includes proper error handling.`;

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
          designReference,
          additionalRequirements
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const result = await response.json();
      
      clearInterval(progressInterval!);
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
      
      // Fallback mock response for demo
      const mockGeneratedCode: GeneratedCode = {
        language: selectedLanguage === 'auto' ? 'typescript' : selectedLanguage,
        codeType,
        files: [
          {
            filename: codeType === 'backend' ? 'server.ts' : 'App.tsx',
            content: codeType === 'backend' 
              ? `// Generated Backend Code
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

app.get('/api/${workItem?.title.toLowerCase().replace(/\s+/g, '-')}', (req, res) => {
  // Implementation for ${workItem?.description}
  res.json({ 
    message: 'Feature implemented',
    data: [] 
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
              : `// Generated Frontend Code
import React, { useState, useEffect } from 'react';
import './App.css';

interface ${workItem?.title.replace(/\s+/g, '')}Props {
  // Add props based on requirements
}

const ${workItem?.title.replace(/\s+/g, '')}Component: React.FC = () => {
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
            <p>Feature implementation goes here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ${workItem?.title.replace(/\s+/g, '')}Component;`,
            type: 'main',
            language: selectedLanguage === 'auto' ? 'typescript' : selectedLanguage,
          },
          ...(codeType === 'frontend' || codeType === 'fullstack' ? [{
            filename: 'App.css',
            content: `/* Styles for ${workItem?.title} */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.app-header p {
  font-size: 1.125rem;
  color: #6b7280;
}

.app-main {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.content {
  padding: 1rem;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
}`,
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
          ? `backend/
├── src/
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   └── models/
├── package.json
├── tsconfig.json
└── README.md`
          : `frontend/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   └── pages/
├── public/
├── package.json
└── README.md`,
        dependencies: codeType === 'backend' 
          ? ['express', 'cors', 'typescript', 'ts-node']
          : ['react', 'react-dom', 'typescript'],
        runInstructions: codeType === 'backend'
          ? 'npm install && npm run dev'
          : 'npm install && npm start'
      };
      
      setGeneratedCode(mockGeneratedCode);
      setSelectedFile(mockGeneratedCode.files[0].filename);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const updatePreview = (code: GeneratedCode) => {
    if (!previewRef.current || codeType === 'backend') return;
    
    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      const htmlFile = code.files.find(f => f.filename.endsWith('.tsx') || f.filename.endsWith('.jsx'));
      const cssFile = code.files.find(f => f.filename.endsWith('.css'));
      
      if (htmlFile) {
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
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f9fafb;
      }
      ${cssFile?.content || ''}
    </style>
</head>
<body>
    <div id="preview-message">
      <h2>Frontend Code Generated</h2>
      <p>This is a React component. To see the live preview, you would need to run the development server.</p>
      <div style="background: white; border-radius: 8px; padding: 20px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3>Component: ${htmlFile.filename}</h3>
        <p>Ready for development environment</p>
      </div>
    </div>
</body>
</html>`;
        
        iframeDoc.open();
        iframeDoc.write(wrappedHtml);
        iframeDoc.close();
      }
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

                {/* Design Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Reference (Optional)
                  </label>
                  <Input
                    placeholder="Reference to previous design work or attach design files..."
                    value={designReference}
                    onChange={(e) => setDesignReference(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to design outputs or describe design requirements
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

      {/* Help Section */}
      {!isFullscreen && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tips:</strong> Choose your preferred language and framework, or let AI auto-select the best options. 
            Include design references and specific requirements for better code generation results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 