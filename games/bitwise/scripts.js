// BitWise - daily number target. Combine six numbers with + - x / to hit
// the target. The generator builds the target FROM the numbers, so every
// puzzle is guaranteed solvable.

const BITWISE_EPOCH = '2026-09-09T00:00:00'; // puzzle #1
const LARGES = [25, 50, 75, 100];
const OP_EMOJI = { '+': '➕', '-': '➖', '*': '✖️', '/': '➗' };

function bwHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function bwMakeRNG(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ t >>> 15, t | 1);
        r ^= r + Math.imul(r ^ r >>> 7, r | 61);
        return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
}

function applyOp(a, op, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 && a % b === 0 ? a / b : null;
    }
    return null;
}

// Deterministic puzzle: 2 large + 4 small numbers; the target is built by
// chaining 3-4 random valid operations, so it is always reachable.
// True par: fewest ops that can reach the target from these numbers.
// Breadth-first over number-multisets, level = op count, memoized on a
// canonical multiset key so the state space stays small (runs in a few ms).
function minOpsFor(numbers, target) {
    let frontier = [numbers.slice().sort((a, b) => a - b)];
    const seen = new Set([frontier[0].join(',')]);
    for (let ops = 1; ops <= numbers.length - 1; ops++) {
        const next = [];
        for (const nums of frontier) {
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const rest = nums.filter((_, k) => k !== i && k !== j);
                    for (const op of ['+', '-', '*', '/']) {
                        const candidates = op === '+' || op === '*'
                            ? [applyOp(nums[i], op, nums[j])]
                            : [applyOp(nums[i], op, nums[j]), applyOp(nums[j], op, nums[i])];
                        for (const value of candidates) {
                            if (value === null) continue;
                            if (value === target) return ops;
                            const state = rest.concat(value).sort((a, b) => a - b);
                            const key = state.join(',');
                            if (!seen.has(key)) {
                                seen.add(key);
                                next.push(state);
                            }
                        }
                    }
                }
            }
        }
        frontier = next;
    }
    return null; // unreachable: puzzles are constructed solvable
}

function generateBitwisePuzzle(seed) {
    for (let attempt = 0; attempt < 200; attempt++) {
        const rng = bwMakeRNG(seed + attempt * 104729);

        const larges = [];
        while (larges.length < 2) {
            const n = LARGES[Math.floor(rng() * LARGES.length)];
            if (!larges.includes(n)) larges.push(n);
        }
        const smalls = [];
        while (smalls.length < 4) {
            const n = 1 + Math.floor(rng() * 10);
            if (smalls.filter(x => x === n).length < 2) smalls.push(n);
        }
        const numbers = [...larges, ...smalls];

        // Chain random operations over a copy of the numbers
        const pool = [...numbers];
        const steps = 3 + Math.floor(rng() * 2); // 3 or 4 ops
        let current = pool.splice(Math.floor(rng() * pool.length), 1)[0];
        let ok = true;

        for (let s = 0; s < steps; s++) {
            const next = pool.splice(Math.floor(rng() * pool.length), 1)[0];
            const ops = ['+', '-', '*', '/'];
            let result = null;
            for (let t = 0; t < 8 && result === null; t++) {
                const op = ops[Math.floor(rng() * ops.length)];
                const forward = applyOp(current, op, next);
                const backward = applyOp(next, op, current);
                const candidate = (forward !== null && forward > 0) ? forward
                    : (backward !== null && backward > 0) ? backward : null;
                if (candidate !== null && candidate <= 100000) result = candidate;
            }
            if (result === null) {
                ok = false;
                break;
            }
            current = result;
        }

        if (!ok) continue;
        if (current < 101 || current > 999) continue;
        if (numbers.includes(current)) continue;

        // Par is the true minimum over all solutions, not the construction
        // path — so under-par is impossible and hitting par means a genuinely
        // optimal solve. Reject targets with a 1-2 op shortcut: those play
        // as trivial puzzles no matter how long the constructed chain was.
        const par = minOpsFor(numbers, current);
        if (par === null || par < 3) continue;

        // Shuffle display order deterministically
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        return { numbers: numbers, target: current, par: par };
    }
    return null; // practically unreachable
}

class BitwiseGame {
    constructor() {
        this.gameMode = 'daily';
        this.gameActive = true;
        this.puzzle = null;
        this.chips = [];        // current numbers on the board (null = spent)
        this.ops = 0;
        this.opEmojis = [];
        this.undoStack = [];
        this.selectedChip = null;
        this.selectedOp = null;
        this.practiceSeed = null;
        this.audioContext = null;

        this.gameAnalytics = new GameAnalytics('bitwise');

        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeGame() {
        const savedMode = localStorage.getItem('bitwise-gameMode');
        this.gameMode = savedMode === 'practice' ? 'practice' : 'daily';
        this.dailyModeButton.classList.toggle('active', this.gameMode === 'daily');
        this.practiceModeButton.classList.toggle('active', this.gameMode === 'practice');

        this.updateStatsDisplay();
        this.startNewGame();

        if (window.analytics) {
            window.analytics.trackPageView('BitWise Game', window.location.href);
        }
    }

    initializeElements() {
        this.chipsEl = document.getElementById('numChips');
        this.message = document.getElementById('message');
        this.targetEl = document.getElementById('targetValue');
        this.opsCountEl = document.getElementById('opsCount');
        this.undoButton = document.getElementById('undoButton');
        this.resetButton = document.getElementById('resetButton');
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
        this.undoButton.addEventListener('click', () => this.undo());
        this.resetButton.addEventListener('click', () => this.resetBoard());

        this.chipsEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.num-chip');
            if (chip) this.tapChip(parseInt(chip.dataset.index));
        });

        document.querySelectorAll('.op-button').forEach(button => {
            button.addEventListener('click', () => this.tapOp(button.dataset.op));
        });

        const statsModal = document.getElementById('statsModal');
        if (statsModal) {
            const closeModal = () => statsModal.style.display = 'none';
            statsModal.querySelector('.modal-close-button').addEventListener('click', closeModal);
            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) closeModal();
            });
        }
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
        localStorage.setItem('bitwise-gameMode', mode);
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.practiceModeButton.classList.toggle('active', mode === 'practice');
        this.updateStatsDisplay();
        this.startNewGame();
        this.gameAnalytics.trackGameAction('game_mode_change', { mode: mode });
    }

    currentSeed() {
        if (this.gameMode === 'daily') {
            return bwHashCode('bitwise-' + this.getDateString());
        }
        return this.practiceSeed;
    }

    startNewGame(forceNew = false) {
        this.hideAllButtons();

        if (!forceNew && this.loadGameState()) {
            return;
        }

        this.clearGameState();
        this.gameActive = true;
        this.ops = 0;
        this.opEmojis = [];
        this.undoStack = [];
        this.selectedChip = null;
        this.selectedOp = null;

        if (this.gameMode === 'practice') {
            this.practiceSeed = Math.floor(Math.random() * 2147483647);
        }

        this.puzzle = generateBitwisePuzzle(this.currentSeed());
        this.chips = [...this.puzzle.numbers];

        this.renderAll();
        this.updateMessage(this.gameMode === 'daily'
            ? "Hit today's target with + − × ÷ — fewest ops wins!"
            : 'Hit the target with + − × ÷ — fewest ops wins!', 'info');
        this.updateUIVisibility();
        this.saveGameState();
        this.gameAnalytics.trackGameStart(this.gameMode);
    }

    resetBoard() {
        if (!this.gameActive) return;
        this.chips = [...this.puzzle.numbers];
        this.ops = 0;
        this.opEmojis = [];
        this.undoStack = [];
        this.selectedChip = null;
        this.selectedOp = null;
        this.renderAll();
        this.updateMessage('Board reset — fresh start!', 'info');
        this.saveGameState();
    }

    // ------------------------------------------------------------
    // Play
    // ------------------------------------------------------------

    tapChip(index) {
        if (!this.gameActive || this.chips[index] === null) return;

        if (this.selectedChip === null) {
            this.selectedChip = index;
        } else if (this.selectedChip === index) {
            this.selectedChip = null;
            this.selectedOp = null;
        } else if (this.selectedOp === null) {
            this.selectedChip = index; // switch first operand
        } else {
            this.merge(this.selectedChip, this.selectedOp, index);
            return;
        }
        this.renderSelection();
    }

    tapOp(op) {
        if (!this.gameActive || this.selectedChip === null) return;
        this.selectedOp = this.selectedOp === op ? null : op;
        this.renderSelection();
    }

    merge(indexA, op, indexB) {
        const a = this.chips[indexA];
        const b = this.chips[indexB];
        const result = applyOp(a, op, b);

        if (result === null || result <= 0 || !Number.isInteger(result)) {
            this.updateMessage(op === '/'
                ? `${a} ÷ ${b} isn't a whole number — try another combo.`
                : `${a} ${op === '*' ? '×' : op} ${b} doesn't work — results must stay positive.`, 'error');
            this.playSound('error');
            this.selectedChip = null;
            this.selectedOp = null;
            this.renderSelection();
            return;
        }

        this.undoStack.push({
            chips: [...this.chips],
            ops: this.ops,
            opEmojis: [...this.opEmojis]
        });

        this.chips[indexA] = null;
        this.chips[indexB] = result;
        this.ops++;
        this.opEmojis.push(OP_EMOJI[op]);
        this.selectedChip = null;
        this.selectedOp = null;

        this.renderAll();
        this.playSound('merge');
        this.saveGameState();

        if (result === this.puzzle.target) {
            this.handleWin(indexB);
        } else {
            const symbol = op === '*' ? '×' : op === '/' ? '÷' : op;
            this.updateMessage(`${a} ${symbol} ${b} = ${result}`, 'info');
        }
    }

    undo() {
        if (!this.gameActive || this.undoStack.length === 0) return;
        const prev = this.undoStack.pop();
        this.chips = prev.chips;
        this.ops = prev.ops;
        this.opEmojis = prev.opEmojis;
        this.selectedChip = null;
        this.selectedOp = null;
        this.renderAll();
        this.updateMessage('Undone.', 'info');
        this.saveGameState();
    }

    // ------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------

    renderAll() {
        this.targetEl.textContent = this.puzzle.target;
        this.opsCountEl.textContent = `${this.ops} ops`;
        this.chipsEl.innerHTML = '';
        this.chips.forEach((value, index) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'num-chip' + (value === null ? ' spent' : '');
            chip.dataset.index = index;
            chip.textContent = value === null ? '' : value;
            this.chipsEl.appendChild(chip);
        });
        this.renderSelection();
        this.undoButton.disabled = this.undoStack.length === 0 || !this.gameActive;
        this.resetButton.disabled = !this.gameActive;
    }

    renderSelection() {
        this.chipsEl.querySelectorAll('.num-chip').forEach(chip => {
            chip.classList.toggle('selected', parseInt(chip.dataset.index) === this.selectedChip);
        });
        document.querySelectorAll('.op-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.op === this.selectedOp);
        });
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    // ------------------------------------------------------------
    // Win, stats, share
    // ------------------------------------------------------------

    handleWin(winIndex) {
        this.gameActive = false;
        const chipEl = this.chipsEl.querySelector(`[data-index="${winIndex}"]`);
        if (chipEl) chipEl.classList.add('win');
        this.updateMessage(`🎉 Target hit in ${this.ops} op${this.ops === 1 ? '' : 's'}! (par ${this.puzzle.par})`, 'success');
        this.playSound('win');
        this.createConfetti();
        this.gameAnalytics.trackGameEnd(true, this.ops);
        if (this.gameMode === 'daily') this.saveDailyShare();

        const stats = this.getStats();
        const gameKey = this.gameMode === 'daily' ? this.getDateString() : 'practice-' + this.practiceSeed;
        if (stats.lastGamePlayed !== gameKey) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            if (stats.bestOps === null || this.ops < stats.bestOps) {
                stats.bestOps = this.ops;
            }
            stats.lastGamePlayed = gameKey;
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
        this.saveGameState();
        this.undoButton.disabled = true;
        this.resetButton.disabled = true;
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
        const key = `bitwise-stats-${this.gameMode}`;
        const defaults = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            bestOps: null,
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
        localStorage.setItem(`bitwise-stats-${this.gameMode}`, JSON.stringify(stats));
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
        document.getElementById('statsBestOps').textContent = stats.bestOps !== null ? stats.bestOps : '—';
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;
        modal.style.display = 'flex';
    }

    saveDailyShare() {
        // Snapshot today's emoji result (minus the link) so the hub can build
        // one combined all-dailies share
        try {
            const now = new Date();
            localStorage.setItem('bitwise-daily-share', JSON.stringify({
                date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                text: this.generateShareText().split('Play at:')[0].trim()
            }));
        } catch (error) { /* storage full */ }
    }

    generateShareText() {
        const epoch = new Date(BITWISE_EPOCH);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const puzzleNumber = Math.max(1, Math.floor((today.getTime() - epoch.getTime()) / 86400000) + 1);
        let shareText = `BitWise ${puzzleNumber}\n${this.puzzle.target} in ${this.ops} op${this.ops === 1 ? '' : 's'} (par ${this.puzzle.par})\n`;
        shareText += this.opEmojis.join('') + '\n';
        shareText += '\nPlay at: ' + window.location.href;
        return shareText;
    }

    shareResults() {
        const shareText = this.generateShareText();
        this.gameAnalytics.trackButtonClick('share_results');
        if (window.cbShare && window.cbShare.isDesktop()) {
            window.cbShare.showModal(shareText);
        } else if (navigator.share) {
            navigator.share({ text: shareText }).catch(err => {
                // A dismissed share sheet is a user choice, not a failure
                if (!err || err.name !== 'AbortError') this.fallbackShare(shareText);
            });
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
            chips: this.chips,
            ops: this.ops,
            opEmojis: this.opEmojis,
            gameActive: this.gameActive,
            practiceSeed: this.practiceSeed,
            savedDate: this.gameMode === 'daily' ? this.getDateString() : null
        };
        localStorage.setItem(`bitwise-gameState-${this.gameMode}`, JSON.stringify(state));
    }

    loadGameState() {
        try {
            const raw = localStorage.getItem(`bitwise-gameState-${this.gameMode}`);
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
            this.puzzle = generateBitwisePuzzle(this.currentSeed());
            this.chips = state.chips || [...this.puzzle.numbers];
            this.ops = state.ops || 0;
            this.opEmojis = state.opEmojis || [];
            this.gameActive = !!state.gameActive;
            this.undoStack = [];
            this.selectedChip = null;
            this.selectedOp = null;

            this.renderAll();
            this.updateUIVisibility();

            if (!this.gameActive) {
                this.updateMessage(`🎉 Target hit in ${this.ops} op${this.ops === 1 ? '' : 's'}! (par ${this.puzzle.par})`, 'success');
                this.undoButton.disabled = true;
                this.resetButton.disabled = true;
            } else {
                this.updateMessage(this.ops > 0
                    ? 'Welcome back! Keep combining.'
                    : "Hit today's target with + − × ÷ — fewest ops wins!", 'info');
            }
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.clearGameState();
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem(`bitwise-gameState-${this.gameMode}`);
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
            if (type === 'merge') { freq = 494; dur = 0.14; }
            if (type === 'win') { freq = 523.25; dur = 0.5; }
            if (type === 'error') { freq = 200; dur = 0.3; }
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
        window.bitwiseGame = new BitwiseGame();
    });
}

// Export pure logic for testing in Node (no effect in the browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateBitwisePuzzle, applyOp, bwHashCode, bwMakeRNG, minOpsFor };
}
