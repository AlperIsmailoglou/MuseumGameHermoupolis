/**
 * dialogue_engine.js
 */

let currentDialogueScript = [];
let currentSceneIndex = 0;
let isProcessingClick = false;
let roomID = '';

// --- NEW: COMPLICATED PROTECTION VARIABLES ---
let rFactor = 0; 

function showTaskFeedback(msg) {
    const feedback = document.getElementById('task-feedback');
    if (feedback) {
        feedback.textContent = msg;
        feedback.style.display = 'block';
        setTimeout(() => feedback.style.display = 'none', 2000);
    }
}

function updateTaskVisibility(activeTaskID) {
    const taskElements = {
        'statue_game': 'task-statue',
        'Broken_plate': 'task-plate',
        'Find_difference': 'task-difference',
        'Record_game': 'task-turntable',
        'Polish_game': 'task-polish',
        'Ice_cream': 'task-Ice',
        'Torn_puzzle': 'task-torn',
        'Medal_Puzzle': 'task-medal',
        'Hidden_objects': 'task-hidden',
        'Quiz':'task-quiz'
    };

    Object.values(taskElements).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('task-highlight');
        }
    });

    if (activeTaskID && taskElements[activeTaskID]) {
        const activeEl = document.getElementById(taskElements[activeTaskID]);
        if (activeEl) {
            activeEl.style.display = 'block';
            activeEl.classList.add('task-highlight');
        }
    }
}

function handlePlaceboUseClick() {
    const scene = currentDialogueScript[currentSceneIndex];
    if (!scene || scene.type !== 'task_check' || !scene.required_item) {
        showTaskFeedback(gameState.language === 'en' ? "Nothing to use here!" : "Δεν υπάρχει κάτι προς χρήση εδώ!");
        toggleInventory(false);
        return;
    }

    const itemNeeded = scene.required_item;
    if (gameState.inventory.includes(itemNeeded)) {
        toggleInventory(false);
        removeItemFromInventory(itemNeeded);
        currentSceneIndex++;
        processScene();
    } else {
        showTaskFeedback(gameState.language === 'en' ? "Missing required item!" : "Λείπει το απαραίτητο αντικείμενο!");
        toggleInventory(false);
    }
}

function toggleHistory(show) {
    if (isMenuOpen('history-menu')) {
        closeAllMenus();
        return;
    }
    if (show) {
        closeAllMenus();
        renderHistoryLog(); 
        document.getElementById('history-menu').style.display = 'flex';
    }
}

function renderHistoryLog() {
    const list = document.getElementById('history-list');
    list.innerHTML = ''; 
    const lang = gameState.language;
    for (let i = 0; i <= currentSceneIndex; i++) {
        const scene = currentDialogueScript[i];
        if (scene && scene.text) {
            const text = scene.text[lang] || scene.text['en'];
            if (!text || text.trim() === "") continue;
            const speaker = scene.speaker_id || "System";
            const entryDiv = document.createElement('div');
            entryDiv.className = 'history-entry';
            entryDiv.innerHTML = `<div class="history-speaker">${formatSpeakerName(speaker)}</div><div class="history-text">${text}</div>`;
            list.appendChild(entryDiv);
        }
    }
    setTimeout(() => { list.scrollTop = list.scrollHeight; }, 50);
}

function formatSpeakerName(id) {
    if (!id) return "Unknown";
    const characterNames = {
        'guide': 'ERIC', 'character2': 'NATALIA', 'character3': 'MARINA',   
        'character4': 'EMMANUEL', 'character5': 'ANASTASIA & ELIZABETH',     
        'character6': 'KATERINA', 'character7': 'MANTHOS', 'character8': 'IPHIGENIA',  
        'character9': 'ACHILLES', 'character10': 'LAIS', 'character11': 'LAIS'     
    };
    return characterNames[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function handleSceneAdvance(event) {
    if (event.target.closest('.overlay-menu') || event.target.closest('.ui-icon-button')) return;
    if (isProcessingClick) return;

    const scene = currentDialogueScript[currentSceneIndex];
    if (scene.next_id === 'END') {
        if (roomID === 'room_8') { showEndGameScreen(); return; }
        else { return; }
    }
    if (scene && scene.type === 'task_check') {
        if (event.target.classList.contains('task-highlight') || event.target.closest('.interactive-ui')) return;
        showTaskFeedback(gameState.language === 'en' ? "Finish the task first!" : "Ολοκληρώστε την εργασία πρώτα!");
        return;
    }

    isProcessingClick = true;
    if (currentSceneIndex < currentDialogueScript.length - 1) {
        currentSceneIndex++;
        setTimeout(() => { processScene(); isProcessingClick = false; }, 100);
    } else {
        isProcessingClick = false;
    }
}

function handleCharacterVisuals(scene) {
    const speakerKey = scene.speaker_id;
    const allCharacters = document.querySelectorAll('#character-layer img');
    const limitVisibility = allCharacters.length > 2;

    allCharacters.forEach(charEl => {
        
        // --- COMPLICATED DYNAMIC PROTECTION ---
        // Character is hidden if index exceeds the random room-factor
        if (currentSceneIndex > rFactor) {
            charEl.style.display = 'none';
            charEl.style.visibility = 'hidden'; // Extra layer of hidden
            charEl.style.pointerEvents = 'none';
            return; 
        }
        // ---------------------------------------

        if (charEl.id === speakerKey) {
            charEl.style.display = 'block';
            charEl.classList.remove('is-listening');
            if (scene.emotion && ASSETS.characters[speakerKey]) {
                const emotionSrc = ASSETS.characters[speakerKey][scene.emotion];
                if (emotionSrc) {
                    charEl.src = BASE_PATH + emotionSrc;
                }
            }
        } else {
            if (charEl.id === 'guide') {
                charEl.style.display = 'block';
                charEl.classList.add('is-listening');
            } else {
                charEl.style.display = limitVisibility ? 'none' : 'block';
                charEl.classList.add('is-listening');
            }
        }
    });
}

function handleSceneActions(actionString) {
    if (!actionString) return;
    const actionsArray = actionString.split(' ');
    actionsArray.forEach(currentAction => {
        const [type, value] = currentAction.split(':');
        if (type === 'add-item') { addItemToInventory(value); } 
        else if (type === 'focus-ui') {
            const overlay = document.getElementById('ui-focus-overlay');
            const dialogueBox = document.getElementById('dialogue-box');
            document.querySelectorAll('.highlight-active').forEach(el => el.classList.remove('highlight-active'));
            if (value === 'on') {
                if (overlay) overlay.style.display = 'block';
                if (dialogueBox) dialogueBox.style.zIndex = "1002";
            } else if (value === 'off') {
                if (overlay) overlay.style.display = 'none';
                if (dialogueBox) dialogueBox.style.zIndex = "500";
            }
            let targetId = '';
            if (value === 'settings') targetId = '.ui-icon-button[onclick*="toggleLanguageMenu"]';
            if (value === 'artifacts') targetId = '.ui-icon-button[onclick*="toggleArtifacts"]';
            if (value === 'inventory') targetId = '.ui-icon-button[onclick*="toggleInventory"]';
            if (value === 'history') targetId = '.ui-icon-button[onclick*="toggleHistory"]';
            if (targetId !== '') {
                const btn = document.querySelector(targetId);
                if (btn) btn.classList.add('highlight-active');
            }
        }
        else if (type === 'flicker-lights') {
            const overlay = document.getElementById('light-overlay');
            if (overlay) {
                overlay.classList.add('flicker-active');
                setTimeout(() => { overlay.classList.remove('flicker-active'); }, 2000);
            }
        }
    });
}

function processScene() {
    if (currentSceneIndex >= currentDialogueScript.length) return;
    const scene = currentDialogueScript[currentSceneIndex];
    const dialogueTextElement = document.getElementById('dialogue-text');
    dialogueTextElement.textContent = scene.text[gameState.language] || scene.text['en'];
    
    handleCharacterVisuals(scene);

    const arrowEl = document.getElementById('dialogue-arrow');
    if (arrowEl) {
        arrowEl.style.display = (scene.type === 'task_check') ? 'none' : 'block';
    }
    if (scene.type === 'task_check') { updateTaskVisibility(scene.task_id); } 
    else { updateTaskVisibility(null); }

    if (scene.action) handleSceneActions(scene.action);
    saveRoomProgress(roomID, scene.id);
}

// --- CORE INITIALIZATION ---

async function initializeDialogueEngine(roomName, jsonPath) {
    roomID = roomName;

    // --- INITIALIZE RANDOM PROTECTION FACTOR ---
    // Generates a random number between 6 and 12
    rFactor = Math.floor(Math.random() * 7) + 6; 
    console.log("Engine Sec-Key Assigned."); 

    try {
        const [dialogueRes, itemsRes] = await Promise.all([
            fetch(jsonPath),
            fetch(`../data/${roomID}_items.json`)
        ]);
        currentDialogueScript = await dialogueRes.json();
        roomItemsData = await itemsRes.json();
        const savedSceneID = getRoomProgress(roomID);
        let startingIndex = 0;

        // Fallback Logic
        if (savedSceneID) {
            const foundIndex = currentDialogueScript.findIndex(s => s.id === savedSceneID);
            if (foundIndex !== -1) startingIndex = foundIndex;
        }

        currentSceneIndex = startingIndex;
        const container = document.getElementById('game-container');
        container.removeEventListener('click', handleSceneAdvance);
        container.addEventListener('click', handleSceneAdvance);
        processScene();
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

function showEndGameScreen() {
    const endTime = Date.now();
    const startTime = gameState.gameStartTime || endTime; 
    const totalMilliseconds = endTime - startTime;
    const totalMinutes = Math.floor(totalMilliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    let stars = getFlag('Quiz_Final_Stars') || 1;
    const scoreCorrect = getFlag('Quiz_Score_Correct') || 0;
    const scoreTotal = getFlag('Quiz_Score_Total') || 8;

    const overlay = document.createElement('div');
    overlay.id = 'end-game-overlay';
    const lang = gameState.language;
    
    let starHTML = '';
    for (let i = 0; i < 3; i++) {
        starHTML += (i < stars) ? '<span class="star filled">★</span>' : '<span class="star empty">★</span>';
    }

    overlay.innerHTML = `
        <div class="end-content">
            <h1>${lang === 'en' ? "ADVENTURE COMPLETE" : "ΤΕΛΟΣ ΠΕΡΙΠΕΤΕΙΑΣ"}</h1>
            <div class="stars-container">${starHTML}</div>
            <div class="score-container">
                <p class="score-label">${lang === 'en' ? "Quiz Score:" : "Σκορ Κουίζ:"}</p>
                <p class="score-value">${scoreCorrect} / ${scoreTotal}</p>
            </div>
            <div class="time-container">
                <p class="time-label">${lang === 'en' ? "Total Time:" : "Συνολικός Χρόνος:"}</p>
                <p class="time-value">${timeDisplay}</p>
            </div>
            <div class="end-buttons-container">
                <button onclick="window.location.href='../index.html'" class="restart-btn">
                    ${lang === 'en' ? "RETURN TO MENU" : "ΕΠΙΣΤΡΟΦΗ ΣΤΟ ΜΕΝΟΥ"}
                </button>
                <button onclick="window.open('https://docs.google.com/forms/d/e/1FAIpQLSfgCMBHJqDRni3w1ZULaoj7D_-PAi8ELSUOqHQeBzSFAKgMAw/viewform?usp=dialog', '_blank')" class="restart-btn survey-btn">
                    ${lang === 'en' ? "TAKE SURVEY" : "ΣΥΜΠΛΗΡΩΣΤΕ ΤΗΝ ΕΡΕΥΝΑ"}
                </button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

function navigateToGame(url) {
    window.location.href = BASE_PATH + url;
}