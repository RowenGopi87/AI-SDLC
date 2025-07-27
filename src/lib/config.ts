export const APP_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "AURA";

export const APP_DESCRIPTION = "Automated Unified Requirement & Assurance";

export const APP_VERSION = "1.0.0-MVP";

export const MODULES = [
  { id: "use-cases", name: "Idea", path: "/use-cases" },
  { id: "requirements", name: "Work Items", path: "/requirements" },
  { id: "design", name: "Design", path: "/design" },
  { id: "code", name: "Code", path: "/code" },
  // { id: "decomposition", name: "Decomposition", path: "/decomposition" }, // Disabled
  { id: "test-cases", name: "Test Cases", path: "/test-cases" },
  { id: "execution", name: "Execution", path: "/execution" },
  { id: "defects", name: "Defects", path: "/defects" },
  { id: "traceability", name: "Traceability", path: "/traceability" },
  { id: "dashboard", name: "Dashboard", path: "/dashboard" },
] as const;

export const WORKFLOW_STEPS = [
  { id: 1, name: "Use Case Intake", module: "use-cases" },
  { id: 2, name: "Requirement Review", module: "requirements" },
  { id: 3, name: "Design & Prototype", module: "design" },
  { id: 4, name: "Work Decomposition", module: "decomposition" },
  { id: 5, name: "Test Generation", module: "test-cases" },
  { id: 6, name: "Test Execution", module: "execution" },
  { id: 7, name: "Defect Management", module: "defects" },
  { id: 8, name: "Traceability Review", module: "traceability" },
  { id: 9, name: "Dashboard Review", module: "dashboard" },
] as const; 