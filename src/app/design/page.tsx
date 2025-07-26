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
import { Separator } from '@/components/ui/separator';
import { mockWorkItems, mockRequirements } from '@/lib/mock-data';
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
  Loader2
} from 'lucide-react';

interface GeneratedCode {
  html: string;
  css: string;
  javascript: string;
  framework: 'react' | 'vue' | 'vanilla';
}

export default function DesignPage() {
  const [selectedTab, setSelectedTab] = useState<'figma' | 'work-item'>('figma');
  const [designImage, setDesignImage] = useState<File | null>(null);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [selectedWorkItem, setSelectedWorkItem] = useState<string>('');
  const [designPrompt, setDesignPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDesignImage(file);
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

  const generateCodeFromDesign = async () => {
    if (!designImage && !figmaUrl && !selectedWorkItem && !designPrompt) {
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
          
          // Convert image to base64
          imageData = await fileToBase64(designImage);
          imageType = designImage.type;
        } else if (figmaUrl) {
          context = `Figma URL: ${figmaUrl}`;
          prompt = `Generate a modern, responsive web component based on the Figma design at the provided URL. ${designPrompt || 'Create a clean, professional implementation with proper styling and interactions.'}`;
        }
      } else {
        const workItem = mockWorkItems.find(item => item.id === selectedWorkItem);
        if (workItem) {
          context = `Work Item: ${workItem.title}`;
          prompt = `Generate a modern, responsive web component for the work item "${workItem.title}". 
          
Description: ${workItem.description}
Requirements: Create a user interface that addresses the work item requirements.
${designPrompt || 'Focus on user experience, accessibility, and modern design patterns.'}`;
        }
      }

      // Simulate API call to LLM service
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const result = await response.json();
      
      clearInterval(progressInterval!);
      setGenerationProgress(100);
      
      // Use the real generated code from the LLM instead of mock data
      if (result.success && result.data && result.data.code) {
        const realCode: GeneratedCode = {
          framework: result.data.code.framework || 'react',
          html: result.data.code.html || '',
          css: result.data.code.css || '',
          javascript: result.data.code.javascript || '',
        };
        
        setGeneratedCode(realCode);
      } else {
        // Fallback only if API fails
        throw new Error(result.message || 'Failed to generate code');
      }
      
    } catch (error) {
      console.error('Error generating code:', error);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Design & Prototype</h1>
          <p className="text-gray-600 mt-2">Generate code from Figma designs or work items using AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Palette className="w-4 h-4 mr-1" />
            Design Phase
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Design Input
              </CardTitle>
              <CardDescription>
                Upload a Figma file or select a work item to generate code from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="figma">Figma Design</TabsTrigger>
                  <TabsTrigger value="work-item">Work Item</TabsTrigger>
                </TabsList>
                
                <TabsContent value="figma" className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
                      <div className="flex items-center justify-center space-x-2">
                        <FileImage className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium">{designImage.name}</span>
                      </div>
                    ) : (
                      <div>
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium">Drop your design image here or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, GIF, WebP images</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">or</div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Figma URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.figma.com/file/..."
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="work-item" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Work Item
                    </label>
                    <Select value={selectedWorkItem} onValueChange={setSelectedWorkItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a work item to design" />
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Selected Work Item</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {mockWorkItems.find(item => item.id === selectedWorkItem)?.description}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Design Requirements (Optional)
                </label>
                <Textarea
                  placeholder="Describe any specific styling, behavior, or requirements for the generated code..."
                  value={designPrompt}
                  onChange={(e) => setDesignPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <Button
                onClick={generateCodeFromDesign}
                disabled={isGenerating || (!designImage && !figmaUrl && !selectedWorkItem)}
                className="w-full mt-4"
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
                    <span>Analyzing design and generating code...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedCode ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Code2 className="w-5 h-5 mr-2" />
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
                    <Button
                      variant={previewMode === 'preview' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('preview')}
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
                  </div>
                </div>
                <CardDescription>
                  Generated {generatedCode.framework} component ready for implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewMode === 'preview' ? (
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
                    <div className="bg-white rounded shadow-sm p-6">
                      {/* CSS styles injected directly into the preview */}
                      <style 
                        dangerouslySetInnerHTML={{ 
                          __html: generatedCode.css 
                        }} 
                      />
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: generatedCode.html.replace(/className=/g, 'class=') 
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="javascript" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="javascript">React Component</TabsTrigger>
                      <TabsTrigger value="css">Styles</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                    </TabsList>
                    
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
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generatedCode.javascript}</code>
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
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generatedCode.css}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
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
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generatedCode.html}</code>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Upload a Figma design or select a work item to generate production-ready code with AI assistance.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tips:</strong> For best results, provide clear design files and specific requirements. 
          The generated code includes responsive design, accessibility features, and modern React patterns.
        </AlertDescription>
      </Alert>
    </div>
  );
} 