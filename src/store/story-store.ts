import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Story {
  id: string;
  epicId: string; // Links back to the parent epic
  featureId: string; // Links back to the feature
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
  storyPoints: number; // For sprint planning
  assignee?: string;
  labels: string[]; // For categorization (frontend, backend, etc.)
  testingNotes: string; // Specific testing guidance
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

interface StoryState {
  stories: Story[];
  addStory: (story: Story) => void;
  addGeneratedStories: (epicId: string, featureId: string, initiativeId: string, businessBriefId: string, generatedStories: any[]) => Story[];
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  getStoriesByEpic: (epicId: string) => Story[];
  getStoriesByFeature: (featureId: string) => Story[];
  getStoriesByInitiative: (initiativeId: string) => Story[];
  getStoriesByBusinessBrief: (businessBriefId: string) => Story[];
  getStoryById: (id: string) => Story | undefined;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: [],

      addStory: (story) =>
        set((state) => ({
          stories: [...state.stories, story],
        })),

      addGeneratedStories: (epicId, featureId, initiativeId, businessBriefId, generatedStories) => {
        console.log('🔄 Adding generated stories to store...', { epicId, featureId, initiativeId, businessBriefId, count: generatedStories.length });
        console.log('🔍 Raw story data:', generatedStories);
        
        // Parse JSON from text field if needed (similar to other stores)
        let parsedStories = generatedStories;
        
        // Check if response needs parsing (OpenAI sometimes embeds JSON in text field)
        if (generatedStories.length === 1 && 
            (generatedStories[0].id === 'STORY-PARSE-NEEDED' || 
             generatedStories[0].category === 'needs-parsing' ||
             generatedStories[0].text?.includes('```json'))) {
          
          console.log('🔍 Detected embedded JSON, parsing...');
          const textContent = generatedStories[0].text;
          
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
            
            // Extract stories array
            if (parsed.stories && Array.isArray(parsed.stories)) {
              parsedStories = parsed.stories;
              console.log('✅ Successfully parsed stories from JSON:', parsedStories.length);
            } else {
              console.warn('⚠️ No stories array found in parsed JSON');
            }
          } catch (parseError) {
            console.error('❌ Failed to parse JSON from text field:', parseError);
            console.log('🔍 Trying to extract JSON manually...');
            
            // Try to extract stories manually if JSON parsing fails
            try {
              const storiesMatch = textContent.match(/"stories":\s*\[([\s\S]*?)\]/);
              if (storiesMatch) {
                const storiesStr = `[${storiesMatch[1]}]`;
                const manualParsed = JSON.parse(storiesStr);
                parsedStories = manualParsed;
                console.log('✅ Successfully extracted stories manually:', parsedStories.length);
              }
            } catch (manualError) {
              console.error('❌ Manual extraction also failed:', manualError);
            }
          }
        }

        const newStories: Story[] = parsedStories.map((gen, index) => ({
          id: `story-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}-${index}`,
          epicId,
          featureId,
          initiativeId,
          businessBriefId,
          title: gen.title || 'Untitled Story',
          description: gen.description || 'No description provided.',
          rationale: gen.rationale || 'No rationale provided.',
          category: gen.category || 'functional',
          priority: gen.priority || 'medium',
          acceptanceCriteria: gen.acceptanceCriteria || ['To be defined'],
          businessValue: gen.businessValue || 'Business value to be determined',
          workflowLevel: gen.workflowLevel || 'story',
          storyPoints: gen.storyPoints || 1,
          labels: gen.labels || [],
          testingNotes: gen.testingNotes || '',
          status: 'draft' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'AI System',
        }));
        
        console.log('✅ Generated new unique IDs for stories:', newStories.map(story => story.id));
        set((state) => ({
          stories: [...state.stories, ...newStories],
        }));
        
        return newStories;
      },

      updateStory: (id, updates) =>
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === id
              ? { ...story, ...updates, updatedAt: new Date() }
              : story
          ),
        })),

      deleteStory: (id) =>
        set((state) => ({
          stories: state.stories.filter((story) => story.id !== id),
        })),

      getStoriesByEpic: (epicId) => {
        const state = get();
        return state.stories.filter((story) => story.epicId === epicId);
      },

      getStoriesByFeature: (featureId) => {
        const state = get();
        return state.stories.filter((story) => story.featureId === featureId);
      },

      getStoriesByInitiative: (initiativeId) => {
        const state = get();
        return state.stories.filter((story) => story.initiativeId === initiativeId);
      },

      getStoriesByBusinessBrief: (businessBriefId) => {
        const state = get();
        return state.stories.filter((story) => story.businessBriefId === businessBriefId);
      },

      getStoryById: (id) => {
        const state = get();
        return state.stories.find((story) => story.id === id);
      },
    }),
    {
      name: 'aura-stories',
      // Persist all story data
      partialize: (state) => ({ stories: state.stories }),
    }
  )
); 