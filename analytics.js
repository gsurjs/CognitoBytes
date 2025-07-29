// analytics.js - Google Analytics Integration (Simplified)
class Analytics {
    constructor() {
        // Get measurement ID from environment or hardcode for static deployment
        this.measurementId = this.getMeasurementId();
        this.isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
        
        if (this.measurementId && this.isProduction) {
            this.initializeGA();
        } else {
            console.log('Analytics disabled (development mode or no measurement ID)');
        }
    }

    getMeasurementId() {
        // For static deployment, you'll need to replace this with your actual measurement ID
        // Or use a different approach that doesn't require build-time environment variables
        
        // Option 1: Hardcode your measurement ID (not ideal but works)
        // return 'G-XXXXXXXXXX'; // Replace with your actual measurement ID
        
        // Option 2: Use a meta tag approach
        const metaTag = document.querySelector('meta[name="ga-measurement-id"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Option 3: Check for a global variable set elsewhere
        if (window.GA_MEASUREMENT_ID) {
            return window.GA_MEASUREMENT_ID;
        }
        
        return null; // Analytics will be disabled
    }

    initializeGA() {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.measurementId, {
            // Privacy-friendly settings
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        // Make gtag globally available
        window.gtag = gtag;
        
        console.log('Google Analytics initialized with ID:', this.measurementId);
    }

    // Track page views
    trackPageView(page_title, page_location) {
        if (!this.isInitialized()) return;

        gtag('event', 'page_view', {
            page_title: page_title,
            page_location: page_location
        });
    }

    // Track game events
    trackGameEvent(action, game_name, additional_params = {}) {
        if (!this.isInitialized()) return;

        gtag('event', action, {
            event_category: 'game',
            game_name: game_name,
            ...additional_params
        });
    }

    // Track game start
    trackGameStart(game_name, difficulty = null) {
        this.trackGameEvent('game_start', game_name, { difficulty });
    }

    // Track game completion
    trackGameComplete(game_name, success, score = null, time_played = null) {
        this.trackGameEvent('game_complete', game_name, {
            success: success,
            score: score,
            time_played: time_played
        });
    }

    // Track button clicks
    trackButtonClick(button_name, location) {
        if (!this.isInitialized()) return;

        gtag('event', 'click', {
            event_category: 'button',
            button_name: button_name,
            location: location
        });
    }

    // Check if Analytics is properly initialized
    isInitialized() {
        return this.measurementId && this.isProduction && typeof gtag !== 'undefined';
    }
}

// Initialize Analytics globally
window.analytics = new Analytics();