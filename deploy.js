// deploy.js - Build script to replace GA_MEASUREMENT_ID_PLACEHOLDER
const fs = require('fs');
const path = require('path');

const measurementId = process.env.VITE_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

if (!measurementId) {
    console.warn('Warning: Google Analytics Measurement ID not found in environment variables');
    process.exit(0); // Don't fail the build, just skip analytics
}

// Replace placeholder in analytics.js
const analyticsPath = path.join(__dirname, 'analytics.js');

if (fs.existsSync(analyticsPath)) {
    let analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
    analyticsContent = analyticsContent.replace('GA_MEASUREMENT_ID_PLACEHOLDER', measurementId);
    fs.writeFileSync(analyticsPath, analyticsContent);
    console.log('Google Analytics Measurement ID injected successfully');
} else {
    console.warn('analytics.js file not found');
}

console.log('Build script completed');