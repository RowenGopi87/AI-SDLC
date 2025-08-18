"use client";

import { useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Settings, 
  Brain, 
  Key, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const {
    llmSettings,
    availableProviders,
    setLLMProvider,
    setLLMModel,
    setAPIKey,
    setLLMSettings,
    resetLLMSettings,
    validateSettings,
    getCurrentProvider,
    getCurrentModel
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(llmSettings.apiKey);
  const [tempTemperature, setTempTemperature] = useState(llmSettings.temperature?.toString() || '0.7');
  const [tempMaxTokens, setTempMaxTokens] = useState(llmSettings.maxTokens?.toString() || '4000');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const currentProvider = getCurrentProvider();
  const currentModel = getCurrentModel();
  const isValid = validateSettings();

  const handleProviderChange = (provider: string) => {
    setLLMProvider(provider);
    // Reset API key when changing providers
    setTempApiKey('');
  };

  const handleModelChange = (model: string) => {
    setLLMModel(model);
    const selectedModel = currentProvider?.models.find(m => m.id === model);
    if (selectedModel?.maxTokens) {
      setTempMaxTokens(selectedModel.maxTokens.toString());
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Validate inputs
      const temperature = parseFloat(tempTemperature);
      const maxTokens = parseInt(tempMaxTokens);

      if (isNaN(temperature) || temperature < 0 || temperature > 2) {
        throw new Error('Temperature must be between 0 and 2');
      }

      if (isNaN(maxTokens) || maxTokens < 1) {
        throw new Error('Max tokens must be a positive number');
      }

      // Save all settings
      setAPIKey(tempApiKey);
      setLLMSettings({
        temperature,
        maxTokens
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetLLMSettings();
    setTempApiKey('');
    setTempTemperature('0.7');
    setTempMaxTokens('4000');
    setSaveStatus('idle');
    // Clear any cached settings that might have file paths
    localStorage.removeItem('aura-settings');
  };

  const getProviderDescription = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'OpenAI provides state-of-the-art language models including GPT-4 and GPT-3.5 Turbo.';
      case 'google':
        return 'Google AI offers Gemini models with advanced reasoning and multimodal capabilities.';
      default:
        return '';
    }
  };

  const getApiKeyPlaceholder = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'sk-...';
      case 'google':
        return 'AI...';
      default:
        return 'Enter API key';
    }
  };

  const getApiKeyInstructions = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'Get your OpenAI API key from platform.openai.com/api-keys';
      case 'google':
        return 'Get your Google AI API key from aistudio.google.com/app/apikey';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure LLM providers and API settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {isValid && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Ready
            </Badge>
          )}
          {!isValid && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle size={14} className="mr-1" />
              Configuration Required
            </Badge>
          )}
        </div>
      </div>

      {/* LLM Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>LLM Provider Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure your preferred language model provider and settings for requirements generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={llmSettings.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentProvider && (
              <p className="text-sm text-gray-600">{getProviderDescription(currentProvider.id)}</p>
            )}
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={llmSettings.model} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        {model.description && (
                          <span className="text-xs text-gray-500">{model.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentModel && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Max Tokens: {currentModel.maxTokens?.toLocaleString()}</span>
                  {currentModel.description && (
                    <span>{currentModel.description}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* API Key Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-gray-600" />
              <Label htmlFor="apiKey">API Key</Label>
            </div>
            
            {currentProvider && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  {getApiKeyInstructions(currentProvider.id)}
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={currentProvider ? getApiKeyPlaceholder(currentProvider.id) : 'Enter API key'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Advanced Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tempTemperature}
                  onChange={(e) => setTempTemperature(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Controls randomness. Lower = more focused, Higher = more creative (0-2)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  value={tempMaxTokens}
                  onChange={(e) => setTempMaxTokens(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Maximum number of tokens in the response
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw size={16} className="mr-2" />
          Reset to Defaults
        </Button>
        
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Saved Successfully
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle size={14} className="mr-1" />
              Save Failed
            </Badge>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Provider:</span>
              <span className="text-sm">{currentProvider?.name || 'Not selected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model:</span>
              <span className="text-sm">{currentModel?.name || 'Not selected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Key:</span>
              <span className="text-sm">
                {tempApiKey ? '••••••••' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isValid ? 'default' : 'secondary'}>
                {isValid ? 'Ready for Requirements Generation' : 'Configuration Incomplete'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 