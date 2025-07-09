// Types for the mock data
export interface UseCase {
  id: string;
  title: string;
  description: string;
  businessValue: string;
  acceptanceCriteria: string[];
  submittedBy: string;
  submittedAt: Date;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
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
}

export interface WorkItem {
  id: string;
  type: "initiative" | "feature" | "epic" | "story";
  title: string;
  description: string;
  parentId?: string;
  requirementId: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "in_progress" | "done";
  assignee?: string;
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
}

// Mock Data
export const mockUseCases: UseCase[] = [
  {
    id: "uc-001",
    title: "User Authentication System",
    description: "Implement a secure user authentication system with multi-factor authentication support",
    businessValue: "Increase security and user trust by implementing robust authentication mechanisms",
    acceptanceCriteria: [
      "Users can login with username/password",
      "Multi-factor authentication is supported",
      "Password reset functionality is available",
      "Session management is implemented"
    ],
    submittedBy: "John Doe",
    submittedAt: new Date("2024-01-15"),
    status: "approved",
    priority: "high"
  },
  {
    id: "uc-002",
    title: "Product Catalog Management",
    description: "Create a comprehensive product catalog with search and filtering capabilities",
    businessValue: "Improve customer experience and increase sales through better product discovery",
    acceptanceCriteria: [
      "Products can be added, edited, and deleted",
      "Search functionality works across all product attributes",
      "Filtering by category, price, and availability",
      "Product images and descriptions are supported"
    ],
    submittedBy: "Jane Smith",
    submittedAt: new Date("2024-01-20"),
    status: "in_review",
    priority: "medium"
  },
  {
    id: "uc-003",
    title: "Order Processing System",
    description: "Implement end-to-end order processing from cart to delivery",
    businessValue: "Streamline sales operations and improve customer satisfaction",
    acceptanceCriteria: [
      "Shopping cart functionality",
      "Checkout process with payment integration",
      "Order tracking and status updates",
      "Email notifications for order updates"
    ],
    submittedBy: "Mike Johnson",
    submittedAt: new Date("2024-01-25"),
    status: "draft",
    priority: "high"
  }
];

export const mockRequirements: Requirement[] = [
  {
    id: "req-001",
    useCaseId: "uc-001",
    originalText: "Users should be able to login",
    enhancedText: "The system shall provide a login interface that authenticates users using their registered email address and password, with failed login attempts being logged for security monitoring. The login process must complete within 3 seconds under normal load conditions.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "Technical Lead",
    reviewedAt: new Date("2024-01-16")
  },
  {
    id: "req-002",
    useCaseId: "uc-001",
    originalText: "Support two-factor authentication",
    enhancedText: "The system shall support Time-based One-Time Password (TOTP) two-factor authentication using standard authenticator apps (Google Authenticator, Authy). Users must be able to enable/disable 2FA from their account settings, and the system shall enforce 2FA for admin accounts.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "approved",
    reviewedBy: "Security Team",
    reviewedAt: new Date("2024-01-17")
  },
  {
    id: "req-003",
    useCaseId: "uc-002",
    originalText: "Products should be searchable",
    enhancedText: "The system shall provide a search interface that allows users to search products by name, description, category, and SKU. Search results must be returned within 2 seconds and be ranked by relevance. The search shall support partial matches and common misspellings.",
    isUnambiguous: true,
    isTestable: true,
    hasAcceptanceCriteria: true,
    status: "enhanced",
    reviewedBy: "Product Owner",
    reviewedAt: new Date("2024-01-21")
  }
];

export const mockWorkItems: WorkItem[] = [
  // Initiative
  {
    id: "wi-001",
    type: "initiative",
    title: "E-commerce Platform",
    description: "Build a complete e-commerce platform with modern features",
    requirementId: "req-001",
    acceptanceCriteria: ["All features implemented", "Performance benchmarks met", "Security requirements satisfied"],
    priority: "high",
    status: "in_progress"
  },
  // Feature
  {
    id: "wi-002",
    type: "feature",
    title: "User Management",
    description: "Complete user management system with authentication and authorization",
    parentId: "wi-001",
    requirementId: "req-001",
    acceptanceCriteria: ["User registration", "Login/logout", "Profile management"],
    priority: "high",
    status: "in_progress"
  },
  // Epic
  {
    id: "wi-003",
    type: "epic",
    title: "Authentication System",
    description: "Secure authentication with multi-factor support",
    parentId: "wi-002",
    requirementId: "req-001",
    acceptanceCriteria: ["Basic login", "2FA support", "Password reset"],
    priority: "high",
    status: "in_progress"
  },
  // Stories
  {
    id: "wi-004",
    type: "story",
    title: "User Login",
    description: "As a user, I want to login with my credentials",
    parentId: "wi-003",
    requirementId: "req-001",
    acceptanceCriteria: ["Email/password validation", "Session creation", "Error handling"],
    storyPoints: 5,
    priority: "high",
    status: "done",
    assignee: "Dev Team A"
  },
  {
    id: "wi-005",
    type: "story",
    title: "Two-Factor Authentication",
    description: "As a user, I want to enable 2FA for additional security",
    parentId: "wi-003",
    requirementId: "req-002",
    acceptanceCriteria: ["TOTP setup", "QR code generation", "Backup codes"],
    storyPoints: 8,
    priority: "medium",
    status: "in_progress",
    assignee: "Dev Team B"
  }
];

export const mockTestCases: TestCase[] = [
  {
    id: "tc-001",
    workItemId: "wi-004",
    title: "Valid User Login",
    description: "Test successful login with valid credentials",
    type: "positive",
    preconditions: ["User account exists", "User is not already logged in"],
    steps: ["Navigate to login page", "Enter valid email", "Enter valid password", "Click login button"],
    expectedResult: "User is successfully logged in and redirected to dashboard",
    actualResult: "User logged in successfully",
    status: "passed",
    priority: "high",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-18"),
    lastExecuted: new Date("2024-01-19")
  },
  {
    id: "tc-002",
    workItemId: "wi-004",
    title: "Invalid Password Login",
    description: "Test login with invalid password",
    type: "negative",
    preconditions: ["User account exists"],
    steps: ["Navigate to login page", "Enter valid email", "Enter invalid password", "Click login button"],
    expectedResult: "Error message displayed, user not logged in",
    actualResult: "Unexpected error occurred",
    status: "failed",
    priority: "high",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-18"),
    lastExecuted: new Date("2024-01-19")
  },
  {
    id: "tc-003",
    workItemId: "wi-005",
    title: "Enable 2FA",
    description: "Test enabling two-factor authentication",
    type: "positive",
    preconditions: ["User is logged in", "2FA is not enabled"],
    steps: ["Go to account settings", "Click enable 2FA", "Scan QR code", "Enter verification code"],
    expectedResult: "2FA is enabled and backup codes are generated",
    status: "not_run",
    priority: "medium",
    createdBy: "QA Team",
    createdAt: new Date("2024-01-20")
  },
  {
    id: "tc-004",
    workItemId: "wi-004",
    title: "SQL Injection in Login",
    description: "Test login form against SQL injection attacks",
    type: "edge",
    preconditions: ["Login form is accessible"],
    steps: ["Navigate to login page", "Enter SQL injection payload in email field", "Enter any password", "Click login button"],
    expectedResult: "Login fails safely, no database error exposed",
    status: "blocked",
    priority: "critical",
    createdBy: "Security Team",
    createdAt: new Date("2024-01-18")
  }
];

export const mockDefects: Defect[] = [
  {
    id: "def-001",
    testCaseId: "tc-002",
    title: "Incorrect error message on invalid login",
    description: "When user enters invalid password, system shows generic error instead of specific message",
    severity: "medium",
    priority: "medium",
    status: "open",
    assignee: "Dev Team A",
    reporter: "QA Team",
    createdAt: new Date("2024-01-19"),
    aiSummary: "The login error handling is not providing specific feedback to users, which may impact user experience and security."
  },
  {
    id: "def-002",
    testCaseId: "tc-004",
    title: "SQL Injection vulnerability in login form",
    description: "Login form is vulnerable to SQL injection attacks through the email field",
    severity: "critical",
    priority: "critical",
    status: "in_progress",
    assignee: "Security Team",
    reporter: "Security Team",
    createdAt: new Date("2024-01-18"),
    aiSummary: "Critical security vulnerability that could lead to database compromise. Immediate attention required."
  },
  {
    id: "def-003",
    testCaseId: "tc-001",
    title: "Session timeout not working",
    description: "User sessions are not expiring after the configured timeout period",
    severity: "high",
    priority: "high",
    status: "resolved",
    assignee: "Dev Team A",
    reporter: "QA Team",
    createdAt: new Date("2024-01-17"),
    resolvedAt: new Date("2024-01-20"),
    aiSummary: "Session management issue that could impact security. Fixed by implementing proper session cleanup."
  }
];

// Dashboard metrics
export const mockDashboardData = {
  testCoverage: {
    total: 156,
    passed: 142,
    failed: 8,
    blocked: 6,
    coverage: 91.0
  },
  useCaseStatus: {
    total: 15,
    approved: 8,
    inReview: 4,
    draft: 3
  },
  defectTrends: {
    open: 12,
    inProgress: 5,
    resolved: 28,
    closed: 45
  },
  workItemProgress: {
    total: 67,
    backlog: 25,
    inProgress: 18,
    done: 24
  }
};

// Traceability data
export const mockTraceabilityData = {
  "uc-001": {
    requirements: ["req-001", "req-002"],
    workItems: ["wi-001", "wi-002", "wi-003", "wi-004", "wi-005"],
    testCases: ["tc-001", "tc-002", "tc-003", "tc-004"],
    defects: ["def-001", "def-002", "def-003"]
  },
  "uc-002": {
    requirements: ["req-003"],
    workItems: [],
    testCases: [],
    defects: []
  },
  "uc-003": {
    requirements: [],
    workItems: [],
    testCases: [],
    defects: []
  }
}; 