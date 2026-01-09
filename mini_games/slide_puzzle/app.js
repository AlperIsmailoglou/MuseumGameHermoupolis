/* --- CONFIG --- */
const gridSize = 3; 
const tileSize = 125; 
const gapSize = 2;    
const imageSize = 375; 
const imgPath = "chinese_statue.jpg"; 

const board = document.getElementById("board");
const winBox = document.getElementById("win-message");
const startBtn = document.getElementById("start-btn");

// Game State
let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let isGameActive = false; 

// Drag Variables
let activeTile = null;
let startX = 0, startY = 0;
let moveAxis = null; 
let minMove = 0, maxMove = 0;
let currentTranslate = 0; // Track current position for smooth animation
let dragRaf = null; // Reference for animation frame
let resetTimer = null; // Reference for the snap-back timer

/* --- INITIALIZE --- */
function initGame() {
    renderBoard();
    board.classList.add("locked"); 

    // NEW: Open Tutorial on Load
    // We check if it's already open to avoid double toggling if this function runs on resize
    const modal = document.getElementById('tutorial-modal');
    if (!modal.classList.contains('show')) {
        toggleTutorial();
    }
}

// --- NEW: Global Tutorial Function ---
// Make sure this is accessible globally (window scope)
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

/* --- RENDER BOARD --- */
function renderBoard() {
    board.innerHTML = "";
    
    tiles.forEach((tileIndex, positionIndex) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.posIndex = positionIndex;
        
        // 8 is the empty slot
        if (tileIndex === 8) {
            tile.classList.add("empty");
        } else {
            // 1. Calculate Background Image Position
            const tileW = imageSize / gridSize;
            const bgX = -(tileIndex % gridSize) * tileW;
            const bgY = -Math.floor(tileIndex / gridSize) * tileW;
            
            tile.style.backgroundImage = `url("${imgPath}")`;
            tile.style.backgroundSize = `${imageSize}px ${imageSize}px`;
            tile.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            // 2. NEW: Add the Number Overlay
            const numberSpan = document.createElement("span");
            numberSpan.classList.add("number");
            numberSpan.innerText = tileIndex + 1; // Convert index 0 -> "1", index 1 -> "2", etc.
            tile.appendChild(numberSpan);

            // 3. Attach Click/Touch Listener
            tile.addEventListener('pointerdown', (e) => handlePointerDown(e));
        }
        board.appendChild(tile);
    });
}

/* --- GAME FLOW --- */
function startGame() {
    winBox.classList.add("hidden");
    isGameActive = false; 
    board.classList.add("locked");
    startBtn.disabled = true;
    startBtn.textContent = "Shuffling...";

    setTimeout(() => {
        let moveCount = 0;
        tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8]; 

        while (moveCount < 800) {
            const emptyIndex = tiles.indexOf(8);
            const neighbors = [];
            const row = Math.floor(emptyIndex / gridSize);
            const col = emptyIndex % gridSize;
            
            if (row > 0) neighbors.push(emptyIndex - 3);
            if (row < 2) neighbors.push(emptyIndex + 3);
            if (col > 0) neighbors.push(emptyIndex - 1);
            if (col < 2) neighbors.push(emptyIndex + 1);
            
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [tiles[emptyIndex], tiles[randomNeighbor]] = [tiles[randomNeighbor], tiles[emptyIndex]];
            moveCount++;
        }

        renderBoard();
        isGameActive = true; 
        board.classList.remove("locked");
        startBtn.disabled = false;
        startBtn.textContent = "Restart Game";
    }, 100);
}

/* --- POINTER LOGIC --- */

function handlePointerDown(e) {
    if (!isGameActive) return; 

    // If we were waiting for a previous tile to reset, clear that timer now
    // This prevents the "Stuck" bug if you click fast
    if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
        // Clean up any lingering active tile
        if (activeTile) {
            activeTile.style.transition = "";
            activeTile.style.transform = "";
            activeTile = null;
        }
    }

    const tile = e.target;
    const posIndex = parseInt(tile.dataset.posIndex);
    const emptyIndex = tiles.indexOf(8);
    
    // Check adjacency
    const row = Math.floor(posIndex / gridSize);
    const col = posIndex % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    
    if (Math.abs(emptyRow - row) + Math.abs(emptyCol - col) !== 1) return;

    activeTile = tile;
    activeTile.setPointerCapture(e.pointerId);
    
    startX = e.clientX;
    startY = e.clientY;
    currentTranslate = 0;
    
    // Determine Axis
    const colDiff = emptyCol - col;
    const rowDiff = emptyRow - row;

    if (colDiff !== 0) {
        moveAxis = 'x';
        minMove = colDiff > 0 ? 0 : - (tileSize + gapSize);
        maxMove = colDiff > 0 ? (tileSize + gapSize) : 0;
    } else {
        moveAxis = 'y';
        minMove = rowDiff > 0 ? 0 : - (tileSize + gapSize);
        maxMove = rowDiff > 0 ? (tileSize + gapSize) : 0;
    }
    
    activeTile.addEventListener('pointermove', handlePointerMove);
    activeTile.addEventListener('pointerup', handlePointerUp);
    activeTile.addEventListener('pointercancel', handlePointerUp);
}

function handlePointerMove(e) {
    if (!activeTile) return;
    
    // Calculate raw delta
    let delta = (moveAxis === 'x') ? e.clientX - startX : e.clientY - startY;
    // Clamp
    delta = Math.max(minMove, Math.min(delta, maxMove));
    currentTranslate = delta;

    // OPTIMIZATION: Use requestAnimationFrame
    // This stops the code from updating CSS more often than the screen can draw
    if (!dragRaf) {
        dragRaf = requestAnimationFrame(() => {
            if (activeTile) {
                const transform = (moveAxis === 'x') ? `translateX(${currentTranslate}px)` : `translateY(${currentTranslate}px)`;
                activeTile.style.transform = transform;
            }
            dragRaf = null;
        });
    }
}

function handlePointerUp(e) {
    if (!activeTile) return;
    
    // Cancel any pending animation frame
    if (dragRaf) {
        cancelAnimationFrame(dragRaf);
        dragRaf = null;
    }

    // "Less Effort" logic:
    // Reduced threshold to tileSize / 5 (20%) instead of 40%
    const threshold = tileSize / 5; 
    
    let swap = false;
    if (moveAxis === 'x') {
        if (maxMove > 0 && currentTranslate > threshold) swap = true;
        if (minMove < 0 && currentTranslate < -threshold) swap = true;
    } else {
        if (maxMove > 0 && currentTranslate > threshold) swap = true;
        if (minMove < 0 && currentTranslate < -threshold) swap = true;
    }

    activeTile.removeEventListener('pointermove', handlePointerMove);
    activeTile.removeEventListener('pointerup', handlePointerUp);
    activeTile.removeEventListener('pointercancel', handlePointerUp);
    activeTile.releasePointerCapture(e.pointerId);

    if (swap) {
        const fromIndex = parseInt(activeTile.dataset.posIndex);
        const toIndex = tiles.indexOf(8);
        [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];
        
        activeTile = null; // Immediate cleanup on success
        renderBoard();
        checkWin();
    } else {
        // Snap back logic
        activeTile.style.transition = "transform 0.2s ease-out";
        activeTile.style.transform = "translate(0, 0)";
        
        // Save the tile element locally to close over it in the timeout
        const tileToReset = activeTile;
        
        resetTimer = setTimeout(() => { 
            if(tileToReset) tileToReset.style.transition = ""; 
            // Only nullify if we haven't already started a NEW drag
            if (activeTile === tileToReset) {
                activeTile = null; 
            }
            resetTimer = null;
        }, 200);
    }
}
/* --- WIN CHECK & REDIRECT --- */
function checkWin() {
    if (!isGameActive) return;

    const isSolved = tiles.every((val, index) => val === index);
    
    if (isSolved) {
        // 1. Show the Win Message
        winBox.classList.remove("hidden");
        
        // 2. Lock the game
        isGameActive = false;
        board.classList.add("locked");
        startBtn.textContent = "Play Again";

        // 3. Set your Global Flag
        if (typeof setFlag === "function") {
            setFlag('statue_game_solved', true);
        } else {
            console.warn("setFlag function not found. Assuming standalone testing.");
        }

        // 4. Redirect after 2 seconds (2000 ms)
        // This gives the user time to realize they won!
        setTimeout(() => {
            // ".." goes up one folder (out of mini_games)
            // "/rooms/room_1.html" goes into the rooms folder
            window.location.href = "../../rooms/room_1.html";
        }, 2000);
    }
}

initGame();