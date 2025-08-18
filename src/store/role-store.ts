import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_ROLES, UserRole, hasPermission, getAccessibleRoutes } from '@/lib/config/roles';

interface RoleState {
  currentRole: string | null;
  isRoleSelected: boolean;
  
  // Actions
  setRole: (roleId: string) => void;
  clearRole: () => void;
  hasAccess: (section: 'aurav2' | 'legacy' | 'admin', permission: string) => boolean;
  getAccessibleRoutes: () => string[];
  getCurrentRole: () => UserRole | null;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      isRoleSelected: false,
      
      setRole: (roleId: string) => {
        if (USER_ROLES[roleId]) {
          set({ 
            currentRole: roleId, 
            isRoleSelected: true 
          });
        }
      },
      
      clearRole: () => {
        set({ 
          currentRole: null, 
          isRoleSelected: false 
        });
      },
      
      hasAccess: (section: 'aurav2' | 'legacy' | 'admin', permission: string): boolean => {
        const { currentRole } = get();
        if (!currentRole) return false;
        return hasPermission(currentRole, section, permission);
      },
      
      getAccessibleRoutes: (): string[] => {
        const { currentRole } = get();
        if (!currentRole) return [];
        return getAccessibleRoutes(currentRole);
      },
      
      getCurrentRole: (): UserRole | null => {
        const { currentRole } = get();
        if (!currentRole) return null;
        return USER_ROLES[currentRole] || null;
      },
    }),
    {
      name: 'aura-role-storage',
      partialize: (state) => ({ 
        currentRole: state.currentRole, 
        isRoleSelected: state.isRoleSelected 
      }),
    }
  )
);
