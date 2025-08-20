"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Workflow,
  ArrowRight,
  Sparkles,
  Users,
  BarChart3,
  CheckCircle,
  Settings,
  Lightbulb,
  Clock,
  Star,
  Plane
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';

export default function LandingPage() {
  return (
    <div className="h-screen overflow-hidden" style={{
      background: `linear-gradient(135deg, 
        #1e293b 0%,
        #334155 25%, 
        #475569 50%,
        #64748b 75%,
        #f8fafc 100%)`
    }}>
      {/* Professional header accent */}
      <div className="w-full h-1 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600"></div>
      
      <div className="container mx-auto px-6 py-8 h-full flex flex-col justify-center space-y-8">
        {/* Hero Section - Compact */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-white/95 backdrop-blur-sm border border-slate-300 text-slate-700 px-6 py-3 rounded-full text-base font-semibold shadow-lg">
            <Sparkles size={18} className="text-blue-600" />
            <span>Choose Your AURA Experience</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AURA
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Select the version that best fits your workflow needs
          </p>
        </div>

        {/* Version Selection Cards - Compact */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Version 1 - Professional Classic */}
          <Card className="relative overflow-hidden border border-slate-200 hover:border-blue-300 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group bg-white/95 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-slate-50 rounded-bl-full opacity-60"></div>
            <div className="absolute -top-1 -right-1 w-12 h-12 bg-blue-100 rotate-45 opacity-20"></div>
            
            <CardHeader className="relative pb-4 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">
                  Classic & Proven
                </Badge>
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                  <BarChart3 size={20} className="text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Version 1</CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">
                Traditional SDLC Management Platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-slate-700">Complete SDLC workflow management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-slate-700">Requirements traceability</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-slate-700">Test case management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-slate-700">Defect tracking & reporting</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-slate-700">Dashboard & analytics</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                  Perfect for established workflows and comprehensive project management
                </p>
                <Link href="/v1">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <span>Enter Version 1</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Version 2 - Professional Premium */}
          <Card className="relative border border-slate-200 hover:border-purple-300 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group bg-white/95 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-bl-full opacity-60"></div>
            
            {/* Fixed Enhanced Badge - properly positioned */}
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs px-2 py-1 shadow-md">
                <Star size={10} className="mr-1" />
                Enhanced
              </Badge>
            </div>
            
            <CardHeader className="relative pb-4 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-1">
                  AI-Powered & Role-Based
                </Badge>
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-md">
                  <Workflow size={20} className="text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">{APP_CONFIG.APP_NAME}</CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">
                Next-Generation Workflow Platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Sparkles size={14} className="text-purple-600" />
                  <span className="text-slate-700">AI-powered workflow consolidation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Users size={14} className="text-purple-600" />
                  <span className="text-slate-700">Role-based access control</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Lightbulb size={14} className="text-purple-600" />
                  <span className="text-slate-700">Enhanced idea management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Settings size={14} className="text-purple-600" />
                  <span className="text-slate-700">Intelligent stage optimization</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Clock size={14} className="text-purple-600" />
                  <span className="text-slate-700">Real-time progress tracking</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                  Designed for modern teams with role-specific workflows and AI assistance
                </p>
                <Link href="/aurav2">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <span>Enter {APP_CONFIG.APP_NAME}</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Footer - Compact */}
        <div className="text-center space-y-3 pt-6">
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          <p className="text-base text-slate-100 font-medium drop-shadow-md">
            Both versions can be accessed anytime. Choose the one that fits your current needs.
          </p>
          <div className="flex justify-center items-center space-x-4 text-xs text-slate-200 font-medium">
            <span>Version 1: Traditional SDLC</span>
            <span className="text-blue-300">•</span>
            <span>{APP_CONFIG.APP_NAME}: Enhanced Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
} 