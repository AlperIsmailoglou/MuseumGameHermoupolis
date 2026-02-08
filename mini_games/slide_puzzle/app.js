
const gridSize = 3; 
const tileSize = 125; 
const gapSize = 2;    
const imageSize = 375; 
const imgPath = "chinese_statue.jpg"; 

const board = document.getElementById("board");
const winBox = document.getElementById("win-message");
const startBtn = document.getElementById("start-btn");

let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let isGameActive = false; 

let activeTile = null;
let startX = 0, startY = 0;
let moveAxis = null; 
let minMove = 0, maxMove = 0;
let currentTranslate = 0; 
let dragRaf = null; 
let resetTimer = null; 


const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Objective",
        step1Desc: "Click 'Start Game' to shuffle the tiles.",
        step2Head: "Controls",
        step2Desc: "Drag tiles into the empty slot to move them.",
        step3Head: "Winning",
        step3Desc: "Arrange the numbers 1-8 in order to reveal the image.",
        closeBtn: "CLOSE"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Στόχος",
        step1Desc: "Πάτα 'Start Game' για να ανακατέψεις τα πλακίδια.",
        step2Head: "Χειρισμός",
        step2Desc: "Σύρε τα πλακίδια στο κενό για να τα μετακινήσεις.",
        step3Head: "Νίκη",
        step3Desc: "Βάλε τους αριθμούς 1-8 στη σειρά για να φτιάξεις την εικόνα.",
        closeBtn: "ΚΛΕΙΣΙΜΟ"
    }
};
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

function updateTutorialLanguage() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en'; 
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        lang = 'gr';
    }

    const t = tutorialData[lang];
    
    if(document.getElementById('tut-title')) 
        document.getElementById('tut-title').innerText = t.title;
    
    if(document.getElementById('tut-step1-head')) {
        document.getElementById('tut-step1-head').innerText = t.step1Head;
        document.getElementById('tut-step1-desc').innerText = t.step1Desc;
    }
    
    if(document.getElementById('tut-step2-head')) {
        document.getElementById('tut-step2-head').innerText = t.step2Head;
        document.getElementById('tut-step2-desc').innerText = t.step2Desc;
    }
    
    if(document.getElementById('tut-step3-head')) {
        document.getElementById('tut-step3-head').innerText = t.step3Head;
        document.getElementById('tut-step3-desc').innerText = t.step3Desc;
    }
    
    if(document.getElementById('tut-close-btn'))
        document.getElementById('tut-close-btn').innerText = t.closeBtn;
}

function initTutorial() {
    updateTutorialLanguage();
    
    const modal = document.getElementById('tutorial-modal');
    if (modal && !modal.classList.contains('show')) {
        toggleTutorial();
    }
}

function initGame() {
    renderBoard();
    board.classList.add("locked"); 
    
    initTutorial();
}


function renderBoard() {
    board.innerHTML = "";
    
    tiles.forEach((tileIndex, positionIndex) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.posIndex = positionIndex;
        
        if (tileIndex === 8) {
            tile.classList.add("empty");
        } else {
            const tileW = imageSize / gridSize;
            const bgX = -(tileIndex % gridSize) * tileW;
            const bgY = -Math.floor(tileIndex / gridSize) * tileW;
            
            tile.style.backgroundImage = `url("${imgPath}")`;
            tile.style.backgroundSize = `${imageSize}px ${imageSize}px`;
            tile.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            const numberSpan = document.createElement("span");
            numberSpan.classList.add("number");
            numberSpan.innerText = tileIndex + 1; 
            tile.appendChild(numberSpan);

            tile.addEventListener('pointerdown', (e) => handlePointerDown(e));
        }
        board.appendChild(tile);
    });
}

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

function skipGame() {
    if (!confirm("Are you sure you want to skip this puzzle?")) {
        return; 
    }
    isGameActive = false;
    board.classList.add("locked");
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8]; 
    renderBoard();

    winBox.textContent = "Puzzle Skipped!"; 
    winBox.classList.remove("hidden");
    startBtn.style.display = "none"; 
    const skipBtn = document.getElementById("skip-btn");
    if(skipBtn) skipBtn.style.display = "none"; 

    if (typeof setFlag === "function") {
        setFlag('statue_game_solved', true);
    } 

    setTimeout(() => {
        window.location.href = "../../rooms/room_1.html";
    }, 1500); 
}

function handlePointerDown(e) {
    if (!isGameActive) return; 

    if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
        if (activeTile) {
            activeTile.style.transition = "";
            activeTile.style.transform = "";
            activeTile = null;
        }
    }

    const tile = e.target;
    const posIndex = parseInt(tile.dataset.posIndex);
    const emptyIndex = tiles.indexOf(8);
    
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
    let delta = (moveAxis === 'x') ? e.clientX - startX : e.clientY - startY;
    delta = Math.max(minMove, Math.min(delta, maxMove));
    currentTranslate = delta;

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
    if (dragRaf) {
        cancelAnimationFrame(dragRaf);
        dragRaf = null;
    }

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
        
        activeTile = null; 
        renderBoard();
        checkWin();
    } else {
        activeTile.style.transition = "transform 0.2s ease-out";
        activeTile.style.transform = "translate(0, 0)";
        const tileToReset = activeTile;
        resetTimer = setTimeout(() => { 
            if(tileToReset) tileToReset.style.transition = ""; 
            if (activeTile === tileToReset) activeTile = null; 
            resetTimer = null;
        }, 200);
    }
}

function checkWin() {
    if (!isGameActive) return;
    const isSolved = tiles.every((val, index) => val === index);
    if (isSolved) {
        winBox.classList.remove("hidden");
        isGameActive = false;
        board.classList.add("locked");
        startBtn.textContent = "Play Again";

        if (typeof setFlag === "function") {
            setFlag('statue_game_solved', true);
        } 
        setTimeout(() => {
            window.location.href = "../../rooms/room_1.html";
        }, 2000);
    }
}

initGame();