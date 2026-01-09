/* ================= GAME STATE ================= */
const State = {
    step: 1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0, parent: null }
};

/* ================= DOM ELEMENTS ================= */
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

/* ================= INITIALIZATION ================= */
window.onload = () => {
    // Open Tutorial on Start
    const modal = document.getElementById('tutorial-modal');
    if (modal) modal.classList.add('show');
};

window.toggleTutorial = function () {
    document.getElementById('tutorial-modal').classList.toggle('show');
};

/* ================= BUTTON EVENTS ================= */
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

/* ================= DRAG SETUP ================= */
setupDraggable(els.dragPiece, 'piece');
setupDraggable(els.dragGlue, 'glue');

function setupDraggable(element, type) {
    const onStart = (e) => {
        e.preventDefault();
        State.isDragging = true;

        // VISUAL FEEDBACK: Light up the board if dragging glue
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

        // VISUAL FEEDBACK: Remove highlight
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

/* ================= MATH-BASED DROP LOGIC (WITH BUFFER) ================= */
function checkDropCoords(dropX, dropY, type, draggedElement) {
    let success = false;

    // 1. Get Board Rect
    const boardRect = els.boardContainer.getBoundingClientRect();

    // 2. Get Item Center
    const itemRect = draggedElement.getBoundingClientRect();
    const itemCenterX = itemRect.left + (itemRect.width / 2);
    const itemCenterY = itemRect.top + (itemRect.height / 2);

    // 3. DEFINE BUFFER (Forgiveness in pixels)
    // If user misses by 50px, we still count it.
    const buffer = 50;

    const isInsideBoard = (
        itemCenterX >= (boardRect.left - buffer) &&
        itemCenterX <= (boardRect.right + buffer) &&
        itemCenterY >= (boardRect.top - buffer) &&
        itemCenterY <= (boardRect.bottom + buffer)
    );

    // --- SCENARIO 1: PIECE ---
    if (type === 'piece' && State.step === 2) {
        if (isInsideBoard) {
            const relativeX = itemCenterX - boardRect.left;
            const percentX = (relativeX / boardRect.width) * 100;

            // Must be on the right half (> 40% to be safe)
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

    // --- SCENARIO 2: GLUE ---
    else if (type === 'glue' && State.step === 4) {
        if (isInsideBoard) {
            success = true;
            draggedElement.style.display = 'none';

            // Win Animation
            const effect = document.getElementById('glue-effect');
            effect.style.opacity = '1';
            effect.style.background = 'white';
            effect.style.animation = 'seal-seam 1.5s forwards';

            State.step = 5;
            els.status.innerText = ""; // Clear status
            els.boardContainer.style.borderColor = "#27ae60";

            // SHOW WIN MODAL AFTER DELAY
            setTimeout(() => {
                document.getElementById('win-modal').classList.add('show');
                if (typeof setFlag === 'function') {
                    setFlag('Torn_puzzle_solved', true);
                } else {
                    console.log("Game Won! Flag 'Torn_puzzle_solved' set to true.");
                }
            }, 1000);
        }
    }

    // --- FAILURE ---
    if (!success) {
        draggedElement.style.position = 'static';
        draggedElement.style.width = 'auto';
        draggedElement.style.zIndex = '1000';
        draggedElement.style.visibility = 'visible';

        els.status.innerText = "Missed! Drop it on the highlighted board.";
        setTimeout(() => {
            if (State.step === 2) els.status.innerText = "Drag the piece to the right side.";
            if (State.step === 4) els.status.innerText = "Glue found! Drop it anywhere on the board.";
        }, 1500);
    }
}