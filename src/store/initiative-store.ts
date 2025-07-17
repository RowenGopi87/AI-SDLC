import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Initiative {
  id: string;
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

interface InitiativeState {
  initiatives: Initiative[];
  addInitiative: (initiative: Initiative) => void;
  addGeneratedInitiatives: (businessBriefId: string, generatedInitiatives: any[]) => Initiative[];
  updateInitiative: (id: string, updates: Partial<Initiative>) => void;
  deleteInitiative: (id: string) => void;
  getInitiativesByBusinessBrief: (businessBriefId: string) => Initiative[];
  getInitiativeById: (id: string) => Initiative | undefined;
}

export const useInitiativeStore = create<InitiativeState>()(
  persist(
    (set, get) => ({
      initiatives: [],

      addInitiative: (initiative) =>
        set((state) => ({
          initiatives: [...state.initiatives, initiative],
        })),

      addGeneratedInitiatives: (businessBriefId, generatedInitiatives) => {
        console.log('🔄 Adding generated initiatives to store...', { businessBriefId, count: generatedInitiatives.length });
        console.log('🔍 Raw response data:', generatedInitiatives);
        
        // Parse JSON from text field if needed (similar to requirements store)
        let parsedInitiatives = generatedInitiatives;
        
        // Check if response needs parsing (OpenAI sometimes embeds JSON in text field)
        if (generatedInitiatives.length === 1 && 
            (generatedInitiatives[0].id === 'INIT-PARSE-NEEDED' || 
             generatedInitiatives[0].category === 'needs-parsing' ||
             generatedInitiatives[0].text?.includes('```json'))) {
          
          console.log('🔍 Detected embedded JSON, parsing...');
          const textContent = generatedInitiatives[0].text;
          
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
            
            // Extract initiatives array
            if (parsed.initiatives && Array.isArray(parsed.initiatives)) {
              parsedInitiatives = parsed.initiatives;
              console.log('✅ Successfully parsed initiatives from JSON:', parsedInitiatives.length);
            } else {
              console.warn('⚠️ No initiatives array found in parsed JSON');
            }
          } catch (parseError) {
            console.error('❌ Failed to parse JSON from text field:', parseError);
            console.log('🔍 Trying to extract JSON manually...');
            
            // Try to extract initiatives manually if JSON parsing fails
            try {
              const initiativesMatch = textContent.match(/"initiatives":\s*\[([\s\S]*?)\]/);
              if (initiativesMatch) {
                const initiativesStr = `[${initiativesMatch[1]}]`;
                const manualParsed = JSON.parse(initiativesStr);
                parsedInitiatives = manualParsed;
                console.log('✅ Successfully extracted initiatives manually:', parsedInitiatives.length);
              }
            } catch (manualError) {
              console.error('❌ Manual extraction also failed:', manualError);
            }
          }
        }

        const newInitiatives: Initiative[] = parsedInitiatives.map((gen, index) => ({
          id: `init-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}-${index}`,
          businessBriefId,
          title: gen.title || 'Untitled Initiative',
          description: gen.description || 'No description provided.',
          rationale: gen.rationale || 'No rationale provided.',
          category: gen.category || 'strategic',
          priority: gen.priority || 'medium',
          acceptanceCriteria: gen.acceptanceCriteria || ['To be defined'],
          businessValue: gen.businessValue || 'Business value to be determined',
          workflowLevel: gen.workflowLevel || 'initiative',
          status: 'draft' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'AI System',
        }));

        console.log('✅ Generated new unique IDs for initiatives:', newInitiatives.map(init => init.id));
        set((state) => ({
          initiatives: [...state.initiatives, ...newInitiatives],
        }));

        console.log('✅ Initiatives added to store successfully');
        return newInitiatives;
      },

      updateInitiative: (id, updates) =>
        set((state) => ({
          initiatives: state.initiatives.map((initiative) =>
            initiative.id === id
              ? { ...initiative, ...updates, updatedAt: new Date() }
              : initiative
          ),
        })),

      deleteInitiative: (id) =>
        set((state) => ({
          initiatives: state.initiatives.filter((initiative) => initiative.id !== id),
        })),

      getInitiativesByBusinessBrief: (businessBriefId) => {
        const state = get();
        return state.initiatives.filter((initiative) => initiative.businessBriefId === businessBriefId);
      },

      getInitiativeById: (id) => {
        const state = get();
        return state.initiatives.find((initiative) => initiative.id === id);
      },
    }),
    {
      name: 'aura-initiatives',
      // Persist all initiative data
      partialize: (state) => ({ initiatives: state.initiatives }),
    }
  )
); 