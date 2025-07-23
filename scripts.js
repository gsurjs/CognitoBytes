class BrainGamesMenu {
    constructor() {
        this.initializeElements();
        this.startFloatingElements();
        this.loadAndDisplayStats();
        this.setupEventListeners();
    }

    initializeElements() {
        this.totalGamesPlayedEl = document.getElementById('totalGamesPlayed');
        this.totalGamesWonEl = document.getElementById('totalGamesWon');
        this.winPercentageEl = document.getElementById('winPercentage');
        this.floatingElementsEl = document.getElementById('floatingElements');
    }

    setupEventListeners() {
        // Add hover sound effects
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.playSound('hover'));
            card.addEventListener('click', () => this.playSound('click'));
        });
    }

    loadAndDisplayStats() {
        // Aggregate stats from all games
        const numberGameStats = this.getGameStats('number-game-stats');
        const memoryGameStats = this.getGameStats('memory-game-stats');
        const woordleStats = this.getGameStats('woordle-stats');
        const floodItStats = this.getGameStats('flood-it-stats');

        const totalPlayed = numberGameStats.totalGames + memoryGameStats.gamesPlayed + woordleStats.gamesPlayed + floodItStats.gamesPlayed;
        const totalWon = numberGameStats.gamesWon + memoryGameStats.gamesWon + woordleStats.gamesWon + floodItStats.gamesWon;
        const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

        this.totalGamesPlayedEl.textContent = totalPlayed;
        this.totalGamesWonEl.textContent = totalWon;
        this.winPercentageEl.textContent = winRate + '%';

        // Animate the numbers
        this.animateValue(this.totalGamesPlayedEl, 0, totalPlayed, 2000);
        this.animateValue(this.totalGamesWonEl, 0, totalWon, 2500);
        
        setTimeout(() => {
            this.animateValue(this.winPercentageEl, 0, winRate, 1500, '%');
        }, 1000);
    }

    getGameStats(key) {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            totalGames: 0
        };
        
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultStats;
    }

    animateValue(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'hover':
                frequency = 440;
                duration = 0.1;
                break;
            case 'click':
                frequency = 550;
                duration = 0.2;
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
}

// Initialize menu when page loads
window.addEventListener('load', () => {
    new BrainGamesMenu();
});