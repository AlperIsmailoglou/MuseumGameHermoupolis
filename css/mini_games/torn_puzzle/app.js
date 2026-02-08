/* ================= GAME STATE ================= */
const State = {
    step: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0, parent: null }
};

/* ================= BILINGUAL TUTORIAL MODULE ================= */
// 1. CONFIGURATION
const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Search",
        step1Desc: "Use buttons to find the piece and glue.",
        step2Head: "Drag & Drop",
        step2Desc: "Drag the piece to the right side of the document.",
        step3Head: "Apply Glue",
        step3Desc: "Drop the glue anywhere on the board to finish.",
        closeBtn: "CLOSE"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Αναζήτηση",
        step1Desc: "Χρησιμοποίησε τα κουμπιά για να βρεις το κομμάτι και την κόλλα.",
        step2Head: "Σύρε & Άσε",
        step2Desc: "Σύρε το κομμάτι στη δεξιά πλευρά του εγγράφου.",
        step3Head: "Κόλλα",
        step3Desc: "Ρίξε την κόλλα οπουδήποτε στον πίνακα για να τελειώσεις.",
        closeBtn: "ΚΛΕΙΣΙΜΟ"
    }
};

// 2. TOGGLE FUNCTION
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

// 3. LANGUAGE UPDATE FUNCTION
function updateTutorialLanguage() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en'; 
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        lang = 'gr';
    }

    const t = tutorialData[lang];
    
    // Safely update DOM
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

// 4. INITIALIZATION
function initTutorial() {
    updateTutorialLanguage();
    
    // Auto-open on start
    const modal = document.getElementById('tutorial-modal');
    if (modal && !modal.classList.contains('show')) {
        toggleTutorial();
    }
}

/* ================= DOM ELEMENTS & INIT ================= */
const els = {
    btnPiece: document.getElementById('btn-search-piece'),
    btnGlue: document.getElementById('btn-search-glue'),
    dragPiece: document.getElementById('draggable-piece'),
    dragGlue: document.getElementById('draggable-glue'),
    boardContainer: document.getElementById('game-board-container'),
    targetPiece: document.getElementById('target-zone-piece'),
    targetGlue: document.getElementById('target-zone-glue'),
    placedPiece: document.getElementById('placed-right-piece'),
    status: document.getElementById('status-bar')
};

window.onload = () => {
    initTutorial();
};

/* ================= GAME LOGIC ================= */
els.btnPiece.addEventListener('click', () => {
    els.status.innerText = "Searching...";
    setTimeout(() => {
        State.step = 2;
        els.btnPiece.classList.add('hidden');
        els.dragPiece.classList.remove('hidden');
        els.status.innerText = "Found it! Drag the piece to the right side of the board.";
    }, 400);
});

els.btnGlue.addEventListener('click', () => {
    els.status.innerText = "Searching...";
    setTimeout(() => {
        State.step = 4;
        els.btnGlue.classList.add('hidden');
        els.dragGlue.classList.remove('hidden');
        els.status.innerText = "Glue found! Drop it anywhere on the highlighted board.";
    }, 400);
});

setupDraggable(els.dragPiece, 'piece');
setupDraggable(els.dragGlue, 'glue');

function setupDraggable(element, type) {
    const onStart = (e) => {
        e.preventDefault();
        State.isDragging = true;

        if (type === 'glue') {
            els.boardContainer.classList.add('active-drop-zone');
        }

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = element.getBoundingClientRect();
        State.dragOffset.x = clientX - rect.left;
        State.dragOffset.y = clientY - rect.top;

        element.style.position = 'fixed';
        element.style.zIndex = '9999';
        element.style.width = rect.width + 'px';
        element.style.left = (clientX - State.dragOffset.x) + 'px';
        element.style.top = (clientY - State.dragOffset.y) + 'px';
    };

    const onMove = (e) => {
        if (!State.isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        element.style.left = (clientX - State.dragOffset.x) + 'px';
        element.style.top = (clientY - State.dragOffset.y) + 'px';
    };

    const onEnd = (e) => {
        if (!State.isDragging) return;
        State.isDragging = false;
        els.boardContainer.classList.remove('active-drop-zone');

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        checkDropCoords(clientX, clientY, type, element);
    };

    element.addEventListener('touchstart', onStart, { passive: false });
    element.addEventListener('touchmove', onMove, { passive: false });
    element.addEventListener('touchend', onEnd);
    element.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
}

function checkDropCoords(dropX, dropY, type, draggedElement) {
    let success = false;

    const boardRect = els.boardContainer.getBoundingClientRect();

    const itemRect = draggedElement.getBoundingClientRect();
    const itemCenterX = itemRect.left + (itemRect.width / 2);
    const itemCenterY = itemRect.top + (itemRect.height / 2);

    const buffer = 50;

    const isInsideBoard = (
        itemCenterX >= (boardRect.left - buffer) &&
        itemCenterX <= (boardRect.right + buffer) &&
        itemCenterY >= (boardRect.top - buffer) &&
        itemCenterY <= (boardRect.bottom + buffer)
    );

    if (type === 'piece' && State.step === 2) {
        if (isInsideBoard) {
            const relativeX = itemCenterX - boardRect.left;
            const percentX = (relativeX / boardRect.width) * 100;

            if (percentX > 40) {
                success = true;
                draggedElement.style.display = 'none';
                els.placedPiece.classList.remove('hidden');
                State.step = 3;
                els.btnGlue.classList.remove('hidden');
                els.status.innerText = "It fits! Search for glue.";
            }
        }
    }

    else if (type === 'glue' && State.step === 4) {
        if (isInsideBoard) {
            success = true;
            draggedElement.style.display = 'none';

            const effect = document.getElementById('glue-effect');
            effect.style.opacity = '1';
            effect.style.background = 'white';
            effect.style.animation = 'seal-seam 1.5s forwards';

            State.step = 5;
            els.status.innerText = ""; 
            els.boardContainer.style.borderColor = "#27ae60";

            setTimeout(() => {
                document.getElementById('win-modal').classList.add('show');
                // --- YOUR ORIGINAL FLAGS PRESERVED HERE ---
                if (typeof setFlag === 'function') {
                    setFlag('Torn_puzzle_solved', true);
                } else {
                    console.log("Game Won! Flag 'Torn_puzzle_solved' set to true.");
                }
            }, 1000);
        }
    }

    if (!success) {
        draggedElement.style.position = 'static';
        draggedElement.style.width = (type === 'glue') ? '15vw' : 'auto'; 
        if(type === 'glue') draggedElement.style.maxWidth = '100px'; 
        draggedElement.style.zIndex = '1000';
        draggedElement.style.visibility = 'visible';

        els.status.innerText = "Missed! Drop it on the highlighted board.";
        setTimeout(() => {
            if (State.step === 2) els.status.innerText = "Drag the piece to the right side.";
            if (State.step === 4) els.status.innerText = "Glue found! Drop it anywhere on the board.";
        }, 1500);
    }
}