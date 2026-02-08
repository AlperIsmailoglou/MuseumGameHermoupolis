const canvas = document.getElementById('dirtCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const cleanShoeImg = document.getElementById('cleanShoeImg');
const cloth = document.getElementById('cloth');
const progressBarFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');
const gameArea = document.getElementById('gameArea'); 
const winScreen = document.getElementById('winScreen');

const BRUSH_SIZE = 50; 
const DIRTY_SHOE_URL = 'shoe_polish_dirty.png'; 
const ERASER_STRENGTH = 0.4; 

const HITBOX_CONFIG = {
    x: 24, y: 13, width: 63, height: 40  
};

const SHOW_HITBOX_DEBUG = false; 
const ALPHA_THRESHOLD = 20; 

let gameWon = false; 
let isDraggingRag = false;
let lastX = 0;
let lastY = 0;
let totalVisiblePixels = 0;


const languageData = {
    en: {
        tutTitle: "How to Play",
        tutStep1Head: "Grab the Brush",
        tutStep1Desc: "Touch and drag the brush to pick it up.",
        tutStep2Head: "Scrub Dirt",
        tutStep2Desc: "Rub back and forth over the dirty spots to clean them.",
        tutStep3Head: "Win!",
        tutStep3Desc: "Clean 100% of the shoe to finish the game.",
        tutCloseBtn: "PLAY",
        
        winHeading: "Perfect!",
        winBtn: "Continue To Adventure",
        uiCleaned: "Cleaned:",
        uiInstructions: "Drag the brush to polish!"
    },
    gr: {
        tutTitle: "Πώς να παίξεις",
        tutStep1Head: "Πιάσε τη Βούρτσα",
        tutStep1Desc: "Πάτα και σύρε τη βούρτσα για να την πιάσεις.",
        tutStep2Head: "Τρίψε τη Βρωμιά",
        tutStep2Desc: "Τρίψε πέρα-δώθε στα βρώμικα σημεία για να καθαρίσουν.",
        tutStep3Head: "Νίκη!",
        tutStep3Desc: "Καθάρισε το 100% του παπουτσιού για να κερδίσεις.",
        tutCloseBtn: "ΠΑΙΞΕ",
        
        winHeading: "Τέλεια!",
        winBtn: "Συνέχεια στην Περιπέτεια",
        uiCleaned: "Γυαλίστηκε:", 
        uiInstructions: "Σύρε το βούρτσα για να γυαλίσεις!"
    }
};

window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

function updateLanguage() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en'; 
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        lang = 'gr';
    }

    const t = languageData[lang];
    
    if(document.getElementById('tut-title')) 
        document.getElementById('tut-title').innerText = t.tutTitle;
    
    if(document.getElementById('tut-step1-head')) {
        document.getElementById('tut-step1-head').innerText = t.tutStep1Head;
        document.getElementById('tut-step1-desc').innerText = t.tutStep1Desc;
    }
    
    if(document.getElementById('tut-step2-head')) {
        document.getElementById('tut-step2-head').innerText = t.tutStep2Head;
        document.getElementById('tut-step2-desc').innerText = t.tutStep2Desc;
    }
    
    if(document.getElementById('tut-step3-head')) {
        document.getElementById('tut-step3-head').innerText = t.tutStep3Head;
        document.getElementById('tut-step3-desc').innerText = t.tutStep3Desc;
    }
    
    if(document.getElementById('tut-close-btn'))
        document.getElementById('tut-close-btn').innerText = t.tutCloseBtn;

    if(document.getElementById('win-heading'))
        document.getElementById('win-heading').innerText = t.winHeading;
        
    if(document.getElementById('win-btn'))
        document.getElementById('win-btn').innerText = t.winBtn;
        
    if(document.getElementById('ui-cleaned-label'))
        document.getElementById('ui-cleaned-label').innerText = t.uiCleaned;
        
    if(document.getElementById('ui-instructions'))
        document.getElementById('ui-instructions').innerText = t.uiInstructions;
}

function initTutorial() {
    updateLanguage();
    
    setTimeout(() => {
        const modal = document.getElementById('tutorial-modal');
        if (modal && !modal.classList.contains('show')) {
            toggleTutorial();
        }
    }, 500);
}


function init() {
    if (cleanShoeImg.complete) {
        setupCanvas();
    } else {
        cleanShoeImg.onload = setupCanvas;
    }
    
    setupEventListeners();
    window.addEventListener('resize', setupCanvas);

    initTutorial();
}

function setupCanvas() {
    canvas.width = cleanShoeImg.offsetWidth;
    canvas.height = cleanShoeImg.offsetHeight;
    fillDirt();
}

function fillDirt() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const dirtyImg = new Image();
    dirtyImg.onload = () => {
        ctx.drawImage(dirtyImg, 0, 0, canvas.width, canvas.height);
        calculateInitialPixels();
        
        if (SHOW_HITBOX_DEBUG) {
            drawDebugHitbox();
        }
    };
    
    dirtyImg.onerror = () => console.error("Could not load dirty image");
    if (DIRTY_SHOE_URL) dirtyImg.src = DIRTY_SHOE_URL;
}

function drawDebugHitbox() {
    const rect = getHitboxPixels();
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = canvas.width;
    debugCanvas.height = canvas.height;
    debugCanvas.style.position = 'absolute';
    debugCanvas.style.top = '0';
    debugCanvas.style.left = '0';
    debugCanvas.style.zIndex = '50';
    debugCanvas.style.pointerEvents = 'none'; 
    gameArea.querySelector('.shoe-container').appendChild(debugCanvas);

    const dCtx = debugCanvas.getContext('2d');
    dCtx.strokeStyle = "red";
    dCtx.lineWidth = 4;
    dCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    
    dCtx.fillStyle = "red";
    dCtx.font = "bold 16px Arial";
    dCtx.fillText("PROGRESS AREA", rect.x, rect.y - 10);

    setTimeout(() => debugCanvas.remove(), 5000);
}

function getHitboxPixels() {
    return {
        x: Math.floor(canvas.width * (HITBOX_CONFIG.x / 100)),
        y: Math.floor(canvas.height * (HITBOX_CONFIG.y / 100)),
        w: Math.floor(canvas.width * (HITBOX_CONFIG.width / 100)),
        h: Math.floor(canvas.height * (HITBOX_CONFIG.height / 100))
    };
}

function calculateInitialPixels() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const box = getHitboxPixels();
    
    totalVisiblePixels = 0;

    for (let y = box.y; y < box.y + box.h; y += 4) {
        for (let x = box.x; x < box.x + box.w; x += 4) {
            const index = (y * canvas.width + x) * 4;
            if (index < data.length && data[index + 3] > ALPHA_THRESHOLD) {
                totalVisiblePixels++;
            }
        }
    }
    console.log("Total Countable Pixels in Box:", totalVisiblePixels);
}

function getRelativePos(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const areaRect = gameArea.getBoundingClientRect();

    return {
        x: clientX - areaRect.left,
        y: clientY - areaRect.top,
        globalX: clientX,
        globalY: clientY
    };
}

function startDrag(e) {
    if (gameWon) return; 
    e.preventDefault(); 
    isDraggingRag = true;
    cloth.style.transition = 'none';

    const pos = getRelativePos(e);
    moveClothVisual(pos.x, pos.y);
    
    const canvasRect = canvas.getBoundingClientRect();
    lastX = pos.globalX - canvasRect.left;
    lastY = pos.globalY - canvasRect.top;
}

function endDrag() {
    if (isDraggingRag) {
        isDraggingRag = false;
        cloth.style.transition = 'all 0.5s ease-out';
        cloth.style.top = '';
        cloth.style.left = '';
        updateProgress();
    }
}

function moveDrag(e) {
    if (!isDraggingRag) return;
    e.preventDefault();

    const pos = getRelativePos(e);
    moveClothVisual(pos.x, pos.y);

    const canvasRect = canvas.getBoundingClientRect();
    const canvasX = pos.globalX - canvasRect.left;
    const canvasY = pos.globalY - canvasRect.top;

    if (canvasX >= 0 && canvasX <= canvas.width && canvasY >= 0 && canvasY <= canvas.height) {
        eraseDirt(canvasX, canvasY);
        if (Math.random() < 0.3) updateProgress(); 
    }
    
    [lastX, lastY] = [canvasX, canvasY];
}

function moveClothVisual(x, y) {
    cloth.style.left = (x - cloth.offsetWidth / 2) + 'px';
    cloth.style.top = (y - cloth.offsetHeight / 2) + 'px';
}

function eraseDirt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = `rgba(0,0,0, ${ERASER_STRENGTH})`; 

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function updateProgress() {
    if (gameWon) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const box = getHitboxPixels();
    
    let currentVisiblePixels = 0;

    for (let y = box.y; y < box.y + box.h; y += 4) {
        for (let x = box.x; x < box.x + box.w; x += 4) {
            const index = (y * canvas.width + x) * 4;
            if (index < data.length && data[index + 3] > ALPHA_THRESHOLD) {
                currentVisiblePixels++;
            }
        }
    }
    
    if (totalVisiblePixels === 0) totalVisiblePixels = 1; 

    const cleanedPixels = totalVisiblePixels - currentVisiblePixels;
    let percentage = Math.floor((cleanedPixels / totalVisiblePixels) * 100);

    if (percentage < 0) percentage = 0;
    
    if (percentage > 96) {
        percentage = 100;
        triggerWin();
    }

    progressBarFill.style.width = percentage + '%';
    progressText.innerText = percentage;
}

function triggerWin() {
    gameWon = true;
    isDraggingRag = false;
    
    canvas.style.transition = "opacity 0.5s";
    canvas.style.opacity = "0";

    endDrag(); 
    if (typeof setFlag === "function") {
        setFlag('Shoe_Polish_solved', true);
    }

    setTimeout(() => {
        winScreen.style.display = 'flex'; 
    }, 500); 
}

function setupEventListeners() {
    cloth.addEventListener('mousedown', startDrag);
    cloth.addEventListener('touchstart', startDrag);

    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}

init();