

const IMAGE_SRC = "Master_bedroom.png";


const MAX_HINTS = 1;     
const HINT_TIME = 500;   

const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Find Objects",
        step1Desc: "Look at the side bar to see which items are hidden in the room.",
        step2Head: "Click to Collect",
        step2Desc: "Tap the hidden objects in the scene to remove them from your list.",
        step3Head: "Use Hints",
        step3Desc: "Stuck? Use the Hint button to briefly highlight the remaining items.",
        closeBtn: "PLAY"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Βρες τα αντικείμενα",
        step1Desc: "Δες τη λίστα στα πλάγια για να δεις ποια αντικείμενα κρύβονται στο δωμάτιο.",
        step2Head: "Πάτα για συλλογή",
        step2Desc: "Πάτα πάνω στα κρυμμένα αντικείμενα για να τα συλλέξεις.",
        step3Head: "Βοήθεια",
        step3Desc: "Κόλλησες; Πάτα το κουμπί HINT για να δεις πού βρίσκονται τα αντικείμενα.",
        closeBtn: "ΠΑΙΞΕ"
    }
};

window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

function updateTutorialLanguage() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    let lang = 'en'; 
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        lang = 'gr';
    }

    const t = tutorialData[lang];
    
    // Safety checks to prevent errors if IDs are missing
    const elements = {
        'tut-title': t.title,
        'tut-step1-head': t.step1Head,
        'tut-step1-desc': t.step1Desc,
        'tut-step2-head': t.step2Head,
        'tut-step2-desc': t.step2Desc,
        'tut-step3-head': t.step3Head,
        'tut-step3-desc': t.step3Desc,
        'tut-close-btn': t.closeBtn
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    }
}

function initTutorial() {
    updateTutorialLanguage();
    const modal = document.getElementById('tutorial-modal');
    if (modal) modal.classList.add('show');
}

const hotspots = [
  { 
    id: "h1", 
    name: "Golden cap", 
    hotspotImg: "golden_cap.png", 
    iconImg: "golden_cap.png", 
    x: 28.5, y: 79.0, w: 9.5, h: 9.0 
  }, 
  { 
    id: "h2", 
    name: "Safety pin", 
    hotspotImg: "Safety_Pin.png", 
    iconImg: "Safety_Pin.png", 
    x: 5.0, y: 5.0, w: 6.0, h: 8.0 
  }, 
  { 
    id: "h3", 
    name: "Cold cream", 
    hotspotImg: "cold_cream.png", 
    iconImg: "cold_cream1.png", 
    x: 53.0, y: 13.0, w: 12.0, h: 12.0 
  }, 
  { 
    id: "h4", 
    name: "Parfume", 
    hotspotImg: "parfume_19th.png", 
    iconImg: "parfume_19th1.png", 
    x: -3.0, y: 80.0, w: 20.0, h: 20.0 
  }, 
  { 
    id: "h5", 
    name: "Feather", 
    hotspotImg: "feather.png", 
    iconImg: "feather.png", 
    x: 80.5, y: 66.0, w: 8.5, h: 8.5 
  } 
];

const wrapper = document.getElementById("game-wrapper");
const iconBar = document.getElementById("icon-bar");
const bgImage = document.getElementById("bg-image");
const hotspotLayer = document.getElementById("hotspot-layer");
const hintBtn = document.getElementById("hint-btn");

const found = new Set();
let hintsUsed = 0;

window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

function buildIconBar() {
  iconBar.innerHTML = ""; 
  hotspots.forEach(h => {
    const tile = document.createElement("div");
    tile.className = "icon";
    tile.dataset.id = h.id;
    tile.title = h.name;
    
    const img = document.createElement("img");
    img.src = h.iconImg; 
    img.alt = h.name;
    tile.appendChild(img);

    iconBar.appendChild(tile);
  });
}

function buildHotspots() {
  hotspotLayer.innerHTML = "";
  hotspots.forEach(h => {
    const el = document.createElement("div");
    el.className = "hotspot";
    el.dataset.id = h.id;

    const img = document.createElement("img");
    img.src = h.hotspotImg; 
    img.className = "hotspot-obj";
    el.appendChild(img);

    el.addEventListener("click", () => onHotspotClick(h.id));
    hotspotLayer.appendChild(el);
  });
}

function onHotspotClick(id) {
  if (found.has(id)) return;
  found.add(id);

  const tile = iconBar.querySelector(`.icon[data-id="${id}"]`);
  if (tile) tile.classList.add("found");

  const hs = hotspotLayer.querySelector(`.hotspot[data-id="${id}"]`);
  if (hs) {
    hs.classList.add("found");
    hs.classList.remove("hint-active");
  }

  checkWinCondition();
}

hintBtn.addEventListener('click', () => {
    if (hintsUsed >= MAX_HINTS) return;
    
    hintsUsed++;
    updateHintButton();

    const unfoundIds = hotspots
        .filter(h => !found.has(h.id))
        .map(h => h.id);
    
    unfoundIds.forEach(id => {
        const el = hotspotLayer.querySelector(`.hotspot[data-id="${id}"]`);
        if(el) el.classList.add('hint-active');
    });

    setTimeout(() => {
        unfoundIds.forEach(id => {
            const el = hotspotLayer.querySelector(`.hotspot[data-id="${id}"]`);
            if(el) el.classList.remove('hint-active');
        });
    }, HINT_TIME);
});

function updateHintButton() {
    if (hintsUsed >= MAX_HINTS) {
        hintBtn.textContent = "NO HINTS";
        hintBtn.disabled = true;
    } else {
        const remaining = MAX_HINTS - hintsUsed;
        hintBtn.textContent = `HINT (${remaining})`;
    }
}

function getImageRect() {
  const img = bgImage;
  if (!img || !img.complete || img.naturalWidth === 0) return null;

  const frame = img.parentElement.getBoundingClientRect();
  const frameW = frame.width;
  const frameH = frame.height;

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const imgRatio = iw / ih;
  const frameRatio = frameW / frameH;

  let renderedW, renderedH, offsetLeft, offsetTop;

  if (imgRatio > frameRatio) {
    renderedW = frameW;
    renderedH = frameW / imgRatio;
    offsetLeft = frame.left;
    offsetTop = frame.top + (frameH - renderedH) / 2;
  } else {
    renderedH = frameH;
    renderedW = frameH * imgRatio;
    offsetLeft = frame.left + (frameW - renderedW) / 2;
    offsetTop = frame.top;
  }

  return {
    left: offsetLeft,
    top: offsetTop,
    width: renderedW,
    height: renderedH
  };
}
function positionHotspots() {
  const rect = getImageRect();
  if (!rect) return;

  const layerRect = hotspotLayer.getBoundingClientRect();

  hotspots.forEach(h => {
    const el = hotspotLayer.querySelector(`.hotspot[data-id="${h.id}"]`);
    if (!el) return;

    const px = rect.left + (h.x / 100) * rect.width;
    const py = rect.top + (h.y / 100) * rect.height;
    const pw = (h.w / 100) * rect.width;
    const ph = (h.h / 100) * rect.height;

    const relLeft = px - layerRect.left;
    const relTop = py - layerRect.top;

    el.style.left = `${relLeft}px`;
    el.style.top = `${relTop}px`;
    el.style.width = `${pw}px`;
    el.style.height = `${ph}px`;
  });
}

function checkOrientation() {
  if (window.innerWidth > window.innerHeight) {
    wrapper.classList.add("landscape");
    wrapper.classList.remove("portrait");
  } else {
    wrapper.classList.add("portrait");
    wrapper.classList.remove("landscape");
  }
}

function checkWinCondition() {
  if (found.size === hotspots.length) {
    document.getElementById("win-popup").classList.remove("hidden");
    if (typeof setFlag === 'function') {
                    setFlag('Hidden_objects_solved', true);
                    window.location.href = "../../rooms/room_7.html";
                } else {
                    console.log("Game Won! Flag 'H_Puzzle_solved' set to true.");
                }
  }
}

function initialize() {
    buildIconBar();
    buildHotspots();
    updateHintButton();

    // 1. Set the language strings first
    updateTutorialLanguage();

    // 2. Setup resizing listeners
    window.addEventListener('resize', () => {
        checkOrientation();
        positionHotspots();
    });

    if (bgImage.complete && bgImage.naturalWidth) {
        positionHotspots();
    } else {
        bgImage.addEventListener('load', positionHotspots);
    }

    checkOrientation();

    // 3. FORCE THE POP-UP
    // We use a tiny delay so the "fadeIn" animation triggers correctly
    setTimeout(() => {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 100); 
}

initialize();