import { test, expect } from '@playwright/test';

test.describe('AuraV2 Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to AuraV2 dashboard
    await page.goto('/aurav2');
    
    // Select Product Manager role (full access)
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    // Wait for role selection to complete
    await expect(page.locator('text=Role: Product Manager')).toBeVisible();
  });

  test('should complete full workflow: Idea → Qualify → Prioritize', async ({ page }) => {
    // Step 1: Navigate to Idea Stage
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
    
    // Verify business briefs are loaded
    await page.getByRole('tab', { name: /briefs/i }).click();
    await expect(page.locator('text=Active Business Briefs')).toBeVisible();
    
    // Step 2: Navigate to Qualify Stage
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await expect(page.locator('text=Qualify Stage • Research & Assessment')).toBeVisible();
    
    // Check ideas to qualify tab
    await page.getByRole('tab', { name: /ideas to qualify/i }).click();
    await expect(page.locator('text=Approved Ideas Awaiting Qualification')).toBeVisible();
    
    // Start qualification process for first idea
    const firstQualifyButton = page.getByRole('button', { name: 'Start Qualification' }).first();
    if (await firstQualifyButton.isVisible()) {
      await firstQualifyButton.click();
      
      // Wait for qualification to complete
      await expect(page.locator('text=Qualifying...')).toBeVisible();
      
      // Handle the completion dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Wait for qualification to finish (up to 5 seconds)
      await page.waitForTimeout(3000);
    }
    
    // Check qualified ideas tab
    await page.getByRole('tab', { name: /qualified ideas/i }).click();
    await expect(page.locator('text=Qualified Ideas')).toBeVisible();
    
    // Step 3: Navigate to Prioritize Stage
    await page.getByRole('link', { name: 'Prioritize' }).click();
    await expect(page.locator('text=Prioritize Stage • Portfolio Planning')).toBeVisible();
    
    // Check overview metrics
    await expect(page.locator('text=Portfolio Summary')).toBeVisible();
    await expect(page.locator('text=Current Stage: Prioritize')).toBeVisible();
    
    // Test Value/Effort Matrix
    await page.getByRole('tab', { name: /value.*effort.*matrix/i }).click();
    await expect(page.locator('text=Value vs Effort Matrix')).toBeVisible();
    await expect(page.locator('text=Quick Wins')).toBeVisible();
    await expect(page.locator('text=Major Projects')).toBeVisible();
    
    // Test Portfolio Planning
    await page.getByRole('tab', { name: /portfolio planning/i }).click();
    await expect(page.locator('text=Portfolio Roadmap')).toBeVisible();
    await expect(page.locator('text=Investment Analysis')).toBeVisible();
  });

  test('should handle role-based access correctly', async ({ page }) => {
    // Navigate back to dashboard to change role
    await page.goto('/aurav2');
    
    // Select Business Analyst role (limited access)
    await page.getByText('Business Analyst').click();
    await page.getByRole('button', { name: 'Continue as Business Analyst' }).click();
    
    // Should have access to Idea and Qualify stages
    await expect(page.getByRole('link', { name: 'Idea Stage' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Qualify Ideas' })).toBeVisible();
    
    // Should NOT have access to Prioritize stage
    await expect(page.getByRole('link', { name: 'Prioritize' })).not.toBeVisible();
    
    // Should show Legacy AURA access restriction
    await expect(page.locator('text=Legacy AURA access not available for your role')).toBeVisible();
  });

  test('should maintain state when navigating between stages', async ({ page }) => {
    // Start at Idea stage and run AI assessment
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await page.getByRole('tab', { name: /briefs/i }).click();
    
    // Run AI assessment if button is available
    const aiButton = page.getByRole('button', { name: /ai assessment/i }).first();
    if (await aiButton.isVisible()) {
      await aiButton.click();
      page.on('dialog', dialog => dialog.accept());
      await page.waitForTimeout(1000);
    }
    
    // Navigate to qualify stage
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    
    // Navigate back to idea stage
    await page.getByRole('link', { name: 'Back to Ideas' }).click();
    
    // Should maintain previous state
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
    await page.getByRole('tab', { name: /ai quality/i }).click();
    await expect(page.locator('text=AI Quality Assessment')).toBeVisible();
  });

  test('should show correct stage progression indicators', async ({ page }) => {
    // Check each stage shows correct stage number and progression
    
    // Stage 1: Idea
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await expect(page.locator('text=Stage 1')).toBeVisible();
    await expect(page.locator('.bg-blue-600 .text-white:has-text("1")')).toBeVisible();
    
    // Stage 2: Qualify  
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await expect(page.locator('text=Stage 2')).toBeVisible();
    await expect(page.locator('.bg-purple-600 .text-white:has-text("2")')).toBeVisible();
    
    // Stage 3: Prioritize
    await page.getByRole('link', { name: 'Prioritize' }).click();
    await expect(page.locator('text=Stage 3')).toBeVisible();
    await expect(page.locator('.bg-green-600 .text-white:has-text("3")')).toBeVisible();
  });
});

test.describe('AuraV2 UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
  });

  test('should handle modal interactions correctly', async ({ page }) => {
    // Navigate to idea stage
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await page.getByRole('tab', { name: /briefs/i }).click();
    
    // Test view modal
    const viewButton = page.getByRole('button', { name: /view/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('text=APPROVED')).toBeVisible();
      
      // Close modal
      await page.getByRole('button').first().click(); // X button
    }
    
    // Test edit modal
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('text=Edit Business Brief')).toBeVisible();
      
      // Cancel edit
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });

  test('should handle search and filtering', async ({ page }) => {
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await page.getByRole('tab', { name: /ideas to qualify/i }).click();
    
    // Test search functionality
    const searchInput = page.getByPlaceholder('Search ideas...');
    await searchInput.fill('Customer Portal');
    await expect(searchInput).toHaveValue('Customer Portal');
    
    // Test filter button
    await page.getByRole('button', { name: /filter/i }).click();
    // Filter button should be interactive
  });

  test('should display real-time metrics updates', async ({ page }) => {
    // Navigate to qualify stage
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    
    // Check initial metrics
    await expect(page.locator('text=Ideas to Qualify')).toBeVisible();
    await expect(page.locator('text=Qualified')).toBeVisible();
    
    // Metrics should be displayed consistently across tabs
    await page.getByRole('tab', { name: /overview/i }).click();
    await expect(page.locator('text=Qualification Metrics')).toBeVisible();
    
    await page.getByRole('tab', { name: /qualified ideas/i }).click();
    await expect(page.locator('text=Qualified Ideas')).toBeVisible();
  });
});

test.describe('AuraV2 Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    // Should navigate properly on mobile
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
    
    // Tabs should be accessible
    await page.getByRole('tab', { name: /briefs/i }).click();
    await expect(page.locator('text=Active Business Briefs')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    // Test qualify stage on tablet
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await expect(page.locator('text=Research and assess approved ideas')).toBeVisible();
    
    // Research tools should be properly laid out
    await page.getByRole('tab', { name: /research tools/i }).click();
    await expect(page.locator('text=Market Research')).toBeVisible();
    await expect(page.locator('text=Competitor Analysis')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    // Test prioritize stage on desktop
    await page.getByRole('link', { name: 'Prioritize' }).click();
    await expect(page.locator('text=Portfolio Planning')).toBeVisible();
    
    // Value/Effort matrix should display properly
    await page.getByRole('tab', { name: /value.*effort.*matrix/i }).click();
    await expect(page.locator('text=Quick Wins')).toBeVisible();
    await expect(page.locator('text=Major Projects')).toBeVisible();
    await expect(page.locator('text=Fill-ins')).toBeVisible();
    await expect(page.locator('text=Questionable')).toBeVisible();
  });
});

test.describe('AuraV2 Performance', () => {
  test('should load pages within acceptable time limits', async ({ page }) => {
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    // Test page load times
    const startTime = Date.now();
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
    const ideaLoadTime = Date.now() - startTime;
    
    expect(ideaLoadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    const qualifyStartTime = Date.now();
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await expect(page.locator('text=Qualify Stage • Research & Assessment')).toBeVisible();
    const qualifyLoadTime = Date.now() - qualifyStartTime;
    
    expect(qualifyLoadTime).toBeLessThan(2000); // Should load within 2 seconds
    
    const prioritizeStartTime = Date.now();
    await page.getByRole('link', { name: 'Prioritize' }).click();
    await expect(page.locator('text=Prioritize Stage • Portfolio Planning')).toBeVisible();
    const prioritizeLoadTime = Date.now() - prioritizeStartTime;
    
    expect(prioritizeLoadTime).toBeLessThan(2000); // Should load within 2 seconds
  });

  test('should handle concurrent API calls efficiently', async ({ page }) => {
    await page.goto('/aurav2/idea');
    
    // Multiple concurrent actions should not break the UI
    await Promise.all([
      page.getByRole('tab', { name: /briefs/i }).click(),
      page.getByRole('tab', { name: /ai quality/i }).click(),
      page.getByRole('tab', { name: /overview/i }).click()
    ]);
    
    // UI should remain responsive
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
  });
});

test.describe('AuraV2 Error Scenarios', () => {
  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('/api/**', route => route.abort());
    
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    
    // Should show loading state but not crash
    await expect(page.locator('text=Loading')).toBeVisible();
  });

  test('should handle malformed API responses', async ({ page }) => {
    // Mock API to return malformed data
    await page.route('/api/business-briefs/list', route => 
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid data' })
      })
    );
    
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
    
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    
    // Should handle error gracefully without crashing
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
  });
});
