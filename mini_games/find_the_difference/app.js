document.addEventListener('DOMContentLoaded', () => {
    
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
    const resetBtn = document.getElementById('reset-btn'); // This is now the "Continue" button

    
    // --- INITIALIZATION ---
    totalCountDisplay.innerText = totalDiffs;
    tipsLeftDisplay.innerText = tipsAllowed;

    // Add this to your mini-game JavaScript or HTML head
(function() {
    // Store the initial orientation to compare later
    let currentOrientation = screen.orientation ? screen.orientation.type : window.orientation;

    const handleRotation = () => {
        // 1. Wait briefly for the device to finish the physical rotation animation
        setTimeout(() => {
            // 2. Check the new orientation
            const newOrientation = screen.orientation ? screen.orientation.type : window.orientation;

            // 3. Only reload if the orientation effectively changed (e.g. Portrait -> Landscape)
            // This prevents phantom reloads on minor sensor jitters
            if (newOrientation !== currentOrientation) {
                console.log("System: Orientation changed. Reloading layout...");
                window.location.reload();
            }
        }, 300); // 300ms delay is usually safe for all mobile browsers
    };

    // Listen for the event
    window.addEventListener('orientationchange', handleRotation);
    
    // Fallback for some Android devices that treat rotation as a resize
    window.addEventListener('resize', () => {
        // We check dimensions to see if the aspect ratio flipped
        if (window.innerWidth > window.innerHeight && currentOrientation.includes('portrait')) {
             handleRotation();
        }
    });
})();

    // --- TUTORIAL LOGIC ---
    window.toggleTutorial = function() {
        const modal = document.getElementById('tutorial-modal');
        modal.classList.toggle('show');
    };

    const modal = document.getElementById('tutorial-modal');
    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            toggleTutorial();
        }
    }, 100);

    // --- GAME LOGIC ---

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
        // A. Show the Win Message Modal
        setTimeout(() => {
            winMsg.style.display = 'block';
        }, 300);

        // B. Update the Game Flag
        // We check if setFlag exists first, to prevent errors if you test this file individually
        if (typeof setFlag === "function") {
            setFlag('Find_difference_solved', true);
        } else {
            console.log("Simulation: Flag 'Find_difference_solved' set to true");
        }
    }

    // 4. Handle Continue / Redirect
    // When the user clicks the button in the success modal
    resetBtn.addEventListener('click', () => {
        // Redirect to the main room
        window.location.href = "../../rooms/room_1.html";
    });
});