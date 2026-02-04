
const gridSize = 3; 
const imageSize = 300; 
const imgPath = "chinese_statue.jpg"; 
const board = document.getElementById("board");
const winBox = document.getElementById("win-message");


let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function initGame() {
    renderBoard();

}

function renderBoard() {
    board.innerHTML = "";
    
    tiles.forEach((tileIndex, positionIndex) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        
        if (tileIndex === 8) {
            tile.classList.add("empty");
        } else {
         
            const tileW = imageSize / gridSize;
            const x = -(tileIndex % gridSize) * tileW;
            const y = -Math.floor(tileIndex / gridSize) * tileW;
            
            tile.style.backgroundImage = `url("${imgPath}")`;
            tile.style.backgroundSize = `${imageSize}px ${imageSize}px`;
            tile.style.backgroundPosition = `${x}px ${y}px`;
            
            tile.onclick = () => moveTile(positionIndex);
        }
        
        board.appendChild(tile);
    });
}

/* --- MOVE LOGIC --- */
function moveTile(currentIndex) {
    const emptyIndex = tiles.indexOf(8); 
    
    if (isAdjacent(currentIndex, emptyIndex)) {
        
        [tiles[currentIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[currentIndex]];
        
        
        renderBoard();
        
      
        checkWin();
    }
}

function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    const totalDiff = Math.abs(row1 - row2) + Math.abs(col1 - col2);
    
    return totalDiff === 1;
}

function shuffleGame() {
    winBox.classList.add("hidden");
    
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    let moveCount = 0;
    const totalMoves = 500;
    
    while (moveCount < totalMoves) {
        const emptyIndex = tiles.indexOf(8);
        const neighbors = [];
        
        for (let i = 0; i < 9; i++) {
            if (isAdjacent(i, emptyIndex)) neighbors.push(i);
        }
        
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        [tiles[emptyIndex], tiles[randomNeighbor]] = [tiles[randomNeighbor], tiles[emptyIndex]];
        
        moveCount++;
    }
    
    renderBoard();
}

function checkWin() {
    const isSolved = tiles.every((val, index) => val === index);
    
    if (isSolved) {
        winBox.classList.remove("hidden");
    }
}

initGame();