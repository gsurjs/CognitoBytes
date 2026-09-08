// CognitoBytes daily hub: reads each game's localStorage to show today's
// daily status, picks the "Up Next" game, and tracks day-by-day history.

const DAILY_GAMES = [
    {
        id: 'terrabyte',
        name: 'TERRABYTE',
        icon: '🌍',
        href: 'games/terra-byte/',
        gradClass: 'g-terrabyte',
        desc: 'Guess the mystery country on the pixel globe'
    },
    {
        id: 'alphabit',
        name: 'ALPHABIT',
        icon: '🔤',
        href: 'games/alpha-bit/',
        gradClass: 'g-alphabit',
        desc: 'Guess the 5-letter word in 6 tries'
    },
    {
        id: 'floodthis',
        name: 'FLOOD-THIS',
        icon: '🌊',
        href: 'games/flood-this/',
        gradClass: 'g-floodthis',
        desc: 'Flood the whole grid in 25 moves'
    },
    {
        id: 'decipherly',
        name: 'DECIPHERLY',
        icon: '🔀',
        href: 'games/decipherly/',
        gradClass: 'g-decipherly',
        desc: 'Swap tiles to fix the crossword grid'
    },
    {
        id: 'pixslate',
        name: 'PIXSLATE',
        icon: '🧩',
        href: 'games/pix-slate/',
        gradClass: 'g-pixslate',
        desc: 'Solve the sliding puzzle for your best time'
    }
];

const HISTORY_KEY = 'cognito-daily-history';

// Same seed helpers the games use, so the hub computes identical dailies
function hubHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function hubSeededRandom(seed) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function readJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

class DailyStatusTracker {
    constructor() {
        const now = new Date();
        // The games seed their dailies from the unpadded local date string
        this.gameDateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        this.pixSlateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        this.legacyDateString = now.toDateString();
        this.isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        this.todaysWord = null; // AlphaBit's answer, computed from its own word list
    }

    async loadAlphaBitWord() {
        try {
            const response = await fetch('games/alpha-bit/data/wordle-answers-alphabetical.txt');
            if (!response.ok) return;
            const text = await response.text();
            const words = text.split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5);
            if (words.length === 0) return;
            const seed = hubHashCode(this.gameDateString);
            this.todaysWord = words[Math.floor(hubSeededRandom(seed) * words.length)];
        } catch (error) {
            // Offline or blocked: AlphaBit just shows as not-done
        }
    }

    getStatus(gameId) {
        switch (gameId) {
            case 'terrabyte': {
                const stats = readJSON('terraByte-stats-daily') || {};
                return {
                    done: stats.lastGamePlayed === this.gameDateString,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
            case 'alphabit': {
                const stats = readJSON('woordle-stats-v2-daily') || {};
                return {
                    done: this.todaysWord !== null && stats.lastGamePlayed === this.todaysWord,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
            case 'floodthis': {
                const stats = readJSON('flood-this-stats-v2-daily') || {};
                return {
                    done: stats.lastGameCompleted === `daily-${this.gameDateString}`,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
            case 'decipherly': {
                const dayState = readJSON('cj-daily-state-' + this.legacyDateString);
                const stats = readJSON('cj-stats') || {};
                return {
                    done: !!(dayState && dayState.solved),
                    streak: parseInt(stats.streak) || 0
                };
            }
            case 'pixslate': {
                const stats = readJSON('pixSlate-stats-daily') || {};
                return {
                    done: stats.lastGamePlayedSeed === this.pixSlateSeed,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
        }
        return { done: false, streak: 0 };
    }

    getAllStatuses() {
        const statuses = {};
        for (const game of DAILY_GAMES) {
            statuses[game.id] = this.getStatus(game.id);
        }
        return statuses;
    }

    // Record today's completion count so the week strip fills in over time
    recordHistory(doneCount) {
        try {
            const history = readJSON(HISTORY_KEY) || {};
            history[this.isoDate] = { done: doneCount, total: DAILY_GAMES.length };
            const keys = Object.keys(history).sort();
            while (keys.length > 60) {
                delete history[keys.shift()];
            }
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
            return history;
        } catch (error) {
            return {};
        }
    }
}

class BrainGamesMenu {
    constructor() {
        this.audioContext = null;
        this.isVisible = true;
        this.tracker = new DailyStatusTracker();

        this.initializeElements();
        this.loadAndDisplayStats();
        this.setupEventListeners();
        this.setupVisibilityHandling();
        this.setupStatsRefresh();
        this.renderDateLine();
        this.initDailyHub();
    }

    async initDailyHub() {
        this.refreshDailyHub(); // First paint from what's already known
        await this.tracker.loadAlphaBitWord();
        this.refreshDailyHub(); // Repaint once AlphaBit's word is known
    }

    refreshDailyHub() {
        try {
            const statuses = this.tracker.getAllStatuses();
            const doneCount = DAILY_GAMES.filter(g => statuses[g.id].done).length;
            const history = this.tracker.recordHistory(doneCount);

            this.renderHero(statuses, doneCount);
            this.renderRows(statuses);
            this.renderWeek(history, doneCount);
            this.renderStreakChip(statuses);
        } catch (error) {
            console.error('Daily hub refresh failed:', error);
        }
    }

    renderDateLine() {
        const el = document.getElementById('hubDate');
        if (!el) return;
        try {
            el.textContent = new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            // Keep the static fallback text
        }
    }

    renderHero(statuses, doneCount) {
        const card = document.getElementById('heroCard');
        const label = document.getElementById('heroLabel');
        const note = document.getElementById('heroNote');
        const icon = document.getElementById('heroIcon');
        const name = document.getElementById('heroName');
        const desc = document.getElementById('heroDesc');
        const play = document.getElementById('heroPlay');
        if (!card || !label || !icon || !name || !desc || !play) return;

        const nextGame = DAILY_GAMES.find(g => !statuses[g.id].done);
        this.heroGameId = nextGame ? nextGame.id : null;

        if (nextGame) {
            const streak = statuses[nextGame.id].streak;
            card.classList.remove('all-done');
            label.textContent = 'UP NEXT';
            note.textContent = streak > 0 ? `🔥 ${streak} streak on the line` : 'Start a new streak';
            icon.textContent = nextGame.icon;
            icon.className = 'hero-icon ' + nextGame.gradClass;
            icon.style.background = '';
            name.textContent = nextGame.name;
            desc.textContent = nextGame.desc;
            play.href = nextGame.href;
            play.style.display = '';
        } else {
            card.classList.add('all-done');
            label.textContent = 'ALL CLEAR';
            note.textContent = `${doneCount} of ${DAILY_GAMES.length} done`;
            icon.textContent = '🏆';
            icon.className = 'hero-icon';
            icon.style.background = 'linear-gradient(135deg, #b8860b, #ffd700)';
            name.textContent = 'All dailies done!';
            desc.textContent = 'Come back tomorrow for fresh puzzles';
            play.style.display = 'none';
        }
    }

    renderRows(statuses) {
        document.querySelectorAll('.game-row').forEach(row => {
            const game = DAILY_GAMES.find(g => g.id === row.dataset.game);
            if (!game) return;

            // The hero already features the up-next game; hide its row
            row.style.display = game.id === this.heroGameId ? 'none' : '';

            const status = statuses[game.id];
            const sub = row.querySelector('.row-sub');
            const statusEl = row.querySelector('.row-status');
            if (!sub || !statusEl) return;

            sub.textContent = status.streak > 0 ? `🔥 ${status.streak} streak` : game.desc;

            if (status.done) {
                statusEl.innerHTML = `
                    <div class="done-badge">
                        <svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="#2ecc71" stroke-width="2"></circle><path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        <span>Done</span>
                    </div>`;
            } else {
                statusEl.innerHTML = `
                    <div class="play-pill">
                        <span>Play</span>
                        <svg viewBox="0 0 16 16" width="11" height="11"><path d="M6 3l5 5-5 5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>`;
            }
        });
    }

    renderWeek(history, doneCount) {
        const dots = document.getElementById('weekDots');
        const caption = document.getElementById('weekCaption');
        if (!dots || !caption) return;

        dots.innerHTML = '';
        const total = DAILY_GAMES.length;
        let perfectRun = 0;
        let runBroken = false;

        for (let offset = 6; offset >= 0; offset--) {
            const day = new Date();
            day.setDate(day.getDate() - offset);
            const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const entry = history[iso];
            const isToday = offset === 0;

            const dot = document.createElement('div');
            let cls = 'day';
            if (isToday) {
                cls += ' today';
                if (entry && entry.done >= entry.total) cls += ' perfect';
            } else if (entry && entry.done >= entry.total) {
                cls += ' perfect';
            } else if (entry && entry.done > 0) {
                cls += ' partial';
            } else {
                cls += ' unknown';
            }
            dot.className = cls;
            dot.title = 'SunMonTueWedThuFriSat'.substr(day.getDay() * 3, 3) +
                (entry ? ` · ${entry.done}/${entry.total}` : '');
            dots.appendChild(dot);
        }

        // Count consecutive perfect days ending today (or yesterday if today isn't done yet)
        for (let offset = 0; offset < 60; offset++) {
            const day = new Date();
            day.setDate(day.getDate() - offset);
            const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const entry = history[iso];
            const perfect = entry && entry.done >= entry.total;
            if (perfect) {
                perfectRun++;
            } else if (offset === 0) {
                continue; // today isn't over yet; don't break the run
            } else {
                break;
            }
        }

        caption.textContent = perfectRun > 0
            ? `${perfectRun}-day perfect run · today ${doneCount} of ${total}`
            : `today ${doneCount} of ${total}`;
    }

    renderStreakChip(statuses) {
        const chip = document.getElementById('bestStreakChip');
        const value = document.getElementById('bestStreakValue');
        if (!chip || !value) return;
        const best = Math.max(...DAILY_GAMES.map(g => statuses[g.id].streak));
        if (best > 0) {
            value.textContent = best;
            chip.style.display = '';
        } else {
            chip.style.display = 'none';
        }
    }

    // ------------------------------------------------------------
    // Aggregate stats (all games, all modes)
    // ------------------------------------------------------------

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            } else if (this.isVisible) {
                this.loadAndDisplayStats();
                this.refreshDailyHub();
            }
        });
    }

    setupStatsRefresh() {
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
    }

    setupEventListeners() {
        document.querySelectorAll('.game-row, .hero-play').forEach(el => {
            el.addEventListener('click', () => this.playSound('click'), { passive: true });
        });
    }

    loadAndDisplayStats() {
        const numberGameStats = this.getGameStats('number-game-stats');
        const memoryGameStats = this.getGameStats('memory-game-stats');
        const slidingPuzzleDailyStats = this.getGameStats('pixSlate-stats-daily');
        const slidingPuzzleRandomStats = this.getGameStats('pixSlate-stats-random');
        const slidingPuzzleTotalPlayed = (slidingPuzzleDailyStats.gamesPlayed || 0) + (slidingPuzzleRandomStats.gamesPlayed || 0);
        const slidingPuzzleTotalWon = (slidingPuzzleDailyStats.gamesWon || 0) + (slidingPuzzleRandomStats.gamesWon || 0);

        const woordleDailyStats = this.getGameStats('woordle-stats-v2-daily');
        const woordleInfiniteStats = this.getGameStats('woordle-stats-v2-infinite');
        const woordleTotalPlayed = (woordleDailyStats.gamesPlayed || 0) + (woordleInfiniteStats.gamesPlayed || 0);
        const woordleTotalWon = (woordleDailyStats.gamesWon || 0) + (woordleInfiniteStats.gamesWon || 0);

        // Aggregate stats for TerraByte from both modes
        const terraByteDailyStats = this.getGameStats('terraByte-stats-daily');
        const terraBytePracticeStats = this.getGameStats('terraByte-stats-practice');
        const terraByteTotalPlayed = (terraByteDailyStats.gamesPlayed || 0) + (terraBytePracticeStats.gamesPlayed || 0);
        const terraByteTotalWon = (terraByteDailyStats.gamesWon || 0) + (terraBytePracticeStats.gamesWon || 0);

        // Decipherly keeps a single combined stats object
        const decipherlyStats = readJSON('cj-stats') || {};
        const decipherlyPlayed = parseInt(decipherlyStats.played) || 0;
        const decipherlyWon = parseInt(decipherlyStats.wins) || 0;

        const floodItDailyStats = this.getGameStats('flood-this-stats-v2-daily');
        const floodItEasyStats = this.getGameStats('flood-this-stats-v2-easy');
        const floodItMediumStats = this.getGameStats('flood-this-stats-v2-medium');
        const floodItHardStats = this.getGameStats('flood-this-stats-v2-hard');
        const floodItTotalPlayed = (floodItDailyStats.gamesPlayed || 0) + (floodItEasyStats.gamesPlayed || 0) + (floodItMediumStats.gamesPlayed || 0) + (floodItHardStats.gamesPlayed || 0);
        const floodItTotalWon = (floodItDailyStats.gamesWon || 0) + (floodItEasyStats.gamesWon || 0) + (floodItMediumStats.gamesWon || 0) + (floodItHardStats.gamesWon || 0);

        const totalPlayed =
            (numberGameStats.totalGames || 0) +
            (memoryGameStats.gamesPlayed || 0) +
            slidingPuzzleTotalPlayed +
            woordleTotalPlayed +
            floodItTotalPlayed +
            terraByteTotalPlayed +
            decipherlyPlayed;

        const totalWon =
            (numberGameStats.gamesWon || 0) +
            (memoryGameStats.gamesWon || 0) +
            slidingPuzzleTotalWon +
            woordleTotalWon +
            floodItTotalWon +
            terraByteTotalWon +
            decipherlyWon;

        const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

        const currentPlayed = parseInt(this.totalGamesPlayedEl.textContent) || 0;
        const currentWon = parseInt(this.totalGamesWonEl.textContent) || 0;
        const currentRate = parseInt(this.winPercentageEl.textContent.replace('%', '')) || 0;

        if (currentPlayed !== totalPlayed || currentWon !== totalWon || currentRate !== winRate) {
            if (this.prefersReducedMotion()) {
                this.totalGamesPlayedEl.textContent = totalPlayed;
                this.totalGamesWonEl.textContent = totalWon;
                this.winPercentageEl.textContent = winRate + '%';
            } else {
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
                if (typeof parsed === 'object' && parsed !== null) {
                    return {
                        gamesWon: parseInt(parsed.gamesWon) || 0,
                        gamesPlayed: parseInt(parsed.gamesPlayed) || parseInt(parsed.totalGames) || 0,
                        totalGames: parseInt(parsed.totalGames) || parseInt(parsed.gamesPlayed) || 0,
                        ...parsed
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
            if (!this.isVisible) return;

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

        try {
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

            oscillator.frequency.setValueAtTime(550, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            // Audio is a nice-to-have; never let it break the menu
        }
    }

    refreshStats() {
        this.loadAndDisplayStats();
        this.refreshDailyHub();
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Make the menu instance globally available so games can call refreshStats
window.brainGamesMenu = null;

window.addEventListener('beforeunload', () => {
    if (window.brainGamesMenu) {
        window.brainGamesMenu.cleanup();
    }
});

window.addEventListener('load', () => {
    window.brainGamesMenu = new BrainGamesMenu();
});

window.addEventListener('focus', () => {
    if (window.brainGamesMenu) {
        window.brainGamesMenu.refreshStats();
    }
});
