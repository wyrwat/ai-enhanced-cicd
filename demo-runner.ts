#!/usr/bin/env npx ts-node

/**
 * 🎬 AI-Enhanced CI/CD Demo Runner
 * Standalone demonstration script for presentation
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import AICIDemo from './src/ai-demo';

async function main() {
  console.log('🎯 Welcome to AI-Enhanced CI/CD Demonstration');
  console.log('============================================');
  console.log('This demo showcases how AI transforms DevOps workflows');
  console.log();

  const demo = new AICIDemo();

  try {
    // Interactive demo menu
    const args = process.argv.slice(2);
    
    if (args.includes('--full') || args.includes('-f')) {
      await demo.runFullDemo();
      return;
    }

    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }

    // Default: run specific demo based on argument
    const demoType = args[0];
    
    switch (demoType) {
      case 'review':
        console.log('🤖 Running AI Code Review Demo...\n');
        await demo.reviewCodeWithAI();
        break;
        
      case 'predict':
        console.log('🧠 Running AI Test Prediction Demo...\n');
        await demo.predictTestFailures();
        break;
        
      case 'optimize':
        console.log('🚀 Running AI Pipeline Optimization Demo...\n');
        await demo.optimizePipelineWithAI();
        break;
        
      case 'monitor':
        console.log('📊 Running AI Performance Monitoring Demo...\n');
        await demo.analyzePerformanceWithAI();
        break;
        
      case 'heal':
        console.log('🛠️ Running AI Self-Healing Demo...\n');
        await demo.activateSelfHealing();
        break;
        
      case 'deploy':
        console.log('🚀 Running AI Deployment Decision Demo...\n');
        await demo.assessDeploymentReadiness();
        break;
        
      default:
        console.log('🎬 Running Full AI-Enhanced CI/CD Demo...\n');
        await demo.runFullDemo();
        break;
    }

    console.log('\n✨ Demo completed successfully!');
    console.log('💡 Try different demo modes with: npm run demo:ai <mode>');
    console.log('📖 Available modes: review, predict, monitor, heal, deploy, --full');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log('🎯 AI-Enhanced CI/CD Demo - Usage');
  console.log('==================================');
  console.log('');
  console.log('Dedicated AI Commands (Recommended):');
  console.log('  npm run ai:full              # 🎬 Complete 15-minute demo');
  console.log('  npm run ai:review            # 🤖 AI Code Review');
  console.log('  npm run ai:predict           # 🧠 AI Test Prediction');
  console.log('  npm run ai:optimize          # 🚀 AI Pipeline Optimization');
  console.log('  npm run ai:monitor           # 📊 AI Performance Monitoring');
  console.log('  npm run ai:heal              # 🛠️ AI Self-Healing');
  console.log('  npm run ai:deploy            # 🚀 AI Deployment Decision');
  console.log('');
  console.log('Legacy Commands:');
  console.log('  npm run demo:ai              # Run full demo');
  console.log('  npm run demo:ai review        # AI Code Review');
  console.log('  npm run demo:ai --full        # Complete demonstration');
  console.log('  npm run demo:ai --help        # Show this help');
  console.log('');
  console.log('🎬 For presentation: npm run ai:full');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default main;
