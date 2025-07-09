"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Settings, 
  GitBranch, 
  TestTube, 
  Play, 
  Bug, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Use Cases",
      description: "Manage and track use case requirements",
      path: "/use-cases"
    },
    {
      icon: Settings,
      title: "Requirements",
      description: "Define and organize system requirements",
      path: "/requirements"
    },
    {
      icon: GitBranch,
      title: "Decomposition",
      description: "Break down work into manageable tasks",
      path: "/decomposition"
    },
    {
      icon: TestTube,
      title: "Test Cases",
      description: "Create and manage test scenarios",
      path: "/test-cases"
    },
    {
      icon: Play,
      title: "Execution",
      description: "Execute tests and track results",
      path: "/execution"
    },
    {
      icon: Bug,
      title: "Defects",
      description: "Track and manage defects",
      path: "/defects"
    },
    {
      icon: BarChart3,
      title: "Traceability",
      description: "Monitor requirements traceability",
      path: "/traceability"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          <span>SDLC Management Platform</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome to AURA</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Automated Unified Requirement & Assurance - Your comprehensive solution for managing the entire software development lifecycle
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/dashboard">
            <Button size="lg" className="flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>View Dashboard</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/use-cases">
            <Button variant="outline" size="lg" className="flex items-center space-x-2">
              <FileText size={18} />
              <span>Start with Use Cases</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Link key={index} href={feature.path}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:border-blue-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <feature.icon size={20} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Workflow Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch size={20} className="text-blue-600" />
            <span>SDLC Workflow</span>
          </CardTitle>
          <CardDescription>
            Follow our structured approach to software development lifecycle management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium">Define</h4>
              <p className="text-sm text-gray-600">Use cases & requirements</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium">Plan</h4>
              <p className="text-sm text-gray-600">Decompose & design</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium">Test</h4>
              <p className="text-sm text-gray-600">Create & execute tests</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h4 className="font-medium">Track</h4>
              <p className="text-sm text-gray-600">Monitor & trace</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">SDLC Modules</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Traceability</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-gray-600">Possibilities</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 