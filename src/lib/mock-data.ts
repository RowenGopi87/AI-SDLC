import { CURRENT_WORKFLOW } from './workflow-config';
import type { Initiative } from '@/store/initiative-store';

// Types for the mock data - Updated for configurable workflows
export interface UseCase {
  id: string;
  businessBriefId: string; // Human-readable business brief identifier
  title: string;
  description: string;
  businessValue: string;
  acceptanceCriteria: string[];
  submittedBy: string;
  submittedAt: Date;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  // Business Brief fields
  businessOwner?: string;
  leadBusinessUnit?: string;
  additionalBusinessUnits?: string[];
  primaryStrategicTheme?: string;
  businessObjective?: string;
  quantifiableBusinessOutcomes?: string;
  inScope?: string;
  impactOfDoNothing?: string;
  happyPath?: string;
  exceptions?: string;
  // End users and stakeholders
  impactedEndUsers?: string;
  changeImpactExpected?: string;
  impactToOtherDepartments?: string;
  otherDepartmentsImpacted?: string[];
  // Technology impact
  impactsExistingTechnology?: boolean;
  technologySolutions?: string;
  relevantBusinessOwners?: string;
  otherTechnologyInfo?: string;
  supportingDocuments?: string[];
  // Workflow tracking
  workflowStage?: "idea" | "discovery" | "design" | "execution";
  completionPercentage?: number;
  // Quality Assessment
  qualityAssessment?: {
    overallGrade: 'gold' | 'silver' | 'bronze';
    overallScore: number;
    summary: string;
    improvements: {
      critical: string[];
      important: string[];
      suggested: string[];
    };
    fieldAssessments: {
      [key: string]: {
        grade: 'gold' | 'silver' | 'bronze';
        score: number;
        feedback: string;
        suggestions: string[];
      };
    };
    assessmentMode?: 'real-llm' | 'mock' | 'mock-fallback';
    approvalRequired: boolean;
    nextSteps: string[];
  };
}

export interface Requirement {
  id: string;
  useCaseId: string;
  originalText: string;
  enhancedText: string;
  isUnambiguous: boolean;
  isTestable: boolean;
  hasAcceptanceCriteria: boolean;
  status: "draft" | "enhanced" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Date;
  // Workflow tracking
  workflowStage?: "analysis" | "enhancement" | "review" | "approved";
  completionPercentage?: number;
}

// Generic work item that can represent any level in the workflow hierarchy
export interface WorkItem {
  id: string;
  workflowLevel: string; // References workflow-config level id
  type: "initiative" | "feature" | "epic" | "story"; // Legacy for backward compatibility
  title: string;
  description: string;
  parentId?: string; // Parent item in the hierarchy
  businessBriefId?: string; // Links to the originating business brief
  requirementId?: string; // Legacy field for backward compatibility
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "in_progress" | "done";
  assignee?: string;
  // Business context
  businessValue?: string;
  userStory?: string; // For stories: "As a... I want... So that..."
  // Workflow tracking
  workflowStage?: "planning" | "development" | "testing" | "done";
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestCase {
  id: string;
  workItemId: string;
  title: string;
  description: string;
  type: "positive" | "negative" | "edge";
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: "not_run" | "passed" | "failed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  createdAt: Date;
  lastExecuted?: Date;
  // Workflow tracking
  workflowStage?: "design" | "ready" | "execution" | "completed";
  completionPercentage?: number;
}

export interface Defect {
  id: string;
  testCaseId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed" | "reopened";
  assignee?: string;
  reporter: string;
  createdAt: Date;
  resolvedAt?: Date;
  aiSummary?: string;
  // Workflow tracking
  workflowStage?: "triage" | "investigation" | "fixing" | "verification";
  completionPercentage?: number;
}

// Mock Data - Customer Portal Enhancement (Execution Stage)
export const mockUseCases: UseCase[] = [
  {
    id: "uc-001",
    businessBriefId: "BB-001",
    title: "Customer Portal Enhancement",
    description: "Enhance the customer portal with self-service capabilities",
    businessValue: "Reduce support costs and improve customer satisfaction",
    acceptanceCriteria: [
      "Self-service account management",
      "Real-time order tracking",
      "Automated billing inquiries",
      "Mobile-responsive design"
    ],
    submittedBy: "Joshua Payne",
    submittedAt: new Date("2024-01-15"),
    status: "approved",
    priority: "high",
    businessOwner: "joshua-payne",
    leadBusinessUnit: "technology",
    additionalBusinessUnits: ["operations", "customer-service"],
    primaryStrategicTheme: "customer-experience",
    businessObjective: "Modernize customer interactions by providing comprehensive self-service capabilities that reduce operational overhead while enhancing customer satisfaction and engagement.",
    quantifiableBusinessOutcomes: "Reduce customer service calls by 40%, improve customer satisfaction scores by 25%, and decrease response time to customer inquiries from 24 hours to 2 hours.",
    inScope: "Customer account management, order tracking, billing inquiries, support ticket creation",
    impactOfDoNothing: "Continued high support costs, declining customer satisfaction, competitive disadvantage",
    happyPath: "Customer logs in, views account status, tracks orders, resolves billing questions without calling support",
    exceptions: "Complex billing issues, refund requests, technical support needs",
    impactedEndUsers: "External customers, internal customer service representatives, billing team members",
    changeImpactExpected: "Customers will need to adapt to new self-service processes. Training materials and gradual rollout required.",
    impactToOtherDepartments: "Customer Service: Reduced call volume, need for process updates. Finance: New billing inquiry automation. IT: Infrastructure and security updates required.",
    otherDepartmentsImpacted: ["Customer Service", "Finance", "IT Security"],
    impactsExistingTechnology: true,
    technologySolutions: "Current customer portal (legacy ASP.NET), CRM system (Salesforce), billing system (SAP)",
    relevantBusinessOwners: "Customer Service Director, Finance Manager, IT Director",
    otherTechnologyInfo: "Integration with existing SSO, compliance with GDPR requirements",
    supportingDocuments: ["customer_survey_results.pdf", "competitor_analysis.docx", "technical_architecture.pptx"],
    workflowStage: "execution",
    completionPercentage: 75
  },
  {
    id: "uc-002",
    businessBriefId: "BB-002",
    title: "Mobile Payment Integration",
    description: "Integrate mobile payment solutions into the existing e-commerce platform",
    businessValue: "Increase conversion rates and improve checkout experience",
    acceptanceCriteria: [
      "Apple Pay integration",
      "Google Pay support",
      "Samsung Pay compatibility",
      "Security compliance (PCI DSS)"
    ],
    submittedBy: "Jane Smith",
    submittedAt: new Date("2024-01-20"),
    status: "in_review",
    priority: "medium",
    businessOwner: "jane-smith",
    leadBusinessUnit: "marketing",
    primaryStrategicTheme: "digital-transformation",
    businessObjective: "Reduce cart abandonment and increase mobile sales by implementing modern payment solutions that meet customer expectations.",
    quantifiableBusinessOutcomes: "Increase mobile conversion rate by 30%, reduce cart abandonment by 20%, achieve 15% growth in mobile sales revenue.",
    impactedEndUsers: "Mobile app users, e-commerce customers, payment processing team",
    changeImpactExpected: "Customers will have new payment options. Marketing team needs to promote new features.",
    impactsExistingTechnology: true,
    technologySolutions: "Current payment gateway (Stripe), mobile app (React Native), fraud detection system",
    workflowStage: "discovery",
    completionPercentage: 35
  },
  {
    id: "uc-003",
    businessBriefId: "BB-003",
    title: "AI-Powered Inventory Optimization",
    description: "Implement machine learning for predictive inventory management",
    businessValue: "Reduce inventory costs while maintaining optimal stock levels",
    acceptanceCriteria: [
      "ML model for demand forecasting",
      "Automated reorder point calculation",
      "Integration with existing ERP",
      "Real-time analytics dashboard"
    ],
    submittedBy: "Mike Johnson",
    submittedAt: new Date("2024-01-25"),
    status: "draft",
    priority: "high",
    businessOwner: "mike-johnson",
    leadBusinessUnit: "operations",
    primaryStrategicTheme: "operational-efficiency",
    businessObjective: "Optimize inventory levels using AI to reduce carrying costs while preventing stockouts and improving supply chain efficiency.",
    quantifiableBusinessOutcomes: "Reduce inventory carrying costs by 18%, decrease stockouts by 35%, improve inventory turnover ratio by 25%.",
    impactedEndUsers: "Warehouse staff, procurement team, supply chain managers, finance team",
    impactsExistingTechnology: false,
    workflowStage: "idea",
    completionPercentage: 10
  },
  {
    id: "uc-004",
    businessBriefId: "BB-004",
    title: "Emirates Booking Management System Enhancement",
    description: "Enhance the Emirates booking management system with improved user experience and streamlined booking operations",
    businessValue: "Improve customer satisfaction and operational efficiency for booking management",
    acceptanceCriteria: [
      "Intuitive manage bookings interface",
      "Real-time booking status updates",
      "Seamless booking modification capabilities",
      "Mobile-responsive design for all devices"
    ],
    submittedBy: "Sarah Abdullah",
    submittedAt: new Date("2024-02-01"),
    status: "approved",
    priority: "high",
    businessOwner: "sarah-abdullah",
    leadBusinessUnit: "customer-operations",
    additionalBusinessUnits: ["technology", "customer-service"],
    primaryStrategicTheme: "customer-experience",
    businessObjective: "Modernize the Emirates booking management experience by providing customers with intuitive, self-service capabilities for managing their flight bookings, reducing operational overhead while enhancing customer satisfaction.",
    quantifiableBusinessOutcomes: "Reduce customer service calls related to booking management by 45%, improve booking modification completion rate by 35%, and decrease average booking management time from 15 minutes to 5 minutes.",
    inScope: "Booking management interface, flight modification capabilities, booking status tracking, customer notification system",
    impactOfDoNothing: "Continued high customer service load, poor customer experience, competitive disadvantage in digital services",
    happyPath: "Customer navigates to Emirates.com, clicks on 'Manage Bookings', enters booking reference, views booking details, makes modifications, and receives confirmation",
    exceptions: "Complex booking changes requiring agent assistance, group bookings, special service requests",
    impactedEndUsers: "Emirates customers, customer service representatives, booking operations team",
    changeImpactExpected: "Customers will have enhanced self-service capabilities. Staff training required for new system features and processes.",
    impactToOtherDepartments: "Customer Service: Reduced booking-related calls. Operations: Updated booking management processes. IT: Infrastructure updates and security enhancements required.",
    otherDepartmentsImpacted: ["Customer Service", "Flight Operations", "IT Security", "Revenue Management"],
    impactsExistingTechnology: true,
    technologySolutions: "Current Emirates booking system, customer portal (React), reservation system (Amadeus), notification service",
    relevantBusinessOwners: "Customer Experience Director, Operations Manager, IT Director",
    otherTechnologyInfo: "Integration with Amadeus GDS, compliance with airline industry standards, GDPR compliance for customer data",
    supportingDocuments: ["customer_feedback_analysis.pdf", "booking_system_requirements.docx", "technical_integration_specs.pptx"],
    workflowStage: "execution",
    completionPercentage: 80
  }
];

export const mockRequirements: Requirement[] = [
  // Customer Portal Enhancement Requirements
  {
    id: "req-001",
    useCaseId: "uc-001",
    originalText: "Users should be able to login to their account",
    enhancedText: "The system shall provide a secure login interface that authenticates customers using their registered email address and password. The login process must complete within 3 seconds under normal load conditions and include proper error handling for invalid credentials.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "Technical Lead",
    reviewedAt: new Date("2024-01-16"),
    workflowStage: "approved",
    completionPercentage: 100
  },
  {
    id: "req-002",
    useCaseId: "uc-001",
    originalText: "Customers need to track their orders in real-time",
    enhancedText: "The system shall provide real-time order tracking functionality that displays current order status, expected delivery date, and shipping information. Updates must be reflected within 5 minutes of status changes in the fulfillment system.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "Product Owner",
    reviewedAt: new Date("2024-01-17"),
    workflowStage: "approved",
    completionPercentage: 100
  },
  {
    id: "req-003",
    useCaseId: "uc-001",
    originalText: "Self-service billing inquiry capability",
    enhancedText: "The system shall allow customers to view their billing history, download invoices, and submit billing inquiries through a self-service portal. The system must integrate with the existing SAP billing system and provide responses to common billing questions automatically.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "Finance Team",
    reviewedAt: new Date("2024-01-18"),
    workflowStage: "approved",
    completionPercentage: 100
  },
  {
    id: "req-004",
    useCaseId: "uc-001",
    originalText: "Mobile responsive design for all portal features",
    enhancedText: "The customer portal shall be fully responsive and optimized for mobile devices with screen sizes from 320px to 1920px. All functionality must be accessible on mobile devices with touch-friendly interfaces and fast loading times (under 3 seconds on 3G networks).",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "UX Team",
    reviewedAt: new Date("2024-01-19"),
    workflowStage: "approved",
    completionPercentage: 100
  },
  // Mobile Payment Integration Requirements (Embedded Features Format)  
  {
    id: "req-005",
    useCaseId: "uc-002",
    originalText: "REQ-MOBILE-PAYMENT-FEATURES",
    enhancedText: "Features:\n\n1. {\n   \"id\": \"FEA-PAY-001\",\n   \"text\": \"Apple Pay integration\",\n   \"category\": \"functional\",\n   \"priority\": \"high\",\n   \"rationale\": \"Enable seamless one-touch payments for iOS users\",\n   \"acceptanceCriteria\": [\"Apple Pay button displays correctly\", \"Payment processes successfully\", \"Error handling for failed payments\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Improved checkout conversion on iOS devices\"\n }\n\n2. {\n   \"id\": \"FEA-PAY-002\",\n   \"text\": \"Google Pay support\",\n   \"category\": \"functional\",\n   \"priority\": \"high\",\n   \"rationale\": \"Provide quick payment option for Android users\",\n   \"acceptanceCriteria\": [\"Google Pay integration works on Android\", \"Tokenization implemented\", \"Fraud detection active\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Reduced cart abandonment on mobile\"\n }",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "enhanced",
    reviewedBy: "AI Generated - FUNCTIONAL | HIGH Priority", 
    reviewedAt: new Date("2024-01-22"),
    workflowStage: "review",
    completionPercentage: 90
  },
  // AI-Powered Inventory Optimization Requirements (Embedded Features Format)
  {
    id: "req-006",
    useCaseId: "uc-003",
    originalText: "REQ-AI-INVENTORY-FEATURES",
    enhancedText: "Features:\n\n1. {\n   \"id\": \"FEA-001\",\n   \"text\": \"ML model for demand forecasting\",\n   \"category\": \"functional\",\n   \"priority\": \"high\",\n   \"rationale\": \"To predict future demand accurately for efficient inventory management\",\n   \"acceptanceCriteria\": [\"The model is capable of predicting future demand\", \"Model adaptability to changes in demand\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Decrease in stockouts and improvement in inventory turnover ratio\"\n }\n\n2. {\n   \"id\": \"FEA-002\",\n   \"text\": \"Automated reorder point calculation\",\n   \"category\": \"functional\",\n   \"priority\": \"high\",\n   \"rationale\": \"Prevent stockouts and excess inventory by automating reorder point calculation\",\n   \"acceptanceCriteria\": [\"System calculates reorder points accurately\", \"System triggers reorders when stock reaches reorder point\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Reduction in carrying costs and decrease in stockouts\"\n }\n\n3. {\n   \"id\": \"FEA-003\",\n   \"text\": \"Integration with existing ERP\",\n   \"category\": \"integration\",\n   \"priority\": \"high\",\n   \"rationale\": \"To ensure seamless data flow between inventory optimization system and existing ERP\",\n   \"acceptanceCriteria\": [\"Successful data exchange between ERP and new inventory system\", \"No disruption of existing ERP functionalities\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Improved supply chain efficiency and data consistency\"\n }\n\n4. {\n   \"id\": \"FEA-004\",\n   \"text\": \"Real-time analytics dashboard\",\n   \"category\": \"user-experience\",\n   \"priority\": \"medium\",\n   \"rationale\": \"To provide end-users with real-time insights into inventory status and performance\",\n   \"acceptanceCriteria\": [\"Dashboard provides real-time data\", \"Dashboard includes key inventory metrics and KPIs\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Increased transparency and informed decision-making\"\n }\n\n5. {\n   \"id\": \"FEA-005\",\n   \"text\": \"Data security and privacy measures\",\n   \"category\": \"security\",\n   \"priority\": \"high\",\n   \"rationale\": \"To protect sensitive inventory and business data\",\n   \"acceptanceCriteria\": [\"Data encryption is implemented\", \"Access control measures are in place\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Protection of sensitive business data and compliance with regulatory requirements\"\n }\n\n6. {\n   \"id\": \"FEA-006\",\n   \"text\": \"Exception handling system\",\n   \"category\": \"functional\",\n   \"priority\": \"medium\",\n   \"rationale\": \"To manage unforeseen changes in demand or supply chain disruptions\",\n   \"acceptanceCriteria\": [\"System can identify exceptions\", \"System notifies relevant personnel about exceptions\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Improved operational resilience and agility\"\n }",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "enhanced",
    reviewedBy: "AI Generated - NEEDS PARSING",
    reviewedAt: new Date("2024-01-25"),
    workflowStage: "enhancement",
    completionPercentage: 90
  },
     // Customer Portal Mobile Features (Embedded Features Format)
   {
     id: "req-007",
     useCaseId: "uc-001",
     originalText: "REQ-MOBILE-FEATURES",
     enhancedText: "Features:\n\n1. {\n   \"id\": \"FEA-007\",\n   \"text\": \"Mobile-responsive customer authentication\",\n   \"category\": \"user-experience\",\n   \"priority\": \"high\",\n   \"rationale\": \"Ensure secure and seamless login experience on mobile devices\",\n   \"acceptanceCriteria\": [\"Touch-friendly login interface\", \"Biometric authentication support\", \"Session persistence on mobile\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Improved mobile user engagement and security\"\n }\n\n2. {\n   \"id\": \"FEA-008\",\n   \"text\": \"Mobile order tracking interface\",\n   \"category\": \"user-experience\",\n   \"priority\": \"high\",\n   \"rationale\": \"Provide intuitive order tracking experience optimized for mobile devices\",\n   \"acceptanceCriteria\": [\"Swipe gestures for order details\", \"Push notifications for status updates\", \"Offline viewing capability\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Reduced customer service calls from mobile users\"\n }\n\n3. {\n   \"id\": \"FEA-009\",\n   \"text\": \"Mobile billing management\",\n   \"category\": \"functional\",\n   \"priority\": \"medium\",\n   \"rationale\": \"Enable customers to manage billing and payments from mobile devices\",\n   \"acceptanceCriteria\": [\"Mobile-optimized invoice viewing\", \"One-tap payment options\", \"Download receipts to device\"],\n   \"workflowLevel\": \"feature\",\n   \"businessValue\": \"Increased customer self-service adoption on mobile\"\n }",
     isUnambiguous: true,
     isTestable: true,
     hasAcceptanceCriteria: true,
     status: "enhanced",
     reviewedBy: "AI Generated - USER-EXPERIENCE | HIGH Priority",
     reviewedAt: new Date("2024-01-20"),
     workflowStage: "enhancement",
     completionPercentage: 90
   }
];

export const mockInitiatives: Initiative[] = [
  // Customer Portal Enhancement Initiative (from BB-001)
  {
    id: "init-001",
    businessBriefId: "uc-001",
    title: "Customer Portal Enhancement Initiative",
    description: "Transform customer experience through comprehensive self-service capabilities and digital modernization",
    category: "strategic",
    priority: "high",
    rationale: "Address customer frustration with current portal limitations while reducing operational support costs",
    acceptanceCriteria: [
      "All portal features fully functional and tested",
      "Performance meets or exceeds benchmarks",
      "User satisfaction scores improve by 25%",
      "Support call reduction of 40% achieved"
    ],
    businessValue: "Reduce customer service costs by 40%, improve customer satisfaction by 25%, and establish foundation for future digital services",
    workflowLevel: "initiative",
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-26"),
    createdBy: "Joshua Payne",
    assignedTo: "Technology Team"
  },
  
  // Mobile Payment Integration Initiative (from BB-002)
  {
    id: "init-002", 
    businessBriefId: "uc-002",
    title: "Mobile Payment Integration Initiative",
    description: "Implement modern mobile payment solutions to reduce cart abandonment and increase mobile conversion rates",
    category: "business",
    priority: "medium",
    rationale: "Mobile commerce growth requires modern payment options to remain competitive and meet customer expectations",
    acceptanceCriteria: [
      "Apple Pay, Google Pay, and Samsung Pay fully integrated",
      "PCI DSS compliance maintained",
      "Mobile conversion rate improves by 30%",
      "Cart abandonment reduces by 20%"
    ],
    businessValue: "Increase mobile sales revenue by 15%, improve user experience, and capture market share from competitors",
    workflowLevel: "initiative",
    status: "draft",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-23"),
    createdBy: "Jane Smith",
    assignedTo: "Payment Team"
  },

  // AI-Powered Inventory Optimization Initiative (from BB-003)
  {
    id: "init-003",
    businessBriefId: "uc-003", 
    title: "AI-Powered Inventory Optimization Initiative",
    description: "Leverage machine learning and AI to optimize inventory levels, reduce costs, and prevent stockouts",
    category: "operational",
    priority: "high",
    rationale: "Current inventory management is reactive and inefficient, leading to high carrying costs and frequent stockouts",
    acceptanceCriteria: [
      "ML models achieve 85%+ accuracy in demand forecasting",
      "Inventory carrying costs reduced by 18%",
      "Stockouts decreased by 35%",
      "ROI positive within 12 months"
    ],
    businessValue: "Reduce inventory carrying costs by 18%, decrease stockouts by 35%, improve inventory turnover ratio by 25%",
    workflowLevel: "initiative",
    status: "draft",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
    createdBy: "Mike Johnson",
    assignedTo: "Operations Team"
  },

  // Emirates Booking Management Initiative (from BB-004)
  {
    id: "init-004",
    businessBriefId: "uc-004",
    title: "Emirates Booking Management Enhancement Initiative",
    description: "Modernize the Emirates booking management system to provide customers with seamless self-service capabilities for managing their flight bookings",
    category: "strategic",
    priority: "high",
    rationale: "Current booking management process requires significant customer service support and lacks modern user experience standards expected by Emirates customers",
    acceptanceCriteria: [
      "Manage Bookings interface is fully functional and intuitive",
      "Booking modifications can be completed without agent assistance",
      "System integrates seamlessly with existing Emirates reservation system",
      "Mobile-responsive design works across all devices",
      "Customer satisfaction scores improve by 35%"
    ],
    businessValue: "Reduce customer service calls by 45%, improve booking modification completion rate by 35%, and enhance Emirates brand reputation for digital excellence",
    workflowLevel: "initiative",
    status: "active",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-15"),
    createdBy: "Sarah Abdullah",
    assignedTo: "Customer Experience Team"
  }
];

export const mockFeatures = [
  {
    id: 'FEA-001',
    initiativeId: 'INIT-001',
    businessBriefId: 'uc-001',
    title: 'Rework the current user interface',
    description: 'An intuitive UI is key to ensuring customers can easily navigate.',
    category: 'user-experience',
    priority: 'high',
    rationale: 'A better UI will improve adoption.',
    acceptanceCriteria: ['Responsive design'],
    businessValue: 'Higher user satisfaction.',
    workflowLevel: 'feature',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'System'
  },
  {
    id: 'FEA-004',
    initiativeId: 'init-004',
    businessBriefId: 'uc-004',
    title: 'Manage Bookings Interface',
    description: 'Create an intuitive and user-friendly interface for customers to manage their Emirates flight bookings online',
    category: 'user-experience',
    priority: 'high',
    rationale: 'A streamlined booking management interface will reduce customer service calls and improve customer satisfaction',
    acceptanceCriteria: [
      'Booking search functionality by reference number',
      'Clear display of booking details and flight information',
      'Intuitive navigation and responsive design',
      'Accessible on both desktop and mobile devices'
    ],
    businessValue: 'Enable customers to self-serve booking management needs, reducing operational costs and improving customer experience',
    workflowLevel: 'feature',
    status: 'active',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'Sarah Abdullah'
  }
];

export const mockEpics = [
  {
    id: 'EPIC-001',
    featureId: 'FEA-001',
    initiativeId: 'INIT-001',
    businessBriefId: 'uc-001',
    title: 'User Authentication and Authorization',
    description: 'Implement a secure and robust user authentication system.',
    category: 'technical',
    priority: 'high',
    rationale: 'Security is paramount for protecting user data.',
    acceptanceCriteria: ['Secure login', 'Role-based access'],
    businessValue: 'Protects user data and builds trust.',
    workflowLevel: 'epic',
    sprintEstimate: 2,
    estimatedEffort: 'High',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'System'
  },
  {
    id: 'EPIC-004',
    featureId: 'FEA-004',
    initiativeId: 'init-004',
    businessBriefId: 'uc-004',
    title: 'Booking Access and Navigation',
    description: 'Implement the core navigation and access functionality for customers to reach and interact with their booking management interface',
    category: 'functional',
    priority: 'high',
    rationale: 'Customers need a clear and reliable way to access their booking information through the Emirates website',
    acceptanceCriteria: [
      'Manage Bookings link is prominently displayed on Emirates.com',
      'Navigation to manage bookings is intuitive and accessible',
      'System handles booking reference validation correctly',
      'Error handling for invalid booking references'
    ],
    businessValue: 'Provides the foundational access point for all booking management activities, enabling customer self-service',
    workflowLevel: 'epic',
    sprintEstimate: 3,
    estimatedEffort: 'Medium',
    status: 'active',
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'Sarah Abdullah'
  }
];

export const mockStories = [
  {
    id: 'STORY-001',
    epicId: 'EPIC-001',
    featureId: 'FEA-001',
    initiativeId: 'INIT-001',
    businessBriefId: 'uc-001',
    title: 'As a user, I want to log in with my email and password',
    description: 'Develop the user interface and logic for the login page.',
    category: 'functional',
    priority: 'high',
    rationale: 'This is the entry point for all users.',
    acceptanceCriteria: ['Valid credentials grant access', 'Invalid credentials show an error'],
    businessValue: 'Enables user access to the platform.',
    workflowLevel: 'story',
    storyPoints: 5,
    labels: ['auth', 'ui'],
    testingNotes: 'Test with valid and invalid credentials.',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'System'
  },
  {
    id: 'STORY-004',
    epicId: 'EPIC-004',
    featureId: 'FEA-004',
    initiativeId: 'init-004',
    businessBriefId: 'uc-004',
    title: 'As an Emirates customer, I want to access Manage Bookings from the website so that I can view and modify my flight reservations',
    description: 'Implement the Manage Bookings navigation and access functionality on Emirates.com that allows customers to easily find and access their booking management interface',
    category: 'functional',
    priority: 'high',
    rationale: 'Customers need a clear, prominent way to access their booking management functionality from the main Emirates website',
    acceptanceCriteria: [
      'Manage Bookings link is visible and accessible on Emirates.com homepage',
      'Clicking Manage Bookings opens the booking management interface',
      'Interface is responsive and works on desktop and mobile browsers',
      'Page loads within 3 seconds on standard internet connections'
    ],
    businessValue: 'Provides customers with easy access to self-service booking management, reducing customer service calls and improving customer satisfaction',
    workflowLevel: 'story',
    storyPoints: 8,
    labels: ['booking', 'navigation', 'web-interface'],
    testingNotes: 'Test navigation from Emirates.com homepage, verify responsive design on multiple devices, test loading performance',
    status: 'active',
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'Sarah Abdullah'
  }
];

export const mockWorkItems: WorkItem[] = [
  // Initiative: Customer Portal Enhancement (maps to Business Brief BB-001)
  {
    id: "wi-001",
    workflowLevel: "initiative", 
    type: "initiative",
    title: "Customer Portal Enhancement Initiative",
    description: "Transform customer experience through comprehensive self-service capabilities",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["All portal features implemented", "Performance benchmarks met", "User acceptance testing passed"],
    priority: "high",
    status: "in_progress",
    businessValue: "Reduce support costs by 40% and improve customer satisfaction by 25%",
    workflowStage: "development",
    completionPercentage: 75,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-25")
  },
  
  // Features under Customer Portal Enhancement Initiative
  {
    id: "wi-002",
    workflowLevel: "feature",
    type: "feature", 
    title: "Customer Authentication System",
    description: "Secure login and session management for customer portal",
    parentId: "wi-001",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Secure login", "Session management", "Password reset", "Multi-factor authentication"],
    priority: "high",
    status: "done",
    assignee: "Dev Team A",
    businessValue: "Secure access for all customer portal features",
    workflowStage: "done",
    completionPercentage: 100,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "wi-003",
    workflowLevel: "feature",
    type: "feature",
    title: "Order Tracking System", 
    description: "Real-time order tracking and status updates",
    parentId: "wi-001",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Real-time updates", "Status visualization", "Delivery estimates", "Notification system"],
    priority: "high",
    status: "in_progress",
    assignee: "Dev Team B",
    businessValue: "Reduce customer service calls about order status",
    workflowStage: "development",
    completionPercentage: 80,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-26")
  },
  {
    id: "wi-004",
    workflowLevel: "feature",
    type: "feature",
    title: "Self-Service Billing Portal",
    description: "Automated billing inquiries and invoice management", 
    parentId: "wi-001",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Billing history", "Invoice downloads", "Automated responses", "Payment history"],
    priority: "medium",
    status: "in_progress",
    assignee: "Dev Team C", 
    businessValue: "Automate 60% of billing inquiries",
    workflowStage: "development",
    completionPercentage: 60,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-27")
  },
  
  // Epics under Customer Authentication Feature
  {
    id: "wi-005",
    workflowLevel: "epic",
    type: "epic",
    title: "User Login Epic",
    description: "Core user authentication functionality",
    parentId: "wi-002",
    businessBriefId: "BB-001", 
    acceptanceCriteria: ["Email/password login", "Remember me", "Account lockout", "Password validation"],
    priority: "high",
    status: "done",
    assignee: "Dev Team A",
    businessValue: "Enable secure customer access",
    workflowStage: "done",
    completionPercentage: 100,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-19")
  },
  {
    id: "wi-006",
    workflowLevel: "epic", 
    type: "epic",
    title: "Password Management Epic",
    description: "Password reset and security features",
    parentId: "wi-002",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Password reset", "Security questions", "Email verification", "Password strength"],
    priority: "high",
    status: "done",
    assignee: "Dev Team A",
    businessValue: "Reduce password-related support tickets",
    workflowStage: "done", 
    completionPercentage: 100,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-20")
  },
  
  // Epics under Order Tracking Feature
  {
    id: "wi-007",
    workflowLevel: "epic",
    type: "epic", 
    title: "Real-time Tracking Epic",
    description: "Live order status and tracking updates",
    parentId: "wi-003",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Live status updates", "Tracking integration", "Status timeline", "Delivery estimates"],
    priority: "high",
    status: "in_progress",
    assignee: "Dev Team B",
    businessValue: "Provide transparent order visibility",
    workflowStage: "development",
    completionPercentage: 75,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-26")
  },
  {
    id: "wi-008", 
    workflowLevel: "epic",
    type: "epic",
    title: "Order Notifications Epic",
    description: "Automated notifications for order updates",
    parentId: "wi-003",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Email notifications", "SMS alerts", "Push notifications", "Notification preferences"],
    priority: "medium",
    status: "backlog",
    assignee: "Dev Team B",
    businessValue: "Proactive customer communication",
    workflowStage: "planning",
    completionPercentage: 20,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17")
  },
  
  // Stories under User Login Epic  
  {
    id: "wi-009",
    workflowLevel: "story",
    type: "story",
    title: "User Email/Password Login",
    description: "Basic login functionality with email and password",
    parentId: "wi-005",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Login form validation", "Authentication API", "Session creation", "Error handling"],
    priority: "high",
    status: "done",
    assignee: "Frontend Dev",
    userStory: "As a customer, I want to log in with my email and password so that I can access my account securely",
    storyPoints: 5,
    workflowStage: "done",
    completionPercentage: 100,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-18")
  },
  {
    id: "wi-010",
    workflowLevel: "story", 
    type: "story",
    title: "Remember Me Functionality",
    description: "Allow users to stay logged in across sessions",
    parentId: "wi-005",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Persistent session", "Secure token", "Logout option", "Session expiry"],
    priority: "medium",
    status: "done",
    assignee: "Backend Dev",
    userStory: "As a customer, I want to stay logged in so that I don't have to enter my credentials every time",
    storyPoints: 3,
    workflowStage: "done",
    completionPercentage: 100,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-19")
  },
  
  // Stories under Real-time Tracking Epic
  {
    id: "wi-011",
    workflowLevel: "story",
    type: "story", 
    title: "Order Status Display",
    description: "Show current order status with visual indicators",
    parentId: "wi-007",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Status icons", "Progress bar", "Status description", "Last updated time"],
    priority: "high",
    status: "in_progress",
    assignee: "Frontend Dev",
    userStory: "As a customer, I want to see my order status clearly so that I know where my order stands",
    storyPoints: 8,
    workflowStage: "development",
    completionPercentage: 70,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-26")
  },
  {
    id: "wi-012",
    workflowLevel: "story",
    type: "story",
    title: "Delivery Timeline", 
    description: "Show estimated delivery dates and milestones",
    parentId: "wi-007",
    businessBriefId: "BB-001",
    acceptanceCriteria: ["Delivery estimate", "Timeline visualization", "Milestone tracking", "Date updates"],
    priority: "medium",
    status: "backlog",
    assignee: "Frontend Dev",
    userStory: "As a customer, I want to see when my order will arrive so that I can plan accordingly",
    storyPoints: 5,
    workflowStage: "planning", 
    completionPercentage: 10,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17")
  },
  
  // Initiative: Mobile Payment Integration (maps to Business Brief BB-002) 
  {
    id: "wi-013",
    workflowLevel: "initiative",
    type: "initiative",
    title: "Mobile Payment Integration Initiative", 
    description: "Integrate modern mobile payment solutions for improved checkout experience",
    businessBriefId: "BB-002",
    acceptanceCriteria: ["Apple Pay integration", "Google Pay integration", "Security compliance", "User testing complete"],
    priority: "medium",
    status: "backlog",
    businessValue: "Increase mobile conversion rate by 30% and reduce cart abandonment by 20%",
    workflowStage: "planning",
    completionPercentage: 25,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25")
  },
  
  // Features under Mobile Payment Integration Initiative
  {
    id: "wi-014",
    workflowLevel: "feature",
    type: "feature",
    title: "Apple Pay Integration",
    description: "Enable Apple Pay for iOS users in checkout flow",
    parentId: "wi-013",
    businessBriefId: "BB-002",
    acceptanceCriteria: ["Apple Pay API", "iOS app integration", "Web integration", "Testing"],
    priority: "high",
    status: "backlog",
    assignee: "Mobile Team",
    businessValue: "Streamlined checkout for iOS users",
    workflowStage: "planning",
    completionPercentage: 15,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22")
  },
  {
    id: "wi-015",
    workflowLevel: "feature", 
    type: "feature",
    title: "Google Pay Integration",
    description: "Enable Google Pay for Android users in checkout flow",
    parentId: "wi-013",
    businessBriefId: "BB-002", 
    acceptanceCriteria: ["Google Pay API", "Android app integration", "Web integration", "Testing"],
    priority: "high",
    status: "backlog",
    assignee: "Mobile Team",
    businessValue: "Streamlined checkout for Android users",
    workflowStage: "planning",
    completionPercentage: 15,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22")
  }
];

export const mockTestCases: TestCase[] = [
  // Customer Portal Authentication Tests
  {
    id: "tc-001",
    workItemId: "wi-002",
    title: "Valid Customer Login",
    description: "Test successful login with valid customer credentials",
    type: "positive",
    preconditions: ["Customer account exists", "Customer is not logged in"],
    steps: ["Navigate to customer portal", "Enter valid email", "Enter valid password", "Click login button"],
    expectedResult: "Customer is successfully logged in and redirected to dashboard",
    actualResult: "Customer logged in successfully",
    status: "passed",
    priority: "high",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-18"),
    lastExecuted: new Date("2024-01-25"),
    workflowStage: "completed",
    completionPercentage: 100
  },
  {
    id: "tc-002",
    workItemId: "wi-002",
    title: "Invalid Password Login",
    description: "Test login with incorrect password",
    type: "negative",
    preconditions: ["Customer account exists"],
    steps: ["Navigate to customer portal", "Enter valid email", "Enter invalid password", "Click login button"],
    expectedResult: "Error message displayed, customer not logged in",
    actualResult: "Generic error message shown instead of specific feedback",
    status: "failed",
    priority: "high",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-18"),
    lastExecuted: new Date("2024-01-25"),
    workflowStage: "execution",
    completionPercentage: 75
  },
  // Order Tracking Tests
  {
    id: "tc-003",
    workItemId: "wi-003",
    title: "Real-time Order Status Update",
    description: "Verify order status updates in real-time",
    type: "positive",
    preconditions: ["Customer logged in", "Active order exists"],
    steps: ["Navigate to order tracking", "Select active order", "Verify current status", "Wait for status update"],
    expectedResult: "Order status updates within 5 minutes of fulfillment system changes",
    status: "passed",
    priority: "high",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-20"),
    lastExecuted: new Date("2024-01-26"),
    workflowStage: "completed",
    completionPercentage: 100
  },
  {
    id: "tc-004",
    workItemId: "wi-003",
    title: "Order Tracking Mobile View",
    description: "Test order tracking functionality on mobile devices",
    type: "positive",
    preconditions: ["Mobile device", "Customer logged in", "Order exists"],
    steps: ["Open portal on mobile", "Navigate to order tracking", "View order details", "Test touch interactions"],
    expectedResult: "Order tracking works seamlessly on mobile with touch-friendly interface",
    status: "passed",
    priority: "medium",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-21"),
    lastExecuted: new Date("2024-01-27"),
    workflowStage: "completed",
    completionPercentage: 100
  },
  // Billing Portal Tests
  {
    id: "tc-005",
    workItemId: "wi-004",
    title: "Billing History Access",
    description: "Test customer access to billing history",
    type: "positive",
    preconditions: ["Customer logged in", "Billing history exists"],
    steps: ["Navigate to billing section", "View billing history", "Download invoice", "Submit billing inquiry"],
    expectedResult: "Customer can access billing history and download invoices successfully",
    status: "not_run",
    priority: "medium",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-22"),
    workflowStage: "ready",
    completionPercentage: 50
  },
  // Mobile Responsive Tests
  {
    id: "tc-006",
    workItemId: "wi-005",
    title: "Cross-Device Responsiveness",
    description: "Test portal responsiveness across different screen sizes",
    type: "positive",
    preconditions: ["Multiple test devices available"],
    steps: ["Test on phone (320px)", "Test on tablet (768px)", "Test on desktop (1920px)", "Verify layout integrity"],
         expectedResult: "Portal layout adapts correctly to all screen sizes",
     status: "not_run",
     priority: "medium",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-23"),
    workflowStage: "execution",
    completionPercentage: 60
  }
];

export const mockDefects: Defect[] = [
  {
    id: "def-001",
    testCaseId: "tc-002",
    title: "Generic error message on invalid login",
    description: "When customer enters invalid password, system shows generic error instead of specific feedback message",
    severity: "medium",
    priority: "medium",
    status: "open",
    assignee: "Dev Team A",
    reporter: "QA Team",
    createdAt: new Date("2024-01-25"),
    aiSummary: "The login error handling needs improvement to provide specific user feedback while maintaining security.",
    workflowStage: "triage",
    completionPercentage: 25
  },
  {
    id: "def-002",
    testCaseId: "tc-006",
    title: "Layout breaks on very small screens",
    description: "Portal layout becomes unusable on screens smaller than 350px width",
    severity: "low",
    priority: "low",
    status: "in_progress",
    assignee: "Frontend Team",
    reporter: "QA Team",
    createdAt: new Date("2024-01-26"),
    aiSummary: "Minor responsive design issue affecting edge case screen sizes.",
    workflowStage: "fixing",
    completionPercentage: 60
  },
  {
    id: "def-003",
    testCaseId: "tc-005",
    title: "Billing inquiry form validation missing",
    description: "Self-service billing inquiry form accepts empty submissions",
    severity: "medium",
    priority: "medium",
    status: "resolved",
    assignee: "Dev Team C",
    reporter: "QA Team",
    createdAt: new Date("2024-01-24"),
    resolvedAt: new Date("2024-01-27"),
    aiSummary: "Form validation issue resolved by implementing client-side and server-side validation.",
    workflowStage: "verification",
    completionPercentage: 90
  }
];

// Dashboard metrics
export const mockDashboardData = {
  testCoverage: {
    total: 24,
    passed: 18,
    failed: 2,
    blocked: 1,
    notRun: 3,
    coverage: 87.5
  },
  useCaseStatus: {
    total: 3,
    approved: 1,
    inReview: 1,
    draft: 1
  },
  defectTrends: {
    open: 1,
    inProgress: 1,
    resolved: 1,
    closed: 0
  },
  workItemProgress: {
    total: 7,
    backlog: 2,
    inProgress: 4,
    done: 1
  },
  requirementStatus: {
    total: 6,
    approved: 4,
    enhanced: 2,
    draft: 0
  }
};

// Enhanced Traceability data with workflow alignment
export const mockTraceabilityData = {
  "uc-001": {
    requirements: ["req-001", "req-002", "req-003", "req-004"],
    workItems: ["wi-001", "wi-002", "wi-003", "wi-004", "wi-005"],
    testCases: ["tc-001", "tc-002", "tc-003", "tc-004", "tc-005", "tc-006"],
    defects: ["def-001", "def-002", "def-003"],
    workflowStage: "execution",
    completionPercentage: 75,
    nextSteps: ["Complete mobile testing", "Fix remaining defects", "User acceptance testing"]
  },
  "uc-002": {
    requirements: ["req-005", "req-006"],
    workItems: ["wi-006", "wi-007"],
    testCases: [],
    defects: [],
    workflowStage: "discovery",
    completionPercentage: 35,
    nextSteps: ["Finalize requirements", "Technical design", "Development planning"]
  },
  "uc-003": {
    requirements: [],
    workItems: [],
    testCases: [],
    defects: [],
    workflowStage: "idea",
    completionPercentage: 10,
    nextSteps: ["Business case approval", "Requirements gathering", "Technical feasibility study"]
  }
};

// Enhanced traceability functions
export const getRelatedItems = (itemId: string, itemType: 'useCase' | 'requirement' | 'workItem' | 'testCase' | 'defect') => {
  const allTraceability = mockTraceabilityData;
  
  switch (itemType) {
    case 'useCase':
      return allTraceability[itemId as keyof typeof allTraceability] || null;
    
    case 'requirement':
      for (const [ucId, trace] of Object.entries(allTraceability)) {
        if (trace.requirements.includes(itemId)) {
          return {
            useCase: ucId,
            workItems: mockWorkItems.filter(w => w.requirementId === itemId).map(w => w.id),
            testCases: mockTestCases.filter(tc => {
              const workItem = mockWorkItems.find(w => w.id === tc.workItemId);
              return workItem?.requirementId === itemId;
            }).map(tc => tc.id),
            defects: mockDefects.filter(def => {
              const testCase = mockTestCases.find(t => t.id === def.testCaseId);
              const workItem = mockWorkItems.find(w => w.id === testCase?.workItemId);
              return workItem?.requirementId === itemId;
            }).map(def => def.id)
          };
        }
      }
      return null;
    
    case 'workItem':
      for (const [ucId, trace] of Object.entries(allTraceability)) {
        if (trace.workItems.includes(itemId)) {
          const workItem = mockWorkItems.find(w => w.id === itemId);
          return {
            useCase: ucId,
            requirement: workItem?.requirementId,
            testCases: mockTestCases.filter(tc => tc.workItemId === itemId).map(tc => tc.id),
            defects: mockDefects.filter(def => {
              const testCase = mockTestCases.find(t => t.id === def.testCaseId);
              return testCase?.workItemId === itemId;
            }).map(def => def.id)
          };
        }
      }
      return null;
    
    case 'testCase':
      const testCase = mockTestCases.find(t => t.id === itemId);
      if (!testCase) return null;
      
      for (const [ucId, trace] of Object.entries(allTraceability)) {
        if (trace.testCases.includes(itemId)) {
          const workItem = mockWorkItems.find(w => w.id === testCase.workItemId);
          return {
            useCase: ucId,
            requirement: workItem?.requirementId,
            workItem: testCase.workItemId,
            defects: mockDefects.filter(def => def.testCaseId === itemId).map(def => def.id)
          };
        }
      }
      return null;
    
    case 'defect':
      const defect = mockDefects.find(d => d.id === itemId);
      if (!defect) return null;
      
      const relatedTestCase = mockTestCases.find(t => t.id === defect.testCaseId);
      if (!relatedTestCase) return null;
      
      for (const [ucId, trace] of Object.entries(allTraceability)) {
        if (trace.defects.includes(itemId)) {
          const workItem = mockWorkItems.find(w => w.id === relatedTestCase.workItemId);
          return {
            useCase: ucId,
            requirement: workItem?.requirementId,
            workItem: relatedTestCase.workItemId,
            testCase: defect.testCaseId
          };
        }
      }
      return null;
    
    default:
      return null;
  }
}; 

// Add mock LLM service for testing - Updated to mirror real LLM quality
export class MockLLMService {
  static async generateFeatures(initiativeId: string, initiativeData: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextually relevant features based on initiative type
    const isPortalInitiative = initiativeData.title?.toLowerCase().includes('portal') || initiativeData.description?.toLowerCase().includes('portal');
    const isPaymentInitiative = initiativeData.title?.toLowerCase().includes('payment') || initiativeData.description?.toLowerCase().includes('payment');
    const isInventoryInitiative = initiativeData.title?.toLowerCase().includes('inventory') || initiativeData.description?.toLowerCase().includes('inventory');
    
    let mockFeatures = [];
    
         if (isPortalInitiative) {
       mockFeatures = [
         {
           title: "Mobile-First Design Overhaul",
           description: "Rebuild the interface of the customer portal using mobile-first design principles, optimizing essential features and ensuring touch-friendly interfaces.",
           rationale: "A significant portion of our users access the portal on mobile devices. A mobile-first design enhances their experience and potentially increases customer engagement.",
           category: "functional",
           priority: "high",
           acceptanceCriteria: [
             "Portal is fully functional on mobile devices",
             "Touch-friendly interface",
             "Optimized essential features"
           ],
           businessValue: "Improved user experience and potential increase in customer engagement",
           workflowLevel: "feature"
         },
         {
           title: "Responsive Layout Implementation",
           description: "Modify the portal layout to be responsive, accommodating various screen sizes and orientations.",
           rationale: "To enhance the user experience across devices, the portal needs to be responsive and adjust its layout based on the device's screen size.",
           category: "functional",
           priority: "high",
           acceptanceCriteria: [
             "Portal layout adjusts based on screen size",
             "Consistent functionality across various screen sizes"
           ],
           businessValue: "Improved usability and consistency across devices, potentially increasing user engagement",
           workflowLevel: "feature"
         },
         {
           title: "Optimized Load Times",
           description: "Optimize the portal for fast load times on slower networks by implementing methods such as image optimization, lazy loading, and leveraging a CDN.",
           rationale: "Given the potential bandwidth limitations on mobile devices, optimizing load times enhances the user experience and can influence user engagement.",
           category: "performance",
           priority: "medium",
           acceptanceCriteria: [
             "Reduced load times on slower networks",
             "Implementation of image optimization and lazy loading"
           ],
           businessValue: "Improved user experience, potentially reducing bounce rates and increasing user engagement",
           workflowLevel: "feature"
         },
         {
           title: "Enhanced Security",
           description: "Improve security by implementing secure coding practices, using secure protocols, and conducting regular security audits.",
           rationale: "Security is vital for user trust and can directly impact user engagement. Regular security audits and secure protocols ensure the safety of user data.",
           category: "security",
           priority: "high",
           acceptanceCriteria: [
             "Secure coding practices are followed",
             "Secure protocols are used",
             "Regular security audits are carried out"
           ],
           businessValue: "Improved user trust, potentially leading to increased user engagement and satisfaction",
           workflowLevel: "feature"
         }
       ];
    } else if (isPaymentInitiative) {
      mockFeatures = [
        {
          title: "Digital Wallet Integration Platform",
          description: "Develop a comprehensive digital wallet integration supporting Apple Pay, Google Pay, Samsung Pay, and PayPal with secure tokenization and fraud detection capabilities.",
          rationale: "Modern consumers expect seamless digital payment options, and the absence of these features directly impacts conversion rates and competitive positioning.",
          category: "integration",
          priority: "high",
          acceptanceCriteria: [
            "Support for all major digital wallet providers",
            "PCI DSS Level 1 compliance maintained",
            "Fraud detection algorithms integrated",
            "Seamless checkout experience across all devices"
          ],
          businessValue: "Increase mobile conversion rates by 40% and reduce cart abandonment by 25%",
          workflowLevel: "feature"
        },
        {
          title: "One-Click Payment Processing",
          description: "Implement secure one-click payment functionality for returning customers with stored payment methods, biometric authentication, and intelligent payment method selection.",
          rationale: "Reducing checkout friction is critical for improving conversion rates and meeting customer expectations for streamlined e-commerce experiences.",
          category: "functional",
          priority: "medium",
          acceptanceCriteria: [
            "Biometric authentication for payment authorization",
            "Intelligent default payment method selection",
            "Secure tokenization of payment data",
            "Compliance with industry security standards"
          ],
          businessValue: "Improve checkout completion rates by 30% and enhance customer loyalty through convenience",
          workflowLevel: "feature"
        }
      ];
    } else if (isInventoryInitiative) {
      mockFeatures = [
        {
          title: "AI-Powered Demand Forecasting Engine",
          description: "Develop machine learning algorithms that analyze historical sales data, seasonal trends, market conditions, and external factors to predict demand with high accuracy and optimize inventory levels.",
          rationale: "Traditional inventory management relies on outdated forecasting methods that fail to account for dynamic market conditions, resulting in costly overstock and stockout situations.",
          category: "analytics",
          priority: "high",
          acceptanceCriteria: [
            "Achieve 90%+ accuracy in demand predictions",
            "Process real-time data from multiple sources",
            "Generate automated reorder recommendations",
            "Provide confidence intervals for all predictions"
          ],
          businessValue: "Reduce inventory carrying costs by 25% and decrease stockouts by 40%",
          workflowLevel: "feature"
        },
        {
          title: "Intelligent Inventory Optimization Dashboard",
          description: "Create a comprehensive dashboard that provides real-time inventory insights, automated alerts for critical stock levels, and actionable recommendations for inventory managers.",
          rationale: "Inventory managers need centralized visibility and actionable intelligence to make informed decisions quickly and prevent costly inventory issues.",
          category: "analytics",
          priority: "medium",
          acceptanceCriteria: [
            "Real-time inventory level monitoring",
            "Customizable alert thresholds and notifications",
            "Interactive analytics with drill-down capabilities",
            "Integration with existing ERP systems"
          ],
          businessValue: "Improve inventory turnover by 20% and reduce manual monitoring overhead by 50%",
          workflowLevel: "feature"
        }
      ];
    } else {
      // Generic high-quality features for other initiatives
      mockFeatures = [
        {
          title: `Advanced ${initiativeData.title} Analytics Platform`,
          description: `Build a comprehensive analytics platform that provides real-time insights, predictive analytics, and automated reporting capabilities specifically designed for ${initiativeData.title} optimization.`,
          rationale: `Data-driven decision making is essential for maximizing the impact of ${initiativeData.title} and ensuring measurable business outcomes.`,
          category: "analytics",
          priority: "high",
          acceptanceCriteria: [
            "Real-time data processing and visualization",
            "Customizable dashboard with role-based access",
            "Automated alert system for key metrics",
            "Export capabilities for executive reporting"
          ],
          businessValue: `Enable data-driven optimization resulting in 25% improvement in key performance indicators`,
          workflowLevel: "feature"
        }
      ];
    }
    
         console.log(`🔧 MockLLMService generated ${mockFeatures.length} contextual features for initiative ${initiativeId}`);
     
     // Return enhanced mock features with proper typing
     return {
      success: true,
      data: {
        initiativeId,
        features: mockFeatures,
        metadata: {
          iterationCount: 1,
          totalTokensUsed: 0,
          processingTime: 1000,
          llmProvider: 'mock',
          llmModel: 'mock-model'
        }
      }
    };
  }

  static async generateEpics(featureId: string, featureData: any, initiativeData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextually relevant epics based on feature type
    const isUIFeature = featureData.title?.toLowerCase().includes('interface') || featureData.title?.toLowerCase().includes('dashboard');
    const isPaymentFeature = featureData.title?.toLowerCase().includes('payment') || featureData.title?.toLowerCase().includes('wallet');
    const isAnalyticsFeature = featureData.title?.toLowerCase().includes('analytics') || featureData.title?.toLowerCase().includes('forecasting');
    
    let mockEpics = [];
    
         if (isUIFeature) {
       mockEpics = [
         {
           title: "Design Responsive Layouts",
           description: "This epic involves designing mobile-responsive layouts for the customer portal. These designs should accommodate various screen sizes and orientations and provide an improved user experience.",
           rationale: "Designing responsive layouts is the foundation for implementing a mobile-responsive portal. The designs will guide development and ensure a consistent and intuitive user interface across devices.",
           category: "technical",
           priority: "high",
           acceptanceCriteria: [
             "Designs are adaptable to various screen sizes and orientations",
             "Designs are intuitive and improve user experience"
           ],
           businessValue: "Provides a blueprint for the development team to implement a mobile-responsive portal, potentially increasing user engagement.",
           workflowLevel: "epic",
           estimatedEffort: "High",
           sprintEstimate: 3
         },
         {
           title: "Implement Responsive Layouts",
           description: "This epic covers the development work to implement responsive layouts based on the approved designs. It involves modifying CSS and HTML structures and potentially integrating a responsive design framework like Bootstrap.",
           rationale: "Implementing responsive layouts is necessary to make the customer portal mobile-responsive. This will enhance the user experience across devices, catering to the growing number of mobile users.",
           category: "technical",
           priority: "high",
           acceptanceCriteria: [
             "Portal layout adjusts based on screen size",
             "Consistent functionality across various screen sizes"
           ],
           businessValue: "Improves usability and consistency across devices, potentially increasing user engagement.",
           workflowLevel: "epic",
           estimatedEffort: "High",
           sprintEstimate: 3
         },
         {
           title: "Testing and Optimization of Responsive Layouts",
           description: "This epic focuses on testing the implemented responsive layouts on various devices and screen sizes, as well as optimizing performance and usability based on testing feedback.",
           rationale: "Thorough testing and optimization are crucial to ensuring the responsive layouts function as expected and provide an improved user experience. They also help identify and resolve performance issues, contributing to a smoother user experience.",
           category: "technical",
           priority: "high",
           acceptanceCriteria: [
             "Responsive layouts function correctly on various devices and screen sizes",
             "Performance is maintained or improved"
           ],
           businessValue: "Ensures the quality and performance of the mobile-responsive portal, contributing to improved user engagement.",
           workflowLevel: "epic",
           estimatedEffort: "Medium",
           sprintEstimate: 2
         }
       ];
    } else if (isPaymentFeature) {
      mockEpics = [
        {
          title: "Payment Gateway Integration and Security",
          description: "Implement secure payment processing infrastructure with multiple gateway support, fraud detection, and compliance with industry security standards including PCI DSS.",
          rationale: "Robust payment security is non-negotiable for customer trust and regulatory compliance, forming the foundation for all payment functionality.",
          category: "security",
          priority: "high",
          acceptanceCriteria: [
            "PCI DSS Level 1 compliance achieved",
            "Multi-gateway failover capability",
            "Real-time fraud detection active",
            "Security audit passed with zero critical issues"
          ],
          businessValue: "Ensure regulatory compliance and build customer trust through enterprise-grade security",
          workflowLevel: "epic",
          estimatedEffort: "High",
          sprintEstimate: 3
        },
        {
          title: "Digital Wallet API Integration",
          description: "Develop comprehensive API integrations for major digital wallet providers with standardized error handling, transaction logging, and reconciliation processes.",
          rationale: "Seamless digital wallet integration requires robust API management and error handling to ensure reliable payment processing across all platforms.",
          category: "integration",
          priority: "high",
          acceptanceCriteria: [
            "All major wallet providers integrated",
            "99.9% uptime for payment processing",
            "Comprehensive transaction logging",
            "Automated reconciliation processes"
          ],
          businessValue: "Enable modern payment options resulting in 30% increase in mobile transactions",
          workflowLevel: "epic",
          estimatedEffort: "Medium",
          sprintEstimate: 2
        }
      ];
    } else if (isAnalyticsFeature) {
      mockEpics = [
        {
          title: "Data Pipeline and Machine Learning Infrastructure",
          description: "Build scalable data processing pipeline with real-time ingestion, feature engineering, and ML model training infrastructure to support advanced analytics capabilities.",
          rationale: "Reliable data infrastructure is fundamental for accurate analytics and machine learning models that drive business value through intelligent automation.",
          category: "data",
          priority: "high",
          acceptanceCriteria: [
            "Real-time data processing at scale",
            "ML model training pipeline operational",
            "Data quality monitoring implemented",
            "99.9% data pipeline uptime achieved"
          ],
          businessValue: "Enable advanced analytics capabilities resulting in 20% improvement in operational efficiency",
          workflowLevel: "epic",
          estimatedEffort: "High",
          sprintEstimate: 3
        }
      ];
    } else {
      // Generic high-quality epics
      mockEpics = [
        {
          title: `Core ${featureData.title} Implementation`,
          description: `Develop the foundational architecture and core functionality for ${featureData.title} with emphasis on scalability, performance, and maintainability.`,
          rationale: `A robust technical foundation is essential for delivering ${featureData.title} capabilities that meet both current requirements and future scalability needs.`,
          category: "technical",
          priority: "high",
          acceptanceCriteria: [
            "Core functionality implemented and tested",
            "Performance benchmarks achieved",
            "Scalability requirements validated",
            "Code quality standards maintained"
          ],
          businessValue: `Provide technical foundation enabling ${featureData.title} business value realization`,
          workflowLevel: "epic",
          estimatedEffort: "Medium",
          sprintEstimate: 2
        }
      ];
    }
    
    console.log(`🔧 MockLLMService generated ${mockEpics.length} contextual epics for feature ${featureId}`);
    return { 
      success: true, 
      data: { 
        featureId, 
        epics: mockEpics, 
        metadata: {
          iterationCount: 1,
          totalTokensUsed: 0,
          processingTime: 1000,
          llmProvider: 'mock',
          llmModel: 'mock-model'
        }
      } 
    };
  }

  static async generateStories(epicId: string, epicData: any, featureData: any, initiativeData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextually relevant stories based on epic type
    const isTechnicalEpic = epicData.category === 'technical' || epicData.title?.toLowerCase().includes('architecture');
    const isUIEpic = epicData.category === 'user-experience' || epicData.title?.toLowerCase().includes('frontend');
    const isSecurityEpic = epicData.category === 'security' || epicData.title?.toLowerCase().includes('security');
    
    let mockStories = [];
    
         if (isTechnicalEpic) {
       mockStories = [
         {
           title: "As a tester, I want to conduct device compatibility tests to ensure the portal's responsiveness",
           description: "The tester needs to conduct device compatibility tests on a variety of mobile devices and screen sizes to validate the responsiveness of the portal's layout.",
           rationale: "Conducting compatibility tests helps ensure that the portal's responsive layout functions correctly across various devices and screen sizes, providing a consistent user experience.",
           category: "testing",
           priority: "high",
           acceptanceCriteria: [
             "Given a variety of devices and screen sizes, When the tester views the portal, Then the layout adjusts correctly based on the device's screen size."
           ],
           businessValue: "Ensures the quality and performance of the mobile-responsive portal, contributing to improved user experience and engagement.",
           workflowLevel: "story",
           storyPoints: 5,
           labels: ["testing", "responsiveness"],
           testingNotes: "Test on a variety of mobile devices and screen sizes. Verify the layout adjusts correctly and maintains functionality."
         },
         {
           title: "As a developer, I want to optimize the portal's performance based on testing feedback",
           description: "The developer needs to optimize the portal's performance based on feedback from the device compatibility tests. This may involve adjusting the layout or resolving performance issues.",
           rationale: "Optimizing the portal's performance based on testing feedback ensures the portal functions smoothly across a variety of devices and screen sizes, improving the user experience.",
           category: "development",
           priority: "high",
           acceptanceCriteria: [
             "Given feedback from the device compatibility tests, When the developer optimizes the portal's performance, Then performance is maintained or improved across various devices and screen sizes."
           ],
           businessValue: "Improves the performance and user experience of the mobile-responsive portal, potentially increasing user engagement.",
           workflowLevel: "story",
           storyPoints: 3,
           labels: ["development", "optimization"],
           testingNotes: "Test on a variety of mobile devices and screen sizes. Verify performance is maintained or improved."
         }
       ];
    } else if (isUIEpic) {
      mockStories = [
        {
          title: "As a customer, I want to see a personalized dashboard when I log in",
          description: "Display a customized dashboard that shows relevant information based on the user's profile, recent activity, and preferences, with quick access to frequently used features.",
          rationale: "Personalized experiences increase user engagement and satisfaction by surfacing the most relevant information and reducing time to complete common tasks.",
          category: "user-interface",
          priority: "high",
          acceptanceCriteria: [
            "Given a customer logs in, When the dashboard loads, Then personalized content is displayed within 3 seconds",
            "Given user preferences are set, When the dashboard renders, Then layout reflects user customizations",
            "Given recent activity exists, When the dashboard displays, Then relevant recent actions are highlighted"
          ],
          businessValue: "Increase user engagement by 40% and reduce time to complete common tasks by 30%",
          workflowLevel: "story",
          storyPoints: 5,
          labels: ["frontend", "personalization"],
          testingNotes: "Test personalization algorithms with various user profiles and verify performance with large datasets"
        },
        {
          title: "As a mobile user, I want the interface to be fully responsive across all device sizes",
          description: "Ensure all interface elements adapt seamlessly to different screen sizes and orientations while maintaining full functionality and optimal user experience on mobile devices.",
          rationale: "Mobile responsiveness is essential for user accessibility and business growth, as mobile traffic continues to increase across all user segments.",
          category: "user-interface",
          priority: "high",
          acceptanceCriteria: [
            "Given a user accesses the site on mobile, When they navigate through features, Then all functionality is accessible and usable",
            "Given the device orientation changes, When the interface adjusts, Then no functionality is lost or obscured",
            "Given touch interactions are used, When users tap interface elements, Then responses are immediate and accurate"
          ],
          businessValue: "Improve mobile user satisfaction by 45% and increase mobile conversion rates",
          workflowLevel: "story",
          storyPoints: 6,
          labels: ["mobile", "responsive"],
          testingNotes: "Test across multiple device types, screen sizes, and operating system versions"
        }
      ];
    } else if (isSecurityEpic) {
      mockStories = [
        {
          title: "As a security administrator, I want to implement multi-factor authentication for all user accounts",
          description: "Deploy comprehensive multi-factor authentication supporting SMS, email, and authenticator apps with fallback options and admin override capabilities for enhanced account security.",
          rationale: "Multi-factor authentication is a critical security control that significantly reduces the risk of unauthorized account access and data breaches.",
          category: "security",
          priority: "high",
          acceptanceCriteria: [
            "Given a user enables MFA, When they log in, Then they must provide a second factor for authentication",
            "Given MFA is required, When a user loses access to their second factor, Then admin recovery options are available",
            "Given MFA is configured, When login attempts are made, Then all authentication events are logged for audit"
          ],
          businessValue: "Reduce security incidents by 80% and ensure compliance with industry security standards",
          workflowLevel: "story",
          storyPoints: 8,
          labels: ["security", "authentication"],
          testingNotes: "Verify MFA works with all supported methods and test recovery procedures thoroughly"
        }
      ];
    } else {
      // Generic high-quality stories
      mockStories = [
        {
          title: `As a user, I want to access ${epicData.title} functionality efficiently`,
          description: `Provide intuitive access to ${epicData.title} capabilities through well-designed user interfaces and streamlined workflows that minimize user effort and maximize productivity.`,
          rationale: `Efficient access to ${epicData.title} functionality is essential for user adoption and realizing the intended business value from this investment.`,
          category: "functional",
          priority: "medium",
          acceptanceCriteria: [
            `Given ${epicData.title} is implemented, When users access the functionality, Then they can complete tasks efficiently`,
            "Given the interface is designed, When users interact with features, Then the experience is intuitive and helpful",
            "Given functionality is available, When users need assistance, Then help and guidance are readily accessible"
          ],
          businessValue: `Enable effective utilization of ${epicData.title} resulting in improved user productivity`,
          workflowLevel: "story",
          storyPoints: 5,
          labels: ["functional", "user-experience"],
          testingNotes: `Test ${epicData.title} functionality with representative user scenarios and validate usability`
        }
      ];
    }
    
    console.log(`🔧 MockLLMService generated ${mockStories.length} contextual stories for epic ${epicId}`);
    return { 
      success: true, 
      data: { 
        epicId, 
        stories: mockStories, 
        metadata: {
          iterationCount: 1,
          totalTokensUsed: 0,
          processingTime: 1000,
          llmProvider: 'mock',
          llmModel: 'mock-model'
        }
      } 
    };
  }
} 