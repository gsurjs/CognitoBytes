// GREP - daily hidden-thread word hunt. Six themed words hide in an 8x8 grid,
// but the word list stays secret: only a cryptic clue hints at the thread.
// Seeded so everyone gets the same daily puzzle.

const GREP_EPOCH = '2026-09-09T00:00:00'; // puzzle #1
const GRID_SIZE = 8;
const WORD_COUNT = 6;
// right, down, down-right, up-right (no reversed words - casual friendly)
const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const ALL_DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
const FOUND_COLORS = ['#27ae60', '#2e86c1', '#d68910', '#8e44ad', '#d94a3a', '#16a085'];
const COMBO_WINDOW_MS = 8000;
const HINT_MAX = 3; // hint 1 reveals the theme, hints 2-3 each un-hide a word chip
const MEDALS = [
    { limit: 120, emoji: '🥇', name: 'GOLD' },
    { limit: 210, emoji: '🥈', name: 'SILVER' },
    { limit: Infinity, emoji: '🥉', name: 'BRONZE' }
];

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

function medalFor(seconds) {
    return MEDALS.find(m => seconds <= m.limit);
}

// How many times a word can be read in the grid, any of the 8 directions.
// Selection accepts reversed drags, so camouflage fill must never create a
// second copy of an answer - each word has to appear exactly once.
function countOccurrences(grid, word) {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            for (const [dx, dy] of ALL_DIRECTIONS) {
                const endR = r + dy * (word.length - 1);
                const endC = c + dx * (word.length - 1);
                if (endR < 0 || endR >= GRID_SIZE || endC < 0 || endC >= GRID_SIZE) continue;
                let match = true;
                for (let i = 0; i < word.length; i++) {
                    if (grid[r + dy * i][c + dx * i] !== word[i]) {
                        match = false;
                        break;
                    }
                }
                if (match) count++;
            }
        }
    }
    return count;
}

// Fixed shuffled cycle through the theme packs: no repeats until all are used,
// and the order never changes for a given pack count.
function dailyThemeIndex(puzzleNumber, themeCount) {
    const order = Array.from({ length: themeCount }, (_, i) => i);
    const rng = makeRNG(grepHashCode('grep-theme-cycle'));
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order[((puzzleNumber - 1) % themeCount + themeCount) % themeCount];
}

// Build a puzzle deterministically from a seed and a fixed six-word theme.
// Retries with a nudged seed until all words place cleanly and no answer
// appears twice, so generation always succeeds.
function generatePuzzle(seed, themeWords) {
    for (let attempt = 0; attempt < 80; attempt++) {
        const rng = makeRNG(seed + attempt * 7919);

        const words = themeWords.slice();
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
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

        if (words.some(w => countOccurrences(grid, w) !== 1)) continue;

        return { grid: grid, words: words, placements: placements };
    }
    return null; // practically unreachable
}

class GrepGame {
    constructor() {
        this.gameMode = 'daily';
        this.gameActive = true;
        this.puzzle = null;
        this.theme = null;
        this.found = [];        // words found, in order
        this.elapsed = 0;
        this.timerInterval = null;
        this.timerStarted = false;
        this.isPaused = false;
        this.lastFoundAt = null;
        this.hintsUsed = 0;
        this.revealedWords = [];
        this.themeRevealed = false;
        this.practiceSeed = null;
        this.selectAnchor = null;
        this.selectPath = [];
        this.audioContext = null;

        this.themes = (typeof GREP_THEMES !== 'undefined' && GREP_THEMES.length > 0) ? GREP_THEMES : [
            { clue: 'Look up', answer: 'THINGS IN THE SKY', words: ['CLOUD', 'COMET', 'STARS', 'PLANET', 'ROCKET', 'HAWKS'] }
        ];

        this.gameAnalytics = new GameAnalytics('grep');

        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeGame() {
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
        this.themeClueEl = document.getElementById('themeClue');
        this.pauseButton = document.getElementById('pauseButton');
        this.hintButton = document.getElementById('hintButton');
        this.pauseOverlay = document.getElementById('pauseOverlay');
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
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.hintButton.addEventListener('click', () => this.useHint());
        this.pauseOverlay.addEventListener('click', () => {
            if (this.isPaused) this.togglePause();
        });

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
            } else if (this.gameActive && this.timerStarted && !this.isPaused) {
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

    getPuzzleNumber() {
        const epoch = new Date(GREP_EPOCH);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.max(1, Math.floor((today.getTime() - epoch.getTime()) / 86400000) + 1);
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

    currentTheme() {
        if (this.gameMode === 'daily') {
            return this.themes[dailyThemeIndex(this.getPuzzleNumber(), this.themes.length)];
        }
        const rng = makeRNG((this.practiceSeed ^ 0x5bf03635) >>> 0);
        return this.themes[Math.floor(rng() * this.themes.length)];
    }

    startNewGame(forceNew = false) {
        this.hideAllButtons();
        this.pauseTimer();

        if (!forceNew && this.loadGameState()) {
            return;
        }

        this.clearGameState();
        this.found = [];
        this.elapsed = 0;
        this.timerStarted = false;
        this.isPaused = false;
        this.lastFoundAt = null;
        this.hintsUsed = 0;
        this.revealedWords = [];
        this.themeRevealed = false;
        this.gameActive = true;

        if (this.gameMode === 'practice') {
            this.practiceSeed = Math.floor(Math.random() * 2147483647);
        }

        this.theme = this.currentTheme();
        this.puzzle = generatePuzzle(this.currentSeed(), this.theme.words);
        this.applyPauseUI();
        this.renderAll(true);
        this.updateMessage('Six hidden words share one thread — no word list! Drag to hunt.', 'info');
        this.updateUIVisibility();
        this.saveGameState();
        this.gameAnalytics.trackGameStart(this.gameMode);
    }

    // ------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------

    renderAll(cascade = false) {
        this.gridEl.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = this.puzzle.grid[r][c];
                if (cascade) {
                    cell.classList.add('drop-in');
                    cell.style.animationDelay = `${(r * GRID_SIZE + c) * 12}ms`;
                }
                this.gridEl.appendChild(cell);
            }
        }

        // Hidden thread: chips only show word lengths until each word is found
        this.chipsEl.innerHTML = '';
        this.puzzle.words.forEach((word, i) => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';
            chip.dataset.idx = i;
            chip.textContent = '•'.repeat(word.length);
            this.chipsEl.appendChild(chip);
        });

        // Re-apply hint reveals, then already-found words (restored games)
        this.revealedWords.forEach(word => this.applyPeek(word));
        this.found.forEach(word => this.markFound(word, false));

        this.updateThemeBanner();
        this.updateHud();
        this.updateTimerDisplay();
    }

    cellAt(r, c) {
        return this.gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    }

    markFound(word, celebrate = true) {
        const placement = this.puzzle.placements.find(p => p.word === word);
        if (!placement) return;
        const wordIndex = this.puzzle.words.indexOf(word);
        const color = FOUND_COLORS[wordIndex % FOUND_COLORS.length];
        placement.cells.forEach(([r, c], i) => {
            const cell = this.cellAt(r, c);
            if (!cell) return;
            cell.classList.add('found');
            cell.style.background = color;
            if (celebrate) {
                setTimeout(() => {
                    cell.classList.add('pop');
                    setTimeout(() => cell.classList.remove('pop'), 500);
                }, i * 45);
            }
        });
        const chip = this.chipsEl.querySelector(`[data-idx="${wordIndex}"]`);
        if (chip) {
            chip.classList.add('hit');
            chip.textContent = word;
            chip.style.background = color;
            chip.style.color = '#ffffff';
        }
        if (celebrate) this.playSound('found');
    }

    updateThemeBanner() {
        if (!this.themeClueEl || !this.theme) return;
        if (this.found.length === WORD_COUNT) {
            this.themeClueEl.textContent = `${this.theme.answer} ✨`;
        } else if (this.themeRevealed) {
            this.themeClueEl.textContent = `${this.theme.answer} 🏳️`;
        } else {
            this.themeClueEl.textContent = `“${this.theme.clue}” 🤔`;
        }
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
        if (!this.gameActive || !this.puzzle || this.isPaused) return;
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
        const pathLength = this.selectPath.length;
        const letters = this.selectPath.map(([r, c]) => this.puzzle.grid[r][c]).join('');
        const reversed = letters.split('').reverse().join('');
        const hit = this.puzzle.words.find(w =>
            (w === letters || w === reversed) && !this.found.includes(w));

        this.clearSelect();

        if (hit) {
            const now = Date.now();
            const combo = this.lastFoundAt !== null && (now - this.lastFoundAt) < COMBO_WINDOW_MS;
            this.lastFoundAt = now;
            this.found.push(hit);
            this.markFound(hit);
            this.updateHud();
            this.saveGameState();
            if (this.found.length === WORD_COUNT) {
                this.handleWin();
            } else if (combo) {
                this.updateMessage(`🔥 COMBO! “${hit}” — keep the chain going!`, 'success');
            } else {
                this.updateMessage(`“${hit}” is in the thread — ${WORD_COUNT - this.found.length} to go!`, 'success');
            }
        } else if (pathLength >= 3 && this.gameActive) {
            this.playSound('miss');
            this.updateMessage('Not in the thread — keep hunting!', 'error');
        }
    }

    clearSelect() {
        this.selectAnchor = null;
        this.setSelectPath([]);
    }

    // ------------------------------------------------------------
    // Hints (white-flag): 1st reveals the theme, later ones un-hide a word chip
    // ------------------------------------------------------------

    useHint() {
        if (!this.gameActive || this.isPaused || this.hintsUsed >= HINT_MAX) return;
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.resumeTimer();
        }
        if (!this.themeRevealed) {
            this.themeRevealed = true;
            this.updateThemeBanner();
            this.updateMessage('🏳️ The thread is out — now hunt its words!', 'info');
        } else {
            const word = this.puzzle.words.find(w =>
                !this.found.includes(w) && !this.revealedWords.includes(w));
            if (!word) return;
            this.revealedWords.push(word);
            this.applyPeek(word);
            this.updateMessage(`🏳️ “${word}” is in the grid — find it!`, 'info');
        }
        this.hintsUsed++;
        this.updateHintButton();
        this.saveGameState();
        this.gameAnalytics.trackButtonClick('hint');
    }

    applyPeek(word) {
        const idx = this.puzzle.words.indexOf(word);
        const chip = this.chipsEl.querySelector(`[data-idx="${idx}"]`);
        if (chip && !chip.classList.contains('hit')) {
            chip.classList.add('peeked');
            chip.textContent = word;
        }
    }

    updateHintButton() {
        const left = HINT_MAX - this.hintsUsed;
        this.hintButton.textContent = `🏳️ HINT ×${left}`;
        this.hintButton.disabled = left <= 0;
    }

    // ------------------------------------------------------------
    // Pause
    // ------------------------------------------------------------

    togglePause() {
        if (!this.gameActive || !this.timerStarted) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.clearSelect();
            this.pauseTimer();
        } else {
            this.resumeTimer();
        }
        this.applyPauseUI();
        this.saveGameState();
        this.gameAnalytics.trackButtonClick(this.isPaused ? 'pause' : 'resume');
    }

    applyPauseUI() {
        this.pauseOverlay.classList.toggle('active', this.isPaused);
        this.pauseButton.textContent = this.isPaused ? '▶ RESUME' : '⏸ PAUSE';
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
        this.isPaused = false;
        this.applyPauseUI();
        this.pauseTimer();
        const medal = medalFor(this.elapsed);
        this.updateThemeBanner();
        this.updateMessage(`🎉 The thread: ${this.theme.answer} — ${medal.emoji} ${medal.name} in ${this.formatTime(this.elapsed)}!`, 'success');
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
        this.pauseButton.style.display = this.gameActive ? 'inline-block' : 'none';
        this.hintButton.style.display = this.gameActive ? 'inline-block' : 'none';
        this.updateHintButton();
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
        const medal = medalFor(this.elapsed);
        const themeFlag = this.themeRevealed ? '🏳️' : '';
        const squares = this.found.map(w => this.revealedWords.includes(w) ? '🏳️' : '🟩').join('');
        let shareText = `GREP-IT ${this.getPuzzleNumber()}\n`;
        shareText += `“${this.theme.clue}”${themeFlag}\n${medal.emoji} ${WORD_COUNT}/${WORD_COUNT} in ${this.formatTime(this.elapsed)}\n`;
        shareText += (squares || '🟩'.repeat(WORD_COUNT)) + '\n';
        shareText += '\nPlay at: ' + window.location.href;
        return shareText;
    }

    shareResults() {
        const shareText = this.generateShareText();
        this.gameAnalytics.trackButtonClick('share_results');
        if (window.cbShare && window.cbShare.isDesktop()) {
            window.cbShare.showModal(shareText);
        } else if (navigator.share) {
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
            isPaused: this.isPaused,
            hintsUsed: this.hintsUsed,
            revealedWords: this.revealedWords,
            themeRevealed: this.themeRevealed,
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
            this.theme = this.currentTheme();
            this.puzzle = generatePuzzle(this.currentSeed(), this.theme.words);
            this.found = (state.found || []).filter(w => this.puzzle.words.includes(w));
            this.elapsed = state.elapsed || 0;
            this.timerStarted = !!state.timerStarted;
            this.gameActive = !!state.gameActive;
            this.isPaused = !!state.isPaused && this.gameActive && this.timerStarted;
            this.lastFoundAt = null;
            this.hintsUsed = Math.min(HINT_MAX, parseInt(state.hintsUsed) || 0);
            this.revealedWords = (state.revealedWords || []).filter(w => this.puzzle.words.includes(w));
            this.themeRevealed = !!state.themeRevealed;

            this.applyPauseUI();
            this.renderAll();
            this.updateUIVisibility();

            if (!this.gameActive) {
                const medal = medalFor(this.elapsed);
                this.updateMessage(`🎉 The thread: ${this.theme.answer} — ${medal.emoji} ${medal.name} in ${this.formatTime(this.elapsed)}!`, 'success');
            } else {
                if (this.timerStarted && !this.isPaused) this.resumeTimer();
                this.updateMessage(this.found.length > 0
                    ? `Welcome back! ${WORD_COUNT - this.found.length} hidden words left.`
                    : 'Six hidden words share one thread — no word list! Drag to hunt.', 'info');
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
            if (type === 'miss') { freq = 220; dur = 0.12; }
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
    module.exports = { generatePuzzle, grepHashCode, makeRNG, dailyThemeIndex, countOccurrences, medalFor, GRID_SIZE, WORD_COUNT };
}
