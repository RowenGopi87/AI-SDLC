// Quick setup script for OpenAI API Key
// You can run this directly in the browser console or import it

import { useSettingsStore } from './store/settings-store';
import { useInitiativeStore } from './store/initiative-store';

// Method 1: Direct function call with environment variable
export const configureOpenAI = () => {
  // Get API key from environment variable or localStorage
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                 localStorage.getItem('openai_api_key') || 
                 'your-api-key-here';
  const model = 'gpt-4';
  
  if (apiKey === 'your-api-key-here') {
    console.log('⚠️ Please set your OpenAI API key in environment variables or through the Settings page');
    console.log('💡 You can set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file');
    return;
  }
  
  // Configure settings using the store
  const { setLLMSettings } = useSettingsStore.getState();
  setLLMSettings({
    provider: 'openai',
    model: model,
    apiKey: apiKey,
    temperature: 0.7,
    maxTokens: 4000
  });
  
  console.log('🎉 OpenAI configured successfully!');
  console.log('You can now generate initiatives from business briefs.');
};

// Debug helper to check initiatives
export const checkInitiatives = () => {
  const { initiatives } = useInitiativeStore.getState();
  console.log('🔍 Current initiatives in store:', initiatives.length);
  console.log('📋 Initiatives:', initiatives.map(init => ({ 
    id: init.id, 
    title: init.title, 
    businessBriefId: init.businessBriefId 
  })));
  return initiatives;
};

// Method 2: Browser console helper
if (typeof window !== 'undefined') {
  (window as any).configureOpenAI = configureOpenAI;
  (window as any).checkInitiatives = checkInitiatives;
  console.log('🔧 Debug helpers available: configureOpenAI(), checkInitiatives()');
}

// Method 3: Auto-configure on import (only if env var is set)
if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  configureOpenAI();
} 