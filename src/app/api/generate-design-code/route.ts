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
  imageData: z.string().optional(), // Base64 encoded image data
  imageType: z.string().optional(), // Image MIME type
  preferredProvider: z.enum(['google', 'openai']).optional().default('google')
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Design code generation API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = GenerateDesignCodeSchema.parse(body);
    const { prompt, context, framework, includeResponsive, includeAccessibility, designStyle, imageData, imageType, preferredProvider } = validatedData;

    console.log('✅ Request validation passed');
    console.log('🔍 Generating code for:', context);

    // Build the comprehensive system prompt for UI/UX conversion
    const systemPrompt = buildUIUXConversionPrompt();

    // Build the user prompt with image data
    const userPrompt = buildUserPrompt(
      prompt,
      context,
      framework,
      includeResponsive,
      includeAccessibility,
      designStyle,
      imageData,
      imageType
    );

    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 User prompt length:', userPrompt.length);

    // Call the LLM service to generate code with retry mechanism
    const generatedCode = await generateCodeWithRetryAndFallback(systemPrompt, userPrompt, framework, imageData, imageType, preferredProvider);

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
          hasImage: !!imageData,
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

function buildUIUXConversionPrompt(): string {
  return `You are an expert AI Frontend Developer specializing in converting visual designs into high-quality, single-file HTML. Your primary function is to take a provided image (e.g., JPG, PNG) or a PDF of a webpage design and accurately recreate it as a single, self-contained HTML file.

Your Goal: To produce a pixel-perfect, responsive, and functional HTML representation of the visual design provided by the user with EXACT visual fidelity to the source material.

Core Instructions & Workflow:

1. **COMPREHENSIVE VISUAL ANALYSIS**: When an image is provided, perform a detailed forensic analysis:
   
   🎨 **COLOR EXTRACTION & MATCHING**:
   - Identify the EXACT color palette using digital color picker techniques
   - Extract primary colors (backgrounds, main UI elements)
   - Extract secondary colors (accents, highlights, borders)
   - Extract text colors (headings, body text, links, captions)
   - Identify gradients, shadows, and color transitions
   - Provide exact hex codes or RGB values for all colors
   - Note color usage patterns and hierarchies
   
   🖋️ **TYPOGRAPHY ANALYSIS**:
   - Identify font families (attempt to match with web-safe or Google Fonts)
   - Determine font weights (100-900 scale)
   - Measure font sizes for different text elements
   - Analyze letter spacing, line height, and text density
   - Identify text alignment patterns
   - Note any special typography effects (shadows, outlines, etc.)
   
   🏗️ **LAYOUT & SPATIAL ANALYSIS**:
   - Deconstruct the grid system and alignment patterns
   - Measure spacing between elements (margins, padding)
   - Analyze container widths and proportions
   - Identify responsive breakpoint implications
   - Note element positioning and layering
   - Analyze white space usage and visual rhythm
   
   🎭 **STYLE & AESTHETIC ANALYSIS**:
   - Determine overall design style (modern, minimal, corporate, creative, etc.)
   - Analyze button styles (shapes, shadows, hover states)
   - Examine card/container treatments (borders, shadows, backgrounds)
   - Identify icon styles and visual treatments
   - Note any animation or interaction hints
   - Assess overall visual hierarchy and emphasis patterns

2. Structure with Semantic HTML: Write clean, semantic HTML5. Use appropriate tags like <header>, <footer>, <nav>, <main>, <section>, <h1>, <p>, and <button>. This is crucial for accessibility and maintainability.

3. Style with Embedded CSS: All CSS must be placed within a single <style> tag in the <head> of the HTML file. Do not link to external CSS files.
   - Use modern CSS techniques like Flexbox and Grid for layout.
   - CRITICALLY IMPORTANT: Replicate the analyzed colors EXACTLY using the extracted hex codes
   - CRITICALLY IMPORTANT: Match typography precisely using the analyzed font properties
   - CRITICALLY IMPORTANT: Maintain exact spacing and proportions from the analysis

4. Ensure Responsiveness: The final output must be responsive and adapt gracefully to different screen sizes. Use media queries (@media) to adjust layouts, font sizes, and spacing for tablet and mobile views. If a mobile view is provided in the input, it is your primary reference for mobile styling. If not, create a logical mobile layout from the desktop design while maintaining the visual style.

CRITICAL RULES & CONSTRAINTS:
- Single File Output: The entire output must be a single index.html file. No external CSS or JavaScript files are permitted.
- Asset Handling (MANDATORY): This is the most critical part of your task.
  * All images (photos, logos, backgrounds) MUST be replaced with publicly accessible, persistent URLs.
  * NEVER use placeholders like path/to/image.jpg or invalid links like https://i.imgur.com/removed.png.
  * Source equivalent, high-quality, royalty-free stock images from services like Pexels, Unsplash, or similar services to match the content and style of the original design.
  * For icons, use a reliable CDN like Font Awesome. Include the CDN link in the <head> and use the appropriate <i> or <span> tags.
- Text & Content: Transcribe all text content from the design exactly as it appears. If the text is placeholder "Lorem Ipsum," use it.
- Fonts: 
  * Attempt to visually identify the font family.
  * If the font is a standard one (e.g., Poppins, Roboto, Lato), import it from Google Fonts using the @import rule at the top of your <style> block.
  * If the font is obscure or unidentifiable, select a close, modern alternative from Google Fonts that matches the style (serif, sans-serif, etc.).

Your response should ONLY contain the complete HTML code in a single code block. Do not include any conversational text or explanations.`;
}

function buildUserPrompt(
  prompt: string,
  context: string,
  framework: string,
  includeResponsive: boolean,
  includeAccessibility: boolean,
  designStyle?: string,
  imageData?: string,
  imageType?: string
): string {
  const imagePrompt = imageData ? 
    `🖼️ VISUAL DESIGN ANALYSIS REQUIRED: I have provided a design reference image that contains the exact visual style, colors, fonts, and layout that must be replicated.

MANDATORY ANALYSIS STEPS:
1. **Extract Color Palette**: Identify all colors used (backgrounds, text, accents, borders) and provide exact hex codes
2. **Analyze Typography**: Identify font families, weights, sizes, and spacing used throughout the design
3. **Study Layout**: Examine spacing patterns, grid systems, component arrangements, and proportions  
4. **Assess Visual Style**: Determine the design aesthetic, button styles, shadows, borders, and overall theme
5. **Match Exactly**: The generated HTML must visually match the uploaded image as closely as possible

Please analyze this image comprehensively and recreate it as a complete, single-file HTML document with pixel-perfect accuracy.` : 
    `Please create a web component based on the following description: ${context}`;

  const additionalRequirements = [
    includeResponsive ? "Make it fully responsive with mobile-first design while maintaining visual consistency" : "",
    includeAccessibility ? "Include proper accessibility features (ARIA labels, semantic HTML, keyboard navigation)" : "",
    designStyle ? `Use a ${designStyle} design aesthetic` : "",
    framework !== 'vanilla' ? `Structure it to be easily convertible to ${framework} component later` : "",
    imageData ? "CRITICAL: Prioritize visual fidelity to the uploaded image over generic styling choices" : ""
  ].filter(Boolean).join(". ");

  return `${imagePrompt}

📋 **PROJECT CONTEXT**: ${context}

🎯 **SPECIFIC REQUIREMENTS**: 
${prompt}

⚙️ **TECHNICAL REQUIREMENTS**: ${additionalRequirements}

${imageData ? `
🔍 **VISUAL MATCHING PRIORITY**: 
The uploaded design image is the PRIMARY reference. Extract and replicate:
- Exact color palette and usage patterns
- Typography hierarchy and font characteristics  
- Spacing, proportions, and layout structure
- Visual style elements (buttons, cards, shadows, etc.)
- Overall aesthetic and design theme

The final result should look virtually identical to the provided design image.` : ''}

Please provide a complete HTML file with embedded CSS that ${imageData ? 'perfectly recreates the design shown in the image' : 'meets the specified requirements'}.`;
}

async function generateCodeWithRetryAndFallback(
  systemPrompt: string, 
  userPrompt: string, 
  framework: string,
  imageData?: string,
  imageType?: string,
  preferredProvider?: string,
  maxRetries: number = 3
): Promise<any> {
  console.log('🤖 Starting design code generation with retry mechanism...');
  
  // Always try Google first (preserves user preference), then OpenAI as fallback
  const providers = [
    { name: 'Google', provider: 'google', model: 'gemini-2.5-pro' },
    { name: 'OpenAI', provider: 'openai', model: 'gpt-4o' }
  ];

  // If user has a specific preference, try that first
  if (preferredProvider === 'openai') {
    providers.reverse();
  }

  for (const providerConfig of providers) {
    console.log(`🔄 Trying ${providerConfig.name} provider...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 ${providerConfig.name} attempt ${attempt}/${maxRetries}`);
        
        // Call the MCP Bridge Server for actual LLM processing
        const response = await fetch('http://localhost:8000/generate-design-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            framework,
            imageData,
            imageType,
            llm_provider: providerConfig.provider,
            model: providerConfig.model
          }),
        });

        if (!response.ok) {
          throw new Error(`MCP Bridge server responded with ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Success with ${providerConfig.name} on attempt ${attempt}`);
          return {
            ...result.data,
            provider: providerConfig.name,
            attempt: attempt,
            usedFallback: providerConfig.name !== 'Google'
          };
        } else {
          throw new Error(result.error || `${providerConfig.name} API returned error`);
        }
        
      } catch (error) {
        console.error(`❌ ${providerConfig.name} attempt ${attempt} failed:`, error);
        
        // If this is the last attempt for this provider, continue to next provider
        if (attempt === maxRetries) {
          console.log(`🔄 ${providerConfig.name} failed after ${maxRetries} attempts, trying next provider...`);
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // If all providers failed, fall back to enhanced mock
  console.log('🔄 All providers failed - falling back to enhanced mock response...');
  
  return {
    html: generateEnhancedMockHTML(framework, imageData ? 'image-based' : 'text-based'),
    css: generateEnhancedMockCSS(),
    javascript: generateEnhancedMockJavaScript(framework),
    framework,
    provider: 'Mock',
    fallbackReason: 'All LLM providers temporarily unavailable - using enhanced mock',
    isManual: true
  };
}

function generateEnhancedMockHTML(framework: string, inputType: string): string {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Design Component</title>
    <!-- Font Awesome CDN for icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Google Fonts import */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* CSS Variables for consistent theming */
        :root {
            --primary-color: #3b82f6;
            --secondary-color: #1e40af;
            --accent-color: #f59e0b;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --bg-primary: #ffffff;
            --bg-secondary: #f9fafb;
            --border-color: #e5e7eb;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        /* Base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--bg-primary);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 2rem 0;
            text-align: center;
        }

        .header h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .header p {
            font-size: 1.25rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Main content */
        .main-content {
            padding: 4rem 0;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .feature-card {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 1rem;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
        }

        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-color);
        }

        .feature-icon {
            width: 4rem;
            height: 4rem;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 1.5rem;
            color: white;
        }

        .feature-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .feature-card p {
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
            background: var(--bg-secondary);
            padding: 4rem 0;
            text-align: center;
            border-radius: 2rem;
            margin: 2rem 0;
        }

        .cta-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .cta-section p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
            min-height: 48px;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
            background: transparent;
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }

        .btn-secondary:hover {
            background: var(--primary-color);
            color: white;
        }

        /* Stats section */
        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }

        .stat-item {
            text-align: center;
            padding: 2rem;
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: var(--primary-color);
            display: block;
        }

        .stat-label {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        /* Footer */
        .footer {
            background: var(--text-primary);
            color: white;
            padding: 3rem 0;
            text-align: center;
        }

        .footer p {
            opacity: 0.8;
            margin-bottom: 1rem;
        }

        .footer-links {
            display: flex;
            gap: 2rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: white;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }

        .footer-links a:hover {
            opacity: 1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .features-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }

            .stats-section {
                grid-template-columns: repeat(2, 1fr);
            }

            .footer-links {
                flex-direction: column;
                gap: 1rem;
            }
        }

        @media (max-width: 480px) {
            .stats-section {
                grid-template-columns: 1fr;
            }

            .feature-card {
                padding: 1.5rem;
            }

            .stat-number {
                font-size: 2.5rem;
            }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-primary: #f9fafb;
                --text-secondary: #d1d5db;
                --bg-primary: #1f2937;
                --bg-secondary: #374151;
                --border-color: #4b5563;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>AI-Generated Design Component</h1>
            <p>Created from ${inputType} using advanced vision-to-code technology</p>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <section class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-palette" aria-hidden="true"></i>
                    </div>
                    <h3>Pixel-Perfect Design</h3>
                    <p>Every element carefully crafted to match the original design specifications with attention to detail and visual hierarchy.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt" aria-hidden="true"></i>
                    </div>
                    <h3>Responsive Layout</h3>
                    <p>Fully responsive design that adapts seamlessly across all device sizes from mobile phones to large desktop screens.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-universal-access" aria-hidden="true"></i>
                    </div>
                    <h3>Accessibility First</h3>
                    <p>Built with accessibility in mind, featuring proper ARIA labels, semantic HTML, and keyboard navigation support.</p>
                </div>
            </section>

            <section class="stats-section">
                <div class="stat-item">
                    <span class="stat-number">100%</span>
                    <span class="stat-label">Semantic HTML</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">0</span>
                    <span class="stat-label">External Dependencies</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">A+</span>
                    <span class="stat-label">Performance Grade</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">WCAG</span>
                    <span class="stat-label">AA Compliant</span>
                </div>
            </section>

            <section class="cta-section">
                <div class="container">
                    <h2>Ready to Use</h2>
                    <p>This component is production-ready and can be immediately integrated into your project or used as a starting point for further customization.</p>
                    <div class="cta-buttons">
                        <a href="#" class="btn btn-primary" role="button">
                            <i class="fas fa-download" aria-hidden="true"></i>
                            Download Code
                        </a>
                        <a href="#" class="btn btn-secondary" role="button">
                            <i class="fas fa-code" aria-hidden="true"></i>
                            View Source
                        </a>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 AI-Generated Component. Created with advanced vision-to-code technology.</p>
            <div class="footer-links">
                <a href="#" aria-label="Documentation">Documentation</a>
                <a href="#" aria-label="Support">Support</a>
                <a href="#" aria-label="GitHub Repository">GitHub</a>
                <a href="#" aria-label="License Information">License</a>
            </div>
        </div>
    </footer>

    <script>
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards for entrance animations
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    </script>
</body>
</html>`;

  return htmlContent;
}

function generateEnhancedMockCSS(): string {
  return `/* This CSS is embedded within the HTML file above */
/* Generated with modern CSS best practices */

/* CSS Custom Properties for theming */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --accent-color: #f59e0b;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Modern CSS Grid and Flexbox layouts */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* Advanced hover effects */
.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

/* Responsive design with mobile-first approach */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

/* Accessibility and reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --bg-primary: #1f2937;
    --bg-secondary: #374151;
    --border-color: #4b5563;
  }
}`;
}

function generateEnhancedMockJavaScript(framework: string): string {
  if (framework === 'react') {
    return `import React, { useState, useEffect, useRef } from 'react';

const AIGeneratedComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const componentRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for entrance animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleFeatureClick = (index) => {
    setActiveFeature(activeFeature === index ? null : index);
  };

  const handleDownload = () => {
    console.log('Download initiated');
    // Add download logic here
  };

  const handleViewSource = () => {
    console.log('View source requested');
    // Add view source logic here
  };

  const features = [
    {
      icon: 'fas fa-palette',
      title: 'Pixel-Perfect Design',
      description: 'Every element carefully crafted to match the original design specifications with attention to detail and visual hierarchy.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Responsive Layout',
      description: 'Fully responsive design that adapts seamlessly across all device sizes from mobile phones to large desktop screens.'
    },
    {
      icon: 'fas fa-universal-access',
      title: 'Accessibility First',
      description: 'Built with accessibility in mind, featuring proper ARIA labels, semantic HTML, and keyboard navigation support.'
    }
  ];

  return (
    <div 
      ref={componentRef}
      className={\`ai-generated-component \${isVisible ? 'animate-in' : ''}\`}
    >
      <header className="header">
        <div className="container">
          <h1>AI-Generated Design Component</h1>
          <p>Created from design image using advanced vision-to-code technology</p>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <section className="features-grid">
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
                <div className="feature-icon">
                  <i className={feature.icon} aria-hidden="true"></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </section>

          <section className="stats-section">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Semantic HTML</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">External Dependencies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">A+</span>
              <span className="stat-label">Performance Grade</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">WCAG</span>
              <span className="stat-label">AA Compliant</span>
            </div>
          </section>

          <section className="cta-section">
            <div className="container">
              <h2>Ready to Use</h2>
              <p>This component is production-ready and can be immediately integrated into your project or used as a starting point for further customization.</p>
              <div className="cta-buttons">
                <button 
                  className="btn btn-primary" 
                  onClick={handleDownload}
                  aria-label="Download generated code"
                >
                  <i className="fas fa-download" aria-hidden="true"></i>
                  Download Code
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleViewSource}
                  aria-label="View source code"
                >
                  <i className="fas fa-code" aria-hidden="true"></i>
                  View Source
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 AI-Generated Component. Created with advanced vision-to-code technology.</p>
          <div className="footer-links">
            <a href="#" aria-label="Documentation">Documentation</a>
            <a href="#" aria-label="Support">Support</a>
            <a href="#" aria-label="GitHub Repository">GitHub</a>
            <a href="#" aria-label="License Information">License</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIGeneratedComponent;`;
  }
  
  return `// Enhanced JavaScript for AI-Generated Component
class AIGeneratedComponent {
  constructor(container) {
    this.container = container;
    this.activeFeature = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.bindEvents();
    this.setupSmoothScrolling();
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          this.isVisible = true;
        }
      });
    }, observerOptions);

    // Observe feature cards for entrance animations
    this.container.querySelectorAll('.feature-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }

  bindEvents() {
    // Feature card interactions
    this.container.querySelectorAll('.feature-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        this.toggleFeature(index);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleFeature(index);
        }
      });
    });

    // CTA button interactions
    const downloadBtn = this.container.querySelector('.btn-primary');
    const viewSourceBtn = this.container.querySelector('.btn-secondary');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', this.handleDownload.bind(this));
    }

    if (viewSourceBtn) {
      viewSourceBtn.addEventListener('click', this.handleViewSource.bind(this));
    }
  }

  setupSmoothScrolling() {
    // Add smooth scrolling for anchor links
    this.container.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  toggleFeature(index) {
    this.activeFeature = this.activeFeature === index ? null : index;
    this.updateFeatureStates();
  }

  updateFeatureStates() {
    this.container.querySelectorAll('.feature-card').forEach((card, index) => {
      if (this.activeFeature === index) {
        card.classList.add('active');
        card.setAttribute('aria-expanded', 'true');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-expanded', 'false');
      }
    });
  }

  handleDownload() {
    console.log('Download initiated');
    // Implement download functionality
    // Example: trigger file download or copy to clipboard
  }

  handleViewSource() {
    console.log('View source requested');
    // Implement view source functionality
    // Example: open code in modal or new window
  }

  // Public method to update component data
  updateContent(newContent) {
    // Allow dynamic content updates
    console.log('Updating component content:', newContent);
  }

  // Cleanup method
  destroy() {
    // Remove event listeners and observers
    this.container.removeEventListener('click', this.handleClick);
    // Clean up intersection observers, etc.
  }
}

// Initialize the component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.ai-generated-component');
  if (container) {
    const component = new AIGeneratedComponent(container);
    
    // Make it globally accessible for debugging
    window.aiComponent = component;
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIGeneratedComponent;
}`;
} 