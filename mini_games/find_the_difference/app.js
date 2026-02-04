// =========================================
//  BILINGUAL TUTORIAL MODULE
// =========================================

// 1. CONFIGURATION: TAILORED FOR "FIND THE DIFFERENCE"
const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Observe Reality",
        step1Desc: "Look at the real object or scene in front of you.",
        step2Head: "Compare Screen",
        step2Desc: "Look at the image on your phone. Find what is different!",
        step3Head: "Tap to Find",
        step3Desc: "Tap the difference on your screen to mark it.",
        closeBtn: "PLAY GAME"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Παρατήρησε",
        step1Desc: "Κοίτα το πραγματικό αντικείμενο ή σκηνή μπροστά σου.",
        step2Head: "Σύγκρινε",
        step2Desc: "Κοίτα την εικόνα στο κινητό σου. Βρες τι διαφέρει!",
        step3Head: "Πάτα τη Διαφορά",
        step3Desc: "Πάτα πάνω στη διαφορά στην οθόνη για να την επιλέξεις.",
        closeBtn: "ΠΑΙΞΕ"
    }
};

// 2. TOGGLE FUNCTION (Open/Close)
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

// 3. LANGUAGE UPDATE FUNCTION
function updateTutorialLanguage() {
    // Detect Language from LocalStorage (standardized)
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en'; // Default
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        lang = 'gr';
    }

    const t = tutorialData[lang];
    
    // Update DOM elements safely
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
    // Small delay to ensure render
    setTimeout(() => {
        if (modal && !modal.classList.contains('show')) {
            toggleTutorial();
        }
    }, 100);
}


// =========================================
//  MAIN GAME LOGIC
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- INIT TUTORIAL ---
    initTutorial();

    // --- CONFIGURATION ---
    let tipsAllowed = 1;      
    const hintDuration = 2000; 
    
    // --- STATE VARIABLES ---
    let foundCount = 0;
    const diffItems = document.querySelectorAll('.diff-item');
    const totalDiffs = diffItems.length;
    
    // --- DOM ELEMENTS ---
    const countDisplay = document.getElementById('count');
    const totalCountDisplay = document.getElementById('total-count');
    const tipsLeftDisplay = document.getElementById('tips-left');
    const hintBtn = document.getElementById('hint-btn');
    const winMsg = document.getElementById('win-msg');
    const resetBtn = document.getElementById('reset-btn');

    // --- INITIALIZATION ---
    totalCountDisplay.innerText = totalDiffs;
    tipsLeftDisplay.innerText = tipsAllowed;

    // --- GAME INTERACTION ---

    // 1. Handle clicking a difference
    diffItems.forEach(item => {
        item.addEventListener('click', function() {
            if(this.classList.contains('found')) return;

            // Mark as found
            this.classList.add('found');
            this.classList.remove('hint-active');

            // Update Score
            foundCount++;
            countDisplay.innerText = foundCount;

            // Check for Win
            if(foundCount === totalDiffs) {
                handleWin();
            }
        });
    });

    // 2. Handle Hint Button
    hintBtn.addEventListener('click', () => {
        if (tipsAllowed > 0) {
            tipsAllowed--;
            tipsLeftDisplay.innerText = tipsAllowed;
            
            const remaining = document.querySelectorAll('.diff-item:not(.found)');
            
            remaining.forEach(item => {
                item.classList.add('hint-active');
            });

            // Timer to remove highlight
            setTimeout(() => {
                remaining.forEach(item => {
                    item.classList.remove('hint-active');
                });
            }, hintDuration);

            if (tipsAllowed === 0) {
                hintBtn.disabled = true;
                hintBtn.style.opacity = '0.5';
            }
        }
    });

    // 3. Handle Win State
    function handleWin() {
        
        setTimeout(() => {
            winMsg.style.display = 'block';
        }, 300);

        if (typeof setFlag === "function") {
            setFlag('Find_difference_solved', true);
        } else {
            console.log("Simulation: Flag 'Find_difference_solved' set to true");
        }
    }

    // 4. Handle Continue Button
    resetBtn.addEventListener('click', () => {
        window.location.href = "../../rooms/room_1.html";
    });
});