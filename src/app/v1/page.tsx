"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Settings, 
  TestTube, 
  Play, 
  Bug, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Palette,
  Code2
} from "lucide-react";
import Link from "next/link";

export default function Version1HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Idea",
      description: "Capture and manage business ideas",
      path: "/v1/use-cases"
    },
    {
      icon: Settings,
      title: "Work Items",
      description: "Define and organize work items",
      path: "/v1/requirements"
    },
    {
      icon: Palette,
      title: "Design",
      description: "Create and manage system designs",
      path: "/v1/design"
    },
    {
      icon: Code2,
      title: "Code",
      description: "Generate and manage code artifacts",
      path: "/v1/code"
    },
    {
      icon: TestTube,
      title: "Test Cases",
      description: "Create and manage test scenarios",
      path: "/v1/test-cases"
    },
    {
      icon: Play,
      title: "Execution",
      description: "Execute tests and track results",
      path: "/v1/execution"
    },
    {
      icon: Bug,
      title: "Defects",
      description: "Track and manage defects",
      path: "/v1/defects"
    },
    {
      icon: BarChart3,
      title: "Traceability",
      description: "Monitor requirements traceability",
      path: "/v1/traceability"
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
        <h1 className="text-4xl font-bold text-gray-900">AURA Version 1</h1>

        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/v1/dashboard">
            <Button size="lg" className="flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>View Dashboard</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/v1/use-cases">
            <Button variant="outline" size="lg" className="flex items-center space-x-2">
              <FileText size={18} />
              <span>Start with Ideas</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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


    </div>
  );
}
