/**
 * List available Gemini models
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');
  
  try {
    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: any = await response.json();
    
    console.log('Available models:');
    console.log('='.repeat(60));
    
    if (data.models && Array.isArray(data.models)) {
      data.models.forEach((model: any) => {
        console.log(`\n📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\nTotal models: ${data.models?.length || 0}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

listModels();
