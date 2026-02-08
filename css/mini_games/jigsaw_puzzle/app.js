const IMAGE_URL = 'wooden_handmade_model_ship.jpg'; 
const ROWS = 5;
const COLS = 5;
const SNAP_TOLERANCE = 50; 
const RETURN_DELAY = 1500; 

let pieces = [];
let puzzleImage = new Image();
let pieceWidth, pieceHeight;
let tabSize; 
let activePlaceholder = null;

const board = document.getElementById('puzzle-board');
const tray = document.getElementById('pieces-tray');
const winScreen = document.getElementById('win-screen');

// --- BILINGUAL TUTORIAL MODULE ---
const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Drag & Drop",
        step1Desc: "Drag pieces from the tray onto the board to rebuild the image.",
        step2Head: "Snap to Lock",
        step2Desc: "A green flash means the piece is in the right spot and locked.",
        step3Head: "Winning",
        step3Desc: "Place all pieces correctly to complete the puzzle!",
        closeBtn: "CLOSE"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Σύρε & Άφησε",
        step1Desc: "Σύρετε τα κομμάτια από το δίσκο στο ταμπλό για να φτιάξετε την εικόνα.",
        step2Head: "Κλείδωμα",
        step2Desc: "Η πράσινη λάμψη σημαίνει ότι το κομμάτι είναι στη σωστή θέση.",
        step3Head: "Νίκη",
        step3Desc: "Τοποθετήστε όλα τα κομμάτια σωστά για να κερδίσετε!",
        closeBtn: "ΚΛΕΙΣΙΜΟ"
    }
};

window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    if(modal) modal.classList.toggle('show');
}

function updateTutorialLanguage() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en';
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') lang = 'gr';
    const t = tutorialData[lang];
    document.getElementById('tut-title').innerText = t.title;
    document.getElementById('tut-step1-head').innerText = t.step1Head;
    document.getElementById('tut-step1-desc').innerText = t.step1Desc;
    document.getElementById('tut-step2-head').innerText = t.step2Head;
    document.getElementById('tut-step2-desc').innerText = t.step2Desc;
    document.getElementById('tut-step3-head').innerText = t.step3Head;
    document.getElementById('tut-step3-desc').innerText = t.step3Desc;
    document.getElementById('tut-close-btn').innerText = t.closeBtn;
}

// --- INITIALIZATION ---
puzzleImage.src = IMAGE_URL;
puzzleImage.onload = () => { initializeGame(); };

window.addEventListener('resize', () => {
    clearTimeout(window.resTimer);
    window.resTimer = setTimeout(() => location.reload(), 500);
});

function initializeGame() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const marginX = 40; const marginY = 80; 
    const screenW = window.innerWidth - marginX;
    const screenH = window.innerHeight - marginY;
    let maxBoardW = isLandscape ? screenW * 0.70 : screenW;
    let maxBoardH = isLandscape ? screenH : screenH * 0.55;

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

    updateTutorialLanguage();
    toggleTutorial(); 
    generatePieces(boardWidth, boardHeight);
}

function generatePieces(boardW, boardH) {
    pieces = []; tray.innerHTML = ''; 
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
    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => tray.appendChild(p.canvas));
}

function createPieceCanvas(r, c, shape, boardW, boardH) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const totalW = pieceWidth + (tabSize * 2);
    const totalH = pieceHeight + (tabSize * 2);
    canvas.width = totalW; canvas.height = totalH;
    canvas.className = 'jigsaw-piece in-tray';
    canvas.dataset.correctX = c * pieceWidth;
    canvas.dataset.correctY = r * pieceHeight;
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

function addDragLogic(el) {
    let shiftX, shiftY;
    const onPointerDown = (e) => {
        if (el.classList.contains('snapped')) return;
        if (el.returnTimer) { clearTimeout(el.returnTimer); el.returnTimer = null; el.classList.remove('wrong'); }
        el.setPointerCapture(e.pointerId);
        const rect = el.getBoundingClientRect();
        shiftX = e.clientX - rect.left;
        shiftY = e.clientY - rect.top;
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

function createPlaceholder(el) {
    if (activePlaceholder) return; 
    activePlaceholder = document.createElement('div');
    activePlaceholder.style.width = el.width + 'px';
    activePlaceholder.style.height = el.height + 'px';
    activePlaceholder.style.margin = '10px'; 
    activePlaceholder.style.visibility = 'hidden'; 
    tray.insertBefore(activePlaceholder, el);
}

function checkSnap(el) {
    const rect = el.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    const targetX = boardRect.left + parseFloat(el.dataset.correctX) - tabSize;
    const targetY = boardRect.top + parseFloat(el.dataset.correctY) - tabSize;
    const dist = Math.hypot(rect.left - targetX, rect.top - targetY);
    if (dist < SNAP_TOLERANCE) {
        if (activePlaceholder) activePlaceholder.remove();
        activePlaceholder = null;
        board.appendChild(el);
        el.style.left = (parseFloat(el.dataset.correctX) - tabSize) + 'px';
        el.style.top = (parseFloat(el.dataset.correctY) - tabSize) + 'px';
        el.classList.add('snapped');
        const pObj = pieces.find(p => p.canvas === el);
        if(pObj) pObj.isLocked = true;
        checkWin();
    } else {
        el.classList.add('wrong');
        el.returnTimer = setTimeout(() => {
            el.classList.remove('wrong');
            returnToTray(el);
        }, RETURN_DELAY); 
    }
}

function returnToTray(el) {
    el.style.position = ''; 
    el.classList.add('in-tray');
    if (activePlaceholder) {
        tray.replaceChild(el, activePlaceholder);
        activePlaceholder = null; 
    } else {
        tray.appendChild(el);
    }
}

function checkWin() {
    if (pieces.every(p => p.isLocked)) {
        setTimeout(() => { 
            winScreen.classList.remove('hidden'); 
            if (typeof setFlag === 'function') {
                setFlag('Medal_Puzzle_solved', true);
                window.location.href = "../../rooms/room_6.html";
            }
        }, 500);
    }
}