import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for request validation
const GenerateCodeSchema = z.object({
  prompt: z.string().min(1),
  workItemId: z.string(),
  codeType: z.enum(['frontend', 'backend', 'fullstack']),
  language: z.string(),
  framework: z.string(),
  designReference: z.string().optional(),
  additionalRequirements: z.string().optional(),
  imageData: z.string().optional(),
  imageType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[CODE API] Received code generation request');
    
    const body = await request.json();
    console.log('[CODE API] Request body received:', {
      workItemId: body.workItemId,
      codeType: body.codeType,
      language: body.language,
      framework: body.framework
    });

    // Validate request
    const validatedData = GenerateCodeSchema.safeParse(body);
    if (!validatedData.success) {
      console.log('[CODE API] ❌ Validation failed:', validatedData.error.issues);
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    console.log('[CODE API] ✅ Request validation passed');
    console.log('[CODE API] 🔍 Generating code for:', body.codeType, body.language);

    const { prompt, workItemId, codeType, language, framework, designReference, additionalRequirements } = validatedData.data;

    // Build comprehensive system prompt for code generation
    const systemPrompt = language === 'html-single' ? 
      `You are an expert frontend developer specializing in single-file HTML applications. Generate a complete, working HTML application with all code in ONE file.

CRITICAL REQUIREMENTS FOR SINGLE-FILE HTML:
1. Generate ONLY ONE FILE named "index.html" 
2. Include ALL CSS in <style> tags within the <head> section
3. Include ALL JavaScript in <script> tags before closing </body>
4. Create a fully functional, interactive application
5. Use modern HTML5, CSS3, and vanilla JavaScript
6. Make it responsive and visually appealing
7. Include proper meta tags and document structure
8. Add comprehensive comments explaining the code
9. Ensure the application works when opened directly in a browser

STYLING REQUIREMENTS:
- Use modern CSS with flexbox/grid layouts
- Include responsive design (mobile-first approach)
- Add smooth animations and transitions
- Use attractive color schemes and typography
- Include hover effects and interactive elements

JAVASCRIPT REQUIREMENTS:
- Use modern ES6+ JavaScript features
- Add event listeners for user interactions
- Include form validation if applicable
- Add error handling for all functions
- Make the application fully interactive

OUTPUT FORMAT:
Provide the response as a JSON object with this structure:
{
  "language": "html",
  "codeType": "${codeType}",
  "files": [
    {
      "filename": "index.html",
      "content": "complete_html_file_with_embedded_css_and_js",
      "type": "main",
      "language": "html"
    }
  ],
  "projectStructure": "Single HTML file containing all code",
  "dependencies": [],
  "runInstructions": "Open index.html in any modern web browser"
}

Generate a beautiful, functional single-file HTML application that works perfectly in the browser preview.` :
      `You are an expert software developer and architect. Generate production-ready code based on the requirements provided.

IMPORTANT INSTRUCTIONS:
1. Generate complete, working code files with proper structure
2. Include all necessary imports, dependencies, and configurations
3. Follow best practices for the selected language and framework
4. Add comprehensive comments and documentation
5. Include error handling and validation
6. Make the code scalable and maintainable
7. Generate multiple files if needed (main, components, configs, tests, styles)
8. Provide clear project structure and setup instructions

CODE GENERATION REQUIREMENTS:
- Code Type: ${codeType}
- Language: ${language === 'auto' ? 'Choose the best language for this project' : language}
- Framework: ${framework === 'auto' ? 'Choose the best framework for this project' : framework}
- Design Reference: ${designReference || 'No specific design reference provided'}

OUTPUT FORMAT:
Provide the response as a JSON object with this structure:
{
  "language": "actual_language_used",
  "codeType": "${codeType}",
  "files": [
    {
      "filename": "filename_with_extension",
      "content": "complete_file_content",
      "type": "main|component|config|test|style",
      "language": "file_language"
    }
  ],
  "projectStructure": "text_representation_of_folder_structure",
  "dependencies": ["list", "of", "required", "packages"],
  "runInstructions": "command_to_run_the_project"
}

Generate professional, production-ready code that follows industry standards and best practices.`;

    const userPrompt = `${prompt}

Additional Context:
- Work Item ID: ${workItemId}
- Design Reference: ${designReference || 'None provided'}
- Additional Requirements: ${additionalRequirements || 'Follow standard best practices'}

Please generate complete, working code that implements this functionality.`;

    console.log('[CODE API] 📋 System prompt length:', systemPrompt.length);
    console.log('[CODE API] 📋 User prompt length:', userPrompt.length);
    console.log('[CODE API] 🤖 Calling LLM service for code generation...');

    // Call the MCP Bridge server for code generation
    const result = await generateCodeWithLLM({
      systemPrompt,
      userPrompt,
      codeType,
      language,
      framework,
      workItemId,
      llm_provider: 'google',
      model: 'gemini-2.5-pro'
    });

    console.log('[CODE API] ✅ Code generated successfully');
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Code generated successfully'
    });

  } catch (error) {
    console.error('[CODE API] ❌ Error in code generation:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Code generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

async function generateCodeWithLLM(params: {
  systemPrompt: string;
  userPrompt: string;
  codeType: string;
  language: string;
  framework: string;
  workItemId: string;
  llm_provider: string;
  model: string;
}) {
  try {
    console.log('[CODE API] 🔗 Calling MCP Bridge server...');
    
    const response = await fetch('http://localhost:8000/generate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[CODE API] ❌ MCP Bridge server error:', response.status, errorText);
      throw new Error(`MCP Bridge server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('[CODE API] ✅ Received successful response from MCP Bridge');
      return result.data;
    } else {
      console.log('[CODE API] ❌ Error from MCP Bridge server:', result.error);
      throw new Error(result.error || 'Failed to generate code via MCP Bridge');
    }

  } catch (error) {
    console.error('[CODE API] ❌ Error calling MCP Bridge server:', error);
    console.log('[CODE API] 🔄 Falling back to mock response for development...');
    
    // Enhanced fallback response
    return generateEnhancedMockCode(params.codeType, params.language, params.workItemId);
  }
}

function generateEnhancedMockCode(codeType: string, language: string, workItemId: string) {
  const actualLanguage = language === 'auto' ? 'typescript' : language;
  
  if (codeType === 'backend') {
    return {
      language: actualLanguage,
      codeType: 'backend',
      files: [
        {
          filename: actualLanguage === 'python' ? 'main.py' : 'server.ts',
          content: actualLanguage === 'python' 
            ? generatePythonBackendCode(workItemId)
            : generateTypeScriptBackendCode(workItemId),
          type: 'main',
          language: actualLanguage,
        },
        {
          filename: actualLanguage === 'python' ? 'requirements.txt' : 'package.json',
          content: actualLanguage === 'python'
            ? 'fastapi==0.104.1\nuvicorn[standard]==0.24.0\npydantic==2.5.0\npython-multipart==0.0.6'
            : JSON.stringify({
                name: `${workItemId}-backend`,
                version: '1.0.0',
                scripts: {
                  start: 'node dist/server.js',
                  dev: 'ts-node server.ts',
                  build: 'tsc'
                },
                dependencies: {
                  express: '^4.18.2',
                  cors: '^2.8.5',
                  '@types/express': '^4.17.17',
                  typescript: '^5.2.2'
                }
              }, null, 2),
          type: 'config',
          language: actualLanguage === 'python' ? 'text' : 'json',
        }
      ],
      projectStructure: actualLanguage === 'python' 
        ? `backend/\n├── main.py\n├── requirements.txt\n├── models/\n└── routes/`
        : `backend/\n├── src/\n│   ├── server.ts\n│   ├── routes/\n│   └── models/\n├── package.json\n└── tsconfig.json`,
      dependencies: actualLanguage === 'python' 
        ? ['fastapi', 'uvicorn', 'pydantic']
        : ['express', 'cors', 'typescript'],
      runInstructions: actualLanguage === 'python'
        ? 'pip install -r requirements.txt && uvicorn main:app --reload'
        : 'npm install && npm run dev'
    };
  } else {
    return {
      language: actualLanguage,
      codeType: 'frontend',
      files: [
        {
          filename: 'App.tsx',
          content: generateReactFrontendCode(workItemId),
          type: 'main',
          language: 'typescript',
        },
        {
          filename: 'App.css',
          content: generateModernCSS(),
          type: 'style',
          language: 'css',
        },
        {
          filename: 'package.json',
          content: JSON.stringify({
            name: `${workItemId}-frontend`,
            version: '1.0.0',
            scripts: {
              start: 'react-scripts start',
              build: 'react-scripts build',
              test: 'react-scripts test'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              typescript: '^5.2.2'
            }
          }, null, 2),
          type: 'config',
          language: 'json',
        }
      ],
      projectStructure: `frontend/\n├── src/\n│   ├── App.tsx\n│   ├── App.css\n│   ├── components/\n│   └── pages/\n├── public/\n└── package.json`,
      dependencies: ['react', 'react-dom', 'typescript'],
      runInstructions: 'npm install && npm start'
    };
  }
}

function generatePythonBackendCode(workItemId: string): string {
  return `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="${workItemId} API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    active: bool = True

class ItemCreate(BaseModel):
    name: str
    description: str

# In-memory storage (replace with database in production)
items_db: List[Item] = []
next_id = 1

@app.get("/")
async def root():
    return {"message": "Welcome to ${workItemId} API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "${workItemId}"}

@app.get("/api/items", response_model=List[Item])
async def get_items():
    return items_db

@app.post("/api/items", response_model=Item)
async def create_item(item: ItemCreate):
    global next_id
    new_item = Item(id=next_id, name=item.name, description=item.description)
    items_db.append(new_item)
    next_id += 1
    return new_item

@app.get("/api/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@app.put("/api/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item_update: ItemCreate):
    for i, item in enumerate(items_db):
        if item.id == item_id:
            items_db[i] = Item(id=item_id, name=item_update.name, description=item_update.description)
            return items_db[i]
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int):
    for i, item in enumerate(items_db):
        if item.id == item_id:
            del items_db[i]
            return {"message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;
}

function generateTypeScriptBackendCode(workItemId: string): string {
  return `import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data interfaces
interface Item {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
}

// In-memory storage (replace with database in production)
let items: Item[] = [];
let nextId = 1;

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to ${workItemId} API',
    version: '1.0.0',
    endpoints: ['/api/items', '/health']
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: '${workItemId}',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/items', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: items,
    count: items.length
  });
});

app.post('/api/items', (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const newItem: Item = {
      id: nextId++,
      name,
      description,
      active: true,
      createdAt: new Date()
    };

    items.push(newItem);
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

app.put('/api/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description, active } = req.body;
  
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  items[itemIndex] = {
    ...items[itemIndex],
    name: name || items[itemIndex].name,
    description: description || items[itemIndex].description,
    active: active !== undefined ? active : items[itemIndex].active
  };
  
  res.json({
    success: true,
    data: items[itemIndex]
  });
});

app.delete('/api/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  items.splice(itemIndex, 1);
  
  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📝 API Documentation: http://localhost:\${PORT}\`);
});

export default app;`;
}

function generateReactFrontendCode(workItemId: string): string {
  return `import React, { useState, useEffect } from 'react';
import './App.css';

interface Item {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API endpoint
      const response = await fetch('/api/items');
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
      } else {
        setError('Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name.trim() || !newItem.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setItems([...items, data.data]);
        setNewItem({ name: '', description: '' });
      } else {
        setError(data.error || 'Failed to add item');
      }
    } catch (err) {
      setError('Failed to add item');
      console.error('Error adding item:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(\`/api/items/\${id}\`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setItems(items.filter(item => item.id !== id));
      } else {
        setError(data.error || 'Failed to delete item');
      }
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>${workItemId} Manager</h1>
        <p>Manage your items efficiently</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}

        <section className="add-item-section">
          <h2>Add New Item</h2>
          <form onSubmit={handleAddItem} className="add-item-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
                disabled={isAdding}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enter item description"
                disabled={isAdding}
                rows={3}
              />
            </div>
            <button type="submit" disabled={isAdding} className="submit-btn">
              {isAdding ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </section>

        <section className="items-section">
          <h2>Items ({items.length})</h2>
          {items.length === 0 ? (
            <div className="empty-state">
              <p>No items found. Add your first item above!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="delete-btn"
                      title="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <span className={\`status \${item.active ? 'active' : 'inactive'}\`}>
                      {item.active ? '✅ Active' : '❌ Inactive'}
                    </span>
                    <small className="created-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </section>
      </main>
    </div>
  );
};

export default App;`;
}

function generateModernCSS(): string {
  return `/* Modern CSS for the application */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--gray-900);
  background-color: var(--gray-50);
}

.app {
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
}

.app-header h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.app-header p {
  font-size: 1.25rem;
  color: var(--gray-500);
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Loading Styles */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--error-color);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--error-color);
}

/* Add Item Section */
.add-item-section {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.add-item-section h2 {
  margin-bottom: 1.5rem;
  color: var(--gray-900);
}

.add-item-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--gray-700);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Items Section */
.items-section {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.items-section h2 {
  margin-bottom: 1.5rem;
  color: var(--gray-900);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.item-card {
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-header h3 {
  color: var(--gray-900);
  font-size: 1.25rem;
  font-weight: 600;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background-color: var(--gray-100);
}

.item-description {
  color: var(--gray-700);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.status.active {
  background-color: #d1fae5;
  color: var(--success-color);
}

.status.inactive {
  background-color: #fee2e2;
  color: var(--error-color);
}

.created-date {
  color: var(--gray-500);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .add-item-form {
    gap: 1.5rem;
  }
  
  .item-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .item-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}`;
} 