'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
}

interface ChatResponse {
  message: string;
  context: any[];
  sources: string[];
  confidence: number;
  conversationId: string;
}

interface ChatAssistantEmbeddedProps {
  className?: string;
}

export function ChatAssistantEmbedded({ className = '' }: ChatAssistantEmbeddedProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm **Aura**, your intelligent SDLC assistant.\n\nI can help you with:\n• Work item status and progress\n• Project insights and analytics  \n• SAFe framework guidance\n• Development best practices\n\n*Try asking: \"What's the status of BB-004?\" or \"How many business briefs are approved?\"*",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/•\s/g, '<span class="text-blue-600">•</span> ')
      .replace(/\n/g, '<br />');
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          conversationId: conversationId || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const chatResponse: ChatResponse = data.data.response ? data.data : data.data;
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatResponse.message || chatResponse.response,
          timestamp: new Date(),
          sources: chatResponse.sources || [],
          confidence: chatResponse.confidence
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(chatResponse.conversationId);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error while processing your request. Please try again.\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error'}*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Messages Area */}
      <div 
        id="chat-messages-area"
        className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-blue-50 chat-scroll" 
        style={{ 
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          minHeight: 0, // Allow flex shrinking
          maxHeight: '70vh', // Set max height to force overflow
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'auto',
          scrollbarColor: '#374151 #f3f4f6'
        }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md shadow-lg'
                    : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                } p-4 transition-all duration-200 hover:shadow-md`}
              >
                {/* Message Content */}
                <div 
                  className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessage(message.content) 
                  }}
                />
                
                {/* Timestamp & Confidence */}
                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                  message.role === 'user' 
                    ? 'border-blue-500 border-opacity-30' 
                    : 'border-gray-200'
                }`}>
                  <span className={`text-xs ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.confidence && message.role === 'assistant' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {Math.round(message.confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 font-semibold mb-2">📚 Sources:</div>
                    <div className="grid gap-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <FileText size={12} className="text-blue-600 flex-shrink-0" />
                          <span className="flex-1">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md p-4 max-w-[85%] shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Aura is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div 
        className="flex-shrink-0 p-3 border-t border-gray-100 bg-white"
      >
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about work items, project status, or anything else..."
                className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-xl px-3 py-2 resize-none focus:outline-none transition-all duration-200 text-sm leading-relaxed shadow-sm"
                style={{ overflow: 'hidden', minHeight: '40px', maxHeight: '40px' }}
                rows={1}
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-1">
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white p-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
              <button
                type="button"
                onClick={() => {/* TODO: File upload */}}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="Upload document"
                title="Upload documents for enhanced context"
              >
                <Upload size={16} />
              </button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>💡 Try: "What's the status of BB-004?" or "Show me approved work items"</span>
            <span className="font-medium">
              Press <kbd className="bg-gray-200 px-1 py-0.5 rounded text-xs">Enter</kbd> to send
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

// Legacy floating version for backward compatibility
export default function ChatAssistantImproved() {
  // This is kept for any existing imports but doesn't render anything
  // All functionality has been moved to the right panel
  return null;
}
