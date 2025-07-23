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
        // Aggregate stats from all games with proper handling of different data structures
        const numberGameStats = this.getGameStats('number-game-stats');
        const memoryGameStats = this.getGameStats('memory-game-stats');
        const woordleStats = this.getGameStats('woordle-stats');
        const floodItStats = this.getGameStats('flood-it-stats');

        // Debug logging
        console.log('Number Game Stats:', numberGameStats);
        console.log('Memory Game Stats:', memoryGameStats);
        console.log('Woordle Stats:', woordleStats);
        console.log('Flood-It Stats:', floodItStats);

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

        console.log(`Total: ${totalPlayed} played, ${totalWon} won, ${winRate}% win rate`);

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
        
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log(`Loaded ${key}:`, parsed);
                return parsed;
            }
        } catch (error) {
            console.error(`Error loading stats for ${key}:`, error);
        }
        
        return defaultStats;
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

    startFloatingElements() {
        const createFloatingElement = () => {
            const element = document.createElement('div');
            const icons = ['🧠', '🎮', '🎯', '🏆', '⭐', '💡', '🔥', '⚡'];
            element.textContent = icons[Math.floor(Math.random() * icons.length)];
            element.style.position = 'absolute';
            element.style.fontSize = Math.random() * 20 + 15 + 'px';
            element.style.opacity = Math.random() * 0.3 + 0.1;
            element.style.left = Math.random() * 100 + '%';
            element.style.top = '100%';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '0';
            element.style.animation = `floatUp ${Math.random() * 10 + 15}s linear infinite`;
            
            this.floatingElementsEl.appendChild(element);
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 25000);
        };
        
        // Create floating elements periodically
        createFloatingElement();
        setInterval(createFloatingElement, 3000);
        
        // Add CSS for floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
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