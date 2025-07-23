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
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            }
        });
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
        const woordleStats = this.getGameStats('woordle-stats');
        const floodItStats = this.getGameStats('flood-it-stats');

        // Calculate totals with proper field mapping
        const totalPlayed = 
            (numberGameStats.totalGames || 0) + 
            (memoryGameStats.gamesPlayed || 0) + 
            (woordleStats.gamesPlayed || 0) + 
            (floodItStats.gamesPlayed || 0);
            
        const totalWon = 
            (numberGameStats.gamesWon || 0) + 
            (memoryGameStats.gamesWon || 0) + 
            (woordleStats.gamesWon || 0) + 
            (floodItStats.gamesWon || 0);
            
        const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

        // Update display immediately (no animation to reduce performance overhead)
        this.totalGamesPlayedEl.textContent = totalPlayed;
        this.totalGamesWonEl.textContent = totalWon;
        this.winPercentageEl.textContent = winRate + '%';

        // Optional: Add subtle animation only if user prefers motion
        if (this.prefersReducedMotion()) {
            // No animations for users who prefer reduced motion
            this.totalGamesPlayedEl.textContent = totalPlayed;
            this.totalGamesWonEl.textContent = totalWon;
            this.winPercentageEl.textContent = winRate + '%';
        } else {
            // Simplified, faster animations
            this.animateValue(this.totalGamesPlayedEl, 0, totalPlayed, 1000);
            this.animateValue(this.totalGamesWonEl, 0, totalWon, 1200);
            
            setTimeout(() => {
                this.animateValue(this.winPercentageEl, 0, winRate, 800, '%');
            }, 500);
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
                return parsed;
            }
        } catch (error) {
            console.error(`Error loading stats for ${key}:`, error);
        }
        
        return defaultStats;
    }

    animateValue(element, start, end, duration, suffix = '') {
        if (this.prefersReducedMotion()) {
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

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

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