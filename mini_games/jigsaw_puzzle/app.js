// --- CONFIGURATION ---
const IMAGE_URL = 'wooden_handmade_model_ship.jpg'; 

const ROWS = 5;
const COLS = 5;
const SNAP_TOLERANCE = 50; 
const RETURN_DELAY = 1500; // Time to wait (1.5 seconds)

// --- STATE ---
let pieces = [];
let puzzleImage = new Image();
let pieceWidth, pieceHeight;
let tabSize; 
let activePlaceholder = null;

const board = document.getElementById('puzzle-board');
const tray = document.getElementById('pieces-tray');
const winScreen = document.getElementById('win-screen');

// Add this to your mini-game JavaScript or HTML head
(function() {
    // Store the initial orientation to compare later
    let currentOrientation = screen.orientation ? screen.orientation.type : window.orientation;

    const handleRotation = () => {
        // 1. Wait briefly for the device to finish the physical rotation animation
        setTimeout(() => {
            // 2. Check the new orientation
            const newOrientation = screen.orientation ? screen.orientation.type : window.orientation;

            // 3. Only reload if the orientation effectively changed (e.g. Portrait -> Landscape)
            // This prevents phantom reloads on minor sensor jitters
            if (newOrientation !== currentOrientation) {
                console.log("System: Orientation changed. Reloading layout...");
                window.location.reload();
            }
        }, 300); // 300ms delay is usually safe for all mobile browsers
    };

    // Listen for the event
    window.addEventListener('orientationchange', handleRotation);
    
    // Fallback for some Android devices that treat rotation as a resize
    window.addEventListener('resize', () => {
        // We check dimensions to see if the aspect ratio flipped
        if (window.innerWidth > window.innerHeight && currentOrientation.includes('portrait')) {
             handleRotation();
        }
    });
})();

// --- INITIALIZATION ---
puzzleImage.src = IMAGE_URL;
puzzleImage.onload = () => { initializeGame(); };

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { location.reload(); }, 500);
});

window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    if(modal) modal.classList.toggle('show');
}

function initializeGame() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const marginX = 40; 
    const marginY = 80; 
    
    const screenW = window.innerWidth - marginX;
    const screenH = window.innerHeight - marginY;

    let maxBoardW, maxBoardH;

    if (isLandscape) {
        maxBoardW = screenW * 0.70; 
        maxBoardH = screenH;        
    } else {
        maxBoardW = screenW;        
        maxBoardH = screenH * 0.55; 
    }

    const imgRatio = puzzleImage.width / puzzleImage.height;
    let boardWidth = maxBoardW;
    let boardHeight = maxBoardW / imgRatio;

    if (boardHeight > maxBoardH) {
        boardHeight = maxBoardH;
        boardWidth = maxBoardH * imgRatio;
    }

    board.style.width = boardWidth + 'px';
    board.style.height = boardHeight + 'px';
    
    document.getElementById('puzzle-guide').style.backgroundImage = `url(${IMAGE_URL})`;

    pieceWidth = boardWidth / COLS;
    pieceHeight = boardHeight / ROWS;
    tabSize = Math.min(pieceWidth, pieceHeight) * 0.20; 

    if(winScreen) winScreen.classList.add('hidden');
    
    const modal = document.getElementById('tutorial-modal');
    if (modal && !modal.classList.contains('show')) window.toggleTutorial();

    generatePieces(boardWidth, boardHeight);
}

// --- GENERATION ---
function generatePieces(boardW, boardH) {
    pieces = [];
    tray.innerHTML = ''; 
    const shapeMap = [];
    
    for(let r=0; r<ROWS; r++) {
        shapeMap[r] = [];
        for(let c=0; c<COLS; c++) {
            shapeMap[r][c] = {
                top: (r === 0) ? 0 : shapeMap[r-1][c].bottom * -1,
                right: (c === COLS-1) ? 0 : (Math.random() > 0.5 ? 1 : -1),
                bottom: (r === ROWS-1) ? 0 : (Math.random() > 0.5 ? 1 : -1),
                left: (c === 0) ? 0 : shapeMap[r][c-1].right * -1
            };
        }
    }

    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            createPieceCanvas(r, c, shapeMap[r][c], boardW, boardH);
        }
    }
    
    const fragment = document.createDocumentFragment();
    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => fragment.appendChild(p.canvas));
    tray.appendChild(fragment);
}

function createPieceCanvas(r, c, shape, boardW, boardH) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const totalW = pieceWidth + (tabSize * 2);
    const totalH = pieceHeight + (tabSize * 2);

    canvas.width = totalW;
    canvas.height = totalH;
    canvas.className = 'jigsaw-piece in-tray';
    
    canvas.dataset.correctX = c * pieceWidth;
    canvas.dataset.correctY = r * pieceHeight;
    canvas.dataset.r = r;
    canvas.dataset.c = c;

    ctx.translate(tabSize, tabSize);
    ctx.beginPath();
    drawSimplePiecePath(ctx, pieceWidth, pieceHeight, shape);
    ctx.clip();

    const srcX = (c * pieceWidth) - tabSize;
    const srcY = (r * pieceHeight) - tabSize;
    
    ctx.drawImage(puzzleImage, 0, 0, puzzleImage.width, puzzleImage.height, -srcX - tabSize, -srcY - tabSize, boardW, boardH);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();

    addDragLogic(canvas);
    pieces.push({ canvas: canvas, isLocked: false });
}

function drawSimplePiecePath(ctx, w, h, shape) {
    const r = tabSize;
    ctx.moveTo(0, 0);
    if (shape.top === 0) ctx.lineTo(w, 0); else { ctx.lineTo(w/2 - r, 0); ctx.arc(w/2, 0, r, Math.PI, 0, shape.top === 1); ctx.lineTo(w, 0); }
    if (shape.right === 0) ctx.lineTo(w, h); else { ctx.lineTo(w, h/2 - r); ctx.arc(w, h/2, r, 1.5 * Math.PI, 0.5 * Math.PI, shape.right === 1); ctx.lineTo(w, h); }
    if (shape.bottom === 0) ctx.lineTo(0, h); else { ctx.lineTo(w/2 + r, h); ctx.arc(w/2, h, r, 0, Math.PI, shape.bottom === 1); ctx.lineTo(0, h); }
    if (shape.left === 0) ctx.lineTo(0, 0); else { ctx.lineTo(0, h/2 + r); ctx.arc(0, h/2, r, 0.5 * Math.PI, 1.5 * Math.PI, shape.left === 1); ctx.lineTo(0, 0); }
}

// --- DRAG LOGIC (Pointer Events) ---

function addDragLogic(el) {
    let shiftX, shiftY;

    const onPointerDown = (e) => {
        if (el.classList.contains('snapped')) return;
        
        // --- CATCH THE PIECE LOGIC ---
        // If the piece is waiting to return (timer active), cancel it!
        if (el.returnTimer) {
            clearTimeout(el.returnTimer);
            el.returnTimer = null;
            el.classList.remove('wrong'); // Stop red flash
            // Note: We leave the placeholder alone in the tray 
            // so the hole remains waiting for this piece.
        }
        // -----------------------------

        el.setPointerCapture(e.pointerId);
        e.preventDefault(); 
        
        const rect = el.getBoundingClientRect();
        shiftX = e.clientX - rect.left;
        shiftY = e.clientY - rect.top;

        // If picking up from tray (fresh pick)
        if (el.classList.contains('in-tray')) {
            createPlaceholder(el);
            el.classList.remove('in-tray');
            document.body.appendChild(el);
            
            el.style.left = (e.clientX - shiftX) + 'px';
            el.style.top = (e.clientY - shiftY) + 'px';
            el.style.position = 'absolute'; 
        }

        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
        e.preventDefault();
        el.style.left = (e.clientX - shiftX) + 'px';
        el.style.top = (e.clientY - shiftY) + 'px';
    };

    const onPointerUp = (e) => {
        el.releasePointerCapture(e.pointerId);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        checkSnap(el);
    };

    el.addEventListener('pointerdown', onPointerDown);
}

// --- PLACEHOLDER UTILS ---
function createPlaceholder(el) {
    if (activePlaceholder) return; 

    activePlaceholder = document.createElement('div');
    activePlaceholder.style.width = el.width + 'px';
    activePlaceholder.style.height = el.height + 'px';
    activePlaceholder.style.margin = '10px'; 
    activePlaceholder.style.flexShrink = '0'; 
    activePlaceholder.style.visibility = 'hidden'; 
    activePlaceholder.style.pointerEvents = 'none'; 
    
    if(el.parentNode === tray) {
        tray.insertBefore(activePlaceholder, el);
    } else {
        tray.appendChild(activePlaceholder);
    }
}

function removePlaceholder() {
    if (activePlaceholder && activePlaceholder.parentNode) {
        activePlaceholder.parentNode.removeChild(activePlaceholder);
    }
    activePlaceholder = null;
}

// --- SNAP & RETURN LOGIC ---
function checkSnap(el) {
    const rect = el.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

    const targetX = boardRect.left + parseFloat(el.dataset.correctX) - tabSize;
    const targetY = boardRect.top + parseFloat(el.dataset.correctY) - tabSize;

    const dist = Math.hypot(rect.left - targetX, rect.top - targetY);

    if (dist < SNAP_TOLERANCE) {
        // --- SUCCESS ---
        if (el.returnTimer) { clearTimeout(el.returnTimer); el.returnTimer = null; }
        
        removePlaceholder(); 
        board.appendChild(el);
        
        el.style.left = (parseFloat(el.dataset.correctX) - tabSize) + 'px';
        el.style.top = (parseFloat(el.dataset.correctY) - tabSize) + 'px';
        el.classList.add('snapped');
        el.classList.remove('wrong');
        
        const pObj = pieces.find(p => p.canvas === el);
        if(pObj) pObj.isLocked = true;
        checkWin();
    } else {
        // --- FAIL ---
        el.classList.add('wrong');
        
        // Cancel previous timer if it exists (rapid clicking)
        if (el.returnTimer) clearTimeout(el.returnTimer);
        
        // Set new timer
        el.returnTimer = setTimeout(() => {
            el.classList.remove('wrong');
            returnToTray(el);
            el.returnTimer = null;
        }, RETURN_DELAY); 
    }
}

function returnToTray(el) {
    el.style.position = ''; 
    el.style.left = '';
    el.style.top = '';
    el.classList.add('in-tray');
    
    // STRICT SWAP: Put element exactly where placeholder is
    if (activePlaceholder && activePlaceholder.parentNode === tray) {
        tray.replaceChild(el, activePlaceholder);
        activePlaceholder = null; 
    } else {
        tray.appendChild(el);
    }
}

function checkWin() {
    if (pieces.length === 0) return;
    if (pieces.every(p => p.isLocked)) {
        setTimeout(() => { 
            const screen = document.getElementById('win-screen');
            screen.classList.remove('hidden'); 
             if (typeof setFlag === 'function') {
                    setFlag('Medal_Puzzle_solved', true);
                    window.location.href = "../../rooms/room_6.html";
                } else {
                    console.log("Game Won! Flag 'Medal_Puzzle_solved' set to true.");
                }
        }, 300);
    }
}