/* Hidden Objects game: Separate images, Green Found Highlight, Hint System, Tutorial */

/* ---------- CONFIG ---------- */
const IMAGE_SRC = "Master_bedroom.png";

// HINT CONFIGURATION
const MAX_HINTS = 1;     
const HINT_TIME = 500;   

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

/* ---------- DOM references ---------- */
const wrapper = document.getElementById("game-wrapper");
const iconBar = document.getElementById("icon-bar");
const bgImage = document.getElementById("bg-image");
const hotspotLayer = document.getElementById("hotspot-layer");
const hintBtn = document.getElementById("hint-btn");

/* Track found state */
const found = new Set();
let hintsUsed = 0;

/* ---------- TUTORIAL LOGIC ---------- */
// Make this global so the HTML button can call it
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

/* ---------- build the icon bar ---------- */
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

/* ---------- create hotspot DOM elements ---------- */
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

/* ---------- When a hotspot is clicked (found) ---------- */
function onHotspotClick(id) {
  if (found.has(id)) return;
  found.add(id);

  // highlight icon
  const tile = iconBar.querySelector(`.icon[data-id="${id}"]`);
  if (tile) tile.classList.add("found");

  // highlight hotspot (Green)
  const hs = hotspotLayer.querySelector(`.hotspot[data-id="${id}"]`);
  if (hs) {
    hs.classList.add("found");
    hs.classList.remove("hint-active");
  }

  checkWinCondition();
}

/* ---------- HINT FUNCTIONALITY ---------- */
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

/* ---------- compute rendered image rectangle ---------- */
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

/* ---------- position hotspots ---------- */
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

/* ---------- orientation check ---------- */
function checkOrientation() {
  if (window.innerWidth > window.innerHeight) {
    wrapper.classList.add("landscape");
    wrapper.classList.remove("portrait");
  } else {
    wrapper.classList.add("portrait");
    wrapper.classList.remove("landscape");
  }
}

/* ---------- win condition check ---------- */
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

/* ---------- initialize everything ---------- */
function initialize() {
  buildIconBar();
  buildHotspots();
  updateHintButton();

  // Show Tutorial immediately on load
  toggleTutorial(); 

  function safePosition() {
    positionHotspots();
  }

  if (bgImage.complete && bgImage.naturalWidth) {
    safePosition();
  } else {
    bgImage.addEventListener('load', safePosition);
  }

  window.addEventListener('resize', () => {
    checkOrientation();
    positionHotspots();
  });

  checkOrientation();
  setTimeout(positionHotspots, 300);
  setTimeout(positionHotspots, 800);
}

initialize();