"use client";

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChatAssistantEmbedded } from '@/components/rag/chat-assistant-improved';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bot,
  X,
  Minimize2,
  Maximize2,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export function RightPanel() {
  const { 
    rightPanelOpen, 
    rightPanelCollapsed, 
    toggleRightPanel, 
    toggleRightPanelCollapsed, 
    getRightPanelWidth 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('assistant');
  const panelWidth = getRightPanelWidth();

  // Always render on desktop, handle mobile via CSS classes
  return (
    <div className={cn(
      "fixed inset-y-0 right-0 z-50 flex flex-col bg-white border-l-2 border-gray-300 shadow-sm transition-all duration-300 ease-in-out overflow-hidden",
      "md:block",
      rightPanelCollapsed ? "w-20" : "", // Increased from w-16 to w-20 for better icon spacing
      !rightPanelOpen && "md:block hidden"
    )}
    style={{
      width: rightPanelOpen ? `${panelWidth}px` : '0px'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightPanelCollapsed}
          className="p-2"
        >
          {rightPanelCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
        
        {!rightPanelCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Aura Assistant</div>
                <div className="text-xs text-gray-500">AI-Powered Helper</div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
          </div>
        )}
        
        {rightPanelCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Tabs - only show when expanded */}
      {!rightPanelCollapsed && (
        <div className="border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'assistant' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('assistant')}
              className="h-8 px-3 text-xs"
            >
              <MessageSquare size={14} className="mr-1" />
              Chat
            </Button>
            <Button
              variant={activeTab === 'help' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('help')}
              className="h-8 px-3 text-xs"
            >
              <HelpCircle size={14} className="mr-1" />
              Help
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="h-8 px-3 text-xs"
            >
              <Settings size={14} className="mr-1" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {rightPanelCollapsed ? (
          /* Collapsed state - show icons only */
          <div className="p-2 space-y-2 overflow-y-auto chat-scroll">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('assistant');
                toggleRightPanelCollapsed();
              }}
              className="w-full p-2 h-12"
              title="Open Aura Assistant"
            >
              <MessageSquare size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('help');
                toggleRightPanelCollapsed();
              }}
              className="w-full p-2 h-12"
              title="Help & Documentation"
            >
              <HelpCircle size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('settings');
                toggleRightPanelCollapsed();
              }}
              className="w-full p-2 h-12"
              title="Assistant Settings"
            >
              <Settings size={18} />
            </Button>
          </div>
        ) : (
          /* Expanded state - show full content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'assistant' && (
              <div className="flex-1 flex flex-col min-h-0">
                <ChatAssistantEmbedded className="h-full" />
              </div>
            )}
            
            {activeTab === 'help' && (
              <div className="flex-1 overflow-y-auto chat-scroll">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Documentation</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Bot size={16} className="mr-2" />
                        Aura Assistant
                      </h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Your AI-powered assistant for navigating the AuraV2 workflow and getting help with tasks.
                      </p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div>• Ask questions about business briefs</div>
                        <div>• Get guidance on workflow stages</div>
                        <div>• Request help with AI assessments</div>
                        <div>• Navigate between features</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Quick Commands</h4>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div><code className="bg-white px-1 rounded">/help</code> - Show available commands</div>
                        <div><code className="bg-white px-1 rounded">/assess [brief-id]</code> - Run quality assessment</div>
                        <div><code className="bg-white px-1 rounded">/navigate [page]</code> - Go to specific page</div>
                        <div><code className="bg-white px-1 rounded">/status</code> - Show workflow status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto chat-scroll">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistant Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">AI Preferences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Auto-suggest actions</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Show typing indicators</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Context awareness</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Display Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Compact mode</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Show timestamps</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Close Button */}
      <div className="md:hidden absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightPanel}
          className="p-2"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
