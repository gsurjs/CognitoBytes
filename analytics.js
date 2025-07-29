// analytics.js - Google Analytics Integration
class Analytics {
    constructor() {
        this.measurementId = this.getMeasurementId();
        this.isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
        
        if (this.measurementId && this.isProduction) {
            this.initializeGA();
        }
    }

    getMeasurementId() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' 
               ? null 
               : 'GA_MEASUREMENT_ID_PLACEHOLDER'; // This will be replaced by Vercel
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
        
        console.log('Google Analytics initialized');
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