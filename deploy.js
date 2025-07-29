// deploy.js - Build script to replace GA_MEASUREMENT_ID_PLACEHOLDER
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Get the measurement ID from environment variables
const measurementId = process.env.VITE_GA_MEASUREMENT_ID || 
                     process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 
                     process.env.GA_MEASUREMENT_ID;

if (!measurementId) {
    console.warn('⚠️  Warning: Google Analytics Measurement ID not found in environment variables');
    console.log('   Analytics will be disabled in production');
    console.log('   Add VITE_GA_MEASUREMENT_ID to your Vercel environment variables');
    // Don't fail the build, just skip analytics
} else {
    console.log('✅ Google Analytics Measurement ID found');
    
    // Replace placeholder in analytics.js
    const analyticsPath = path.join(__dirname, 'analytics.js');

    if (fs.existsSync(analyticsPath)) {
        let analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
        analyticsContent = analyticsContent.replace('GA_MEASUREMENT_ID_PLACEHOLDER', measurementId);
        fs.writeFileSync(analyticsPath, analyticsContent);
        console.log('✅ Google Analytics Measurement ID injected successfully');
    } else {
        console.warn('⚠️  analytics.js file not found - creating placeholder');
        // Create a basic analytics file if it doesn't exist
        const placeholderAnalytics = `
// Analytics placeholder - no tracking
window.analytics = {
    trackPageView: () => {},
    trackGameEvent: () => {},
    trackGameStart: () => {},
    trackGameComplete: () => {},
    trackButtonClick: () => {},
    isInitialized: () => false
};`;
        fs.writeFileSync(analyticsPath, placeholderAnalytics);
    }
}

// Run prettier if available
try {
    const { execSync } = require('child_process');
    console.log('🎨 Running Prettier...');
    execSync('npx prettier --write *.js *.html *.css', { stdio: 'inherit' });
    console.log('✅ Code formatting completed');
} catch (error) {
    console.log('ℹ️  Prettier not available or failed - continuing without formatting');
}

console.log('🎉 Build process completed successfully!');