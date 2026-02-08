
const State = {
    step: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0, parent: null }
};

const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Search",
        step1Desc: "Use buttons to find the piece and glue.",
        step2Head: "Drag & Drop",
        step2Desc: "Drag the piece to the right side of the document.",
        step3Head: "Apply Glue",
        step3Desc: "Drop the glue anywhere on the board to finish.",
        closeBtn: "CLOSE",
        
        winTitle: "Memory Restored!",
        winDesc: "You have successfully repaired the document.",
        winBtn: "CONTINUE TO ADVENTURE ➔",

        btnPiece: "SEARCH FOR PIECE",
        btnGlue: "SEARCH FOR GLUE",

        msgStart: "Tray is empty. Search for the missing piece.",
        msgSearching: "Searching...",
        msgFoundPiece: "Found it! Drag the piece to the right side of the board.",
        msgFoundGlue: "Glue found! Drop it anywhere on the highlighted board.",
        msgFits: "It fits! Search for glue.",
        msgMissed: "Missed! Drop it on the highlighted board.",
        msgMissedPiece: "Drag the piece to the right side.", 
        msgMissedGlue: "Glue found! Drop it anywhere on the board." 
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Αναζήτηση",
        step1Desc: "Χρησιμοποίησε τα κουμπιά για να βρεις το κομμάτι και την κόλλα.",
        step2Head: "Σύρε & Άσε",
        step2Desc: "Σύρε το κομμάτι στη δεξιά πλευρά του εγγράφου.",
        step3Head: "Κόλλα",
        step3Desc: "Ρίξε την κόλλα οπουδήποτε στον πίνακα για να τελειώσεις.",
        closeBtn: "ΚΛΕΙΣΙΜΟ",

        winTitle: "Η Μνήμη Αποκαταστάθηκε!",
        winDesc: "Επιδιορθώσατε το έγγραφο με επιτυχία.",
        winBtn: "ΣΥΝΕΧΕΙΑ ΣΤΗΝ ΠΕΡΙΠΕΤΕΙΑ ➔",

        btnPiece: "ΑΝΑΖΗΤΗΣΗ ΚΟΜΜΑΤΙΟΥ",
        btnGlue: "ΑΝΑΖΗΤΗΣΗ ΚΟΛΛΑΣ",

        msgStart: "Ο δίσκος είναι άδειος. Αναζητήστε το κομμάτι.",
        msgSearching: "Αναζήτηση...",
        msgFoundPiece: "Βρέθηκε! Σύρε το κομμάτι στη δεξιά πλευρά.",
        msgFoundGlue: "Η κόλλα βρέθηκε! Ρίξτε την οπουδήποτε στον πίνακα.",
        msgFits: "Ταιριάζει! Αναζητήστε την κόλλα.",
        msgMissed: "Αστοχία! Ρίξτε το στον επισημασμένο πίνακα.",
        msgMissedPiece: "Σύρε το κομμάτι στη δεξιά πλευρά.",
        msgMissedGlue: "Η κόλλα βρέθηκε! Ρίξτε την οπουδήποτε στον πίνακα."
    }
};
function getCurrentLang() {
    const stored = localStorage.getItem('gameLanguage');
    return (stored === 'gr' || stored === 'el' || stored === 'Greek') ? 'gr' : 'en';
}
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

function updateTutorialLanguage() {
    const lang = getCurrentLang();
    const t = tutorialData[lang];
    
    if(document.getElementById('tut-title')) document.getElementById('tut-title').innerText = t.title;
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
    if(document.getElementById('tut-close-btn')) document.getElementById('tut-close-btn').innerText = t.closeBtn;

    if(document.getElementById('win-title')) document.getElementById('win-title').innerText = t.winTitle;
    if(document.getElementById('win-desc')) document.getElementById('win-desc').innerText = t.winDesc;
    if(document.getElementById('win-btn')) document.getElementById('win-btn').innerText = t.winBtn;

    if(els.btnPiece) els.btnPiece.innerText = t.btnPiece;
    if(els.btnGlue) els.btnGlue.innerText = t.btnGlue;

    const sb = els.status;
    if(sb) {
        if(State.step === 1) sb.innerText = t.msgStart;
        else if(State.step === 2) sb.innerText = t.msgFoundPiece;
        else if(State.step === 3) sb.innerText = t.msgFits;
        else if(State.step === 4) sb.innerText = t.msgFoundGlue;
    }
}

function initTutorial() {
    updateTutorialLanguage();
    
    const modal = document.getElementById('tutorial-modal');
    if (modal && !modal.classList.contains('show')) {
        toggleTutorial();
    }
}

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

els.btnPiece.addEventListener('click', () => {
    const t = tutorialData[getCurrentLang()]; 
    els.status.innerText = t.msgSearching;
    
    setTimeout(() => {
        State.step = 2;
        els.btnPiece.classList.add('hidden');
        els.dragPiece.classList.remove('hidden');
        els.status.innerText = tutorialData[getCurrentLang()].msgFoundPiece;
    }, 400);
});

els.btnGlue.addEventListener('click', () => {
    const t = tutorialData[getCurrentLang()];
    els.status.innerText = t.msgSearching;
    
    setTimeout(() => {
        State.step = 4;
        els.btnGlue.classList.add('hidden');
        els.dragGlue.classList.remove('hidden');
        els.status.innerText = tutorialData[getCurrentLang()].msgFoundGlue;
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
    const t=tutorialData[getCurrentLang()];

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
                els.status.innerText = t.msgFits;
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
                updateTutorialLanguage();
                document.getElementById('win-modal').classList.add('show');
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

        els.status.innerText =t.msgMissed;
        setTimeout(() => {
            if (State.step === 2) els.status.innerText = currentT.msgMissedPiece;
            if (State.step === 4) els.status.innerText = currentT.msgMissedGlue;
        }, 1500);
    }
}