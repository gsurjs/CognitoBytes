class CrossJumbleGame {
    constructor() {
        this.words = [];
        this.gridSize = 8; // Increased to 8x8 for better fit
        this.targetWordCount = 5; // Aim for 5 words
        
        this.solutionGrid = [];
        this.currentGrid = [];
        this.wordDefs = [];
        this.tileMap = [];

        this.selectedTile = null; 
        this.moves = 0;
        this.gameActive = false;
        
        // Timer & Pause
        this.timer = 0;
        this.timerInterval = null;
        this.hasStarted = false;
        this.isPaused = false;
        
        this.init();
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();
        await this.loadWords();
        
        const savedMode = localStorage.getItem('cj-gameMode');
        const validModes = ['daily', 'infinite'];
        if (savedMode && validModes.includes(savedMode)) {
            this.setGameMode(savedMode);
        } else {
            this.setGameMode('daily');
        }
    }

    cacheDOM() {
        this.dom = {
            board: document.getElementById('gameBoard'),
            movesDisplay: document.getElementById('movesDisplay'),
            timerDisplay: document.getElementById('timerDisplay'),
            message: document.getElementById('message'),
            dailyBtn: document.getElementById('dailyMode'),
            infiniteBtn: document.getElementById('infiniteMode'),
            newGameBtn: document.getElementById('newGameButton'),
            shareBtn: document.getElementById('shareButton'),
            pauseBtn: document.getElementById('pauseButton'),
            statsModal: document.getElementById('statsModal'),
            closeModal: document.querySelector('.modal-close-button')
        };
    }

    bindEvents() {
        this.dom.dailyBtn.addEventListener('click', () => this.setGameMode('daily'));
        this.dom.infiniteBtn.addEventListener('click', () => this.setGameMode('infinite'));
        this.dom.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.dom.shareBtn.addEventListener('click', () => this.shareResult());
        this.dom.pauseBtn.addEventListener('click', () => this.togglePause());
        
        this.dom.closeModal.addEventListener('click', () => this.dom.statsModal.style.display = 'none');
        this.dom.statsModal.addEventListener('click', (e) => {
             if (e.target === this.dom.statsModal) this.dom.statsModal.style.display = 'none';
        });
    }

    async loadWords() {
        try {
            const response = await fetch('/games/decipherly/data/words.txt');
            if (!response.ok) throw new Error("Failed to load dictionary");
            const text = await response.text();
            this.words = text.split('\n')
                .map(w => w.trim().toUpperCase())
                .filter(w => w.length >= 3 && w.length <= 7 && /^[A-Z]+$/.test(w));
        } catch (e) {
            this.words = ["APPLE", "BREAD", "CHAIR", "DANCE", "EAGLE"];
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dom.dailyBtn.classList.toggle('active', mode === 'daily');
        this.dom.infiniteBtn.classList.toggle('active', mode === 'infinite');
        localStorage.setItem('cj-gameMode', mode);
        this.dom.newGameBtn.style.display = mode === 'daily' ? 'none' : 'inline-block';
        this.startNewGame();
    }

    seededRandom(seed) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    getSeed() {
        if (this.gameMode === 'infinite') return Math.random() * 100000;
        const d = new Date();
        const str = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    startNewGame() {
        this.moves = 0;
        this.timer = 0;
        this.hasStarted = false;
        this.isPaused = false;
        this.stopTimer();
        
        this.selectedTile = null;
        this.gameActive = true;
        
        this.dom.movesDisplay.textContent = "Moves: 0";
        this.dom.timerDisplay.textContent = "Time: 00:00";
        this.dom.shareBtn.style.display = 'none';
        this.dom.pauseBtn.style.display = 'inline-block';
        this.dom.pauseBtn.textContent = 'PAUSE';
        
        this.dom.board.innerHTML = ''; 
        this.createPauseOverlay();
        this.showMessage("Swap letters in each word to decipher the grid!", "");

        // Check daily save
        if (this.gameMode === 'daily') {
            const saveKey = 'cj-daily-state-' + new Date().toDateString();
            const savedState = localStorage.getItem(saveKey);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed && parsed.solved === true) {
                        this.loadSavedState(parsed);
                        return;
                    }
                } catch (e) { localStorage.removeItem(saveKey); }
            }
        }

        const seed = this.getSeed();
        let rng = this.seededRandom(seed);
        const nextRand = () => {
            rng = this.seededRandom(rng * 100000);
            return rng;
        };

        // Retry loop for valid grid
        let success = false;
        let attempts = 0;
        while (!success && attempts < 20) {
            success = this.generateGrid(nextRand);
            attempts++;
        }

        if (!success) {
            this.showMessage("Generator failed. Try refresh.", "error");
            return;
        }

        this.scrambleBoard(nextRand); // FIX: Function name matches definition
        this.renderBoard();
    }

    // --- GRID GENERATION ---
    generateGrid(randFunc) {
        const size = this.gridSize;
        const grid = Array(size).fill(null).map(() => Array(size).fill(null));
        const placedWords = []; 
        
        const pickWord = (len, mustContainChar = null) => {
            let subsets = this.words.filter(w => w.length === len);
            if (mustContainChar) {
                subsets = subsets.filter(w => w.includes(mustContainChar));
            }
            if (subsets.length === 0) return null;
            return subsets[Math.floor(randFunc() * subsets.length)];
        };

        // 1. Center Word (Horizontal)
        const centerLen = 5 + Math.floor(randFunc() * 2);
        const centerWord = pickWord(centerLen);
        if (!centerWord) return false;
        
        const startCol = Math.floor((size - centerLen) / 2);
        const startRow = Math.floor(size / 2);
        
        for (let i = 0; i < centerLen; i++) grid[startRow][startCol + i] = centerWord[i];
        placedWords.push({dir: 'H', r: startRow, c: startCol, len: centerLen, word: centerWord});

        // 2. Branch Out
        let attempts = 0;
        // Keep trying until we have 5 words or give up
        while (placedWords.length < this.targetWordCount && attempts < 50) {
            attempts++;
            
            // Pick a random existing word to branch off
            const baseWord = placedWords[Math.floor(randFunc() * placedWords.length)];
            
            // Pick a random char in that word
            const charIdx = Math.floor(randFunc() * baseWord.len);
            const intersectChar = baseWord.word[charIdx];
            
            // Determine intersection coordinates
            const intersectR = baseWord.dir === 'H' ? baseWord.r : baseWord.r + charIdx;
            const intersectC = baseWord.dir === 'H' ? baseWord.c + charIdx : baseWord.c;
            
            // Determine new direction
            const newDir = baseWord.dir === 'H' ? 'V' : 'H';
            
            // Pick a new word length (3 to 6)
            const newLen = 3 + Math.floor(randFunc() * 4);
            
            // Find a word that fits
            const newWordStr = pickWord(newLen, intersectChar);
            if (!newWordStr) continue;
            
            // Determine start position of new word
            const newCharIdx = newWordStr.indexOf(intersectChar);
            const newStartR = newDir === 'V' ? intersectR - newCharIdx : intersectR;
            const newStartC = newDir === 'H' ? intersectC - newCharIdx : intersectC;
            
            // Check Bounds
            if (newStartR < 0 || newStartR + newLen > size || newStartC < 0 || newStartC + newLen > size) continue;
            
            // Check Collisions
            let fits = true;
            for (let k = 0; k < newLen; k++) {
                const checkR = newDir === 'V' ? newStartR + k : newStartR;
                const checkC = newDir === 'H' ? newStartC + k : newStartC;
                
                const existingChar = grid[checkR][checkC];
                
                // Must match existing char if present
                if (existingChar !== null && existingChar !== newWordStr[k]) {
                    fits = false; break;
                }
                
                // If empty, check neighbors (Don't create accidental 2-letter words parallel)
                if (existingChar === null) {
                    if (newDir === 'V') {
                        if (checkC > 0 && grid[checkR][checkC-1] !== null) fits = false;
                        if (checkC < size-1 && grid[checkR][checkC+1] !== null) fits = false;
                        // Check ends
                        if (k===0 && checkR > 0 && grid[checkR-1][checkC] !== null) fits = false;
                        if (k===newLen-1 && checkR < size-1 && grid[checkR+1][checkC] !== null) fits = false;
                    } else {
                        if (checkR > 0 && grid[checkR-1][checkC] !== null) fits = false;
                        if (checkR < size-1 && grid[checkR+1][checkC] !== null) fits = false;
                        // Check ends
                        if (k===0 && checkC > 0 && grid[checkR][checkC-1] !== null) fits = false;
                        if (k===newLen-1 && checkC < size-1 && grid[checkR][checkC+1] !== null) fits = false;
                    }
                }
            }
            
            if (fits) {
                // Place it
                for (let k = 0; k < newLen; k++) {
                    const r = newDir === 'V' ? newStartR + k : newStartR;
                    const c = newDir === 'H' ? newStartC + k : newStartC;
                    grid[r][c] = newWordStr[k];
                }
                placedWords.push({dir: newDir, r: newStartR, c: newStartC, len: newLen, word: newWordStr});
            }
        }

        if (placedWords.length < 4) return false; // Minimum 4 words

        this.solutionGrid = grid;
        this.wordDefs = placedWords;
        
        // Build Tile Map
        this.tileMap = Array(size).fill(null).map(() => Array(size).fill(null).map(() => []));
        placedWords.forEach((def, idx) => {
            if (def.dir === 'H') {
                for (let i=0; i<def.len; i++) this.tileMap[def.r][def.c + i].push(idx);
            } else {
                for (let i=0; i<def.len; i++) this.tileMap[def.r + i][def.c].push(idx);
            }
        });

        return true;
    }

    // --- ANCHORED SCRAMBLE LOGIC ---
    scrambleBoard(randFunc) {
        this.currentGrid = this.solutionGrid.map(row => [...row]);
        const wordBuckets = this.wordDefs.map(() => []); 

        for(let r=0; r<this.gridSize; r++) {
            for(let c=0; c<this.gridSize; c++) {
                const indices = this.tileMap[r][c];
                // Only scramble Non-Intersection (Non-Anchor) tiles
                if (indices && indices.length === 1) {
                    const wordIdx = indices[0];
                    wordBuckets[wordIdx].push({r, c, char: this.solutionGrid[r][c]});
                }
            }
        }

        wordBuckets.forEach(bucket => {
            if (bucket.length > 1) {
                const originalStr = bucket.map(b => b.char).join('');
                let chars = bucket.map(b => b.char);
                let scrambledStr = originalStr;
                let attempts = 0;

                // FORCE SCRAMBLE: Keep shuffling until it doesn't match
                while (scrambledStr === originalStr && attempts < 20) {
                    // Fisher-Yates
                    for (let i = chars.length - 1; i > 0; i--) {
                        const j = Math.floor(randFunc() * (i + 1));
                        [chars[i], chars[j]] = [chars[j], chars[i]];
                    }
                    scrambledStr = chars.join('');
                    attempts++;
                }

                // Fallback: If random shuffle failed to change it (rare), force a swap
                if (scrambledStr === originalStr) {
                    [chars[0], chars[1]] = [chars[1], chars[0]];
                }

                bucket.forEach((item, i) => {
                    this.currentGrid[item.r][item.c] = chars[i];
                });
            }
        });
    }

    renderBoard() {
        const overlay = this.dom.pauseOverlay;
        this.dom.board.innerHTML = '';
        if (overlay) this.dom.board.appendChild(overlay);

        this.dom.board.style.display = 'grid';
        this.dom.board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        // Calculate valid swap targets
        let validTargets = new Set();
        if (this.selectedTile) {
            const sR = this.selectedTile.r;
            const sC = this.selectedTile.c;
            const sourceWordIndices = this.tileMap[sR][sC];
            
            for(let r=0; r<this.gridSize; r++) {
                for(let c=0; c<this.gridSize; c++) {
                    if (this.tileMap[r][c].length > 0) {
                         const targetIndices = this.tileMap[r][c];
                         const intersection = sourceWordIndices.filter(x => targetIndices.includes(x));
                         if (intersection.length > 0) validTargets.add(`${r},${c}`);
                    }
                }
            }
        }

        for(let r=0; r<this.gridSize; r++) {
            for(let c=0; c<this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'tile';
                cell.dataset.r = r;
                cell.dataset.c = c;

                if (this.solutionGrid[r][c] === null) {
                    cell.classList.add('empty');
                } else {
                    const char = this.currentGrid[r][c];
                    cell.textContent = char;
                    
                    const isSelected = this.selectedTile && this.selectedTile.r === r && this.selectedTile.c === c;
                    
                    if (char === this.solutionGrid[r][c]) {
                        cell.classList.add('correct');
                    }
                    
                    if (isSelected) {
                        cell.classList.add('selected');
                    } else if (this.selectedTile && validTargets.has(`${r},${c}`)) {
                        cell.classList.add('valid-target');
                    } else if (this.selectedTile) {
                        cell.classList.add('dimmed');
                    }

                    if (char !== this.solutionGrid[r][c]) {
                         cell.addEventListener('click', () => this.handleTileClick(r, c));
                    }
                }
                this.dom.board.appendChild(cell);
            }
        }
    }

    handleTileClick(r, c) {
        if (!this.gameActive || this.isPaused) return;

        if (!this.hasStarted) {
            this.hasStarted = true;
            this.startTimer();
        }

        if (this.selectedTile && this.selectedTile.r === r && this.selectedTile.c === c) {
            this.selectedTile = null;
            this.renderBoard();
            return;
        }

        if (!this.selectedTile) {
            this.selectedTile = {r, c};
            this.renderBoard();
            return;
        }

        const pos1 = this.selectedTile;
        const pos2 = {r, c};

        const words1 = this.tileMap[pos1.r][pos1.c];
        const words2 = this.tileMap[pos2.r][pos2.c];
        const common = words1.filter(id => words2.includes(id));

        if (common.length > 0) {
            this.swapTiles(pos1, pos2);
            this.selectedTile = null;
            this.moves++;
            this.dom.movesDisplay.textContent = `Moves: ${this.moves}`;
            this.renderBoard();
            this.checkWin();
        } else {
            this.selectedTile = {r, c};
            this.playSound('click'); 
            this.renderBoard();
        }
    }

    swapTiles(pos1, pos2) {
        const temp = this.currentGrid[pos1.r][pos1.c];
        this.currentGrid[pos1.r][pos1.c] = this.currentGrid[pos2.r][pos2.c];
        this.currentGrid[pos2.r][pos2.c] = temp;
        this.playSound('click');
    }

    checkWin() {
        let allCorrect = true;
        for(let r=0; r<this.gridSize; r++) {
            for(let c=0; c<this.gridSize; c++) {
                if (this.solutionGrid[r][c] !== null && this.currentGrid[r][c] !== this.solutionGrid[r][c]) {
                    allCorrect = false;
                }
            }
        }

        if (allCorrect) {
            this.gameActive = false;
            this.stopTimer();
            this.playSound('win');
            this.showMessage("🎉 Grid Deciphered!", "success");
            this.dom.pauseBtn.style.display = 'none';
            this.saveStats(true);
            if(this.gameMode === 'daily') {
                this.dom.shareBtn.style.display = 'inline-block';
                localStorage.setItem('cj-daily-state-' + new Date().toDateString(), JSON.stringify({
                    solved: true,
                    moves: this.moves,
                    time: this.timer
                }));
            }
            setTimeout(() => this.dom.statsModal.style.display = 'flex', 1500);
        }
    }

    createPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'pause-overlay';
        overlay.id = 'pauseOverlay';
        overlay.textContent = "PAUSED";
        this.dom.board.appendChild(overlay);
        this.dom.pauseOverlay = overlay;
    }

    togglePause() {
        if (!this.gameActive) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.stopTimer();
            this.dom.pauseBtn.textContent = "RESUME";
            this.dom.pauseOverlay.classList.add('active');
        } else {
            if (this.hasStarted) this.startTimer();
            this.dom.pauseBtn.textContent = "PAUSE";
            this.dom.pauseOverlay.classList.remove('active');
        }
    }

    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    stopTimer() {
        if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    }
    updateTimerDisplay() {
        const min = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const sec = (this.timer % 60).toString().padStart(2, '0');
        this.dom.timerDisplay.textContent = `Time: ${min}:${sec}`;
    }

    saveStats(win) {
        let stats;
        try {
            stats = JSON.parse(localStorage.getItem('cj-stats') || '{"played":0, "wins":0, "streak":0, "bestTime":null}');
        } catch(e) { stats = {played:0, wins:0, streak:0, bestTime:null}; }
        
        stats.played++;
        if(win) {
            stats.wins++;
            stats.streak++;
            if (stats.bestTime === null || this.timer < stats.bestTime) stats.bestTime = this.timer;
        } else { stats.streak = 0; }
        localStorage.setItem('cj-stats', JSON.stringify(stats));
        
        document.getElementById('statsPlayed').textContent = stats.played;
        document.getElementById('statsWinRate').textContent = Math.round((stats.wins/stats.played)*100) + '%';
        document.getElementById('statsStreak').textContent = stats.streak;
        
        if (stats.bestTime !== null) {
            const min = Math.floor(stats.bestTime / 60).toString().padStart(2, '0');
            const sec = (stats.bestTime % 60).toString().padStart(2, '0');
            document.getElementById('statsBestTime').textContent = `${min}:${sec}`;
        } else { document.getElementById('statsBestTime').textContent = "--:--"; }
    }

    loadSavedState(state) {
        this.moves = state.moves;
        this.timer = state.time || 0;
        this.dom.movesDisplay.textContent = `Moves: ${this.moves}`;
        this.updateTimerDisplay();
        this.dom.message.textContent = "You already deciphered today's puzzle!";
        this.dom.shareBtn.style.display = 'inline-block';
        this.dom.pauseBtn.style.display = 'none';
        this.dom.board.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;">Come back tomorrow!</div>';
    }

    showMessage(msg, type) {
        this.dom.message.textContent = msg;
        this.dom.message.style.color = type === 'error' ? '#ff6b6b' : '#f1c40f';
    }

    playSound(type) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') {
            osc.frequency.value = 400; gain.gain.value = 0.1; osc.start(); osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'win') {
            osc.frequency.value = 600; gain.gain.value = 0.1; osc.start();
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.stop(ctx.currentTime + 0.3);
        }
    }

    generateShareText() {
        const epoch = new Date('2026-02-12T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const puzzleNumber = Math.max(1, Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const min = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const sec = (this.timer % 60).toString().padStart(2, '0');
        
        let art = "";
        for (let r = 0; r < this.gridSize; r++) {
            let rowStr = '';
            for (let c = 0; c < this.gridSize; c++) {
                if (this.solutionGrid[r][c] !== null) rowStr += '🟩';
                else rowStr += '⬛';
            }
            if (rowStr.includes('🟩')) art += rowStr + "\n";
        }

        return `🔀 Decipherly #${puzzleNumber}\n` +
               `Time: ${min}:${sec} | Moves: ${this.moves}\n\n` +
               `${art}\n` +
               `Play at: ${window.location.href}`;
    }

    shareResult() {
        const text = this.generateShareText();
        if (navigator.share) {
            navigator.share({text: text}).catch(e => console.log(e));
        } else {
            navigator.clipboard.writeText(text);
            this.showMessage("📋 Copied to clipboard!", "success");
        }
    }
}

window.onload = () => new CrossJumbleGame();