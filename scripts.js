class BrainGamesMenu {
    constructor() {
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        
        this.initializeElements();
        this.loadAndDisplayStats();
        this.setupEventListeners();
        this.setupVisibilityHandling();
        
        // Removed floating elements for better performance
        // this.startFloatingElements();
        this.setupStatsRefresh();
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            } else if (this.isVisible) {
                // Refresh stats when returning to the page
                this.loadAndDisplayStats();
            }
        });
    }

    setupStatsRefresh() {
        // Refresh stats every 2 seconds when page is visible
        setInterval(() => {
            if (this.isVisible) {
                this.loadAndDisplayStats();
            }
        }, 2000);
    }

    initializeElements() {
        this.totalGamesPlayedEl = document.getElementById('totalGamesPlayed');
        this.totalGamesWonEl = document.getElementById('totalGamesWon');
        this.winPercentageEl = document.getElementById('winPercentage');
        this.floatingElementsEl = document.getElementById('floatingElements');
    }

    setupEventListeners() {
        // Add hover sound effects with passive listeners
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.playSound('hover'), { passive: true });
            card.addEventListener('click', () => this.playSound('click'), { passive: true });
        });
    }

    loadAndDisplayStats() {
        // Aggregate stats from all games with proper handling of different data structures
        const numberGameStats = this.getGameStats('number-game-stats');
        const memoryGameStats = this.getGameStats('memory-game-stats');
        const slidingPuzzleStats = this.getGameStats('sliding-puzzle-stats');

        // Aggregate stats for Alpha-Bit (Woordle) from both modes
        const woordleDailyStats = this.getGameStats('woordle-stats-v2-daily');
        const woordleInfiniteStats = this.getGameStats('woordle-stats-v2-infinite');
        const woordleTotalPlayed = (woordleDailyStats.gamesPlayed || 0) + (woordleInfiniteStats.gamesPlayed || 0);
        const woordleTotalWon = (woordleDailyStats.gamesWon || 0) + (woordleInfiniteStats.gamesWon || 0);

        // Aggregate stats for Flood-This from all modes
        const floodItDailyStats = this.getGameStats('flood-this-stats-v2-daily');
        const floodItEasyStats = this.getGameStats('flood-this-stats-v2-easy');
        const floodItMediumStats = this.getGameStats('flood-this-stats-v2-medium');
        const floodItHardStats = this.getGameStats('flood-this-stats-v2-hard');
        const floodItTotalPlayed = (floodItDailyStats.gamesPlayed || 0) + (floodItEasyStats.gamesPlayed || 0) + (floodItMediumStats.gamesPlayed || 0) + (floodItHardStats.gamesPlayed || 0);
        const floodItTotalWon = (floodItDailyStats.gamesWon || 0) + (floodItEasyStats.gamesWon || 0) + (floodItMediumStats.gamesWon || 0) + (floodItHardStats.gamesWon || 0);

        // Calculate totals with proper field mapping
        const totalPlayed = 
            (numberGameStats.totalGames || 0) + 
            (memoryGameStats.gamesPlayed || 0) +
            (slidingPuzzleStats.gamesPlayed || 0) + 
            woordleTotalPlayed +
            floodItTotalPlayed;
            
        const totalWon = 
            (numberGameStats.gamesWon || 0) + 
            (memoryGameStats.gamesWon || 0) + 
            (slidingPuzzleStats.gamesWon || 0) +
            woordleTotalWon +
            floodItTotalWon;
            
        const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

        const currentPlayed = parseInt(this.totalGamesPlayedEl.textContent) || 0;
        const currentWon = parseInt(this.totalGamesWonEl.textContent) || 0;
        const currentRate = parseInt(this.winPercentageEl.textContent.replace('%', '')) || 0;

        if (currentPlayed !== totalPlayed || currentWon !== totalWon || currentRate !== winRate) {
            // Update display with animation only if user prefers motion
            if (this.prefersReducedMotion()) {
                // No animations for users who prefer reduced motion
                this.totalGamesPlayedEl.textContent = totalPlayed;
                this.totalGamesWonEl.textContent = totalWon;
                this.winPercentageEl.textContent = winRate + '%';
            } else {
                // Simplified, faster animations
                this.animateValue(this.totalGamesPlayedEl, currentPlayed, totalPlayed, 800);
                this.animateValue(this.totalGamesWonEl, currentWon, totalWon, 800);
                
                setTimeout(() => {
                    this.animateValue(this.winPercentageEl, currentRate, winRate, 600, '%');
                }, 200);
            }
        }
    }

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    getGameStats(key) {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            totalGames: 0
        };
        
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Validate that the parsed data has expected structure
                if (typeof parsed === 'object' && parsed !== null) {
                    return {
                        gamesWon: parseInt(parsed.gamesWon) || 0,
                        gamesPlayed: parseInt(parsed.gamesPlayed) || parseInt(parsed.totalGames) || 0,
                        totalGames: parseInt(parsed.totalGames) || parseInt(parsed.gamesPlayed) || 0,
                        ...parsed // Include any other fields
                    };
                }
            }
        } catch (error) {
            console.error(`Error loading stats for ${key}:`, error);
        }
        
        return defaultStats;
    }

    animateValue(element, start, end, duration, suffix = '') {
        if (this.prefersReducedMotion() || start === end) {
            element.textContent = end + suffix;
            return;
        }
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.isVisible) return; // Pause if not visible
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * this.easeOutQuart(progress));
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    playSound(type) {
        if (!this.isVisible) return;
        
        // Reuse AudioContext for better performance
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'hover':
                frequency = 440;
                duration = 0.05; // Reduced duration
                break;
            case 'click':
                frequency = 550;
                duration = 0.1; // Reduced duration
                break;
            default:
                frequency = 440;
                duration = 0.05;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime); // Reduced volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Method to manually refresh stats (can be called from other scripts)
    refreshStats() {
        this.loadAndDisplayStats();
    }

    // Method to reset all stats (for testing purposes)
    resetAllStats() {
        if (confirm('Are you sure you want to reset all game statistics? This cannot be undone.')) {
            localStorage.removeItem('number-game-stats');
            localStorage.removeItem('memory-game-stats');
            localStorage.removeItem('woordle-stats');
            localStorage.removeItem('flood-it-stats');
            localStorage.removeItem('sliding-puzzle-stats');
            this.loadAndDisplayStats();
            console.log('All stats have been reset');
        }
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Make the menu instance globally available so games can call refreshStats
window.brainGamesMenu = null;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.brainGamesMenu) {
        window.brainGamesMenu.cleanup();
    }
});

// Initialize menu when page loads
window.addEventListener('load', () => {
    window.brainGamesMenu = new BrainGamesMenu();
});

// Also refresh stats when the page gains focus (user returns to tab)
window.addEventListener('focus', () => {
    if (window.brainGamesMenu) {
        window.brainGamesMenu.refreshStats();
    }
});