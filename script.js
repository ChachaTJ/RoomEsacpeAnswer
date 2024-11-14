// Constants
const TOTAL_TIME = 420; // 7 minutes in seconds
const HINT_INTERVAL = 20; // Show new hint every 20 seconds

// Game data
const problems = [
    {
        id: 1,
        question: "What is the voltage across the single lightbulb in the circuit?",
        description: "Given: Battery voltage = 12V, Lightbulb resistance = 2Ω",
        hints: [
            "Remember that voltage and current are related through resistance",
            "In a single bulb circuit, there's only one path for current to flow",
            "Think about how the voltage divides in a circuit with only one component",
        ],
        answer: "12",
        image: "images/circuit1.png"
    },
    {
        id: 2,
        question: "In a series circuit with two identical lightbulbs, what is the voltage across one bulb?",
        description: "Given: Battery voltage = 12V, Each lightbulb resistance = 2Ω",
        hints: [
            "Consider how resistance adds up in a series circuit",
            "Think about how the total voltage is distributed among equal resistances",
            "Calculate the total resistance first, then find the current",
        ],
        answer: "6",
        image: "images/circuit2.png"
    },
    {
        id: 3,
        question: "In a parallel circuit with two identical lightbulbs, what is the voltage across one bulb?",
        description: "Given: Battery voltage = 12V, Each lightbulb resistance = 2Ω",
        hints: [
            "Think about how voltage behaves in parallel branches",
            "Consider what happens to current in parallel circuits",
            "Remember that parallel components have the same voltage difference",
        ],
        answer: "12",
        image: "images/circuit3.png"
    }
];

// Game state
let currentProblem = 0;
let timeLeft = TOTAL_TIME;
let problemTimers = [0, 0, 0];
let hintsUsed = [0, 0, 0];
let gameInterval;
let isGameOver = false;

// DOM Elements
const elements = {
    problemNumber: document.getElementById('problemNumber'),
    hintsAvailable: document.getElementById('hintsAvailable'),
    timeLeft: document.getElementById('timeLeft'),
    circuitImage: document.getElementById('circuitImage'),
    question: document.getElementById('question'),
    description: document.getElementById('description'),
    hintAlert: document.getElementById('hintAlert'),
    hintText: document.getElementById('hintText'),
    answerInput: document.getElementById('answerInput'),
    submitBtn: document.getElementById('submitBtn'),
    hintBtn: document.getElementById('hintBtn'),
    correctAlert: document.getElementById('correctAlert'),
    successCard: document.getElementById('successCard'),
    gameOverAlert: document.getElementById('gameOverAlert'),
    gameCard: document.getElementById('gameCard'),
    timeUsed: document.getElementById('timeUsed'),
    timeRemaining: document.getElementById('timeRemaining'),
    totalHints: document.getElementById('totalHints'),
    hintsList: document.getElementById('hintsList')
};

// Helper Functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    elements.timeLeft.textContent = formatTime(timeLeft);
}

function getAvailableHints() {
    return Math.min(
        Math.floor(problemTimers[currentProblem] / HINT_INTERVAL),
        problems[currentProblem].hints.length
    );
}

function updateProblemDisplay() {
    const problem = problems[currentProblem];
    elements.problemNumber.textContent = currentProblem + 1;
    elements.circuitImage.src = problem.image;
    elements.question.textContent = problem.question;
    elements.description.textContent = problem.description;
    elements.hintsAvailable.textContent = getAvailableHints();
    elements.answerInput.value = '';
    elements.hintAlert.classList.add('hidden');
    elements.correctAlert.classList.add('hidden');
}

function showGameOver() {
    isGameOver = true;
    elements.gameCard.classList.add('hidden');
    elements.gameOverAlert.classList.remove('hidden');
    clearInterval(gameInterval);
}

function showSuccess() {
    elements.gameCard.classList.add('hidden');
    elements.successCard.classList.remove('hidden');
    
    const totalHintsUsed = hintsUsed.reduce((a, b) => a + b, 0);
    const timeUsed = TOTAL_TIME - timeLeft;
    
    elements.timeUsed.textContent = formatTime(timeUsed);
    elements.timeRemaining.textContent = formatTime(timeLeft);
    elements.totalHints.textContent = totalHintsUsed;
    
    elements.hintsList.innerHTML = hintsUsed.map((hints, idx) => 
        `<li>Problem ${idx + 1}: ${hints} hints</li>`
    ).join('');
    
    clearInterval(gameInterval);
}

// Event Handlers
function handleSubmit() {
    const userAnswer = elements.answerInput.value;
    if (userAnswer === problems[currentProblem].answer) {
        elements.correctAlert.classList.remove('hidden');
        if (currentProblem === problems.length - 1) {
            setTimeout(showSuccess, 2000);
        } else {
            setTimeout(() => {
                currentProblem++;
                updateProblemDisplay();
            }, 2000);
        }
    } else {
        elements.answerInput.classList.add('shake');
        timeLeft = Math.max(0, timeLeft - 10); // Penalty: -10 seconds
        updateTimerDisplay();
        setTimeout(() => {
            elements.answerInput.classList.remove('shake');
        }, 820);
    }
}

function handleHint() {
    const availableHints = getAvailableHints();
    if (hintsUsed[currentProblem] < availableHints) {
        hintsUsed[currentProblem]++;
        elements.hintText.textContent = `Hint ${hintsUsed[currentProblem]}: ${problems[currentProblem].hints[hintsUsed[currentProblem] - 1]}`;
        elements.hintAlert.classList.remove('hidden');
        elements.hintsAvailable.textContent = availableHints - hintsUsed[currentProblem];
    }
}

// Game initialization
function initGame() {
    updateProblemDisplay();
    updateTimerDisplay();
    
    gameInterval = setInterval(() => {
        if (timeLeft <= 0) {
            showGameOver();
            return;
        }
        
        timeLeft--;
        problemTimers[currentProblem]++;
        updateTimerDisplay();
        elements.hintsAvailable.textContent = getAvailableHints() - hintsUsed[currentProblem];
    }, 1000);
    
    // Event Listeners
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.hintBtn.addEventListener('click', handleHint);
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
}

// Start the game
initGame();