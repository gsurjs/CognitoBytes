// analytics.js - Dynamic Google Analytics Implementation
(function() {
    // Get measurement ID from a global variable that will be set in HTML
    const MEASUREMENT_ID = window.GA_MEASUREMENT_ID || null;
    
    // Check if we should load analytics
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        window.location.hostname !== '';
    
    console.log('Analytics Debug Info:');
    console.log('- Hostname:', window.location.hostname);
    console.log('- Is Production:', isProduction);
    console.log('- Measurement ID found:', MEASUREMENT_ID ? 'Yes' : 'No');
    
    if (!isProduction) {
        console.log('🚫 Analytics disabled - development environment');
        createMockAnalytics();
        return;
    }
    
    if (!MEASUREMENT_ID) {
        console.error('❌ Google Analytics Measurement ID not found!');
        console.log('📝 Please ensure GA_MEASUREMENT_ID is set in the script tag');
        createMockAnalytics();
        return;
    }
    
    // Load Google Analytics
    console.log('🔄 Loading Google Analytics...');
    
    // Create and load the gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.onload = function() {
        console.log('✅ Google Analytics script loaded');
        initializeGoogleAnalytics();
    };
    script.onerror = function() {
        console.error('❌ Failed to load Google Analytics script');
        createMockAnalytics();
    };
    document.head.appendChild(script);
    
    function initializeGoogleAnalytics() {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', MEASUREMENT_ID, {
            // Privacy-friendly settings
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            send_page_view: true
        });
        
        console.log('✅ Google Analytics initialized successfully!');
        
        // Create the analytics wrapper
        createWorkingAnalytics();
        
        // Send initial page view
        window.analytics.trackPageView(document.title, window.location.href);
    }
    
    function createWorkingAnalytics() {
        window.analytics = {
            // Track page views
            trackPageView: function(page_title, page_location) {
                console.log('📊 Page View:', page_title);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_view', {
                        page_title: page_title,
                        page_location: page_location
                    });
                }
            },
            
            // Track game events
            trackGameEvent: function(action, game_name, additional_params = {}) {
                console.log('🎮 Game Event:', action, game_name, additional_params);
                if (typeof gtag !== 'undefined') {
                    gtag('event', action, {
                        event_category: 'game',
                        game_name: game_name,
                        ...additional_params
                    });
                }
            },
            
            // Track game start
            trackGameStart: function(game_name, difficulty = null) {
                console.log('🚀 Game Start:', game_name, difficulty);
                this.trackGameEvent('game_start', game_name, { difficulty });
            },
            
            // Track game completion
            trackGameComplete: function(game_name, success, score = null, time_played = null) {
                console.log('🏁 Game Complete:', game_name, success, score, time_played);
                this.trackGameEvent('game_complete', game_name, {
                    success: success,
                    score: score,
                    time_played: time_played
                });
            },
            
            // Track button clicks
            trackButtonClick: function(button_name, location) {
                console.log('🖱️ Button Click:', button_name, location);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'button',
                        button_name: button_name,
                        location: location
                    });
                }
            },
            
            // Check if Analytics is properly initialized
            isInitialized: function() {
                return typeof gtag !== 'undefined';
            }
        };
    }
    
    function createMockAnalytics() {
        // Create mock analytics for development/fallback
        window.analytics = {
            trackPageView: function(page_title, page_location) {
                console.log('🔇 Mock Analytics - Page View:', page_title);
            },
            trackGameEvent: function(action, game_name, additional_params = {}) {
                console.log('🔇 Mock Analytics - Game Event:', action, game_name);
            },
            trackGameStart: function(game_name, difficulty = null) {
                console.log('🔇 Mock Analytics - Game Start:', game_name, difficulty);
            },
            trackGameComplete: function(game_name, success, score = null, time_played = null) {
                console.log('🔇 Mock Analytics - Game Complete:', game_name, success);
            },
            trackButtonClick: function(button_name, location) {
                console.log('🔇 Mock Analytics - Button Click:', button_name, location);
            },
            isInitialized: function() {
                return false;
            }
        };
    }
})();