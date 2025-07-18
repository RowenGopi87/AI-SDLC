# AURA - Automated Unified Requirement & Assurance

An AI-powered SDLC orchestration platform designed to streamline software development workflows. This is the UI-first MVP focusing on visual design and user experience.

## 🚀 Features

### 8 Core Modules

1. **Use Case Intake** - Capture and manage use cases with AI enhancement
2. **Requirement Review Enhancement** - Side-by-side comparison of original vs AI-enhanced requirements
3. **Decomposition Work Items** - Hierarchical breakdown of work items (Initiative → Feature → Epic → Story)
4. **Test Case Generation** - Automated test case creation with categorization
5. **Execution Layer** - Test execution tracking and management
6. **Defect Management** - Bug tracking with AI-powered analysis
7. **Traceability Matrix** - End-to-end requirement traceability
8. **Dashboard & Reporting** - Comprehensive project overview and metrics

### Key Features

- **Modern UI/UX** - Clean, minimal design inspired by Linear, Notion, and Vercel
- **Responsive Design** - Fully mobile-friendly interface
- **State Management** - Powered by Zustand for efficient state handling
- **Mock Data** - Comprehensive mock data for all modules
- **Human-in-the-loop** - Approval workflows for AI-generated content
- **Real-time Updates** - Live status tracking and notifications
- **Search & Filter** - Advanced filtering across all modules
- **Export Capabilities** - Data export functionality (placeholder)

## 🛠️ Tech Stack

- **Frontend**: React 18 with Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: ShadCN UI
- **State Management**: Zustand
- **Icons**: Lucide React
- **Development**: ESLint, Prettier

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RowenGopi87/AI-SDLC.git
   cd AI-SDLC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Quick Start with MCP Integration**
   ```bash
   # Run the setup script
   .\scripts\setup-mcp.bat
   
   # Start Aura with MCP integration
   .\start-aura-with-mcp.bat
   ```

## 📁 Repository Structure

```
Aura/
├── src/                      # Source code
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── store/               # State management
├── docs/                     # Documentation
│   ├── guides/              # User guides and setup instructions
│   ├── fixes/               # Technical fix documentation
│   └── troubleshooting/     # Troubleshooting guides
├── scripts/                  # Utility scripts
│   ├── setup-mcp.bat        # MCP setup script
│   ├── diagnose-mcp-connection.bat  # Connection diagnostics
│   └── ... (other utilities)
├── mcp/                      # MCP server files
├── public/                   # Static assets
├── fresh-start.bat          # Fresh project start script
├── start-aura-with-mcp.bat  # Main startup script
└── README.md                # This file
```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📱 Module Overview

### Use Case Intake
- **Purpose**: Capture and manage use cases
- **Features**: Form submission, AI enhancement, approval workflow
- **Navigation**: `/use-cases`

### Requirement Review Enhancement
- **Purpose**: Review and enhance requirements with AI
- **Features**: Side-by-side comparison, human approval, version tracking
- **Navigation**: `/requirements`

### Decomposition Work Items
- **Purpose**: Break down requirements into hierarchical work items
- **Features**: Tree view, drag-and-drop, status tracking
- **Navigation**: `/decomposition`

### Test Case Generation
- **Purpose**: Generate comprehensive test cases
- **Features**: Positive/Negative/Edge case tabs, AI generation
- **Navigation**: `/test-cases`

### Execution Layer
- **Purpose**: Execute and track test cases
- **Features**: Test execution, logs, status updates
- **Navigation**: `/execution`

### Defect Management
- **Purpose**: Track and manage software defects
- **Features**: Bug reporting, AI analysis, assignment
- **Navigation**: `/defects`

### Traceability Matrix
- **Purpose**: Maintain end-to-end requirement traceability
- **Features**: Drill-down navigation, breadcrumbs, relationship mapping
- **Navigation**: `/traceability`

### Dashboard & Reporting
- **Purpose**: Project overview and metrics
- **Features**: KPI cards, charts, quick actions
- **Navigation**: `/dashboard`

## 🎯 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── use-cases/         # Use Case Intake module
│   ├── requirements/      # Requirement Review module
│   ├── decomposition/     # Work Item Decomposition
│   ├── test-cases/        # Test Case Generation
│   ├── execution/         # Test Execution Layer
│   ├── defects/           # Defect Management
│   ├── traceability/      # Traceability Matrix
│   └── dashboard/         # Dashboard & Reporting
├── components/
│   ├── ui/                # ShadCN UI components
│   └── layout/            # Layout components
├── lib/                   # Utility functions
├── store/                 # Zustand stores
│   ├── use-case-store.ts
│   ├── requirement-store.ts
│   ├── work-item-store.ts
│   ├── test-case-store.ts
│   ├── execution-store.ts
│   ├── defect-store.ts
│   ├── traceability-store.ts
│   └── dashboard-store.ts
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Purple (#8B5CF6)

### Typography
- **Primary Font**: Inter (system font fallback)
- **Headings**: Font weight 600-700
- **Body**: Font weight 400-500

### Components
- **Cards**: Clean, minimal with subtle shadows
- **Buttons**: Consistent sizing and states
- **Forms**: Proper validation and error handling
- **Tables**: Responsive with sorting and filtering
- **Modals**: Centered with backdrop blur

## 🔮 Future Enhancements

### Phase 2 - Backend Integration
- Real AI/ML model integration
- Database connectivity
- API development
- Authentication system

### Phase 3 - Advanced Features
- Real-time collaboration
- Advanced analytics
- Custom workflows
- Integration with external tools

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Linear, Notion, Vercel
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

---

**Note**: This is a UI-first MVP without backend integration. All data is mocked and stored in local state. The focus is on demonstrating the user interface and user experience for the AURA platform.
