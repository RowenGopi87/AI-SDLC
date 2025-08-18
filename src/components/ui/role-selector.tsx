"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Target, 
  Code, 
  TestTube, 
  Settings,
  CheckCircle,
  User,
  Shield
} from "lucide-react";
import { USER_ROLES } from '@/lib/config/roles';
import { useRoleStore } from '@/store/role-store';

const iconMap = {
  Users,
  FileText, 
  Target,
  Code,
  TestTube,
  Settings,
  User,
  Shield
};

interface RoleSelectorProps {
  onRoleSelected?: () => void;
}

export function RoleSelector({ onRoleSelected }: RoleSelectorProps) {
  const { setRole, currentRole } = useRoleStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(currentRole);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const confirmRoleSelection = () => {
    if (selectedRole) {
      setRole(selectedRole);
      onRoleSelected?.();
    }
  };

  const getRoleColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "transition-all duration-200 cursor-pointer border-2 rounded-lg p-4 shadow-md hover:shadow-lg";
    
    if (isSelected) {
      switch (color) {
        case 'blue': return `${baseClasses} border-blue-500 bg-blue-50`;
        case 'purple': return `${baseClasses} border-purple-500 bg-purple-50`;
        case 'green': return `${baseClasses} border-green-500 bg-green-50`;
        case 'orange': return `${baseClasses} border-orange-500 bg-orange-50`;
        case 'red': return `${baseClasses} border-red-500 bg-red-50`;
        case 'indigo': return `${baseClasses} border-indigo-500 bg-indigo-50`;
        default: return `${baseClasses} border-gray-500 bg-gray-50`;
      }
    }
    
    return `${baseClasses} border-gray-300 bg-white hover:border-gray-400`;
  };

  const getIconColorClass = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'text-gray-600';
    
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'green': return 'text-green-600';
      case 'orange': return 'text-orange-600';
      case 'red': return 'text-red-600';
      case 'indigo': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="border border-gray-400 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield size={20} className="text-blue-600" />
          <span>Select Your Role</span>
        </CardTitle>
        <CardDescription>
          Choose your role to customize the interface and access appropriate features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.values(USER_ROLES).map((role) => {
            const IconComponent = iconMap[role.icon as keyof typeof iconMap] || User;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                className={getRoleColorClasses(role.color, isSelected)}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="flex items-start space-x-3">
                                      <div className="p-2 rounded-lg bg-blue-100">
                    <IconComponent 
                      size={20} 
                      className={getIconColorClass(role.color, isSelected)} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{role.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{role.description}</p>
                    
                    {/* Permission Preview */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium">Access Includes:</div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.aurav2.idea_stage && (
                          <Badge variant="outline" className="text-xs">Idea Stage</Badge>
                        )}
                        {role.permissions.aurav2.qualify_stage && (
                          <Badge variant="outline" className="text-xs">Qualify</Badge>
                        )}
                        {role.permissions.aurav2.prioritize_stage && (
                          <Badge variant="outline" className="text-xs">Prioritize</Badge>
                        )}
                        {role.permissions.legacy.code && (
                          <Badge variant="outline" className="text-xs">Code</Badge>
                        )}
                        {role.permissions.legacy.test_cases && (
                          <Badge variant="outline" className="text-xs">Testing</Badge>
                        )}
                        {role.permissions.admin.user_management && (
                          <Badge variant="outline" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle size={16} className={getIconColorClass(role.color, true)} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedRole && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                Role Selected: {USER_ROLES[selectedRole].name}
              </span>
            </div>
            <Button onClick={confirmRoleSelection} className="flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>Continue as {USER_ROLES[selectedRole].name}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
