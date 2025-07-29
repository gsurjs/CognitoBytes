// build.js - Inject GA measurement ID into HTML files
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 Starting build process...');

// Get the measurement ID from environment variables
const measurementId = process.env.VITE_GA_MEASUREMENT_ID || 
                     process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 
                     process.env.GA_MEASUREMENT_ID;

if (!measurementId) {
    console.warn('⚠️  Warning: Google Analytics Measurement ID not found in environment variables');
    console.log('   Analytics will be disabled in production');
    console.log('   Add GA_MEASUREMENT_ID to your Vercel environment variables');
} else {
    console.log('✅ Google Analytics Measurement ID found');
    
    // Find all HTML files
    const htmlFiles = glob.sync('*.html');
    
    htmlFiles.forEach(htmlFile => {
        console.log(`📝 Processing ${htmlFile}...`);
        
        let htmlContent = fs.readFileSync(htmlFile, 'utf8');
        
        // Check if meta tag already exists
        if (htmlContent.includes('name="ga-measurement-id"')) {
            // Replace existing meta tag
            htmlContent = htmlContent.replace(
                /<meta name="ga-measurement-id" content="[^"]*">/g,
                `<meta name="ga-measurement-id" content="${measurementId}">`
            );
        } else {
            // Add meta tag after <meta charset="UTF-8">
            htmlContent = htmlContent.replace(
                /<meta charset="UTF-8">/,
                `<meta charset="UTF-8">
    <meta name="ga-measurement-id" content="${measurementId}">`
            );
        }
        
        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`✅ Updated ${htmlFile} with measurement ID`);
    });
}

console.log('🎉 Build process completed successfully!');