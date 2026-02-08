/* --- 1. CONFIGURATION (BILINGUAL DATA) --- */
const quizData = [
    {
        question: {
            en: "Why did high society people collect various objects and place them in rooms where visitors would see them?",
            gr: "Για ποιό λόγο οι άνθρωποι της υψηλής κοινωνίας μάζευαν διάφορα αντικείμενα και τα τοποθετούσαν στα δωμάτια όπου επισκέπτες θα τα έβλεπαν;"
        },
        img: null, 
        answers: {
            en: ["Because they believed it would bring good feng shui.", "Because they wanted to show off their wealth.", "Because they just wanted to."],
            gr: ["Γιατί πίστευαν ότι έτσι θα είχαν καλό feng shui.", "Γιατί ήθελαν να αναδείξουν τον πλούτο τους.", "Γιατί έτσι ήθελαν."]
        },
        correct: 1 
    },
    {
        question: {
            en: "Why did the maids have two different aprons to wear?",
            gr: "Γιατί οι υπηρέτριες είχαν δύο διαφορετικές ποδιές που φορούσαν;"
        },
        img: null, 
        answers: {
            en: ["To wear one while doing chores inside the house, and the other for serving guests.", "To wear one while the other was being washed.", "To wear one when the master was home, and the other when he was away."],
            gr: ["Για να φοράνε την μία ενώ έκαναν δουλειές μέσα στο σπίτι, και την άλλη για το σερβίρισμα.", "Για να φοράνε την μία όταν είχαν την άλλη να πλένεται.", "Για να φοράνε την μία όταν το αφεντικό ήταν στο σπίτι, και την άλλη όταν έλειπε."]
        },
        correct: 0
    },
    {
        question: {
            en: "What was the name of the dance card that came with invitations for high society ladies?",
            gr: "Πώς λεγόταν η κάρτα με τους χορούς που ερχόταν μαζί με τις προσκλήσεις στις κυρίες υψηλής κοινωνίας;"
        },
        img: null,
        answers: {
            en: ["De bal carnet", "Carnet de bal", "Carte de bal"],
            gr: ["De bal carnet", "Carnet de bal", "Carte de bal"]
        },
        correct: 1
    },
    {
        question: {
            en: "Who was not allowed to enter the square at that time?",
            gr: "Ποιοι δεν μπορούσαν να μπουν στην πλατεία εκείνη την εποχή;"
        },
        img: null,
        answers: {
            en: ["High society people who were well-dressed.", "Children.", "People who were not well-dressed."],
            gr: ["Άτομα υψηλής κοινωνίας που ήταν καλά ντυμένα.", "Παιδιά", "Άτομα που δεν ήταν καλά ντυμένα."]
        },
        correct: 2
    },
    {
        question: {
            en: "Why did the masters of the house always bring new clothes for the women whenever they returned from a trip to Paris?",
            gr: "Γιατί όποτε γυρνούσαν οι κύριοι του σπιτιού από ταξίδι στο Παρίσι, έφερναν πάντα καινούργια ρούχα για τις γυναίκες του σπιτιού;"
        },
        img: null,
        answers: {
            en: ["Because they wanted to give them gifts.", "Because it was considered proper.", "Because Paris was the fashion capital, and styles there became popular here, so ladies had to compete on who had the most fashionable clothes."],
            gr: ["Γιατί ήθελαν να τους κάνουν δώρα.", "Γιατί έτσι θεωρούταν σωστό.", "Γιατί το Παρίσι ήταν η πρωτεύουσα της μόδας, και όλα τα στυλ από εκεί γινόντουσαν μεγάλα και εδώ, οπότε οι κυρίες και δεσποινίδες έπρεπε να αγωνιστούν μεταξύ τους ως προς το ποιά έχει τα πιο “μοδάτα” ρούχα."]
        },
        correct: 2
    },
    {
        question: {
            en: "Which of the servants did the master of the house trust the most?",
            gr: "Ποιον από τους υπηρέτες εμπιστευόταν περισσότερο ο κύριος του σπιτιού;"
        },
        img: null,
        answers: {
            en: ["The butler.", "The head maid.", "The cook."],
            gr: ["Τον μπάτλερ.", "Την κύρια υπηρέτρια.", "Την μαγείρισσα."]
        },
        correct: 0
    },
    {
        question: {
            en: "Only one person was allowed to use the sewing machine. Who was it?",
            gr: "Την ραπτομηχανή μπορούσε μόνο να την χρησιμοποιεί ένα άτομο. Ποιο ήταν αυτό;"
        },
        img: null,
        answers: {
            en: ["The lady of the house.", "A kitchen maid.", "The man of the house."],
            gr: ["Η κυρία του σπιτιού", "Μία υπηρέτρια της κουζίνας", "Ο άντρας του σπιτιού."]
        },
        correct: 0
    },
    {
        question: {
            en: "What is the difference between a Butler and a Head Maid?",
            gr: "Ποια είναι η διαφορά μεταξύ Μπάτλερ και Επικεφαλής Υπηρέτριας;"
        },
        img: null,
        answers: {
            en: ["The butler managed the household finances.", "Butler was responsible for receiving visitors.", "The Head Maid managed the house scout."],
            gr: ["Ο Μπάτλερ διαχειριζόταν τα οικονομικά του σπιτιού", "Ο Μπάτλερ ήταν υπεύθυνος για την υποδοχή επισκέψεων", "Η Επικεφαλής Υπηρέτρια διαχειριζόταν το προσκοπικό του σπιτιού."]
        },
        correct: 0
    }
];

// --- TUTORIAL DATA (Bilingual) ---
const tutorialData = {
    en: {
        title: "How to Play",
        step1Head: "Read",
        step1Desc: "Read the question carefully.",
        step2Head: "Select",
        step2Desc: "Tap the answer you think is correct.",
        step3Head: "Feedback",
        step3Desc: "Green is correct. Red is wrong.",
        closeBtn: "CLOSE"
    },
    gr: {
        title: "Πώς να παίξεις",
        step1Head: "Διάβασε",
        step1Desc: "Διάβασε προσεκτικά την ερώτηση.",
        step2Head: "Επίλεξε",
        step2Desc: "Πάτησε την απάντηση που νομίζεις ότι είναι σωστή.",
        step3Head: "Αποτέλεσμα",
        step3Desc: "Πράσινο είναι το σωστό. Κόκκινο είναι το λάθος.",
        closeBtn: "ΚΛΕΙΣΙΜΟ"
    }
};

/* --- 2. STATE VARIABLES --- */
let currentQuestionIndex = 0;
let score = 0;
let isGameLocked = false; 
let currentLang = 'en'; 

/* --- 3. DOM ELEMENTS --- */
const currentIdxDisplay = document.getElementById('current-index');
const totalCountDisplay = document.getElementById('total-count');
const questionText = document.getElementById('question-text');
const questionImage = document.getElementById('question-image');
const answersContainer = document.getElementById('answers-container');
const gameContainer = document.getElementById('game-container');

/* --- 4. INITIALIZATION --- */
function initGame() {
    const storedLang = localStorage.getItem('gameLanguage'); 
    
    if (storedLang === 'gr' || storedLang === 'el' || storedLang === 'Greek') {
        currentLang = 'gr';
    } else {
        currentLang = 'en';
    }

    // Update Tutorial Language immediately
    updateTutorialLanguage();

    // Show tutorial automatically on load
    const modal = document.getElementById('tutorial-modal');
    if (!modal.classList.contains('show')) {
        toggleTutorial();
    }

    totalCountDisplay.innerText = quizData.length;
    loadQuestion();
}

/* --- 5. TUTORIAL FUNCTIONS --- */
// Function to toggle the modal visibility
window.toggleTutorial = function() {
    const modal = document.getElementById('tutorial-modal');
    modal.classList.toggle('show');
}

// Function to update tutorial text based on language
function updateTutorialLanguage() {
    const t = tutorialData[currentLang];
    
    document.getElementById('tut-title').innerText = t.title;
    
    document.getElementById('tut-step1-head').innerText = t.step1Head;
    document.getElementById('tut-step1-desc').innerText = t.step1Desc;
    
    document.getElementById('tut-step2-head').innerText = t.step2Head;
    document.getElementById('tut-step2-desc').innerText = t.step2Desc;
    
    document.getElementById('tut-step3-head').innerText = t.step3Head;
    document.getElementById('tut-step3-desc').innerText = t.step3Desc;
    
    document.getElementById('tut-close-btn').innerText = t.closeBtn;
}

/* --- 6. CORE GAME LOGIC --- */
function loadQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        calculateAndFinish();
        return;
    }

    isGameLocked = false;
    answersContainer.classList.remove('no-click');

    const data = quizData[currentQuestionIndex];

    currentIdxDisplay.innerText = currentQuestionIndex + 1;
    
    questionText.innerText = data.question[currentLang];

    if (data.img) {
        questionImage.src = data.img;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }

    answersContainer.innerHTML = ''; 
    
    data.answers[currentLang].forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = answer;
        btn.onclick = () => handleAnswer(index, btn);
        answersContainer.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, selectedBtn) {
    if (isGameLocked) return; 
    isGameLocked = true; 

    answersContainer.classList.add('no-click');

    const currentData = quizData[currentQuestionIndex];
    const correctIndex = currentData.correct;
    
    const allButtons = answersContainer.querySelectorAll('.answer-btn');

    if (selectedIndex === correctIndex) {
        score++;
        selectedBtn.classList.add('btn-correct');
    } else {
        selectedBtn.classList.add('btn-wrong');
        if(allButtons[correctIndex]) {
            allButtons[correctIndex].classList.add('btn-correct');
        }
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 2000);
}

function calculateAndFinish() {
    const total = quizData.length;
    const mistakes = total - score;
    let stars = 1; 

    if (mistakes === 0) {
        stars = 3;
    } else if (mistakes === 1) {
        stars = 2;
    }

    // Pass the score and total to the setFlag function
    setFlag(stars, score, total);
    
    // Slight delay to ensure saving happens before redirect
    setTimeout(() => {
        window.location.href = "../../rooms/room_8.html";
    }, 100);
}

/* --- 7. INTEGRATION --- */
function setFlag(starCount, rawScore, totalQuestions) {
    console.log(`Quiz Finished. Stars: ${starCount} | Score: ${rawScore}/${totalQuestions}`);

    if (typeof gameState !== 'undefined') {
        // 1. Save the calculated Stars
        gameState.flags['Quiz_Final_Stars'] = starCount;
        
        // 2. Save the Raw Score numbers
        gameState.flags['Quiz_Score_Correct'] = rawScore;
        gameState.flags['Quiz_Score_Total'] = totalQuestions;

        // 3. Persist to LocalStorage
        localStorage.setItem('museumAdventure_gameState', JSON.stringify(gameState));
    } else {
        try {
            const savedJSON = localStorage.getItem('museumAdventure_gameState');
            if (savedJSON) {
                let tempState = JSON.parse(savedJSON);
                tempState.flags['Quiz_Final_Stars'] = starCount;
                tempState.flags['Quiz_Score_Correct'] = rawScore;
                tempState.flags['Quiz_Score_Total'] = totalQuestions;
                localStorage.setItem('museumAdventure_gameState', JSON.stringify(tempState));
            }
        } catch (e) {
            console.error("Could not save quiz score to storage", e);
        }
    }
    
    gameContainer.style.display = 'none';
}

initGame();