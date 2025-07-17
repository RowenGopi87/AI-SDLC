import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Feature {
  id: string;
  initiativeId: string; // Links back to the parent initiative
  businessBriefId: string; // Links back to the business brief
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
  status: 'draft' | 'active' | 'completed' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  assignedTo?: string;
}

interface FeatureState {
  features: Feature[];
  addFeature: (feature: Feature) => void;
  addGeneratedFeatures: (initiativeId: string, businessBriefId: string, generatedFeatures: any[]) => Feature[];
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  deleteFeature: (id: string) => void;
  getFeaturesByInitiative: (initiativeId: string) => Feature[];
  getFeaturesByBusinessBrief: (businessBriefId: string) => Feature[];
  getFeatureById: (id: string) => Feature | undefined;
  clearFeaturesByInitiative: (initiativeId: string) => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      features: [],

      addFeature: (feature) =>
        set((state) => ({
          features: [...state.features, feature],
        })),

      addGeneratedFeatures: (initiativeId, businessBriefId, generatedFeatures) => {
        console.log('🔄 Adding generated features to store...', { initiativeId, businessBriefId, count: generatedFeatures.length });
        console.log('🔍 Raw feature data:', generatedFeatures);
        console.log('🔍 Current features in store before adding:', get().features.length);
        console.log('🔍 Existing features for this initiative:', get().features.filter(f => f.initiativeId === initiativeId).length);
        
        // Parse JSON from text field if needed (similar to initiative store)
        let parsedFeatures = generatedFeatures;
        
        // Check if response needs parsing (OpenAI sometimes embeds JSON in text field)
        if (generatedFeatures.length === 1 && 
            (generatedFeatures[0].id === 'FEA-PARSE-NEEDED' || 
             generatedFeatures[0].category === 'needs-parsing' ||
             generatedFeatures[0].text?.includes('```json'))) {
          
          console.log('🔍 Detected embedded JSON, parsing...');
          const textContent = generatedFeatures[0].text;
          
          try {
            // Extract JSON from markdown code blocks or raw text
            let jsonStr = textContent;
            if (textContent.includes('```json')) {
              const match = textContent.match(/```json\s*\n([\s\S]*?)\n```/);
              if (match) {
                jsonStr = match[1];
              }
            }
            
            // Parse the JSON
            const parsed = JSON.parse(jsonStr);
            console.log('🔍 Parsed JSON:', parsed);
            
            // Extract features array
            if (parsed.features && Array.isArray(parsed.features)) {
              parsedFeatures = parsed.features;
              console.log('✅ Successfully parsed features from JSON:', parsedFeatures.length);
            } else {
              console.warn('⚠️ No features array found in parsed JSON');
            }
          } catch (parseError) {
            console.error('❌ Failed to parse JSON from text field:', parseError);
            console.log('🔍 Trying to extract JSON manually...');
            
            // Try to extract features manually if JSON parsing fails
            try {
              const featuresMatch = textContent.match(/"features":\s*\[([\s\S]*?)\]/);
              if (featuresMatch) {
                const featuresStr = `[${featuresMatch[1]}]`;
                const manualParsed = JSON.parse(featuresStr);
                parsedFeatures = manualParsed;
                console.log('✅ Successfully extracted features manually:', parsedFeatures.length);
              }
            } catch (manualError) {
              console.error('❌ Manual extraction also failed:', manualError);
            }
          }
        }

        const newFeatures: Feature[] = parsedFeatures.map((gen, index) => ({
          id: `feat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}-${index}`,
          initiativeId,
          businessBriefId,
          title: gen.title || 'Untitled Feature',
          description: gen.description || 'No description provided.',
          rationale: gen.rationale || 'No rationale provided.',
          category: gen.category || 'functional',
          priority: gen.priority || 'medium',
          acceptanceCriteria: gen.acceptanceCriteria || ['To be defined'],
          businessValue: gen.businessValue || 'Business value to be determined',
          workflowLevel: gen.workflowLevel || 'feature',
          status: 'draft' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'AI System',
        }));

        console.log('✅ Generated new unique IDs for features:', newFeatures.map(feat => feat.id));
        console.log('🔍 Generated features preview:', newFeatures.map(feat => ({ id: feat.id, title: feat.title, initiativeId: feat.initiativeId })));
        console.log('🔍 About to add features with initiativeId:', initiativeId);

        set((state) => ({
          features: [...state.features, ...newFeatures],
        }));

        console.log('✅ Features added to store successfully');
        console.log('🔍 Total features in store after adding:', get().features.length);
        console.log('🔍 Features for this initiative after adding:', get().features.filter(f => f.initiativeId === initiativeId).length);
        return newFeatures;
      },

      updateFeature: (id, updates) =>
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id
              ? { ...feature, ...updates, updatedAt: new Date() }
              : feature
          ),
        })),

      deleteFeature: (id) =>
        set((state) => ({
          features: state.features.filter((feature) => feature.id !== id),
        })),

      getFeaturesByInitiative: (initiativeId) => {
        const state = get();
        const filteredFeatures = state.features.filter((feature) => feature.initiativeId === initiativeId);
        console.log(`🔍 getFeaturesByInitiative(${initiativeId}): Found ${filteredFeatures.length} features`);
        return filteredFeatures;
      },

      getFeaturesByBusinessBrief: (businessBriefId) => {
        const state = get();
        return state.features.filter((feature) => feature.businessBriefId === businessBriefId);
      },

      getFeatureById: (id) => {
        const state = get();
        return state.features.find((feature) => feature.id === id);
      },

      // Debug helper to clear features by initiative
      clearFeaturesByInitiative: (initiativeId: string) => {
        console.log(`🧹 Clearing features for initiative ${initiativeId}`);
        set((state) => ({
          features: state.features.filter((feature) => feature.initiativeId !== initiativeId),
        }));
      },
    }),
    {
      name: 'aura-features',
      // Persist all feature data
      partialize: (state) => ({ features: state.features }),
    }
  )
); 