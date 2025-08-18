import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LLMProvider {
  id: string;
  name: string;
  models: LLMModel[];
}

export interface LLMModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
}

export interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

interface SettingsStore {
  // LLM Configuration
  llmSettings: LLMSettings;
  availableProviders: LLMProvider[];
  
  // Actions
  setLLMProvider: (provider: string) => void;
  setLLMModel: (model: string) => void;
  setAPIKey: (apiKey: string) => void;
  setLLMSettings: (settings: Partial<LLMSettings>) => void;
  resetLLMSettings: () => void;
  validateSettings: () => boolean;
  getCurrentProvider: () => LLMProvider | undefined;
  getCurrentModel: () => LLMModel | undefined;
}

const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model, best for complex reasoning',
        maxTokens: 8192
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Faster and more efficient GPT-4',
        maxTokens: 128000
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for most tasks',
        maxTokens: 4096
      }
    ]
  },
  {
    id: 'google',
    name: 'Google AI (Gemini)',
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Google\'s most capable model',
        maxTokens: 30720
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Multimodal model with vision capabilities',
        maxTokens: 30720
      }
    ]
  }
];

const DEFAULT_SETTINGS: LLMSettings = {
  provider: 'openai',
  model: 'gpt-4',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 4000 // Conservative default to avoid token limit issues
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      llmSettings: DEFAULT_SETTINGS,
      availableProviders: DEFAULT_PROVIDERS,

      setLLMProvider: (provider: string) => {
        const providerData = get().availableProviders.find(p => p.id === provider);
        const defaultModel = providerData?.models[0]?.id || '';
        
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            provider,
            model: defaultModel
          }
        }));
      },

      setLLMModel: (model: string) => {
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            model
          }
        }));
      },

      setAPIKey: (apiKey: string) => {
        // Validate API key format and reject file paths
        if (apiKey && (apiKey.includes('\\') || apiKey.includes('/') || apiKey.includes(':'))) {
          console.error('❌ Invalid API key format detected (contains file path characters)');
          console.log('💡 API key should start with sk- for OpenAI or AI for Google');
          return;
        }
        
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            apiKey
          }
        }));
      },

      setLLMSettings: (settings: Partial<LLMSettings>) => {
        set((state) => ({
          llmSettings: {
            ...state.llmSettings,
            ...settings
          }
        }));
      },

      resetLLMSettings: () => {
        set({ llmSettings: DEFAULT_SETTINGS });
      },

      validateSettings: () => {
        const { llmSettings } = get();
        return !!(llmSettings.provider && llmSettings.model && llmSettings.apiKey);
      },

      getCurrentProvider: () => {
        const { llmSettings, availableProviders } = get();
        return availableProviders.find(p => p.id === llmSettings.provider);
      },

      getCurrentModel: () => {
        const { llmSettings } = get();
        const provider = get().getCurrentProvider();
        return provider?.models.find(m => m.id === llmSettings.model);
      }
    }),
    {
      name: 'aura-settings',
      // Persist all settings including API key (user responsibility for security)
      partialize: (state) => ({
        llmSettings: {
          provider: state.llmSettings.provider,
          model: state.llmSettings.model,
          temperature: state.llmSettings.temperature,
          maxTokens: state.llmSettings.maxTokens,
          // Persist API key for convenience (user should secure their environment)
          apiKey: state.llmSettings.apiKey
        }
      })
    }
  )
); 