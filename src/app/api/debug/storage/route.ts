// Debug endpoint to check localStorage status
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Debug localStorage checker',
    instructions: {
      checkBrowser: 'Open browser console and run: Object.keys(localStorage)',
      expectedKeys: [
        'use-case-storage',
        'aura-initiatives', 
        'aura-features',
        'aura-epics',
        'aura-stories'
      ],
      testCommand: `
// In browser console:
const useCases = JSON.parse(localStorage.getItem('use-case-storage') || '{}');
console.log('Use Cases:', useCases);
console.log('Use Cases Count:', useCases.state?.useCases?.length || 0);
      `
    }
  });
}
