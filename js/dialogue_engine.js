/**
 * dialogue_engine.js
 */

let currentDialogueScript = [];
let currentSceneIndex = 0;
let isProcessingClick = false;
let roomID = '';

// --- HELPER FUNCTIONS ---

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
        'Hidden_objects': 'task-hidden'
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

/**
 * Λειτουργία του κουμπιού USE (Placebo) στο Inventory
 */
function handlePlaceboUseClick() {
    console.log("System: Use Button Clicked");
    const scene = currentDialogueScript[currentSceneIndex];

    // 1. Έλεγχος αν η τρέχουσα σκηνή απαιτεί αντικείμενο
    if (!scene || scene.type !== 'task_check' || !scene.required_item) {
        showTaskFeedback(gameState.language === 'en' ? "Nothing to use here!" : "Δεν υπάρχει κάτι προς χρήση εδώ!");
        toggleInventory(false); // Κλείνει το inventory αν πατηθεί άσκοπα
        return;
    }

    const itemNeeded = scene.required_item;
    console.log("System: Scene needs:", itemNeeded);
    console.log("System: Current Inventory:", gameState.inventory);

    // 2. Έλεγχος αν ο παίκτης έχει το αντικείμενο
    if (gameState.inventory.includes(itemNeeded)) {
        console.log(`System: Successfully using ${itemNeeded}`);
        
        // Κλείσιμο του inventory panel
        toggleInventory(false);

        // Αφαίρεση από το inventory και προώθηση στην επόμενη σκηνή
        removeItemFromInventory(itemNeeded);
        currentSceneIndex++;
        processScene();
    } else {
        // Αν ο παίκτης δεν έχει το σωστό αντικείμενο
        showTaskFeedback(gameState.language === 'en' ? "Missing required item!" : "Λείπει το απαραίτητο αντικείμενο!");
        // Προαιρετικά κλείνουμε το inventory για να δει το feedback
        toggleInventory(false);
    }
}

function handleSceneAdvance(event) {
    console.log("System: Click detected on:", event.target);

    if (event.target.closest('.overlay-menu') || event.target.closest('.ui-icon-button')) return;
    if (isProcessingClick) return;

    const scene = currentDialogueScript[currentSceneIndex];
    if (scene && scene.type === 'task_check') {
        if (event.target.classList.contains('task-highlight') || event.target.closest('.interactive-ui')) {
            return; 
        }
        showTaskFeedback(gameState.language === 'en' ? "Finish the task first!" : "Ολοκληρώστε την εργασία πρώτα!");
        return;
    }

    isProcessingClick = true;
    if (currentSceneIndex < currentDialogueScript.length - 1) {
        currentSceneIndex++;
        setTimeout(() => {
            processScene();
            isProcessingClick = false;
        }, 100);
    } else {
        isProcessingClick = false;
    }
}

function handleCharacterVisuals(scene) {
    const speakerKey = scene.speaker_id;
    const allCharacters = document.querySelectorAll('#character-layer img');
    const limitVisibility = allCharacters.length > 2;

    allCharacters.forEach(charEl => {
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

        if (type === 'add-item') {
            addItemToInventory(value);
        } else if (type === 'focus-ui') {
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

            if (targetId !== '') {
                const btn = document.querySelector(targetId);
                if (btn) btn.classList.add('highlight-active');
            }
        } else if (type === 'show-alert') {
            const currentLang = gameState.language || 'en';
            const alertMessages = {
                'gr': "Χαχαχα! Σας έκλεψα τόσα πολλά πράγματα...",
                'en': "Hahaha! I stole so many things..."
            };
            alert(alertMessages[currentLang]);
        }
    });
}

function processScene() {
    if (currentSceneIndex >= currentDialogueScript.length) return;
    const scene = currentDialogueScript[currentSceneIndex];
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueTextElement = document.getElementById('dialogue-text');

    dialogueTextElement.textContent = scene.text[gameState.language] || scene.text['en'];
    handleCharacterVisuals(scene);

    if (scene.type === 'task_check') {
        updateTaskVisibility(scene.task_id);
    } else {
        updateTaskVisibility(null);
    }

    if (scene.action) handleSceneActions(scene.action);
    saveRoomProgress(roomID, scene.id);
}

// --- CORE INITIALIZATION ---

async function initializeDialogueEngine(roomName, jsonPath) {
    roomID = roomName;
    try {
        const [dialogueRes, itemsRes] = await Promise.all([
            fetch(jsonPath),
            fetch(`../data/${roomID}_items.json`)
        ]);

        currentDialogueScript = await dialogueRes.json();
        roomItemsData = await itemsRes.json();

        const container = document.getElementById('game-container');
        container.removeEventListener('click', handleSceneAdvance);
        container.addEventListener('click', handleSceneAdvance);

        processScene();
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

window.handleTaskInteraction = function (taskID, requiredItem, miniGameURL) {
    const scene = currentDialogueScript[currentSceneIndex];
    if (scene.type === 'task_check' && scene.task_id === taskID) {
        saveRoomProgress(roomID, scene.id);
        const finalURL = BASE_PATH + miniGameURL;
        console.log("Navigating to mini-game:", finalURL);
        window.location.href = finalURL;
    }
};