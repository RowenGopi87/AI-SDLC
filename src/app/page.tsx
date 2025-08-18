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
  Star
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from '@/lib/config/app-config';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-sm font-medium shadow-lg">
            <Sparkles size={16} />
            <span>Choose Your AURA Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to AURA
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            <span className="text-lg text-gray-600">Select the version that best fits your workflow needs</span>
          </p>
        </div>

        {/* Version Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Version 1 - Legacy AURA */}
          <Card className="relative overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl group bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-full opacity-50"></div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                  Classic & Proven
                </Badge>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 size={24} className="text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Version 1</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Traditional SDLC Management Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Complete SDLC workflow management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Requirements traceability</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Test case management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Defect tracking & reporting</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Dashboard & analytics</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-4">
                  Perfect for established workflows and comprehensive project management
                </p>
                <Link href="/v1">
                  <Button className="w-full group-hover:bg-blue-700 transition-colors" size="lg">
                    <span>Enter Version 1</span>
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Version 2 - AuraV2 */}
          <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl group bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-bl-full opacity-50"></div>
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <Star size={12} className="mr-1" />
                Enhanced
              </Badge>
            </div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                  AI-Powered & Role-Based
                </Badge>
                <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                  <Workflow size={24} className="text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">{APP_CONFIG.APP_NAME}</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Next-Generation Workflow Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Sparkles size={16} className="text-purple-600" />
                  <span>AI-powered workflow consolidation</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Users size={16} className="text-purple-600" />
                  <span>Role-based access control</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Lightbulb size={16} className="text-purple-600" />
                  <span>Enhanced idea management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Settings size={16} className="text-purple-600" />
                  <span>Intelligent stage optimization</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock size={16} className="text-purple-600" />
                  <span>Real-time progress tracking</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-4">
                  Designed for modern teams with role-specific workflows and AI assistance
                </p>
                <Link href="/aurav2">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all"
                    size="lg"
                  >
                    <span>Enter {APP_CONFIG.APP_NAME}</span>
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <Card className="max-w-4xl mx-auto bg-white/60 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Choose What's Right for You
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Both versions offer powerful SDLC management capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center space-y-3">
                <div className="text-lg font-semibold text-blue-600">Version 1 is ideal for:</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Traditional project management workflows</li>
                  <li>• Teams familiar with established processes</li>
                  <li>• Comprehensive documentation needs</li>
                  <li>• Full control over all SDLC stages</li>
                </ul>
              </div>
              <div className="text-center space-y-3">
                <div className="text-lg font-semibold text-purple-600">{APP_CONFIG.APP_NAME} is perfect for:</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Agile and modern development teams</li>
                  <li>• Role-specific access and workflows</li>
                  <li>• AI-assisted decision making</li>
                  <li>• Streamlined idea-to-execution process</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-sm text-gray-500">
            Both versions can be accessed anytime. Choose the one that fits your current needs.
          </p>
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
            <span>Version 1: Traditional SDLC</span>
            <span>•</span>
            <span>{APP_CONFIG.APP_NAME}: Enhanced Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
} 