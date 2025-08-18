// Role-based Access Control Configuration
export interface UserRole {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  permissions: RolePermissions;
}

export interface RolePermissions {
  // AuraV2 Playbook Access
  aurav2: {
    dashboard: boolean;
    idea_stage: boolean;
    qualify_stage: boolean;
    prioritize_stage: boolean;
    settings: boolean;
  };
  
  // Legacy AURA Access
  legacy: {
    idea: boolean;
    work_items: boolean;
    design: boolean;
    code: boolean;
    test_cases: boolean;
    execution: boolean;
    defects: boolean;
    traceability: boolean;
    dashboard: boolean;
    requirements: boolean;
    decomposition: boolean;
    use_cases: boolean;
    migrate_data: boolean;
  };
  
  // Administrative Functions
  admin: {
    user_management: boolean;
    system_settings: boolean;
    data_migration: boolean;
    reports: boolean;
  };
}

// Define user roles with their specific access permissions
export const USER_ROLES: Record<string, UserRole> = {
  business_analyst: {
    id: 'business_analyst',
    name: 'Business Analyst',
    description: 'Captures and qualifies business ideas in the AuraV2 workflow',
    color: 'blue',
    icon: 'FileText',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: true,
        qualify_stage: true,
        prioritize_stage: false,
        settings: false,
      },
      legacy: {
        idea: false,
        work_items: false,
        design: false,
        code: false,
        test_cases: false,
        execution: false,
        defects: false,
        traceability: false,
        dashboard: false,
        requirements: false,
        decomposition: false,
        use_cases: false,
        migrate_data: false,
      },
      admin: {
        user_management: false,
        system_settings: false,
        data_migration: false,
        reports: true,
      },
    },
  },
  
  product_manager: {
    id: 'product_manager',
    name: 'Product Manager',
    description: 'Manages full AuraV2 workflow from idea capture to prioritization',
    color: 'purple',
    icon: 'Target',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: true,
        qualify_stage: true,
        prioritize_stage: true,
        settings: false,
      },
      legacy: {
        idea: false,
        work_items: false,
        design: false,
        code: false,
        test_cases: false,
        execution: false,
        defects: false,
        traceability: false,
        dashboard: false,
        requirements: false,
        decomposition: false,
        use_cases: false,
        migrate_data: false,
      },
      admin: {
        user_management: false,
        system_settings: false,
        data_migration: false,
        reports: true,
      },
    },
  },
  
  tech_lead: {
    id: 'tech_lead',
    name: 'Technical Lead',
    description: 'Technical oversight of AuraV2 workflow with limited legacy system access',
    color: 'green',
    icon: 'Code',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: false,
        qualify_stage: true,
        prioritize_stage: true,
        settings: false,
      },
      legacy: {
        idea: false,
        work_items: false,
        design: false,
        code: true,
        test_cases: false,
        execution: false,
        defects: false,
        traceability: false,
        dashboard: false,
        requirements: false,
        decomposition: false,
        use_cases: false,
        migrate_data: true,
      },
      admin: {
        user_management: false,
        system_settings: true,
        data_migration: true,
        reports: true,
      },
    },
  },
  
  qa_engineer: {
    id: 'qa_engineer',
    name: 'QA Engineer',
    description: 'Quality assurance focused on AuraV2 workflow processes',
    color: 'orange',
    icon: 'TestTube',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: false,
        qualify_stage: false,
        prioritize_stage: false,
        settings: false,
      },
      legacy: {
        idea: false,
        work_items: false,
        design: false,
        code: false,
        test_cases: false,
        execution: false,
        defects: false,
        traceability: false,
        dashboard: false,
        requirements: false,
        decomposition: false,
        use_cases: false,
        migrate_data: false,
      },
      admin: {
        user_management: false,
        system_settings: false,
        data_migration: false,
        reports: true,
      },
    },
  },
  
  admin: {
    id: 'admin',
    name: 'System Administrator',
    description: 'Full system access for administration and configuration',
    color: 'red',
    icon: 'Settings',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: true,
        qualify_stage: true,
        prioritize_stage: true,
        settings: true,
      },
      legacy: {
        idea: true,
        work_items: true,
        design: true,
        code: true,
        test_cases: true,
        execution: true,
        defects: true,
        traceability: true,
        dashboard: true,
        requirements: true,
        decomposition: true,
        use_cases: true,
        migrate_data: true,
      },
      admin: {
        user_management: true,
        system_settings: true,
        data_migration: true,
        reports: true,
      },
    },
  },
  
  stakeholder: {
    id: 'stakeholder',
    name: 'Business Stakeholder',
    description: 'Executive view of AuraV2 workflow progress and business outcomes',
    color: 'indigo',
    icon: 'Users',
    permissions: {
      aurav2: {
        dashboard: true,
        idea_stage: true,
        qualify_stage: false,
        prioritize_stage: true,
        settings: false,
      },
      legacy: {
        idea: false,
        work_items: false,
        design: false,
        code: false,
        test_cases: false,
        execution: false,
        defects: false,
        traceability: false,
        dashboard: false,
        requirements: false,
        decomposition: false,
        use_cases: false,
        migrate_data: false,
      },
      admin: {
        user_management: false,
        system_settings: false,
        data_migration: false,
        reports: true,
      },
    },
  },
};

// Helper functions for role management
export const getUserRole = (roleId: string): UserRole | null => {
  return USER_ROLES[roleId] || null;
};

export const hasPermission = (roleId: string, section: keyof RolePermissions, permission: string): boolean => {
  const role = getUserRole(roleId);
  if (!role) return false;
  
  const sectionPermissions = role.permissions[section] as Record<string, boolean>;
  return sectionPermissions[permission] || false;
};

export const getAccessibleRoutes = (roleId: string): string[] => {
  const role = getUserRole(roleId);
  if (!role) return [];
  
  const routes: string[] = [];
  
  // AuraV2 routes
  if (role.permissions.aurav2.dashboard) routes.push('/aurav2');
  if (role.permissions.aurav2.idea_stage) routes.push('/aurav2/idea');
  if (role.permissions.aurav2.qualify_stage) routes.push('/aurav2/qualify');
  if (role.permissions.aurav2.prioritize_stage) routes.push('/aurav2/prioritize');
  if (role.permissions.aurav2.settings) routes.push('/aurav2/settings');
  
  // Legacy routes
  if (role.permissions.legacy.idea) routes.push('/idea');
  if (role.permissions.legacy.work_items) routes.push('/work-items');
  if (role.permissions.legacy.design) routes.push('/design');
  if (role.permissions.legacy.code) routes.push('/code');
  if (role.permissions.legacy.test_cases) routes.push('/test-cases');
  if (role.permissions.legacy.execution) routes.push('/execution');
  if (role.permissions.legacy.defects) routes.push('/defects');
  if (role.permissions.legacy.traceability) routes.push('/traceability');
  if (role.permissions.legacy.dashboard) routes.push('/dashboard');
  if (role.permissions.legacy.requirements) routes.push('/requirements');
  if (role.permissions.legacy.decomposition) routes.push('/decomposition');
  if (role.permissions.legacy.use_cases) routes.push('/use-cases');
  if (role.permissions.legacy.migrate_data) routes.push('/migrate-data');
  
  return routes;
};

export const getRoleColor = (roleId: string): string => {
  const role = getUserRole(roleId);
  return role?.color || 'gray';
};

export const getRoleIcon = (roleId: string): string => {
  const role = getUserRole(roleId);
  return role?.icon || 'User';
};
