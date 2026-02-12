/* app.js */

const IMAGE_SRC = 'plate.jpg'; 
const PIECE_COUNT_MIN = 12;
const PIECE_COUNT_MAX = 20; 
const SNAP_TOLERANCE = 60; 
const RETURN_DELAY = 1000; 

let pieces = [];
let visualScale = 1;
let selectedPiece = null;
let offset = { x: 0, y: 0 };
let zIndexCounter = 100;
let lockedCount = 0;

const ghostImg = document.getElementById('ghost-image');
const playZone = document.getElementById('play-zone');
const pieceTray = document.getElementById('piece-tray');
const winScreen = document.getElementById('win-screen');
const resetBtn = document.getElementById('reset-btn');
const continueBtn = document.getElementById('play-again-btn'); 

function initGame() {
    document.querySelectorAll('.puzzle-piece').forEach(el => el.remove());
    document.querySelectorAll('.flash-overlay').forEach(el => el.remove());
    pieces = [];
    lockedCount = 0;
    winScreen.classList.add('hidden');
    
    const img = new Image();
    img.src = IMAGE_SRC;
    
    img.onload = () => {
        ghostImg.src = img.src;
        setTimeout(() => {
            setupBoard(img);
            createPuzzlePieces(img);
        }, 100);
    };

    initTutorial();
}

window.onload = initGame;
resetBtn.addEventListener('click', initGame);

continueBtn.addEventListener('click', () => {
    window.location.href = "../../rooms/room_1.html";
});

window.onresize = () => {
    setTimeout(() => {
        const img = new Image();
        img.src = IMAGE_SRC;
        img.onload = () => setupBoard(img);
    }, 200);
};

function setupBoard(naturalImg) {
    const boardContainer = document.getElementById('puzzle-board');
    if (!boardContainer) return;

    const availWidth = boardContainer.clientWidth - 20;
    const availHeight = boardContainer.clientHeight - 20;
    
    const imgRatio = naturalImg.naturalWidth / naturalImg.naturalHeight;
    const boxRatio = availWidth / availHeight;
    
    let renderWidth, renderHeight;
    
    if (imgRatio > boxRatio) {
        renderWidth = availWidth;
        renderHeight = availWidth / imgRatio;
    } else {
        renderHeight = availHeight;
        renderWidth = availHeight * imgRatio;
    }
    
    playZone.style.width = renderWidth + 'px';
    playZone.style.height = renderHeight + 'px';
    visualScale = renderWidth / naturalImg.naturalWidth;
}

function createPuzzlePieces(image) {
    const totalPieces = Math.floor(Math.random() * (PIECE_COUNT_MAX - PIECE_COUNT_MIN + 1)) + PIECE_COUNT_MIN;
    const cols = Math.ceil(Math.sqrt(totalPieces));
    const rows = Math.ceil(totalPieces / cols);
    const pieceWidth = image.width / cols;
    const pieceHeight = image.height / rows;

    const vertices = [];
    for (let y = 0; y <= rows; y++) {
        const rowVertices = [];
        for (let x = 0; x <= cols; x++) {
            let vx = x * pieceWidth;
            let vy = y * pieceHeight;
            if (x > 0 && x < cols && y > 0 && y < rows) {
                const jitter = Math.min(pieceWidth, pieceHeight) * 0.25;
                vx += (Math.random() - 0.5) * jitter;
                vy += (Math.random() - 0.5) * jitter;
            }
            rowVertices.push({x: vx, y: vy});
        }
        vertices.push(rowVertices);
    }

    const createShard = (points) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const minX = Math.min(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxX = Math.max(...points.map(p => p.x));
        const maxY = Math.max(...points.map(p => p.y));
        const w = maxX - minX;
        const h = maxY - minY;

        canvas.width = w;
        canvas.height = h;
        canvas.style.width = (w * visualScale) + 'px';
        canvas.style.height = (h * visualScale) + 'px';
        canvas.className = 'puzzle-piece';
        
        ctx.beginPath();
        ctx.moveTo(points[0].x - minX, points[0].y - minY);
        for(let i=1; i<points.length; i++) {
            ctx.lineTo(points[i].x - minX, points[i].y - minY);
        }
        ctx.closePath();
        ctx.clip(); 
        ctx.drawImage(image, minX, minY, w, h, 0, 0, w, h);
        
        canvas.dataset.correctX = minX;
        canvas.dataset.correctY = minY;
        canvas.dataset.isLocked = "false";
        
        document.body.appendChild(canvas);
        spawnPieceInTray(canvas);
        addDragListeners(canvas);
        pieces.push(canvas);
    };

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const p1 = vertices[y][x];
            const p2 = vertices[y][x+1];
            const p3 = vertices[y+1][x+1];
            const p4 = vertices[y+1][x];
            if (Math.random() > 0.5) {
                createShard([p1, p2, p3]);
                createShard([p1, p3, p4]);
            } else {
                createShard([p1, p2, p3, p4]);
            }
        }
    }
}

function spawnPieceInTray(piece) {
    const tRect = pieceTray.getBoundingClientRect();
    const pRect = piece.getBoundingClientRect();
    const maxX = tRect.width - pRect.width;
    const maxY = tRect.height - pRect.height;
    
    if (maxX <= 0 || maxY <= 0) {
        piece.style.left = tRect.left + 'px';
        piece.style.top = tRect.top + 'px';
        return;
    }

    let randX, randY;
    let attempts = 0;
    
    do {
        randX = tRect.left + (Math.random() * maxX);
        randY = tRect.top + (Math.random() * maxY);
        attempts++;
    } while (attempts < 5); 

    piece.style.left = randX + 'px';
    piece.style.top = randY + 'px';
    piece.dataset.trayX = randX;
    piece.dataset.trayY = randY;
}

function addDragListeners(el) {
    el.addEventListener('mousedown', handleStart);
    el.addEventListener('touchstart', handleStart, {passive: false});
}

function handleStart(e) {
    if (e.target.dataset.isLocked === "true") return;
    
    e.preventDefault(); 
    selectedPiece = e.target;
    selectedPiece.style.zIndex = ++zIndexCounter;
    if (selectedPiece.returnTimer) {
        clearTimeout(selectedPiece.returnTimer);
        selectedPiece.returnTimer = null;
    }

    let clientX, clientY;
    
    if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        window.addEventListener('touchmove', handleMove, {passive: false});
        window.addEventListener('touchend', handleEnd);
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
    }

    const rect = selectedPiece.getBoundingClientRect();
    offset.x = clientX - rect.left;
    offset.y = clientY - rect.top;
}

function handleMove(e) {
    if (!selectedPiece) return;
    e.preventDefault();

    let clientX, clientY;

    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    selectedPiece.style.left = (clientX - offset.x) + 'px';
    selectedPiece.style.top = (clientY - offset.y) + 'px';
}

function handleEnd(e) {
    if (!selectedPiece) return;
    
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);

    checkPosition(selectedPiece);
    selectedPiece = null;
}

function createFlashOverlay(piece, color) {
    const flashCanvas = document.createElement('canvas');
    flashCanvas.width = piece.width;
    flashCanvas.height = piece.height;
    flashCanvas.style.width = piece.style.width;
    flashCanvas.style.height = piece.style.height;
    flashCanvas.className = 'flash-overlay'; 
    
    const ctx = flashCanvas.getContext('2d');
    ctx.drawImage(piece, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, flashCanvas.width, flashCanvas.height);
    
    const rect = piece.getBoundingClientRect();
    flashCanvas.style.left = rect.left + 'px';
    flashCanvas.style.top = rect.top + 'px';
    
    document.body.appendChild(flashCanvas);
    
    setTimeout(() => { flashCanvas.style.opacity = '0'; }, 50);
    setTimeout(() => { flashCanvas.remove(); }, 600);
}

function checkPosition(piece) {
    const zoneRect = playZone.getBoundingClientRect();
    const correctLeft = parseFloat(piece.dataset.correctX) * visualScale;
    const correctTop = parseFloat(piece.dataset.correctY) * visualScale;
    const targetAbsX = zoneRect.left + correctLeft;
    const targetAbsY = zoneRect.top + correctTop;

    const currentRect = piece.getBoundingClientRect();
    const dist = Math.hypot(currentRect.left - targetAbsX, currentRect.top - targetAbsY);

    if (dist < SNAP_TOLERANCE) {
        snapToGrid(piece, targetAbsX, targetAbsY);
    } else {
        returnToTrayAnimated(piece);
    }
}

function snapToGrid(piece, x, y) {
    if (piece.returnTimer) {
        clearTimeout(piece.returnTimer);
        piece.returnTimer = null;
    }

    piece.style.left = x + 'px';
    piece.style.top = y + 'px';
    
    createFlashOverlay(piece, '#2ecc71'); // Green Flash
    
    piece.classList.add('locked');
    piece.dataset.isLocked = "true";
    
    lockedCount++;
    
    if (lockedCount === pieces.length) {
        if (typeof setFlag === 'function') {
            setFlag('Broken_plate_solved', true);
        } else {
            console.log("Game Won! Flag set.");
        }
        setTimeout(() => {
            winScreen.classList.remove('hidden');
        }, 500);
    }
}

function returnToTrayAnimated(piece) {
    createFlashOverlay(piece, '#e74c3c'); // Red Flash
    
    if (piece.returnTimer) clearTimeout(piece.returnTimer);

    piece.returnTimer = setTimeout(() => {
        piece.style.left = piece.dataset.trayX + 'px';
        piece.style.top = piece.dataset.trayY + 'px';
        piece.returnTimer = null; 
    }, RETURN_DELAY);
}


const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Drag & Drop",
        step1Desc: "Drag the broken pieces from the tray to the board.",
        step2Head: "Snap to Lock",
        step2Desc: "If the position is correct, the piece flashes green and locks.",
        step3Head: "Watch Out",
        step3Desc: "Incorrect pieces flash red and return to the tray after 1 second.",
        closeBtn: "CLOSE",
        winTitle: "Restored!",
        winDesc: "The plate is whole again.",
        winBtn: "Continue Adventure",
        winTitle: "Restored!",
        winDesc: "The plate is whole again.",
        winBtn: "Continue Adventure"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Σύρε & Άσε",
        step1Desc: "Σύρε τα σπασμένα κομμάτια από τον δίσκο στον πίνακα.",
        step2Head: "Κλείδωμα",
        step2Desc: "Αν η θέση είναι σωστή, το κομμάτι πρασινίζει και κλειδώνει.",
        step3Head: "Προσοχή",
        step3Desc: "Τα λάθος κομμάτια κοκκινίζουν και επιστρέφουν στον δίσκο.",
        closeBtn: "ΚΛΕΙΣΙΜΟ",
        winTitle: "Αποκαταστάθηκε!",
        winDesc: "Το πιάτο είναι και πάλι ολόκληρο.",
        winBtn: "Συνέχεια Περιπέτειας",
        
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
   
    if(document.getElementById('win-title'))
        document.getElementById('win-title').innerText = t.winTitle;

    if(document.getElementById('win-desc'))
        document.getElementById('win-desc').innerText = t.winDesc;

    if(document.getElementById('play-again-btn'))
        document.getElementById('play-again-btn').innerText = t.winBtn;

}

function initTutorial() {
    updateTutorialLanguage();
    
    const modal = document.getElementById('tutorial-modal');
  
    if (modal && !modal.classList.contains('show')) {
        toggleTutorial();
    }
}