class WoordleGame {
    constructor() {
        this.wordLength = 5;
        this.maxAttempts = 6;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameActive = true;
        this.currentWord = '';
        this.targetWord = '';
        this.gameMode = 'daily';
        this.keyboardState = {};
        
        // Word lists
        this.commonWords = [
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
            'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
            'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
            'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID',
            'AWAKE', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN',
            'BEING', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK',
            'BLOOD', 'BOARD', 'BOAST', 'BOBBY', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS',
            'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD',
            'BUILT', 'BUYER', 'CABLE', 'CACHE', 'CANAL', 'CANDY', 'CANOE', 'CARRY', 'CARVE', 'CATCH',
            'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHESS',
            'CHEST', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK',
            'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER',
            'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CURVE',
            'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING',
            'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK',
            'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY', 'ENEMY',
            'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA',
            'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST',
            'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM',
            'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT',
            'GIVEN', 'GLASS', 'GLOBE', 'GLORY', 'GOODS', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT',
            'GRASS', 'GRAVE', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST',
            'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE', 'HOTEL', 'HOUSE',
            'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN', 'JIMMY', 'JOINT',
            'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN',
            'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT', 'LINKS', 'LIVES',
            'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER',
            'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR',
            'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH',
            'MOVED', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED',
            'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'PAINT',
            'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PICKED',
            'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND',
            'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD',
            'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO',
            'REACH', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'REPAY', 'REPLY', 'RIGHT', 'RIGID',
            'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RUGBY',
            'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN', 'SHALL', 'SHAPE',
            'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT',
            'SHORT', 'SHOWN', 'SIGHT', 'SIMON', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE',
            'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SNAKE', 'SNOW', 'SOLID', 'SOLVE', 'SORRY',
            'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE',
            'SPORT', 'SQUAD', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL',
            'STEEP', 'STEER', 'STEVE', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM',
            'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET',
            'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TERRY', 'THANK', 'THEFT', 'THEIR', 'THEME',
            'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW',
            'THUMB', 'TIGER', 'TIGHT', 'TIRED', 'TITLE', 'TODAY', 'TOKEN', 'TOPIC', 'TOTAL', 'TOUCH',
            'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK',
            'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TWICE', 'TWIST', 'TYPED',
            'UNCLE', 'UNCUT', 'UNDER', 'UNFAIR', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN',
            'USAGE', 'USUAL', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'WASTE',
            'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN',
            'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE',
            'YOUNG', 'YOUTH'
        ];
        
        this.validWords = [...this.commonWords];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.initializeGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.keyboard = document.getElementById('keyboard');
        this.message = document.getElementById('message');
        this.attemptsLeft = document.getElementById('attemptsLeft');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');
        this.dailyMode = document.getElementById('dailyMode');
        this.infiniteMode = document.getElementById('infiniteMode');
        this.newGameButton = document.getElementById('newGameButton');
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'));
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'));
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');
        this.startNewGame();
    }

    initializeGame() {
        this.createGameBoard();
        this.createKeyboard();
        this.startNewGame();
    }

    createGameBoard() {
        this.gameBoard.innerHTML = '';
        for (let row = 0; row < this.maxAttempts; row++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';
            guessRow.id = `row-${row}`;
            
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                tile.id = `tile-${row}-${col}`;
                guessRow.appendChild(tile);
            }
            
            this.gameBoard.appendChild(guessRow);
        }
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key));
                keyboardRow.appendChild(keyButton);
            });
            
            this.keyboard.appendChild(keyboardRow);
        });
    }

    startNewGame() {
        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        
        // Clear the board
        for (let row = 0; row < this.maxAttempts; row++) {
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                tile.textContent = '';
                tile.className = 'letter-tile';
            }
        }
        
        // Reset keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });
        
        // Select target word
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily Woordle!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
        this.newGameButton.style.display = 'none';
        
        console.log('Target word:', this.targetWord); // For debugging
    }

    getDailyWord() {
        // Use today's date as seed for consistent daily word
        const today = new Date();
        const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const seed = this.hashCode(dateString);
        const index = Math.abs(seed) % this.commonWords.length;
        return this.commonWords[index];
    }

    getRandomWord() {
        return this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const key = e.key.toUpperCase();
        
        // Don't allow typing disabled (absent) letters
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = document.querySelector(`[data-key="${key}"]`);
            if (keyElement && keyElement.disabled) return;
        }
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            this.addLetter(key);
        }
    }

    handleKeyClick(key) {
        if (!this.gameActive) return;
        
        // Don't allow clicking on disabled (absent) keys
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement && keyElement.disabled) return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (this.currentCol < this.wordLength) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentWord += letter;
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    submitGuess() {
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not a valid word!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            return;
        }
        
        // Check the guess and process results
        this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 100 + 200);
        } else if (this.currentRow >= this.maxAttempts - 1) {
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 100 + 200);
        } else {
            // Move to next row after animation completes
            setTimeout(() => {
                this.currentRow++;
                this.currentCol = 0;
                this.currentWord = '';
                this.updateAttemptsDisplay();
            }, this.wordLength * 100 + 100);
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        const targetLetters = [...this.targetWord];
        const guessLetters = [...this.currentWord];
        const results = new Array(this.wordLength).fill('absent');
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                results[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                results[i] = 'present';
                targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
        }
        
        // Animate tiles and update keyboard state
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            const result = results[i];
            
            setTimeout(() => {
                const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
                tile.classList.add(result);
                
                // Update keyboard state - prioritize correct > present > absent
                if (!this.keyboardState[letter] || 
                    (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                    (this.keyboardState[letter] === 'absent' && result === 'present')) {
                    this.keyboardState[letter] = result;
                }
            }, i * 100);
        }
        
        // Update keyboard after all tiles are processed
        setTimeout(() => {
            this.updateKeyboard();
        }, this.wordLength * 100);
        
        this.playSound('flip');
    }

    updateKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            const letter = key.dataset.key;
            if (this.keyboardState[letter]) {
                key.classList.remove('correct', 'present', 'absent');
                
                if (this.keyboardState[letter] === 'absent') {
                    // Make absent letters disappear from keyboard
                    key.style.visibility = 'hidden';
                    key.disabled = true;
                } else {
                    // Show correct and present letters normally
                    key.classList.add(this.keyboardState[letter]);
                    key.style.visibility = 'visible';
                    key.disabled = false;
                }
            }
        });
    }

    handleWin() {
        this.gameActive = false;
        const attempts = this.currentRow + 1;
        this.updateMessage(`🎉 Excellent! You got it in ${attempts} attempt${attempts === 1 ? '' : 's'}!`, "success");
        this.playSound('win');
        this.createConfetti();
        
        // Update stats
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 2000);
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');
        
        // Update stats
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 2000);
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateAttemptsDisplay() {
        const remaining = this.maxAttempts - this.currentRow;
        this.attemptsLeft.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} left`;
        
        if (remaining <= 2) {
            this.attemptsLeft.style.color = '#ff4444';
        } else {
            this.attemptsLeft.style.color = '#ffeb3b';
        }
    }

    shakeRow(row) {
        const rowElement = document.getElementById(`row-${row}`);
        rowElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 500);
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'confettiFall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.5;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.8;
                break;
            case 'flip':
                frequency = 330;
                duration = 0.2;
                break;
            case 'error':
                frequency = 200;
                duration = 0.3;
                break;
            default:
                frequency = 440;
                duration = 0.2;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        const saved = localStorage.getItem('woordle-stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveStats(stats) {
        localStorage.setItem('woordle-stats', JSON.stringify(stats));
    }

    loadStats() {
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }
}

// CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.addEventListener('load', () => {
    new WoordleGame();
});