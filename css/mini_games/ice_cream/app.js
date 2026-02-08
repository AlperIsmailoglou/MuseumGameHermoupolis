// --- CONFIGURATION ---
const TARGET_SCORE = 100;
const PROGRESS_PER_TAP = 4; 

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

    currentProgress += PROGRESS_PER_TAP;
    if (currentProgress >= TARGET_SCORE) {
        currentProgress = TARGET_SCORE;
        winGame();
    }
    
    progressBar.style.width = currentProgress + "%";
    statusText.innerText = "TURN PROGRESS: " + Math.floor(currentProgress) + "%";

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
        // Check if global game state exists (from your file include)
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
    e.preventDefault(); 
    churn(); 
}, {passive: false});

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        churn();
         crankBtn.style.transform = "translateY(3px)";
         setTimeout(() => crankBtn.style.transform = "", 100);
    }
});

/* =========================================
   BILINGUAL TUTORIAL MODULE
   ========================================= */

// 1. CONFIGURATION: Updated for ICE CREAM GAME
const tutorialData = {
    en: {
        title: "How to Make Ice Cream",
        step1Head: "Objective",
        step1Desc: "The ingredients are ready! You need to mix them to make the ice cream.",
        step2Head: "How to Crank",
        step2Desc: "Tap the 'TAP TO TURN' button repeatedly or press SPACEBAR to turn the handle.",
        step3Head: "Winning",
        step3Desc: "Fill the progress bar to 100% to finish the ice cream!",
        closeBtn: "START CHURNING"
    },
    gr: {
        title: "Πώς να φτιάξεις Παγωτό",
        step1Head: "Στόχος",
        step1Desc: "Τα υλικά είναι έτοιμα! Πρέπει να τα ανακατέψεις.",
        step2Head: "Χειρισμός",
        step2Desc: "Πάτα το κουμπί 'TAP TO TURN' επανειλημμένα ή το SPACEBAR για να γυρίσεις τη μανιβέλα.",
        step3Head: "Νίκη",
        step3Desc: "Γέμισε τη μπάρα στο 100% για να ολοκληρώσεις το παγωτό!",
        closeBtn: "ΞΕΚΙΝΑ ΤΟ ΓΥΡΙΣΜΑ"
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
    let lang = 'en'; // Default
    
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

// 4. INITIALIZATION
// Call this immediately to set text and open the modal
updateTutorialLanguage();
toggleTutorial();