// GREP - daily word search. Six 5-letter words hidden in an 8x8 grid,
// drawn from AlphaBit's answer list, seeded so everyone gets the same daily.

const GREP_EPOCH = '2026-09-09T00:00:00'; // puzzle #1
const GRID_SIZE = 8;
const WORD_COUNT = 6;
// right, down, down-right, up-right (no reversed words - casual friendly)
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const FOUND_COLORS = ['#27ae60', '#2e86c1', '#d68910', '#8e44ad', '#d94a3a', '#16a085'];

function grepHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

// mulberry32 stream - same generator family as the other daily games
function makeRNG(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ t >>> 15, t | 1);
        r ^= r + Math.imul(r ^ r >>> 7, r | 61);
        return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
}

// Build a puzzle deterministically from a seed. Retries with a nudged seed
// until all words place, so generation always succeeds.
function generatePuzzle(seed, wordPool) {
    for (let attempt = 0; attempt < 60; attempt++) {
        const rng = makeRNG(seed + attempt * 7919);

        // Pick distinct words
        const words = [];
        const used = new Set();
        while (words.length < WORD_COUNT) {
            const word = wordPool[Math.floor(rng() * wordPool.length)];
            if (!used.has(word)) {
                used.add(word);
                words.push(word);
            }
        }

        const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
        const placements = [];
        let allPlaced = true;

        for (const word of words) {
            let placed = false;
            for (let tries = 0; tries < 220 && !placed; tries++) {
                const [dx, dy] = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
                const span = word.length - 1;
                const minRow = dy === -1 ? span : 0;
                const maxRow = dy === 1 ? GRID_SIZE - 1 - span : GRID_SIZE - 1;
                const maxCol = dx === 1 ? GRID_SIZE - 1 - span : GRID_SIZE - 1;
                const row = minRow + Math.floor(rng() * (maxRow - minRow + 1));
                const col = Math.floor(rng() * (maxCol + 1));

                const cells = [];
                let fits = true;
                for (let i = 0; i < word.length; i++) {
                    const r = row + dy * i;
                    const c = col + dx * i;
                    if (grid[r][c] !== null && grid[r][c] !== word[i]) {
                        fits = false;
                        break;
                    }
                    cells.push([r, c]);
                }
                if (!fits) continue;

                cells.forEach(([r, c], i) => grid[r][c] = word[i]);
                placements.push({ word: word, cells: cells });
                placed = true;
            }
            if (!placed) {
                allPlaced = false;
                break;
            }
        }
        if (!allPlaced) continue;

        // Camouflage fill: letters drawn from the hidden words themselves
        const pool = words.join('');
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === null) {
                    grid[r][c] = pool[Math.floor(rng() * pool.length)];
                }
            }
        }

        return { grid: grid, words: words, placements: placements };
    }
    return null; // practically unreachable
}

class GrepGame {
    constructor() {
        this.gameMode = 'daily';
        this.gameActive = true;
        this.puzzle = null;
        this.found = [];        // words found, in order
        this.elapsed = 0;
        this.timerInterval = null;
        this.timerStarted = false;
        this.practiceSeed = null;
        this.selectAnchor = null;
        this.selectPath = [];
        this.wordPool = [];
        this.audioContext = null;

        this.gameAnalytics = new GameAnalytics('grep');

        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    async initializeGame() {
        try {
            const response = await fetch('/games/alpha-bit/data/wordle-answers-alphabetical.txt');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const text = await response.text();
            this.wordPool = text.split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5);
        } catch (error) {
            console.error('Word list failed to load:', error);
            this.wordPool = ['CRANE', 'PIXEL', 'BRAIN', 'GLOBE', 'FLOOD', 'SLATE', 'QUERY', 'DAILY',
                'TILES', 'GAMES', 'SCORE', 'GUESS', 'SWIPE', 'TOUCH', 'POINT', 'WORDS'];
        }

        const savedMode = localStorage.getItem('grep-gameMode');
        this.gameMode = savedMode === 'practice' ? 'practice' : 'daily';
        this.dailyModeButton.classList.toggle('active', this.gameMode === 'daily');
        this.practiceModeButton.classList.toggle('active', this.gameMode === 'practice');

        this.updateStatsDisplay();
        this.startNewGame();

        if (window.analytics) {
            window.analytics.trackPageView('GREP Game', window.location.href);
        }
    }

    initializeElements() {
        this.gridEl = document.getElementById('wordGrid');
        this.chipsEl = document.getElementById('wordChips');
        this.message = document.getElementById('message');
        this.foundCountEl = document.getElementById('foundCount');
        this.timerEl = document.getElementById('timer');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');
        this.dailyModeButton = document.getElementById('dailyMode');
        this.practiceModeButton = document.getElementById('practiceMode');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.statsButton = document.getElementById('statsButton');
    }

    setupEventListeners() {
        this.dailyModeButton.addEventListener('click', () => this.setGameMode('daily'));
        this.practiceModeButton.addEventListener('click', () => this.setGameMode('practice'));
        this.newGameButton.addEventListener('click', () => this.startNewGame(true));
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.statsButton.addEventListener('click', () => this.showStatsModal());

        const statsModal = document.getElementById('statsModal');
        if (statsModal) {
            const closeModal = () => statsModal.style.display = 'none';
            statsModal.querySelector('.modal-close-button').addEventListener('click', closeModal);
            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) closeModal();
            });
        }

        // Drag selection (pointer events cover touch + mouse)
        this.gridEl.addEventListener('pointerdown', (e) => this.beginSelect(e));
        this.gridEl.addEventListener('pointermove', (e) => this.moveSelect(e));
        this.gridEl.addEventListener('pointerup', () => this.endSelect());
        this.gridEl.addEventListener('pointercancel', () => this.clearSelect());

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTimer();
                this.saveGameState();
            } else if (this.gameActive && this.timerStarted) {
                this.resumeTimer();
            }
        });
    }

    // ------------------------------------------------------------
    // Modes & new game
    // ------------------------------------------------------------

    getDateString() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    }

    setGameMode(mode) {
        if (this.gameMode === mode) return;
        this.saveGameState();
        this.gameMode = mode;
        localStorage.setItem('grep-gameMode', mode);
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.practiceModeButton.classList.toggle('active', mode === 'practice');
        this.updateStatsDisplay();
        this.startNewGame();
        this.gameAnalytics.trackGameAction('game_mode_change', { mode: mode });
    }

    currentSeed() {
        if (this.gameMode === 'daily') {
            return grepHashCode('grep-' + this.getDateString());
        }
        return this.practiceSeed;
    }

    startNewGame(forceNew = false) {
        if (this.wordPool.length === 0) return;
        this.hideAllButtons();
        this.pauseTimer();

        if (!forceNew && this.loadGameState()) {
            return;
        }

        this.clearGameState();
        this.found = [];
        this.elapsed = 0;
        this.timerStarted = false;
        this.gameActive = true;

        if (this.gameMode === 'practice') {
            this.practiceSeed = Math.floor(Math.random() * 2147483647);
        }

        this.puzzle = generatePuzzle(this.currentSeed(), this.wordPool);
        this.renderAll();
        this.updateMessage(this.gameMode === 'daily'
            ? "Find today's 6 hidden words! Drag across the grid."
            : 'Find all 6 hidden words! Drag across the grid.', 'info');
        this.updateUIVisibility();
        this.saveGameState();
        this.gameAnalytics.trackGameStart(this.gameMode);
    }

    // ------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------

    renderAll() {
        this.gridEl.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = this.puzzle.grid[r][c];
                this.gridEl.appendChild(cell);
            }
        }

        this.chipsEl.innerHTML = '';
        this.puzzle.words.forEach(word => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';
            chip.dataset.word = word;
            chip.textContent = word;
            this.chipsEl.appendChild(chip);
        });

        // Re-apply already-found words (restored games)
        this.found.forEach(word => this.markFound(word, false));

        this.updateHud();
        this.updateTimerDisplay();
    }

    cellAt(r, c) {
        return this.gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    }

    markFound(word, celebrate = true) {
        const placement = this.puzzle.placements.find(p => p.word === word);
        if (!placement) return;
        const color = FOUND_COLORS[this.puzzle.words.indexOf(word) % FOUND_COLORS.length];
        placement.cells.forEach(([r, c]) => {
            const cell = this.cellAt(r, c);
            if (cell) {
                cell.classList.add('found');
                cell.style.background = color;
            }
        });
        const chip = this.chipsEl.querySelector(`[data-word="${word}"]`);
        if (chip) {
            chip.classList.add('hit');
            chip.style.background = color;
            chip.style.color = '#ffffff';
        }
        if (celebrate) this.playSound('found');
    }

    updateHud() {
        this.foundCountEl.textContent = `Found: ${this.found.length}/${WORD_COUNT}`;
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    // ------------------------------------------------------------
    // Selection
    // ------------------------------------------------------------

    cellFromEvent(e) {
        const rect = this.gridEl.getBoundingClientRect();
        const col = Math.floor((e.clientX - rect.left) / rect.width * GRID_SIZE);
        const row = Math.floor((e.clientY - rect.top) / rect.height * GRID_SIZE);
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
        return [row, col];
    }

    beginSelect(e) {
        if (!this.gameActive || !this.puzzle) return;
        const cell = this.cellFromEvent(e);
        if (!cell) return;
        this.gridEl.setPointerCapture(e.pointerId);
        this.selectAnchor = cell;
        this.setSelectPath([cell]);
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.resumeTimer();
        }
    }

    moveSelect(e) {
        if (!this.selectAnchor) return;
        const cell = this.cellFromEvent(e);
        if (!cell) return;

        const [ar, ac] = this.selectAnchor;
        const dr = cell[0] - ar;
        const dc = cell[1] - ac;

        // Snap to one of 8 straight directions
        let path = [this.selectAnchor];
        if (dr === 0 && dc === 0) {
            // single cell
        } else if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            const steps = Math.max(Math.abs(dr), Math.abs(dc));
            const sr = Math.sign(dr);
            const sc = Math.sign(dc);
            path = [];
            for (let i = 0; i <= steps; i++) {
                path.push([ar + sr * i, ac + sc * i]);
            }
        } else {
            return; // not a straight line from the anchor: keep last path
        }
        this.setSelectPath(path);
    }

    setSelectPath(path) {
        this.gridEl.querySelectorAll('.cell.sel').forEach(el => el.classList.remove('sel'));
        this.selectPath = path;
        path.forEach(([r, c]) => {
            const cell = this.cellAt(r, c);
            if (cell) cell.classList.add('sel');
        });
    }

    endSelect() {
        if (!this.selectAnchor) return;
        const letters = this.selectPath.map(([r, c]) => this.puzzle.grid[r][c]).join('');
        const reversed = letters.split('').reverse().join('');
        const hit = this.puzzle.words.find(w =>
            (w === letters || w === reversed) && !this.found.includes(w));

        this.clearSelect();

        if (hit) {
            this.found.push(hit);
            this.markFound(hit);
            this.updateHud();
            this.saveGameState();
            if (this.found.length === WORD_COUNT) {
                this.handleWin();
            } else {
                this.updateMessage(`Found "${hit}" — ${WORD_COUNT - this.found.length} to go!`, 'success');
            }
        }
    }

    clearSelect() {
        this.selectAnchor = null;
        this.setSelectPath([]);
    }

    // ------------------------------------------------------------
    // Timer
    // ------------------------------------------------------------

    resumeTimer() {
        if (this.timerInterval || !this.gameActive) return;
        this.timerInterval = setInterval(() => {
            this.elapsed++;
            this.updateTimerDisplay();
            if (this.elapsed % 5 === 0) this.saveGameState();
        }, 1000);
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    updateTimerDisplay() {
        this.timerEl.textContent = `⏱ ${this.formatTime(this.elapsed)}`;
    }

    // ------------------------------------------------------------
    // Win, stats, share
    // ------------------------------------------------------------

    handleWin() {
        this.gameActive = false;
        this.pauseTimer();
        this.updateMessage(`🎉 grep complete! ${WORD_COUNT}/${WORD_COUNT} in ${this.formatTime(this.elapsed)}!`, 'success');
        this.playSound('win');
        this.createConfetti();
        this.gameAnalytics.trackGameEnd(true, this.elapsed);

        const stats = this.getStats();
        const gameKey = this.gameMode === 'daily' ? this.getDateString() : 'practice-' + this.practiceSeed;
        if (stats.lastGamePlayed !== gameKey) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            if (stats.bestTime === null || this.elapsed < stats.bestTime) {
                stats.bestTime = this.elapsed;
            }
            stats.lastGamePlayed = gameKey;
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
        this.saveGameState();
        setTimeout(() => this.updateUIVisibility(), 500);
    }

    updateUIVisibility() {
        const gameOver = !this.gameActive;
        this.shareButton.style.display = gameOver && this.gameMode === 'daily' ? 'inline-block' : 'none';
        this.statsButton.style.display = gameOver ? 'inline-block' : 'none';
        this.newGameButton.style.display = this.gameMode === 'practice' ? 'inline-block' : 'none';
    }

    hideAllButtons() {
        this.shareButton.style.display = 'none';
        this.statsButton.style.display = 'none';
        this.newGameButton.style.display = 'none';
    }

    getStats() {
        const key = `grep-stats-${this.gameMode}`;
        const defaults = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            bestTime: null,
            lastGamePlayed: null
        };
        try {
            const saved = localStorage.getItem(key);
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            return defaults;
        }
    }

    saveStats(stats) {
        localStorage.setItem(`grep-stats-${this.gameMode}`, JSON.stringify(stats));
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }

    showStatsModal() {
        const stats = this.getStats();
        const modal = document.getElementById('statsModal');
        if (!modal) return;
        this.gameAnalytics.trackButtonClick('show_stats');
        document.getElementById('statsPlayed').textContent = stats.gamesPlayed;
        document.getElementById('statsBestTime').textContent =
            stats.bestTime !== null ? this.formatTime(stats.bestTime) : '--:--';
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;
        modal.style.display = 'flex';
    }

    generateShareText() {
        const epoch = new Date(GREP_EPOCH);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const puzzleNumber = Math.max(1, Math.floor((today.getTime() - epoch.getTime()) / 86400000) + 1);
        let shareText = `GREP ${puzzleNumber} 🔎\n${WORD_COUNT}/${WORD_COUNT} in ${this.formatTime(this.elapsed)}\n`;
        shareText += '🟩'.repeat(WORD_COUNT) + '\n';
        shareText += '\nPlay at: ' + window.location.href;
        return shareText;
    }

    shareResults() {
        const shareText = this.generateShareText();
        this.gameAnalytics.trackButtonClick('share_results');
        if (navigator.share) {
            navigator.share({ text: shareText }).catch(() => this.fallbackShare(shareText));
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.updateMessage('📋 Results copied to clipboard!', 'success');
            }).catch(() => this.showShareText(text));
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        document.body.style.overflow = 'hidden';
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        `;
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #2c2c2c; padding: 20px; border-radius: 8px;
            width: 90%; max-width: 400px; text-align: center; color: #fff;
        `;
        const closeModal = () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        };
        modal.innerHTML = `
            <h3 style="margin-top:0;">Copy to Clipboard</h3>
            <textarea readonly style="width: 100%; height: 120px; background: #1e1e1e; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 10px; box-sizing: border-box; resize: none;">${text}</textarea>
            <button class="modal-close-button" style="width: 100%; padding: 10px; margin-top: 15px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Close</button>
        `;
        modal.querySelector('.modal-close-button').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ------------------------------------------------------------
    // Persistence
    // ------------------------------------------------------------

    saveGameState() {
        if (!this.puzzle) return;
        const state = {
            found: this.found,
            elapsed: this.elapsed,
            timerStarted: this.timerStarted,
            gameActive: this.gameActive,
            practiceSeed: this.practiceSeed,
            savedDate: this.gameMode === 'daily' ? this.getDateString() : null
        };
        localStorage.setItem(`grep-gameState-${this.gameMode}`, JSON.stringify(state));
    }

    loadGameState() {
        try {
            const raw = localStorage.getItem(`grep-gameState-${this.gameMode}`);
            if (!raw) return false;
            const state = JSON.parse(raw);

            if (this.gameMode === 'daily' && state.savedDate !== this.getDateString()) {
                this.clearGameState();
                return false;
            }
            if (this.gameMode === 'practice' && !state.practiceSeed) {
                return false;
            }

            this.practiceSeed = state.practiceSeed || null;
            this.puzzle = generatePuzzle(this.currentSeed(), this.wordPool);
            this.found = (state.found || []).filter(w => this.puzzle.words.includes(w));
            this.elapsed = state.elapsed || 0;
            this.timerStarted = !!state.timerStarted;
            this.gameActive = !!state.gameActive;

            this.renderAll();
            this.updateUIVisibility();

            if (!this.gameActive) {
                this.updateMessage(`🎉 grep complete! ${WORD_COUNT}/${WORD_COUNT} in ${this.formatTime(this.elapsed)}!`, 'success');
            } else {
                if (this.timerStarted) this.resumeTimer();
                this.updateMessage(this.found.length > 0
                    ? `Welcome back! ${WORD_COUNT - this.found.length} words left.`
                    : "Find today's 6 hidden words! Drag across the grid.", 'info');
            }
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.clearGameState();
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem(`grep-gameState-${this.gameMode}`);
    }

    // ------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------

    playSound(type) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') this.audioContext.resume();
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            let freq = 440, dur = 0.2;
            if (type === 'found') { freq = 587; dur = 0.18; }
            if (type === 'win') { freq = 523.25; dur = 0.5; }
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.07, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + dur);
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + dur);
        } catch (error) {
            // Audio is optional
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed; width: 10px; height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%; top: -10px; border-radius: 50%;
                    pointer-events: none; z-index: 9999;
                    animation: confettiFall 3s linear forwards;
                `;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }
}

class GameAnalytics {
    constructor(gameName) {
        this.gameName = gameName;
        this.gameStartTime = null;
    }

    trackGameStart(difficulty = null) {
        this.gameStartTime = Date.now();
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameStart(this.gameName, difficulty);
        }
    }

    trackGameEnd(success, score = null) {
        const timePlayed = this.gameStartTime ? Math.round((Date.now() - this.gameStartTime) / 1000) : null;
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameComplete(this.gameName, success, score, timePlayed);
        }
    }

    trackGameAction(action, additionalParams = {}) {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameEvent(action, this.gameName, additionalParams);
        }
    }

    trackButtonClick(buttonName) {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackButtonClick(buttonName, this.gameName);
        }
    }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            to { transform: translateY(100vh) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('load', () => {
        window.grepGame = new GrepGame();
    });
}

// Export pure logic for testing in Node (no effect in the browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePuzzle, grepHashCode, makeRNG, GRID_SIZE, WORD_COUNT };
}
