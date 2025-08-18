# AuraV2 Testing Suite

This directory contains comprehensive tests for the AuraV2 Enhanced Workflow system, covering all three main workflow stages: **Idea**, **Qualify**, and **Prioritize**.

## 📁 Test Structure

```
tests/
├── unit/aurav2/              # Unit tests for individual components
│   ├── idea-stage.test.tsx      # Idea Stage component tests
│   ├── qualify-stage.test.tsx   # Qualify Stage component tests
│   └── prioritize-stage.test.tsx # Prioritize Stage component tests
├── integration/aurav2/       # Integration tests for API endpoints
│   └── api-endpoints.test.ts    # API endpoint integration tests
├── e2e/aurav2/              # End-to-end workflow tests
│   ├── complete-workflow.spec.ts     # Complete workflow E2E tests
│   └── workflow-integration.spec.ts  # Workflow integration tests
├── mocks/                   # Mock data and utilities
│   └── aurav2-data.ts          # Mock business briefs, qualified ideas, etc.
├── utils/                   # Test utilities and helpers
│   ├── test-helpers.tsx        # React testing utilities
│   └── mock-api.ts            # API mocking utilities
├── setup.ts                 # Jest test setup
└── README.md               # This file
```

## 🧪 Test Types

### Unit Tests
- **Component rendering** - Verify all UI elements render correctly
- **User interactions** - Test button clicks, form inputs, modal operations
- **State management** - Verify component state updates correctly
- **Error handling** - Test error scenarios and edge cases
- **Accessibility** - Ensure proper ARIA labels and keyboard navigation

### Integration Tests
- **API endpoint testing** - Test all AuraV2 API routes
- **Database integration** - Verify database operations work correctly
- **Service method testing** - Test AuraV2Service class methods
- **Request/response validation** - Ensure proper data formats
- **Error handling** - Test API error responses

### End-to-End Tests
- **Complete workflow** - Test full Idea → Qualify → Prioritize flow
- **Role-based access** - Verify different user roles work correctly
- **Cross-page navigation** - Test navigation between stages
- **Real-time updates** - Verify metrics update correctly
- **Responsive design** - Test on different viewport sizes

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# End-to-end tests only
npm run test:e2e

# Run with UI for E2E tests
npm run test:e2e:ui

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Run Individual Test Files
```bash
# Single unit test file
npm test tests/unit/aurav2/idea-stage.test.tsx

# Single E2E test file
npx playwright test tests/e2e/aurav2/complete-workflow.spec.ts

# Run specific test by name
npm test -- --testNamePattern="should render the idea stage header"
```

## 🎯 Test Coverage

The test suite covers:

### Idea Stage (✅ Complete)
- ✅ Component rendering and UI elements
- ✅ Business brief loading and display
- ✅ AI assessment functionality
- ✅ Modal interactions (view/edit/delete)
- ✅ Tab navigation
- ✅ Error handling and loading states
- ✅ Accessibility and keyboard navigation

### Qualify Stage (✅ Complete)
- ✅ Qualification process workflow
- ✅ Research tools interface
- ✅ Qualified ideas management
- ✅ Search and filtering functionality
- ✅ Assessment criteria display
- ✅ Empty state handling
- ✅ API integration

### Prioritize Stage (✅ Complete)
- ✅ Portfolio prioritization interface
- ✅ Value/Effort matrix visualization
- ✅ Priority list management
- ✅ Auto-prioritization functionality
- ✅ Portfolio planning and roadmap
- ✅ Investment analysis display
- ✅ Resource planning metrics

### API Endpoints (✅ Complete)
- ✅ `/api/aurav2/workflow/stages` - Workflow stage management
- ✅ `/api/aurav2/qualify/ideas` - Qualified ideas CRUD
- ✅ `/api/aurav2/prioritize/portfolio` - Portfolio prioritization
- ✅ `/api/aurav2/ai/assess-quality` - AI quality assessment

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript support with ts-jest
- React Testing Library setup
- Path mapping for `@/` imports
- Coverage reporting configuration
- Mock setup for Next.js components

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Responsive design testing
- Screenshot and trace capture on failures
- Development server integration

## 📊 Test Data

### Mock Data Sources
- **Business Briefs** - Various status/priority combinations
- **Qualified Ideas** - Different qualification scores and criteria
- **Workflow Stages** - Complete stage definitions
- **AI Assessments** - Sample quality assessment results

### Test Scenarios
- **Happy Path** - Normal user workflow completion
- **Error Scenarios** - Network failures, API errors, malformed data
- **Edge Cases** - Empty states, boundary conditions
- **Performance** - Page load times, concurrent operations
- **Security** - Role-based access validation

## 🐛 Debugging Tests

### Common Issues and Solutions

1. **Tests timing out**
   ```bash
   # Increase timeout in jest.config.js
   testTimeout: 10000
   ```

2. **Mock API not working**
   ```typescript
   // Ensure fetch is properly mocked in setup.ts
   global.fetch = jest.fn();
   ```

3. **Component not rendering**
   ```typescript
   // Check if all required props are provided
   // Verify mock store values are set correctly
   ```

4. **E2E tests failing**
   ```bash
   # Run with headed browser for debugging
   npx playwright test --headed

   # Run specific test with debug
   npx playwright test tests/e2e/aurav2/complete-workflow.spec.ts --debug
   ```

## 🎨 Writing New Tests

### Adding Unit Tests
1. Create test file in appropriate `/tests/unit/aurav2/` directory
2. Import component and testing utilities
3. Use `render()` from test-helpers for consistent setup
4. Follow existing patterns for mocking API calls

### Adding Integration Tests
1. Create test file in `/tests/integration/aurav2/`
2. Mock database connections and services
3. Test API routes directly
4. Verify request/response formats

### Adding E2E Tests
1. Create `.spec.ts` file in `/tests/e2e/aurav2/`
2. Use Playwright test framework
3. Test complete user workflows
4. Include error scenarios and edge cases

## 📈 Continuous Integration

Tests can be easily integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:integration
    npm run test:e2e
```

## 🔄 Test Maintenance

- **Update mock data** when business brief schema changes
- **Add new test cases** when new features are implemented  
- **Review coverage reports** to identify untested code paths
- **Update E2E tests** when UI layouts change significantly

The test suite is designed to catch regressions early and ensure the AuraV2 workflow remains stable as development continues.
