// DOM Elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const winModal = document.getElementById('win-modal');
const finalMovesDisplay = document.getElementById('final-moves');

// Game State Variables
let tiles = [];
let flippedTiles = [];
let matchedPairs = 0;
let moves = 0;
let isBoardLocked = false; // Prevent clicks while animations are running
const TOTAL_PAIRS = 8;     // 16 tiles total

// Beautiful specific images from Unsplash via Picsum id routing for consistency
// Selected to be distinct and vibrant
const imageIds = [
    '10', '13', '15', '16', 
    '17', '22', '28', '29'
];

/**
 * Initialize a new game
 */
function initGame() {
    // Reset state
    matchedPairs = 0;
    moves = 0;
    flippedTiles = [];
    isBoardLocked = false;
    
    // Update UI
    updateScore();
    movesDisplay.textContent = moves;
    winModal.classList.add('hidden');
    
    // Clear board
    gameBoard.innerHTML = '';
    
    // Generate and shuffle tiles Array
    const tileData = generateTileData();
    const shuffledTiles = shuffleArray(tileData);
    
    // Create DOM elements
    createBoard(shuffledTiles);
}

/**
 * Creates 16 tile objects (8 pairs) using predefined image IDs
 */
function generateTileData() {
    const data = [];
    
    // Create a pair for each image ID
    imageIds.forEach((id, index) => {
        // We use a specific ID to ensure the images don't change randomly 
        // between matching attempts
        const imgUrl = `https://picsum.photos/id/${id}/200/200`;
        
        // Push twice for a pair
        data.push({ id: index, imgUrl });
        data.push({ id: index, imgUrl });
    });
    
    return data;
}

/**
 * Fisher-Yates array shuffle algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate DOM elements for the game board
 */
function createBoard(shuffledTiles) {
    shuffledTiles.forEach((tileData, index) => {
        // Create main tile container
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.dataset.id = tileData.id;
        tileElement.dataset.index = index;
        
        // Create front face (shows default pattern before flipping)
        const frontFace = document.createElement('div');
        frontFace.classList.add('tile-face', 'tile-front');
        
        // Create back face (shows the actual image)
        const backFace = document.createElement('div');
        backFace.classList.add('tile-face', 'tile-back');
        
        const img = document.createElement('img');
        img.src = tileData.imgUrl;
        img.alt = 'Memory tile';
        
        // Append elements
        backFace.appendChild(img);
        tileElement.appendChild(frontFace);
        tileElement.appendChild(backFace);
        
        // Add click listener
        tileElement.addEventListener('click', () => handleTileClick(tileElement));
        
        gameBoard.appendChild(tileElement);
    });
}

/**
 * Handle clicking on a tile
 */
function handleTileClick(tile) {
    // Ignore clicks if board is locked, tile is already matched, or already flipped
    if (
        isBoardLocked || 
        tile.classList.contains('matched') || 
        tile.classList.contains('flipped')
    ) {
        return;
    }

    // Flip the tile
    tile.classList.add('flipped');
    flippedTiles.push(tile);

    // If two tiles are flipped, check for a match
    if (flippedTiles.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }
}

/**
 * Compare the two flipped tiles
 */
function checkForMatch() {
    isBoardLocked = true; // Lock board during check
    
    const [tile1, tile2] = flippedTiles;
    const isMatch = tile1.dataset.id === tile2.dataset.id;
    
    if (isMatch) {
        handleMatch(tile1, tile2);
    } else {
        handleMismatch(tile1, tile2);
    }
}

/**
 * Actions to take when a match is found
 */
function handleMatch(tile1, tile2) {
    // Wait briefly so user sees the match, then run disappear logic
    setTimeout(() => {
        tile1.classList.add('matched');
        tile2.classList.add('matched');
        
        matchedPairs++;
        updateScore();
        
        resetTurn();
        checkWinCondition();
    }, 600); // Wait 600ms before dissolving
}

/**
 * Actions to take when cards do not match
 */
function handleMismatch(tile1, tile2) {
    // Wait for the flip animation to finish + a little time for the user to memorize
    setTimeout(() => {
        tile1.classList.remove('flipped');
        tile2.classList.remove('flipped');
        
        resetTurn();
    }, 1000); // Give user 1 second to look at the cards
}

/**
 * Reset local turn variables
 */
function resetTurn() {
    flippedTiles = [];
    isBoardLocked = false;
}

/**
 * Update the UI score
 */
function updateScore() {
    scoreDisplay.textContent = `${matchedPairs} / ${TOTAL_PAIRS}`;
}

/**
 * Check if the game is over
 */
function checkWinCondition() {
    if (matchedPairs === TOTAL_PAIRS) {
        // Wait for final disappearing animation
        setTimeout(() => {
            finalMovesDisplay.textContent = moves;
            winModal.classList.remove('hidden');
        }, 500);
    }
}

// Event Listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Bootstrap the game on load
document.addEventListener('DOMContentLoaded', initGame);
