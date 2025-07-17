import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Epic {
  id: string;
  featureId: string; // Links back to the parent feature
  initiativeId: string; // Links back to the initiative
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
  estimatedEffort: string; // For sizing epics appropriately
  sprintEstimate: number; // Expected number of sprints
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  assignedTo?: string;
}

interface EpicState {
  epics: Epic[];
  addEpic: (epic: Epic) => void;
  addGeneratedEpics: (featureId: string, initiativeId: string, businessBriefId: string, generatedEpics: any[]) => Epic[];
  updateEpic: (id: string, updates: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;
  getEpicsByFeature: (featureId: string) => Epic[];
  getEpicsByInitiative: (initiativeId: string) => Epic[];
  getEpicsByBusinessBrief: (businessBriefId: string) => Epic[];
  getEpicById: (id: string) => Epic | undefined;
}

export const useEpicStore = create<EpicState>()(
  persist(
    (set, get) => ({
      epics: [],

      addEpic: (epic) =>
        set((state) => ({
          epics: [...state.epics, epic],
        })),

      addGeneratedEpics: (featureId, initiativeId, businessBriefId, generatedEpics) => {
        console.log('🔄 Adding generated epics to store...', { featureId, initiativeId, businessBriefId, count: generatedEpics.length });
        console.log('🔍 Raw epic data:', generatedEpics);
        
        // Parse JSON from text field if needed (similar to feature/initiative stores)
        let parsedEpics = generatedEpics;
        
        // Check if response needs parsing (OpenAI sometimes embeds JSON in text field)
        if (generatedEpics.length === 1 && 
            (generatedEpics[0].id === 'EPIC-PARSE-NEEDED' || 
             generatedEpics[0].category === 'needs-parsing' ||
             generatedEpics[0].text?.includes('```json'))) {
          
          console.log('🔍 Detected embedded JSON, parsing...');
          const textContent = generatedEpics[0].text;
          
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
            
            // Extract epics array
            if (parsed.epics && Array.isArray(parsed.epics)) {
              parsedEpics = parsed.epics;
              console.log('✅ Successfully parsed epics from JSON:', parsedEpics.length);
            } else {
              console.warn('⚠️ No epics array found in parsed JSON');
            }
          } catch (parseError) {
            console.error('❌ Failed to parse JSON from text field:', parseError);
            console.log('🔍 Trying to extract JSON manually...');
            
            // Try to extract epics manually if JSON parsing fails
            try {
              const epicsMatch = textContent.match(/"epics":\s*\[([\s\S]*?)\]/);
              if (epicsMatch) {
                const epicsStr = `[${epicsMatch[1]}]`;
                const manualParsed = JSON.parse(epicsStr);
                parsedEpics = manualParsed;
                console.log('✅ Successfully extracted epics manually:', parsedEpics.length);
              }
            } catch (manualError) {
              console.error('❌ Manual extraction also failed:', manualError);
            }
          }
        }

        const newEpics: Epic[] = parsedEpics.map((gen, index) => ({
          id: `epic-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}-${index}`,
          featureId,
          initiativeId,
          businessBriefId,
          title: gen.title || 'Untitled Epic',
          description: gen.description || 'No description provided.',
          rationale: gen.rationale || 'No rationale provided.',
          category: gen.category || 'functional',
          priority: gen.priority || 'medium',
          acceptanceCriteria: gen.acceptanceCriteria || ['To be defined'],
          businessValue: gen.businessValue || 'Business value to be determined',
          workflowLevel: gen.workflowLevel || 'epic',
          estimatedEffort: gen.estimatedEffort || 'TBD',
          sprintEstimate: gen.sprintEstimate || 1,
          status: 'draft' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'AI System',
        }));
        
        console.log('✅ Generated new unique IDs for epics:', newEpics.map(epic => epic.id));
        set((state) => ({
          epics: [...state.epics, ...newEpics],
        }));

        console.log('✅ Epics added to store successfully');
        return newEpics;
      },

      updateEpic: (id, updates) =>
        set((state) => ({
          epics: state.epics.map((epic) =>
            epic.id === id
              ? { ...epic, ...updates, updatedAt: new Date() }
              : epic
          ),
        })),

      deleteEpic: (id) =>
        set((state) => ({
          epics: state.epics.filter((epic) => epic.id !== id),
        })),

      getEpicsByFeature: (featureId) => {
        const state = get();
        return state.epics.filter((epic) => epic.featureId === featureId);
      },

      getEpicsByInitiative: (initiativeId) => {
        const state = get();
        return state.epics.filter((epic) => epic.initiativeId === initiativeId);
      },

      getEpicsByBusinessBrief: (businessBriefId) => {
        const state = get();
        return state.epics.filter((epic) => epic.businessBriefId === businessBriefId);
      },

      getEpicById: (id) => {
        const state = get();
        return state.epics.find((epic) => epic.id === id);
      },
    }),
    {
      name: 'aura-epics',
      // Persist all epic data
      partialize: (state) => ({ epics: state.epics }),
    }
  )
); 