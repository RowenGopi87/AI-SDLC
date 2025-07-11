import { CURRENT_WORKFLOW } from './workflow-config';

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