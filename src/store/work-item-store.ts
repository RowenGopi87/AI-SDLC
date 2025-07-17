import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkItem, mockWorkItems } from '@/lib/mock-data';

interface WorkItemStore {
  workItems: WorkItem[];
  selectedWorkItem: WorkItem | null;
  addWorkItem: (workItem: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  deleteWorkItem: (id: string) => void;
  selectWorkItem: (id: string) => void;
  clearSelection: () => void;
  getWorkItemById: (id: string) => WorkItem | undefined;
  getWorkItemsByParentId: (parentId: string) => WorkItem[];
  getWorkItemsByType: (type: WorkItem['type']) => WorkItem[];
  getWorkItemsByStatus: (status: WorkItem['status']) => WorkItem[];
  getWorkItemHierarchy: () => WorkItem[];
}

export const useWorkItemStore = create<WorkItemStore>()(
  persist(
    (set, get) => ({
  workItems: mockWorkItems,
  selectedWorkItem: null,

  addWorkItem: (workItem) => {
    const newWorkItem: WorkItem = {
      ...workItem,
      id: `wi-${Date.now().toString(36)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      workItems: [...state.workItems, newWorkItem],
    }));
  },

  updateWorkItem: (id, updates) => {
    set((state) => ({
      workItems: state.workItems.map((workItem) =>
        workItem.id === id ? { ...workItem, ...updates } : workItem
      ),
    }));
  },

  deleteWorkItem: (id) => {
    set((state) => ({
      workItems: state.workItems.filter((workItem) => workItem.id !== id),
      selectedWorkItem: state.selectedWorkItem?.id === id ? null : state.selectedWorkItem,
    }));
  },

  selectWorkItem: (id) => {
    const workItem = get().workItems.find((wi) => wi.id === id);
    set({ selectedWorkItem: workItem || null });
  },

  clearSelection: () => {
    set({ selectedWorkItem: null });
  },

  getWorkItemById: (id) => {
    return get().workItems.find((workItem) => workItem.id === id);
  },

  getWorkItemsByParentId: (parentId) => {
    return get().workItems.filter((workItem) => workItem.parentId === parentId);
  },

  getWorkItemsByType: (type) => {
    return get().workItems.filter((workItem) => workItem.type === type);
  },

  getWorkItemsByStatus: (status) => {
    return get().workItems.filter((workItem) => workItem.status === status);
  },

  getWorkItemHierarchy: () => {
    const items = get().workItems;
    const rootItems = items.filter((item) => !item.parentId);
    
    const buildHierarchy = (item: WorkItem): WorkItem & { children?: WorkItem[] } => {
      const children = items.filter((child) => child.parentId === item.id);
      return {
        ...item,
        children: children.length > 0 ? children.map(buildHierarchy) : undefined,
      };
    };
    
    return rootItems.map(buildHierarchy);
  },
}),
{
  name: 'work-item-storage',
  // Persist all work item data
}
)
); 