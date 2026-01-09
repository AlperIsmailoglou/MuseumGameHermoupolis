/* --- CONFIG --- */
const gridSize = 3; 
const imageSize = 300; 
const imgPath = "chinese_statue.jpg"; // Ensure this image exists!
const board = document.getElementById("board");
const winBox = document.getElementById("win-message");

// The game state. 
// 0-7 are the image tiles. 8 is the empty slot.
// We start with a solved state: [0, 1, 2, 3, 4, 5, 6, 7, 8]
let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/* --- INITIALIZE --- */
function initGame() {
    renderBoard();
    // Optional: Auto-shuffle on load
    // setTimeout(shuffleGame, 500); 
}

/* --- RENDER BOARD --- */
function renderBoard() {
    board.innerHTML = ""; // Clear current board
    
    tiles.forEach((tileIndex, positionIndex) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        
        // 8 represents the empty slot
        if (tileIndex === 8) {
            tile.classList.add("empty");
        } else {
            // Apply background image logic
            // We calculate the background position based on the 'tileIndex' (what the image piece IS),
            // not the 'positionIndex' (where it is currently sitting).
            const tileW = imageSize / gridSize;
            const x = -(tileIndex % gridSize) * tileW;
            const y = -Math.floor(tileIndex / gridSize) * tileW;
            
            tile.style.backgroundImage = `url("${imgPath}")`;
            tile.style.backgroundSize = `${imageSize}px ${imageSize}px`;
            tile.style.backgroundPosition = `${x}px ${y}px`;
            
            // Add click listener only to non-empty tiles
            tile.onclick = () => moveTile(positionIndex);
        }
        
        board.appendChild(tile);
    });
}

/* --- MOVE LOGIC --- */
function moveTile(currentIndex) {
    const emptyIndex = tiles.indexOf(8); // Find where the empty slot is
    
    if (isAdjacent(currentIndex, emptyIndex)) {
        // Swap in the array
        [tiles[currentIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[currentIndex]];
        
        // Re-draw the board
        renderBoard();
        
        // Check if won
        checkWin();
    }
}

/* --- ADJACENCY CHECK --- */
// Checks if the clicked tile is Up, Down, Left, or Right of the empty slot
function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    const totalDiff = Math.abs(row1 - row2) + Math.abs(col1 - col2);
    
    // Total difference must be exactly 1 (meaning adjacent, no diagonals)
    return totalDiff === 1;
}

/* --- SHUFFLE --- */
// To guarantee the puzzle is solvable, we don't randomize the array.
// Instead, we perform many random valid moves.
function shuffleGame() {
    winBox.classList.add("hidden");
    
    // Reset to solved state first
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    let moveCount = 0;
    const totalMoves = 500; // How much to shuffle
    
    // Use an interval to animate the shuffle (optional) or just loop instantly
    // Here we do it instantly for speed
    while (moveCount < totalMoves) {
        const emptyIndex = tiles.indexOf(8);
        const neighbors = [];
        
        // Find all valid neighbors
        for (let i = 0; i < 9; i++) {
            if (isAdjacent(i, emptyIndex)) neighbors.push(i);
        }
        
        // Pick a random neighbor
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Swap
        [tiles[emptyIndex], tiles[randomNeighbor]] = [tiles[randomNeighbor], tiles[emptyIndex]];
        
        moveCount++;
    }
    
    renderBoard();
}

/* --- WIN CHECK --- */
function checkWin() {
    // A win means the array is perfectly sorted: [0, 1, 2... 8]
    const isSolved = tiles.every((val, index) => val === index);
    
    if (isSolved) {
        winBox.classList.remove("hidden");
    }
}

// Start
initGame();