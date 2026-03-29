// Game Levels Configuration
const levels = [
    { level: 1, subtitle: "Getting Started", gridSize: "grid-2x2", pairs: 2, time: 0 },
    { level: 2, subtitle: "Speedy Puppies", gridSize: "grid-3x4", pairs: 6, time: 45 },
    { level: 3, subtitle: "Cute Overload", gridSize: "grid-4x4", pairs: 8, time: 60 } // Level 12 style equivalent
];

// Available images from project /images/ folder
const puppyImages = [
    "a-cute-mini-goldendoodle-puppy-looking-at-the-camera_SoySendra_Shutterstock-800x534.jpg",
    "depositphotos_842831286-stock-photo-studio-portrait-golden-retriever-panting.jpg",
    "dog-animal_DOTORLBDD7.jpg",
    "dog-puppy_X8VPPWVKKY.jpg",
    "free-dog-pictures-7.jpg",
    "happy-white-dog-0410-5701543.webp",
    "istockphoto-1589824836-612x612.jpg",
    "istockphoto-2026155202-612x612.webp",
    "pexels-daniel-franco-25130847-6999621.jpg",
    "puppy-1047521_1280.jpg",
    "puppy-1903313_1280.jpg",
    "selective-focus-shot-adorable-kooikerhondje-dog_181624-37636.avif"
];

// DOM Elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const bestMovesDisplay = document.getElementById('best-moves');
const timerDisplay = document.getElementById('timer');
const movesTopDisplay = document.getElementById('moves-top');
const levelTitleDisplay = document.getElementById('level-title');
const levelSubtitleDisplay = document.getElementById('level-subtitle');

const restartBtnFooter = document.getElementById('restart-btn-footer');
const playAgainBtn = document.getElementById('play-again-btn');
const winModal = document.getElementById('win-modal');
const finalMovesDisplay = document.getElementById('final-moves');

// Game State
let currentLevelIndex = 0;
let flippedTiles = [];
let matchedPairs = 0;
let moves = 0;
let isBoardLocked = false;
let timerSeconds = 0;
let timerInterval = null;

/**
 * Initialize selected level
 */
function initGame(levelIndex = 0) {
    currentLevelIndex = levelIndex;
    const currentLevel = levels[currentLevelIndex];

    // Reset State
    matchedPairs = 0;
    moves = 0;
    flippedTiles = [];
    isBoardLocked = false;
    
    // UI Update
    levelTitleDisplay.textContent = `Level ${currentLevel.level}`;
    levelSubtitleDisplay.textContent = currentLevel.subtitle;
    movesTopDisplay.textContent = moves;
    scoreDisplay.textContent = `0 / ${currentLevel.pairs}`;
    
    // Load Best Score from LocalStorage
    const bestMoves = localStorage.getItem(`bestMoves_lvl${currentLevel.level}`) || "-";
    bestMovesDisplay.textContent = bestMoves;

    winModal.classList.add('hidden');

    // Setup Grid View
    gameBoard.className = currentLevel.gridSize; // Apply grid-2x2 etc.
    gameBoard.innerHTML = '';

    // Timer Setting
    clearInterval(timerInterval);
    if (currentLevel.time > 0) {
        timerSeconds = currentLevel.time;
        updateTimerUI();
        timerInterval = setInterval(countDown, 1000);
    } else {
        timerDisplay.textContent = "--:--";
    }

    // Generate Cards
    const tileData = generateTileData(currentLevel.pairs);
    const shuffledTiles = shuffleArray(tileData);
    createBoard(shuffledTiles);
}

/**
 * Generate pairs of images
 */
function generateTileData(pairCount) {
    const data = [];
    // Shuffle puppyImages to get random subset
    const shuffledImages = shuffleArray(puppyImages);
    
    for (let i = 0; i < pairCount; i++) {
        const imgPath = `images/${shuffledImages[i]}`;
        data.push({ id: i, imgPath });
        data.push({ id: i, imgPath });
    }
    return data;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createBoard(tiles) {
    tiles.forEach((tileData, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.id = tileData.id;
        tile.dataset.index = index;

        const front = document.createElement('div');
        front.classList.add('tile-face', 'tile-front');

        const back = document.createElement('div');
        back.classList.add('tile-face', 'tile-back');

        const img = document.createElement('img');
        img.src = tileData.imgPath;
        img.alt = "Puppy";
        
        back.appendChild(img);
        tile.appendChild(front);
        tile.appendChild(back);

        tile.addEventListener('click', () => handleTileClick(tile));
        gameBoard.appendChild(tile);
    });
}

function handleTileClick(tile) {
    if (isBoardLocked || tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

    tile.classList.add('flipped');
    flippedTiles.push(tile);

    if (flippedTiles.length === 2) {
        moves++;
        movesTopDisplay.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    isBoardLocked = true;
    const [t1, t2] = flippedTiles;

    if (t1.dataset.id === t2.dataset.id) {
        setTimeout(() => {
            t1.classList.add('matched');
            t2.classList.add('matched');
            matchedPairs++;
            scoreDisplay.textContent = `${matchedPairs} / ${levels[currentLevelIndex].pairs}`;
            
            flippedTiles = [];
            isBoardLocked = false;
            checkWinCondition();
        }, 500);
    } else {
        setTimeout(() => {
            t1.classList.remove('flipped');
            t2.classList.remove('flipped');
            flippedTiles = [];
            isBoardLocked = false;
        }, 1000);
    }
}

function checkWinCondition() {
    const currentLevel = levels[currentLevelIndex];
    if (matchedPairs === currentLevel.pairs) {
        clearInterval(timerInterval);
        
        // Save Best Score
        const savedBest = localStorage.getItem(`bestMoves_lvl${currentLevel.level}`);
        if (!savedBest || moves < savedBest) {
            localStorage.setItem(`bestMoves_lvl${currentLevel.level}`, moves);
            bestMovesDisplay.textContent = moves;
        }

        setTimeout(() => {
            finalMovesDisplay.textContent = moves;
            winModal.classList.remove('hidden');
        }, 600);
    }
}

function countDown() {
    timerSeconds--;
    updateTimerUI();
    if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        alert("Time is up! Game Over!");
        initGame(currentLevelIndex); // restart same level
    }
}

function updateTimerUI() {
    const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const secs = (timerSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

// Event Listeners
restartBtnFooter.addEventListener('click', () => initGame(currentLevelIndex));
playAgainBtn.addEventListener('click', () => {
    // Progress to next level if available, or loop
    const nextLvl = (currentLevelIndex + 1) % levels.length;
    initGame(nextLvl);
});

// Load
document.addEventListener('DOMContentLoaded', () => initGame(0));
