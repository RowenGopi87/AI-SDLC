import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the request schema
const GenerateDesignCodeSchema = z.object({
  prompt: z.string(),
  context: z.string(),
  framework: z.enum(['react', 'vue', 'vanilla']).default('react'),
  includeResponsive: z.boolean().default(true),
  includeAccessibility: z.boolean().default(true),
  designStyle: z.enum(['modern', 'minimal', 'corporate', 'creative']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Design code generation API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = GenerateDesignCodeSchema.parse(body);
    const { prompt, context, framework, includeResponsive, includeAccessibility, designStyle } = validatedData;

    console.log('✅ Request validation passed');
    console.log('🔍 Generating code for:', context);

    // Build the enhanced prompt for the LLM
    const enhancedPrompt = buildEnhancedPrompt(
      prompt,
      context,
      framework,
      includeResponsive,
      includeAccessibility,
      designStyle
    );

    console.log('📋 Enhanced prompt length:', enhancedPrompt.length);

    // Call the LLM service to generate code
    const generatedCode = await generateCodeWithLLM(enhancedPrompt, framework);

    console.log('✅ Code generated successfully');

    return NextResponse.json({
      success: true,
      data: {
        code: generatedCode,
        framework,
        metadata: {
          context,
          includeResponsive,
          includeAccessibility,
          designStyle,
          generatedAt: new Date().toISOString(),
        },
      },
      message: 'Design code generated successfully',
    });

  } catch (error) {
    console.error('❌ Error generating design code:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate design code',
    }, { status: 500 });
  }
}

function buildEnhancedPrompt(
  prompt: string,
  context: string,
  framework: string,
  includeResponsive: boolean,
  includeAccessibility: boolean,
  designStyle?: string
): string {
  const styleGuidelines = getStyleGuidelines(designStyle);
  const frameworkGuidelines = getFrameworkGuidelines(framework);
  const accessibilityGuidelines = includeAccessibility ? getAccessibilityGuidelines() : '';
  const responsiveGuidelines = includeResponsive ? getResponsiveGuidelines() : '';

  return `
# Design-to-Code Generation Task

## Context
${context}

## Request
${prompt}

## Technical Requirements

### Framework: ${framework.toUpperCase()}
${frameworkGuidelines}

### Design System
${styleGuidelines}

${responsiveGuidelines}

${accessibilityGuidelines}

## Output Requirements
Generate complete, production-ready code with:
1. Clean, semantic HTML structure
2. Modern CSS with flexbox/grid layouts
3. ${framework === 'react' ? 'Functional React component with hooks' : framework === 'vue' ? 'Vue 3 composition API component' : 'Vanilla JavaScript with ES6+'}
4. Interactive elements with proper event handling
5. Loading states and error handling where applicable
6. Comments explaining key functionality

## Code Structure
Please provide:
1. **HTML/JSX**: Complete markup structure
2. **CSS**: All styling including animations and transitions
3. **JavaScript**: Component logic and interactions

Focus on creating a professional, user-friendly interface that follows modern web development best practices.
`;
}

function getStyleGuidelines(designStyle?: string): string {
  const styles = {
    modern: `
- Use clean lines, subtle shadows, and modern color palettes
- Implement glassmorphism or neumorphism effects where appropriate
- Prefer gradients and smooth transitions
- Use modern typography (system fonts, proper font weights)`,
    
    minimal: `
- Embrace whitespace and clean layouts
- Use monochromatic or limited color palettes
- Focus on typography and content hierarchy
- Minimal use of decorative elements`,
    
    corporate: `
- Professional color schemes (blues, grays, whites)
- Clean, business-oriented layouts
- Clear data presentation and forms
- Trust-building elements (testimonials, certifications)`,
    
    creative: `
- Bold colors and experimental layouts
- Creative use of animations and transitions
- Unique UI patterns and interactive elements
- Artistic typography and visual elements`
  };

  return styles[designStyle as keyof typeof styles] || styles.modern;
}

function getFrameworkGuidelines(framework: string): string {
  const guidelines = {
    react: `
- Use functional components with React hooks (useState, useEffect, etc.)
- Implement proper TypeScript interfaces if applicable
- Use modern React patterns (composition, custom hooks)
- Include proper prop types and default values
- Handle component lifecycle and state management`,
    
    vue: `
- Use Vue 3 Composition API with <script setup>
- Implement proper reactive state with ref() and reactive()
- Use computed properties and watchers appropriately
- Include proper TypeScript support
- Handle component lifecycle with lifecycle hooks`,
    
    vanilla: `
- Use modern ES6+ JavaScript features
- Implement proper event delegation and cleanup
- Use classes or modules for code organization
- Include proper error handling and validation
- Focus on performance and browser compatibility`
  };

  return guidelines[framework as keyof typeof guidelines] || guidelines.react;
}

function getAccessibilityGuidelines(): string {
  return `
### Accessibility Requirements
- Use semantic HTML elements (header, nav, main, section, article)
- Include proper ARIA labels and roles
- Ensure keyboard navigation support
- Maintain proper color contrast ratios (WCAG 2.1 AA)
- Include alt text for images and descriptive text for icons
- Implement focus management and visible focus indicators
- Use proper heading hierarchy (h1, h2, h3, etc.)`;
}

function getResponsiveGuidelines(): string {
  return `
### Responsive Design Requirements
- Mobile-first approach with CSS media queries
- Flexible layouts using CSS Grid and Flexbox
- Responsive typography with clamp() or fluid scaling
- Touch-friendly interactive elements (44px minimum)
- Optimized images and media queries
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large)`;
}

async function generateCodeWithLLM(prompt: string, framework: string): Promise<any> {
  // In a real implementation, this would call your LLM service (OpenAI, Anthropic, etc.)
  // For now, we'll return a mock response
  
  console.log('🤖 Calling LLM service for code generation...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response - in production, this would be the actual LLM response
  const mockResponse = {
    html: generateMockHTML(framework),
    css: generateMockCSS(),
    javascript: generateMockJavaScript(framework),
    framework,
  };

  return mockResponse;
}

function generateMockHTML(framework: string): string {
  if (framework === 'react') {
    return `<div className="design-component">
  <header className="component-header">
    <h1 className="title">Generated Design Component</h1>
    <p className="subtitle">Created with AI assistance</p>
  </header>
  
  <main className="component-content">
    <section className="features-section">
      <div className="features-grid">
        <div className="feature-card" tabIndex="0">
          <div className="feature-icon">🎨</div>
          <h3>Modern Design</h3>
          <p>Clean, responsive interface with modern aesthetics</p>
        </div>
        <div className="feature-card" tabIndex="0">
          <div className="feature-icon">⚡</div>
          <h3>High Performance</h3>
          <p>Optimized for speed and user experience</p>
        </div>
        <div className="feature-card" tabIndex="0">
          <div className="feature-icon">📱</div>
          <h3>Mobile Ready</h3>
          <p>Fully responsive across all device sizes</p>
        </div>
      </div>
    </section>
    
    <section className="cta-section">
      <button className="primary-btn" onClick={handlePrimaryAction}>
        Get Started
      </button>
      <button className="secondary-btn" onClick={handleSecondaryAction}>
        Learn More
      </button>
    </section>
  </main>
</div>`;
  }
  
  return `<div class="design-component">
  <header class="component-header">
    <h1 class="title">Generated Design Component</h1>
    <p class="subtitle">Created with AI assistance</p>
  </header>
  
  <main class="component-content">
    <section class="features-section">
      <div class="features-grid">
        <div class="feature-card" tabindex="0">
          <div class="feature-icon">🎨</div>
          <h3>Modern Design</h3>
          <p>Clean, responsive interface with modern aesthetics</p>
        </div>
        <div class="feature-card" tabindex="0">
          <div class="feature-icon">⚡</div>
          <h3>High Performance</h3>
          <p>Optimized for speed and user experience</p>
        </div>
        <div class="feature-card" tabindex="0">
          <div class="feature-icon">📱</div>
          <h3>Mobile Ready</h3>
          <p>Fully responsive across all device sizes</p>
        </div>
      </div>
    </section>
    
    <section class="cta-section">
      <button class="primary-btn" onclick="handlePrimaryAction()">
        Get Started
      </button>
      <button class="secondary-btn" onclick="handleSecondaryAction()">
        Learn More
      </button>
    </section>
  </main>
</div>`;
}

function generateMockCSS(): string {
  return `/* Generated Component Styles */
.design-component {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
}

.component-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.features-section {
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.feature-card:hover,
.feature-card:focus {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  outline: none;
  border-color: #667eea;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: #6b7280;
  font-size: 1rem;
}

.cta-section {
  text-align: center;
  padding: 2rem 0;
}

.primary-btn,
.secondary-btn {
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  min-height: 44px;
  min-width: 44px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
}

.primary-btn:hover,
.primary-btn:focus {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.secondary-btn {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-btn:hover,
.secondary-btn:focus {
  background: #667eea;
  color: white;
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .design-component {
    padding: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .primary-btn,
  .secondary-btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }
}

@media (max-width: 480px) {
  .feature-card {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .primary-btn,
  .secondary-btn {
    transition: none;
  }
  
  .feature-card:hover,
  .feature-card:focus {
    transform: none;
  }
  
  .primary-btn:hover,
  .primary-btn:focus,
  .secondary-btn:hover,
  .secondary-btn:focus {
    transform: none;
  }
}

@media (prefers-color-scheme: dark) {
  .design-component {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .feature-card {
    background: linear-gradient(145deg, #374151, #4b5563);
    border-color: #6b7280;
    color: #f9fafb;
  }
  
  .subtitle {
    color: #d1d5db;
  }
  
  .feature-card p {
    color: #d1d5db;
  }
}`;
}

function generateMockJavaScript(framework: string): string {
  if (framework === 'react') {
    return `import React, { useState, useEffect } from 'react';

const GeneratedDesignComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    // Animate component on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handlePrimaryAction = () => {
    console.log('Primary action triggered');
    // Add your primary action logic here
    // Example: navigate to signup, open modal, etc.
  };

  const handleSecondaryAction = () => {
    console.log('Secondary action triggered');
    // Add your secondary action logic here
    // Example: navigate to about page, show more info, etc.
  };

  const handleFeatureClick = (index) => {
    setActiveFeature(activeFeature === index ? null : index);
  };

  const features = [
    {
      icon: '🎨',
      title: 'Modern Design',
      description: 'Clean, responsive interface with modern aesthetics',
      details: 'Built with the latest design principles and user experience best practices.'
    },
    {
      icon: '⚡',
      title: 'High Performance',
      description: 'Optimized for speed and user experience',
      details: 'Lightweight, fast-loading components with efficient rendering and minimal bundle size.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Fully responsive across all device sizes',
      details: 'Seamless experience from mobile phones to large desktop screens.'
    }
  ];

  return (
    <div className={\`design-component \${isVisible ? 'animate-in' : ''}\`}>
      <header className="component-header">
        <h1 className="title">Generated Design Component</h1>
        <p className="subtitle">Created with AI assistance</p>
      </header>
      
      <main className="component-content">
        <section className="features-section">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={\`feature-card \${activeFeature === index ? 'active' : ''}\`}
                onClick={() => handleFeatureClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFeatureClick(index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={activeFeature === index}
              >
                <div className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {activeFeature === index && (
                  <div className="feature-details">
                    <p>{feature.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        <section className="cta-section">
          <button 
            className="primary-btn" 
            onClick={handlePrimaryAction}
            aria-label="Get started with our service"
          >
            Get Started
          </button>
          <button 
            className="secondary-btn" 
            onClick={handleSecondaryAction}
            aria-label="Learn more about our features"
          >
            Learn More
          </button>
        </section>
      </main>
    </div>
  );
};

export default GeneratedDesignComponent;`;
  }
  
  return `// Generated JavaScript for Design Component
class DesignComponent {
  constructor(container) {
    this.container = container;
    this.activeFeature = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.animateIn();
  }

  render() {
    this.container.innerHTML = \`
      <div class="design-component">
        <header class="component-header">
          <h1 class="title">Generated Design Component</h1>
          <p class="subtitle">Created with AI assistance</p>
        </header>
        
        <main class="component-content">
          <section class="features-section">
            <div class="features-grid">
              \${this.renderFeatures()}
            </div>
          </section>
          
          <section class="cta-section">
            <button class="primary-btn" data-action="primary">
              Get Started
            </button>
            <button class="secondary-btn" data-action="secondary">
              Learn More
            </button>
          </section>
        </main>
      </div>
    \`;
  }

  renderFeatures() {
    const features = [
      {
        icon: '🎨',
        title: 'Modern Design',
        description: 'Clean, responsive interface with modern aesthetics'
      },
      {
        icon: '⚡',
        title: 'High Performance',
        description: 'Optimized for speed and user experience'
      },
      {
        icon: '📱',
        title: 'Mobile Ready',
        description: 'Fully responsive across all device sizes'
      }
    ];

    return features.map((feature, index) => \`
      <div class="feature-card" data-feature="\${index}" tabindex="0">
        <div class="feature-icon">\${feature.icon}</div>
        <h3>\${feature.title}</h3>
        <p>\${feature.description}</p>
      </div>
    \`).join('');
  }

  bindEvents() {
    // Feature card interactions
    this.container.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const featureIndex = e.currentTarget.dataset.feature;
        this.toggleFeature(featureIndex);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const featureIndex = e.currentTarget.dataset.feature;
          this.toggleFeature(featureIndex);
        }
      });
    });

    // Button actions
    this.container.querySelector('[data-action="primary"]')
      .addEventListener('click', this.handlePrimaryAction.bind(this));
    
    this.container.querySelector('[data-action="secondary"]')
      .addEventListener('click', this.handleSecondaryAction.bind(this));
  }

  toggleFeature(index) {
    this.activeFeature = this.activeFeature === index ? null : index;
    this.updateFeatureStates();
  }

  updateFeatureStates() {
    this.container.querySelectorAll('.feature-card').forEach((card, index) => {
      if (this.activeFeature === index.toString()) {
        card.classList.add('active');
        card.setAttribute('aria-expanded', 'true');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-expanded', 'false');
      }
    });
  }

  handlePrimaryAction() {
    console.log('Primary action triggered');
    // Add your primary action logic here
  }

  handleSecondaryAction() {
    console.log('Secondary action triggered');
    // Add your secondary action logic here
  }

  animateIn() {
    setTimeout(() => {
      this.container.querySelector('.design-component').classList.add('animate-in');
    }, 100);
  }
}

// Initialize the component
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('design-component-container');
  if (container) {
    new DesignComponent(container);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignComponent;
}`;
} 