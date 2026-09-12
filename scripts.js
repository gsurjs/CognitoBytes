// CognitoBytes daily hub: reads each game's localStorage to show today's
// daily status, expands a roaming selection card, and tracks day history.

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
    },
    {
        id: 'grep',
        name: 'GREP-IT',
        icon: '🔎',
        href: 'games/grep-it/',
        gradClass: 'g-grep',
        desc: 'Six hidden words share one secret thread'
    },
    {
        id: 'bitwise',
        name: 'BITWISE',
        icon: '🧮',
        href: 'games/bitwise/',
        gradClass: 'g-bitwise',
        desc: 'Hit the target number in the fewest ops'
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
                // Derive the streak from daily-solve records: the game's own
                // cj-stats.streak historically mixed quickplay wins in
                let streak = 0;
                for (let offset = 0; offset < 400; offset++) {
                    const day = new Date();
                    day.setDate(day.getDate() - offset);
                    const rec = readJSON('cj-daily-state-' + day.toDateString());
                    if (rec && rec.solved) streak++;
                    else if (offset === 0) continue;
                    else break;
                }
                return {
                    done: !!(dayState && dayState.solved),
                    streak: streak
                };
            }
            case 'pixslate': {
                const stats = readJSON('pixSlate-stats-daily') || {};
                return {
                    done: stats.lastGamePlayedSeed === this.pixSlateSeed,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
            case 'grep': {
                const stats = readJSON('grep-stats-daily') || {};
                return {
                    done: stats.lastGamePlayed === this.gameDateString,
                    streak: parseInt(stats.currentStreak) || 0
                };
            }
            case 'bitwise': {
                const stats = readJSON('bitwise-stats-daily') || {};
                return {
                    done: stats.lastGamePlayed === this.gameDateString,
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
        this.selectedId = null;
        this.listOrder = [...DAILY_GAMES];

        this.initializeElements();
        this.loadAndDisplayStats();
        this.setupVisibilityHandling();
        this.setupStatsRefresh();
        this.renderDateLine();
        this.initDailyHub();
    }

    async initDailyHub() {
        await this.tracker.loadAlphaBitWord();
        this.buildGameList();
        this.refreshDailyHub();
    }

    // Build the accordion once per page load: up-next game first, then the rest
    buildGameList() {
        const container = document.getElementById('gameRows');
        if (!container) return;

        const statuses = this.tracker.getAllStatuses();
        const next = DAILY_GAMES.find(g => !statuses[g.id].done);
        this.listOrder = next
            ? [next, ...DAILY_GAMES.filter(g => g.id !== next.id)]
            : [...DAILY_GAMES];
        this.selectedId = (next || DAILY_GAMES[0]).id;

        container.innerHTML = this.listOrder.map(game => `
            <div class="game-item" data-game="${game.id}">
                <button class="game-row" type="button" aria-expanded="false">
                    <div class="row-icon ${game.gradClass}">${game.icon}</div>
                    <div class="row-text">
                        <div class="row-name">${game.name}</div>
                        <div class="row-sub">${game.desc}</div>
                    </div>
                    <div class="row-status"></div>
                </button>
                <div class="game-expand">
                    <div class="hero-top">
                        <div class="hero-label"></div>
                        <div class="hero-note"></div>
                    </div>
                    <div class="hero-week">
                        <div class="week-dots"></div>
                        <div class="week-caption"></div>
                    </div>
                    <div class="hero-game">
                        <div class="hero-icon ${game.gradClass}">${game.icon}</div>
                        <div class="hero-text">
                            <div class="hero-name">${game.name}</div>
                            <div class="hero-desc">${game.desc}</div>
                        </div>
                    </div>
                    <a class="hero-play" href="${game.href}">
                        <span class="hero-play-text">PLAY NOW</span>
                        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 3l5 5-5 5" fill="none" stroke="#241a3d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </a>
                </div>
            </div>`).join('');

        container.addEventListener('click', (event) => {
            if (event.target.closest('.hero-play')) {
                this.playSound('click');
                return; // Let the link navigate
            }
            const row = event.target.closest('.game-row');
            if (!row) return;
            const item = row.closest('.game-item');
            if (item && item.dataset.game !== this.selectedId) {
                this.selectedId = item.dataset.game;
                this.playSound('click');
                this.refreshDailyHub();
            }
        });
    }

    refreshDailyHub() {
        try {
            const statuses = this.tracker.getAllStatuses();
            const doneCount = DAILY_GAMES.filter(g => statuses[g.id].done).length;
            const history = this.tracker.recordHistory(doneCount);
            const nextGame = this.listOrder.find(g => !statuses[g.id].done);

            const banner = document.getElementById('allClearBanner');
            if (banner) banner.style.display = nextGame ? 'none' : '';

            document.querySelectorAll('.game-item').forEach(item => {
                const game = DAILY_GAMES.find(g => g.id === item.dataset.game);
                if (!game) return;
                const status = statuses[game.id];
                const expanded = game.id === this.selectedId;

                item.classList.toggle('expanded', expanded);
                const row = item.querySelector('.game-row');
                if (row) row.setAttribute('aria-expanded', expanded ? 'true' : 'false');

                this.renderRowState(item, game, status);
                this.renderExpandState(item, game, status, nextGame, doneCount, history);
            });

            this.renderStreakChip(statuses);
        } catch (error) {
            console.error('Daily hub refresh failed:', error);
        }
    }

    renderRowState(item, game, status) {
        const sub = item.querySelector('.row-sub');
        const statusEl = item.querySelector('.row-status');
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
    }

    renderExpandState(item, game, status, nextGame, doneCount, history) {
        const expand = item.querySelector('.game-expand');
        const label = item.querySelector('.hero-label');
        const note = item.querySelector('.hero-note');
        const playText = item.querySelector('.hero-play-text');
        if (!expand || !label || !note || !playText) return;

        expand.classList.toggle('done', status.done);

        if (status.done) {
            label.textContent = 'DONE TODAY';
            note.textContent = status.streak > 0 ? `🔥 ${status.streak} streak` : 'Nice work!';
            playText.textContent = 'VIEW RESULT';
        } else if (nextGame && game.id === nextGame.id) {
            label.textContent = 'UP NEXT';
            note.textContent = status.streak > 0 ? `🔥 ${status.streak} streak on the line` : 'Start a new streak';
            playText.textContent = 'PLAY NOW';
        } else {
            label.textContent = 'READY';
            note.textContent = status.streak > 0 ? `🔥 ${status.streak} streak on the line` : 'Start a new streak';
            playText.textContent = 'PLAY NOW';
        }

        this.renderWeek(history, doneCount,
            item.querySelector('.week-dots'), item.querySelector('.week-caption'));
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

    renderWeek(history, doneCount, dots, caption) {
        if (!dots || !caption) return;

        dots.innerHTML = '';
        const total = DAILY_GAMES.length;
        let perfectRun = 0;

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

    loadAndDisplayStats() {
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

        // GREP + BitWise, both modes each
        const grepTotalPlayed = (this.getGameStats('grep-stats-daily').gamesPlayed || 0) + (this.getGameStats('grep-stats-practice').gamesPlayed || 0);
        const grepTotalWon = (this.getGameStats('grep-stats-daily').gamesWon || 0) + (this.getGameStats('grep-stats-practice').gamesWon || 0);
        const bitwiseTotalPlayed = (this.getGameStats('bitwise-stats-daily').gamesPlayed || 0) + (this.getGameStats('bitwise-stats-practice').gamesPlayed || 0);
        const bitwiseTotalWon = (this.getGameStats('bitwise-stats-daily').gamesWon || 0) + (this.getGameStats('bitwise-stats-practice').gamesWon || 0);

        const floodItDailyStats = this.getGameStats('flood-this-stats-v2-daily');
        const floodItEasyStats = this.getGameStats('flood-this-stats-v2-easy');
        const floodItMediumStats = this.getGameStats('flood-this-stats-v2-medium');
        const floodItHardStats = this.getGameStats('flood-this-stats-v2-hard');
        const floodItTotalPlayed = (floodItDailyStats.gamesPlayed || 0) + (floodItEasyStats.gamesPlayed || 0) + (floodItMediumStats.gamesPlayed || 0) + (floodItHardStats.gamesPlayed || 0);
        const floodItTotalWon = (floodItDailyStats.gamesWon || 0) + (floodItEasyStats.gamesWon || 0) + (floodItMediumStats.gamesWon || 0) + (floodItHardStats.gamesWon || 0);

        const totalPlayed =
            slidingPuzzleTotalPlayed +
            woordleTotalPlayed +
            floodItTotalPlayed +
            terraByteTotalPlayed +
            decipherlyPlayed +
            grepTotalPlayed +
            bitwiseTotalPlayed;

        const totalWon =
            slidingPuzzleTotalWon +
            woordleTotalWon +
            floodItTotalWon +
            terraByteTotalWon +
            decipherlyWon +
            grepTotalWon +
            bitwiseTotalWon;

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

// ============================================================
// Stats transfer: move all localStorage progress to another
// device via a link (data rides in the #fragment, never sent
// to any server). Old device shares the link; new device opens
// it, confirms, and the stats are written locally.
// ============================================================

const TRANSFER_PREFIX = '#transfer=';

function transferBufToB64url(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function transferB64urlToBuf(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function encodeAllStats() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const json = new TextEncoder().encode(JSON.stringify(data));
    if (typeof CompressionStream !== 'undefined') {
        const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
        return 'gz.' + transferBufToB64url(await new Response(stream).arrayBuffer());
    }
    return 'raw.' + transferBufToB64url(json);
}

async function decodeStats(blob) {
    const dot = blob.indexOf('.');
    const kind = blob.slice(0, dot);
    const bytes = transferB64urlToBuf(blob.slice(dot + 1));
    let json;
    if (kind === 'gz') {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        json = await new Response(stream).text();
    } else {
        json = new TextDecoder().decode(bytes);
    }
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('bad payload');
    return data;
}

function initStatsTransfer() {
    const openButton = document.getElementById('transferButton');
    const modal = document.getElementById('transferModal');
    const title = document.getElementById('transferTitle');
    const body = document.getElementById('transferBody');
    if (!openButton || !modal) return;

    const closeModal = () => { modal.style.display = 'none'; };
    modal.querySelector('.modal-close-button').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    openButton.addEventListener('click', async () => {
        title.textContent = 'Transfer Stats';
        modal.style.display = 'flex';
        try {
            const link = location.origin + '/' + TRANSFER_PREFIX + await encodeAllStats();
            body.innerHTML = `
                <p>Send this link to your other device (AirDrop, message, email…), then open it there. Your streaks and stats come along — nothing is uploaded anywhere.</p>
                <div class="transfer-actions"></div>`;
            const actions = body.querySelector('.transfer-actions');
            const hasTouch = (navigator.maxTouchPoints || 0) > 0;
            if (navigator.share && hasTouch) {
                const shareBtn = document.createElement('button');
                shareBtn.className = 'transfer-action';
                shareBtn.textContent = '📤 SEND LINK';
                shareBtn.addEventListener('click', () => {
                    navigator.share({ url: link }).catch(() => {});
                });
                actions.appendChild(shareBtn);
            }
            const copyBtn = document.createElement('button');
            copyBtn.className = 'transfer-action';
            copyBtn.textContent = '📋 COPY LINK';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(link).then(() => {
                    copyBtn.textContent = '✅ COPIED';
                    setTimeout(() => copyBtn.textContent = '📋 COPY LINK', 1600);
                }).catch(() => {
                    const field = document.createElement('input');
                    field.className = 'transfer-field';
                    field.readOnly = true;
                    field.value = link;
                    body.appendChild(field);
                    field.select();
                });
            });
            actions.appendChild(copyBtn);
        } catch (error) {
            body.innerHTML = '<p>Sorry — the transfer link could not be built on this browser.</p>';
        }
    });

    // Receiving side: a #transfer= link was opened on this device
    if (location.hash.startsWith(TRANSFER_PREFIX)) {
        const blob = location.hash.slice(TRANSFER_PREFIX.length);
        history.replaceState(null, '', location.pathname);
        decodeStats(blob).then((data) => {
            const count = Object.keys(data).length;
            title.textContent = 'Import Stats';
            body.innerHTML = `
                <p>Import <b>${count}</b> saved items (streaks, stats, and game progress) from your other device?</p>
                <p class="transfer-warning">This replaces the stats currently on THIS device.</p>
                <div class="transfer-actions">
                    <button type="button" class="transfer-action" id="transferImport">✅ IMPORT</button>
                    <button type="button" class="transfer-action ghost" id="transferCancel">CANCEL</button>
                </div>`;
            modal.style.display = 'flex';
            document.getElementById('transferCancel').addEventListener('click', closeModal);
            document.getElementById('transferImport').addEventListener('click', () => {
                Object.entries(data).forEach(([key, value]) => {
                    try { localStorage.setItem(key, value); } catch (error) { /* storage full */ }
                });
                location.reload();
            });
        }).catch(() => {
            title.textContent = 'Import Stats';
            body.innerHTML = '<p>That transfer link is damaged or incomplete — generate a fresh one on your other device and try again.</p>';
            modal.style.display = 'flex';
        });
    }
}

document.addEventListener('DOMContentLoaded', initStatsTransfer);
