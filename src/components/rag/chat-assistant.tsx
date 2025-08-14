'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, FileUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

interface ChatAssistantProps {
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export function ChatAssistant({ position = 'bottom-right', theme = 'light' }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ragStatus, setRagStatus] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load RAG status on mount
  useEffect(() => {
    if (isOpen && !ragStatus) {
      fetchRagStatus();
    }
  }, [isOpen]);

  const fetchRagStatus = async () => {
    try {
      const response = await fetch('/api/rag/status');
      const status = await response.json();
      setRagStatus(status);
    } catch (error) {
      console.error('Failed to fetch RAG status:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          includeContext: true
        })
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          confidence: result.data.confidence,
          sources: result.data.sources
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(result.data.conversationId);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100';
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="ml-2 hidden md:inline">Ask Aura Assistant</span>
        </Button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <Card className="w-96 h-[600px] shadow-xl border-0 bg-white">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Aura Assistant</h3>
                <p className="text-xs opacity-90">
                  {ragStatus?.healthy ? 'Ready to help' : 'Basic mode'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    Hi! I'm your Aura assistant. Ask me about:
                  </p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>• Work item status</li>
                    <li>• SAFe framework guidance</li>
                    <li>• Testing & design strategies</li>
                    <li>• General SDLC questions</li>
                  </ul>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatTimestamp(msg.timestamp)}</span>
                      
                      {msg.role === 'assistant' && msg.confidence !== undefined && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getConfidenceColor(msg.confidence)}`}
                        >
                          {Math.round(msg.confidence * 100)}% confident
                        </Badge>
                      )}
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium mb-1">Sources:</p>
                        {msg.sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Status Bar */}
            {ragStatus && (
              <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${ragStatus.healthy ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>
                    {ragStatus.services?.embedding?.enabled ? 'Full features' : 'Basic mode'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <FileUp className="h-3 w-3" />
                  <span className="ml-1">Upload</span>
                </Button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your projects..."
                  className="flex-1 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ChatAssistant;
