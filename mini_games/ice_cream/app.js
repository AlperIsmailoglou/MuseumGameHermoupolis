// --- CONFIGURATION ---
const TARGET_SCORE = 100;
const PROGRESS_PER_TAP = 4; // Adjust difficulty here

// --- STATE ---
let currentProgress = 0;
let isMirrored = false;
let isWinning = false;

// --- ELEMENTS ---
const handleImg = document.getElementById('handle-img');
const progressBar = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const crankBtn = document.getElementById('crank-btn');
const winScreen = document.getElementById('win-screen');

function churn() {
    if(isWinning) return;

    // 1. Update Progress
    currentProgress += PROGRESS_PER_TAP;
    if (currentProgress >= TARGET_SCORE) {
        currentProgress = TARGET_SCORE;
        winGame();
    }
    
    // 2. Update UI
    progressBar.style.width = currentProgress + "%";
    statusText.innerText = "TURN PROGRESS: " + Math.floor(currentProgress) + "%";

    // 3. Toggle Handle
    toggleHandle();
}

function toggleHandle() {
    isMirrored = !isMirrored;
    if (isMirrored) {
        handleImg.style.transform = "scaleY(-1)";
    } else {
        handleImg.style.transform = "scaleY(1)";
    }
}

function winGame() {
    isWinning = true;
    setTimeout(() => {
        winScreen.style.display = "flex";
         if (typeof setFlag === 'function') {
            setFlag('Ice_cream_solved', true);
        } else {
            console.log("Game Won! Flag 'Ice_cream_solved' set to true.");
        }
    }, 300);
}

// --- INPUTS ---
crankBtn.addEventListener('mousedown', churn);
crankBtn.addEventListener('touchstart', (e) => { 
    e.preventDefault(); // Prevents double-firing on some screens
    churn(); 
}, {passive: false});

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        churn();
         // Visual button feedback
         crankBtn.style.transform = "translateY(3px)";
         setTimeout(() => crankBtn.style.transform = "", 100);
    }
});