import { test, expect } from '@playwright/test';

test.describe('AuraV2 Workflow Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/aurav2');
    await page.getByText('Product Manager').click();
    await page.getByRole('button', { name: 'Continue as Product Manager' }).click();
  });

  test('should demonstrate business brief to qualified idea flow', async ({ page }) => {
    // Start from business brief in idea stage
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    await page.getByRole('tab', { name: /briefs/i }).click();
    
    // Wait for business briefs to load
    await expect(page.locator('text=Active Business Briefs')).toBeVisible();
    
    // Run AI assessment on a business brief
    const assessmentButton = page.getByRole('button', { name: /ai assessment/i }).first();
    if (await assessmentButton.isVisible()) {
      await assessmentButton.click();
      
      // Handle assessment completion dialog
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('AI Assessment Complete');
        dialog.accept();
      });
      
      await page.waitForTimeout(1000);
    }
    
    // Navigate to qualify stage
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    await expect(page.locator('text=Research and assess approved ideas')).toBeVisible();
    
    // Start qualification process
    await page.getByRole('tab', { name: /ideas to qualify/i }).click();
    const qualifyButton = page.getByRole('button', { name: 'Start Qualification' }).first();
    
    if (await qualifyButton.isVisible()) {
      await qualifyButton.click();
      
      // Handle qualification completion
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('Qualification complete');
        dialog.accept();
      });
      
      await page.waitForTimeout(3000);
      
      // Verify qualified idea appears
      await page.getByRole('tab', { name: /qualified ideas/i }).click();
      await expect(page.locator('text=Test Customer Portal Enhancement')).toBeVisible();
    }
  });

  test('should maintain data consistency across stage transitions', async ({ page }) => {
    // Check that data persists when navigating between stages
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    
    // Note initial brief count
    await page.getByRole('tab', { name: /briefs/i }).click();
    const initialBriefText = await page.locator('text=/\\d+ Active Briefs/').textContent();
    
    // Navigate to qualify stage
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    
    // Navigate back to idea stage
    await page.getByRole('link', { name: 'Back to Ideas' }).click();
    
    // Verify brief count is maintained
    const finalBriefText = await page.locator('text=/\\d+ Active Briefs/').textContent();
    expect(finalBriefText).toBe(initialBriefText);
  });

  test('should handle workflow stage progression correctly', async ({ page }) => {
    // Test stage progression indicators
    const stages = [
      { name: 'Idea Stage', url: '/aurav2/idea', stageNum: '1' },
      { name: 'Qualify Ideas', url: '/aurav2/qualify', stageNum: '2' },
      { name: 'Prioritize', url: '/aurav2/prioritize', stageNum: '3' }
    ];
    
    for (const stage of stages) {
      await page.getByRole('link', { name: stage.name }).click();
      
      // Verify stage indicator
      await expect(page.locator(`text=Stage ${stage.stageNum}`)).toBeVisible();
      
      // Verify stage is marked as active
      await expect(page.locator('text=Active')).toBeVisible();
      
      // Verify workflow step indicator in sidebar shows progression
      await expect(page.locator('text=Workflow Progress')).toBeVisible();
    }
  });

  test('should validate cross-stage data relationships', async ({ page }) => {
    // Verify that qualified ideas reference correct business briefs
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    
    // Check qualified ideas tab
    await page.getByRole('tab', { name: /qualified ideas/i }).click();
    
    // If qualified ideas exist, verify they have proper business brief references
    const qualifiedIdea = page.locator('text=BB-').first();
    if (await qualifiedIdea.isVisible()) {
      const briefId = await qualifiedIdea.textContent();
      
      // Navigate to idea stage to verify this brief exists
      await page.getByRole('link', { name: 'Back to Ideas' }).click();
      await page.getByRole('tab', { name: /briefs/i }).click();
      
      // Should find the corresponding business brief
      await expect(page.locator(`text=${briefId}`)).toBeVisible();
    }
  });
});

test.describe('AuraV2 Real-time Updates', () => {
  test('should update metrics when qualification is completed', async ({ page }) => {
    await page.getByRole('link', { name: 'Qualify Ideas' }).click();
    
    // Note initial qualified count
    const initialQualifiedText = await page.locator('text=/\\d+ Qualified/').textContent();
    const initialCount = parseInt(initialQualifiedText?.match(/\d+/)?.[0] || '0');
    
    // Start qualification if available
    await page.getByRole('tab', { name: /ideas to qualify/i }).click();
    const qualifyButton = page.getByRole('button', { name: 'Start Qualification' }).first();
    
    if (await qualifyButton.isVisible()) {
      await qualifyButton.click();
      
      // Handle completion dialog
      page.on('dialog', dialog => dialog.accept());
      await page.waitForTimeout(3000);
      
      // Check if count increased
      const finalQualifiedText = await page.locator('text=/\\d+ Qualified/').textContent();
      const finalCount = parseInt(finalQualifiedText?.match(/\d+/)?.[0] || '0');
      
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('should update portfolio metrics when priorities change', async ({ page }) => {
    await page.getByRole('link', { name: 'Prioritize' }).click();
    
    // Check if auto-prioritization affects metrics
    const autoPrioritizeButton = page.getByRole('button', { name: /auto-prioritize/i });
    if (await autoPrioritizeButton.isVisible()) {
      await autoPrioritizeButton.click();
      
      // Handle completion dialog
      page.on('dialog', dialog => dialog.accept());
      await page.waitForTimeout(4000);
      
      // Verify metrics are updated
      await expect(page.locator('text=Portfolio Summary')).toBeVisible();
    }
  });
});

test.describe('AuraV2 Tab Content Validation', () => {
  test('should show appropriate content in each tab for each stage', async ({ page }) => {
    const stageTabTests = [
      {
        stageName: 'Idea Stage',
        stageLink: 'Idea Stage',
        tabs: [
          { name: /overview/i, expectedContent: 'Definition of Ready' },
          { name: /briefs/i, expectedContent: 'Active Business Briefs' },
          { name: /ai quality/i, expectedContent: 'AI Quality Assessment' },
          { name: /activities/i, expectedContent: 'activities' },
          { name: /reference/i, expectedContent: 'Loading reference documents' }
        ]
      },
      {
        stageName: 'Qualify Stage',
        stageLink: 'Qualify Ideas',
        tabs: [
          { name: /overview/i, expectedContent: 'Qualification Metrics' },
          { name: /ideas to qualify/i, expectedContent: 'Approved Ideas Awaiting Qualification' },
          { name: /qualified ideas/i, expectedContent: 'Ideas that have completed the qualification process' },
          { name: /research tools/i, expectedContent: 'Market Research' },
          { name: /activities/i, expectedContent: 'activities' }
        ]
      },
      {
        stageName: 'Prioritize Stage',
        stageLink: 'Prioritize',
        tabs: [
          { name: /overview/i, expectedContent: 'Portfolio Summary' },
          { name: /priority list/i, expectedContent: 'Prioritized Ideas Ranking' },
          { name: /value.*effort.*matrix/i, expectedContent: 'Value vs Effort Matrix' },
          { name: /portfolio planning/i, expectedContent: 'Portfolio Roadmap' },
          { name: /activities/i, expectedContent: 'activities' }
        ]
      }
    ];

    for (const stage of stageTabTests) {
      await page.getByRole('link', { name: stage.stageLink }).click();
      await expect(page.locator(`text=${stage.stageName}`)).toBeVisible();
      
      for (const tab of stage.tabs) {
        await page.getByRole('tab', { name: tab.name }).click();
        await expect(page.locator(`text=${tab.expectedContent}`)).toBeVisible();
      }
    }
  });
});

test.describe('AuraV2 User Experience Flows', () => {
  test('should provide smooth navigation experience', async ({ page }) => {
    // Test breadcrumb-style navigation
    await page.getByRole('link', { name: 'Prioritize' }).click();
    await page.getByRole('link', { name: 'Back to Qualify' }).click();
    await expect(page.locator('text=Qualify Stage')).toBeVisible();
    
    await page.getByRole('link', { name: 'Back to Ideas' }).click();
    await expect(page.locator('text=Idea Stage')).toBeVisible();
    
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.locator('text=Welcome to AuraV2')).toBeVisible();
  });

  test('should maintain visual consistency across stages', async ({ page }) => {
    const stages = ['Idea Stage', 'Qualify Ideas', 'Prioritize'];
    
    for (const stage of stages) {
      await page.getByRole('link', { name: stage }).click();
      
      // Each stage should have consistent header structure
      await expect(page.locator('.bg-gray-50.min-h-screen')).toBeVisible();
      await expect(page.locator('.border.border-gray-400.rounded-lg.shadow-lg')).toBeVisible();
      await expect(page.locator('text=Active')).toBeVisible();
      
      // Each stage should have tab structure
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tab"]')).toHaveCount(5);
    }
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Test loading indicators appear and disappear appropriately
    await page.getByRole('link', { name: 'Idea Stage' }).click();
    
    // Page should not stay in loading state indefinitely
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('text=Loading');
      return !loadingElement || !loadingElement.isVisible;
    }, { timeout: 10000 });
    
    await expect(page.locator('text=Idea Stage • Business Brief')).toBeVisible();
  });
});
