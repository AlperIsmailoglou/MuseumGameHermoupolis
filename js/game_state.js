/**
 * game_state.js
 * Manages global game state, asset mapping, and UI interactions.
 */
const LOCAL_STORAGE_KEY = 'museumAdventure_';

// --- Centralized Asset Map ---
const ASSETS = {
    items: {
        // Just point to the original folder so all rooms can find them
        'kanata': 'images/room_1/kanata.jpg', 
        'Golden_Fragment': 'images/room_1/GoldenFragment_icon.png',
        'Broken_Record': 'images/room_3/Broken_record.jpg',
        'Ice_cream_ingredients':'images/room_4/Ice_cream_ingredients.png',
        'Ice_cream':'images/room_2/Ice_cream.jpg',
        'Glue':'images/room_4/Glue.jpg',
        'Right_score':'images/room_5/torn_piece_right.png',
        'Needle': 'images/room_7/Safety_Pin.png',
        'Apron':'images/room_7/Apron.png',
        'Knitwear':'images/room_7/Knitwear.png',
        'Plate':'images/room_7/plate.png',
        'WalkingStick':'images/room_7/WalkingStick.png'
    },
    ui: {
        'inv_empty': 'images/UI/inventory_empty.png',
        'inv_full': 'images/UI/inventory_full.png',
        'back_arrow': 'images/UI/back_arrow.png',
        'lang_icon': 'images/UI/language_icon.png',
        'art_icon': 'images/UI/artifact_icon.png'
    },
    characters: {
        'guide': {
            'neutral': 'images/characters/guide_neutral.png',
            'happy': 'images/characters/guide_happy.png',
            'thinking': 'images/characters/guide_thinking.png',
            'surprised': 'images/characters/guide_surprised.png'
        },

        'character2': {
            'neutral': 'images/characters/character2_neutral.png',
            'happy': 'images/characters/character2_happy.png',
            'thinking': 'images/characters/character2_thinking.png',
            'surprised': 'images/characters/character2_surprised.png'
        },
        'character3': {
            'neutral': 'images/characters/character3_neutral.png',
            'happy': 'images/characters/character3_happy.png',
            'surprised': 'images/characters/character3_surprised.png'
        },
        'character4': {
            'neutral': 'images/characters/character4_neutral.png',
            'happy': 'images/characters/character4_happy.png',
            'surprised': 'images/characters/character4_surprised.png'
        },
        'character5': {
            'neutral': 'images/characters/character5_neutral.png',
            'happy': 'images/characters/character5_happy.png',
            'surprised': 'images/characters/character5_surprised.png'
        },
        'character6': {
            'neutral': 'images/characters/character6_neutral.png',
            'happy': 'images/characters/character6_happy.png',
            'surprised': 'images/characters/character6_surprised.png'
        },
        'character7': {
            'neutral': 'images/characters/character7_neutral.png',
            'happy': 'images/characters/character7_happy.png',
            'surprised': 'images/characters/character7_surprised.png'
        },
         'character8': {
            'neutral': 'images/characters/character8_neutral.png',
            'happy': 'images/characters/character8_happy.png',
            'surprised': 'images/characters/character8_surprised.png'
        },
         'character9': {
            'neutral': 'images/characters/character9_neutral.png',
            'happy': 'images/characters/character9_happy.png',
            'surprised': 'images/characters/character9_surprised.png'
        },
        'character10': {
            'neutral': 'images/characters/character10_neutral.png',
            'happy': 'images/characters/character10_happy.png',
            'surprised': 'images/characters/character10_surprised.png'
        },
        'character11': {
            'neutral': 'images/characters/character11_neutral.png',
            'happy': 'images/characters/character11_happy.png',
            'surprised': 'images/characters/character11_surprised.png'
        }

    }
};

function getBasePath() {
    // Detect if we are on GitHub Pages
    const isGitHub = window.location.hostname.includes('github.io');
    
    if (isGitHub) {
        // Extracts 'REPOSITORY_NAME' from 'alperismailoglou.github.io/REPOSITORY_NAME/'
        const repoName = window.location.pathname.split('/')[1];
        return `/${repoName}/`; 
    }
    
    // For local testing (Live Server)
    return '/'; 
}

const BASE_PATH = getBasePath();

const defaultState = {
    language: localStorage.getItem('gameLanguage') || 'en', 
    inventory: [],
    flags: {},
    collectedArtifacts: {}, 
    roomProgress: {},
    currentRoom: 'room_1',
    gameStartTime: 0
};

let gameState = { ...defaultState };
let artifactData = {};  
let roomItemsData = {}; 

function loadGameState() {
    const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY + 'gameState');
    // Start with default, then overwrite if save exists
    gameState = { ...defaultState };

    if (savedStateJSON) {
        try {
            const savedState = JSON.parse(savedStateJSON);
            // Merge saved data into current state
            gameState = { ...gameState, ...savedState };
        } catch (e) {
            console.error("Error parsing saved state:", e);
        }
    }
    
    // Always sync language from its specific key
    gameState.language = localStorage.getItem('gameLanguage') || 'en';
    updateInventoryButtonVisual();
}

function saveGameState(roomID = gameState.currentRoom) {
    gameState.currentRoom = roomID;
    localStorage.setItem('gameLanguage', gameState.language); 
    localStorage.setItem(LOCAL_STORAGE_KEY + 'gameState', JSON.stringify(gameState));
}

/**
 * Global Viewport & Orientation Fix
 */
function updateViewportHeight() {
    // We use a small timeout to ensure the browser has finished its rotation animation
    setTimeout(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Force a layout reflow on the game container
        const container = document.getElementById('game-container');
        if (container) {
            container.style.display = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.display = 'flex';
        }
    }, 150);
}

// Listen for both orientation changes and window resizing
window.addEventListener('resize', updateViewportHeight);
window.addEventListener('orientationchange', updateViewportHeight);

// Initial call on load
document.addEventListener('DOMContentLoaded', updateViewportHeight);

// --- UI Panel Logic ---

function isMenuOpen(id) {
    const el = document.getElementById(id);
    return el && el.style.display === 'flex';
}

function closeAllMenus() {
    ['inventory-menu', 'artifacts-menu', 'language-menu'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// --- Inventory Logic ---

function addItemToInventory(itemKey) {
    if (!gameState.inventory.includes(itemKey)) {
        gameState.inventory.push(itemKey);
        saveGameState();
        updateInventoryButtonVisual();

        // Trigger visual alert
        const invBtn = document.querySelector('.ui-icon-button[onclick*="toggleInventory"]');
        if (invBtn) {
            invBtn.classList.add('notification-dot', 'inventory-bounce');
        }
    }
}

function toggleInventory(show) {
    if (isMenuOpen('inventory-menu')) {
        closeAllMenus();
        return;
    }
    if (show) {
        if (show) {
        const invBtn = document.querySelector('.ui-icon-button[onclick*="toggleInventory"]');
        if (invBtn) {
            invBtn.classList.remove('notification-dot', 'inventory-bounce');
        }
    }
        closeAllMenus();
        updateInventoryUI();
        document.getElementById('inventory-menu').style.display = 'flex';
    }
}

/**
 * IMPLEMENTATION: Fixed Side-by-Side Inventory UI
 */
function updateInventoryUI() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    list.innerHTML = ''; 
    const lang = gameState.language;
    
    if (gameState.inventory.length === 0) {
        list.innerHTML = `<p id="empty-inventory-message">${lang === 'en' ? 'Inventory is empty.' : 'Η αποθήκη είναι άδεια.'}</p>`;
        return;
    }
    
    gameState.inventory.forEach(itemKey => {
        const itemData = getItemDetails(itemKey); 
        if (!itemData) return;

        const itemName = itemData.name[lang] || itemData.name['en'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item'; // Removed 'interactive-ui' class here
        
        itemDiv.innerHTML = `
            <div class="item-image-box">
                <img src="${itemData.fullImagePath}" alt="${itemName}">
            </div>
            <div class="item-info-box">
                <span class="item-name">${itemName}</span>
            </div>
        `;
        list.appendChild(itemDiv);
    });
}

function getItemDetails(itemKey) {
    // 1. Get the text data (names/descriptions) from the loaded JSON
    const data = roomItemsData[itemKey];

    if (!data) {
        console.warn(`Item Data Missing: ${itemKey} not found in roomItemsData.`);
        return null;
    }

    // 2. Resolve the Image Path
    // We check the ASSETS map first; if not there, we use the JSON's image path
    let assetPath = ASSETS.items[itemKey] || data.image;

    // 3. Prevent Double-Pathing
    // If assetPath already starts with http or the full domain, don't add BASE_PATH
    if (assetPath.startsWith('http') || assetPath.startsWith(window.location.origin)) {
        data.fullImagePath = assetPath;
    } else {
        // Ensure we don't have double slashes
        const cleanBasePath = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
        const cleanAssetPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
        data.fullImagePath = cleanBasePath + cleanAssetPath;
    }

    return data;
}

function updateInventoryButtonVisual() {
    const inventoryBtn = document.getElementById('inventory-btn');
    if (!inventoryBtn) return; 

    const isNotEmpty = gameState.inventory.length > 0;
    const assetKey = isNotEmpty ? 'inv_full' : 'inv_empty';
    inventoryBtn.src = BASE_PATH + ASSETS.ui[assetKey];
}

function removeItemFromInventory(itemKey) {
    const index = gameState.inventory.indexOf(itemKey);
    if (index > -1) {
        gameState.inventory.splice(index, 1);
        saveGameState();
        updateInventoryButtonVisual(); // Swaps icon back to empty if 0 items
        return true;
    }
    return false;
}

// --- Artifacts Logic ---

function toggleArtifacts(show) {
    if (isMenuOpen('artifacts-menu')) {
        closeAllMenus();
        return;
    }
    if (show) {
        closeAllMenus();
        const currentRoomID = gameState.currentRoom;
        loadRoomArtifactData(currentRoomID).then(() => updateArtifactsGrid(currentRoomID));
        document.getElementById('artifacts-menu').style.display = 'flex';
    }
}

async function loadRoomArtifactData(roomName) {
    try {
        const response = await fetch(`../data/${roomName}_artifacts.json`);
        artifactData[roomName] = await response.json(); 
    } catch (error) {
        console.error("Artifact data load error:", error);
    }
}

function updateArtifactsGrid(roomName) {
    const grid = document.getElementById('artifacts-grid-list');
    if (!grid) return;
    grid.innerHTML = '';
    
    const collected = gameState.collectedArtifacts[roomName] || [];
    const definitions = artifactData[roomName] || {};
    const lang = gameState.language;
    
    if (collected.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: black;">${lang === 'en' ? 'No artifacts collected yet.' : 'Δεν έχουν συλλεχθεί τεχνουργήματα.'}</p>`;
        return;
    }
    
    collected.forEach(key => {
        const data = definitions[key];
        if (!data) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'artifact-grid-item interactive-ui';
        itemDiv.onclick = () => showArtifactDetails(roomName, key); 
        itemDiv.innerHTML = `<img src="${BASE_PATH + data.image}" alt="artifact" style="width: 100%; height: 100%; object-fit: contain;">`;
        grid.appendChild(itemDiv);
    });
    showArtifactsList();
}

function showArtifactDetails(roomName, artifactKey) {
    const detailsPanel = document.getElementById('artifact-detail-panel');
    const definition = artifactData[roomName][artifactKey];
    const lang = gameState.language;

    if (!definition) return;
    
    document.getElementById('detail-name-title').textContent = definition.name[lang];
    document.getElementById('detail-image').src = BASE_PATH + definition.image;
    document.getElementById('detail-description').innerHTML = definition.description[lang];

    document.getElementById('artifacts-grid-list').style.display = 'none';
    detailsPanel.style.display = 'block';
}

window.showArtifactsList = function() {
    document.getElementById('artifacts-grid-list').style.display = 'grid';
    document.getElementById('artifact-detail-panel').style.display = 'none';
}

function addArtifact(roomID, artifactKey) {
    gameState.collectedArtifacts[roomID] = gameState.collectedArtifacts[roomID] || [];
    if (!gameState.collectedArtifacts[roomID].includes(artifactKey)) {
        gameState.collectedArtifacts[roomID].push(artifactKey);
        saveGameState();
    }
}

// --- Flags & Language ---

function setFlag(flagKey, value = true) {
    gameState.flags[flagKey] = value;
    saveGameState();
}

function getFlag(flagKey) {
    return gameState.flags[flagKey];
}

function toggleLanguageMenu(show) {
    if (isMenuOpen('language-menu')) {
        closeAllMenus();
        return;
    }
    if (show) {
        closeAllMenus();
        document.getElementById('language-menu').style.display = 'flex';
    }
}

function changeGameLanguage(newLang) {
    gameState.language = newLang;
    localStorage.setItem('gameLanguage', newLang);
    window.location.reload(); 
}
function saveRoomProgress(roomID, sceneID) {
    // 1. Update the progress for this specific room
    gameState.roomProgress[roomID] = sceneID;
    // 2. Track which room the player is currently in
    gameState.currentRoom = roomID;
    // 3. Persist to localStorage
    saveGameState();
}

function getRoomProgress(roomID) {
    return gameState.roomProgress[roomID];
}

function attemptUseItem(itemKey) {
    const useEvent = new CustomEvent('itemUsed', { 
        detail: { item: itemKey, room: gameState.currentRoom } 
    });
    document.dispatchEvent(useEvent);
    toggleInventory(false);
}

// Initial Load
loadGameState();