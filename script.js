// Constants
const TOTAL_TIME = 420; // 7 minutes in seconds
const HINT_INTERVAL = 20; // Show new hint every 20 seconds

// 전기 효과 관련 함수
function createSparks() {
    const electricityElements = document.querySelectorAll('.electricity');
    
    
    electricityElements.forEach(el => {
        // 기존 스파크 제거
        el.innerHTML = '';
        
        for(let i = 0; i < 5; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = Math.random() * 100 + '%';
            spark.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            spark.style.animationDelay = (Math.random() * 2) + 's';
            el.appendChild(spark);
        }
    });
}

function createLightningEffect() {
    const electricityElements = document.querySelectorAll('.electricity');
    
    electricityElements.forEach(el => {
        // Clear existing effects
        el.innerHTML = '';
        
        // Create main lightning bolt
        const lightning = document.createElement('div');
        lightning.className = 'lightning';
        lightning.style.left = Math.random() * 80 + '%';
        el.appendChild(lightning);

        // Create lightning branches
        const branchCount = Math.floor(Math.random() * 3) + 2;
        for(let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'lightning-branch';
            branch.style.left = Math.random() * 80 + '%';
            branch.style.top = (Math.random() * 60 + 20) + '%';
            branch.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
            el.appendChild(branch);
        }

        // Create sparks
        const sparkCount = Math.floor(Math.random() * 4) + 3;
        for(let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = Math.random() * 100 + '%';
            spark.style.top = Math.random() * 100 + '%';
            spark.style.animationDuration = (Math.random() * 0.5 + 0.3) + 's';
            spark.style.animationDelay = (Math.random() * 0.5) + 's';
            el.appendChild(spark);
        }
    });
}

createSparks();
    setInterval(createSparks, 2000);

createLightningEffect();
    setInterval(createLightningEffect, 1500);

// Game data
const problems = [
   {
       id: "1-1",
       question: "Total resistance in Series Circuit",
       description: "Given: Battery voltage = 18V, R1 = 3Ω, R2 = 5Ω, R3 = 1Ω",
       hints: [
           "For total resistance in series: add all resistances",
           "Remember: resistors in series add directly",
       ],
       answer: "9",
       image: "images/circuit1.png",
       inputType: "single",
       label: "Total Resistance (Ω):"
   },
   {
       id: "1-2",
       question: "Total Current in Series Circuit",
       description: "Given: Battery voltage = 18V, Total Resistance = 9Ω",
       hints: [
           "Use Ohm's law: I = V/R to find total current",
           "Remember: V = 18V, R = 9Ω",
       ],
       answer: "2",
       image: "images/circuit1.png",
       inputType: "single",
       label: "Total Current (A):"
   },
   {
       id: "2-1",
       question: "Total resistance in Parallel Circuit",
       description: "Given: Battery voltage = 18V, R1 = 3Ω, R2 = 5Ω, R3 = 1Ω",
       hints: [
           "For parallel resistance: use 1/Rt = 1/R1 + 1/R2 + 1/R3",
           "Simplify the fraction",
       ],
       answer: {
           numerator: "15",
           denominator: "23"
       },
       image: "images/circuit2.png",
       inputType: "fraction",
       label: "Total Resistance (Ω):"
   },
   {
       id: "2-2",
       question: "Total Current in Parallel Circuit",
       description: "Given: Battery voltage = 18V, Total Resistance = 15/23 Ω",
       hints: [
           "Use Ohm's law: I = V/R for total current",
           "Remember to use the total resistance you just calculated",
       ],
       answer: "27.6",
       image: "images/circuit2.png",
       inputType: "single",
       label: "Total Current (A):"
   }
];

// Game state
let currentProblem = 0;
let timeLeft = TOTAL_TIME;
let problemTimers = [0, 0, 0, 0];  // 4 problems now
let hintsUsed = [0, 0, 0, 0];      // 4 problems now
let gameInterval;
let isGameOver = false;
let hasShownExtraTimeAlert = false;

// DOM Elements
const elements = {
   problemNumber: document.getElementById('problemNumber'),
   hintsAvailable: document.getElementById('hintsAvailable'),
   timeLeft: document.getElementById('timeLeft'),
   circuitImage: document.getElementById('circuitImage'),
   question: document.getElementById('question'),
   description: document.getElementById('description'),
   hintsList: document.getElementById('hintsList'),  // hintAlert 대신 hintsList
   submitBtn: document.getElementById('submitBtn'),
   hintBtn: document.getElementById('hintBtn'),
   correctAlert: document.getElementById('correctAlert'),
   successCard: document.getElementById('successCard'),
   gameOverAlert: document.getElementById('gameOverAlert'),
   gameCard: document.getElementById('gameCard'),
   timeUsed: document.getElementById('timeUsed'),
   timeRemaining: document.getElementById('timeRemaining'),
   totalHints: document.getElementById('totalHints'),
   hintTimeDisplay: document.getElementById('hintTimeDisplay')
};

// Helper Functions
function formatTime(seconds) {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;
    return `${isNegative ? '-' : ''}${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

function updateHintTimeDisplay() {
   const availableHints = getAvailableHints();
   const usedHints = hintsUsed[currentProblem];
   const remainingHints = problems[currentProblem].hints.length - usedHints;
   
   if (remainingHints <= 0) {
       elements.hintTimeDisplay.textContent = "No more hints";
       return;
   }

   const timeUntilNextHint = HINT_INTERVAL - (problemTimers[currentProblem] % HINT_INTERVAL);
   elements.hintTimeDisplay.textContent = `Next hint in: ${timeUntilNextHint}s`;
}

function updateProblemDisplay() {
   const problem = problems[currentProblem];
   elements.problemNumber.textContent = problem.id;
   elements.circuitImage.src = problem.image;
   elements.question.textContent = problem.question;
   elements.description.textContent = problem.description;
   elements.hintsAvailable.textContent = getAvailableHints();
   
   // Update input display
   document.getElementById('singleInput').style.display = 
       problem.inputType === 'single' ? 'flex' : 'none';
   document.getElementById('fractionInput').style.display = 
       problem.inputType === 'fraction' ? 'flex' : 'none';
   
   // Update labels
   document.getElementById('answerLabel').textContent = problem.label;
   document.getElementById('fractionLabel').textContent = problem.label;
   
   // Clear inputs
   document.getElementById('singleAnswer').value = '';
   document.getElementById('numeratorAnswer').value = '';
   document.getElementById('denominatorAnswer').value = '';
   
   // 힌트 목록 초기화
   elements.hintsList.innerHTML = '';
   
   elements.correctAlert.classList.add('hidden');
   
   updateHintTimeDisplay();
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


   
   
   // 문제 리뷰 생성
   const reviewList = document.getElementById('problemReviewList');
   reviewList.innerHTML = problems.map((problem, index) => {
       const answerDisplay = problem.inputType === 'fraction' 
           ? `${problem.answer.numerator}/${problem.answer.denominator}`
           : problem.answer;
           
       return `
           <div class="problem-review-item">
               <div class="problem-review-header">
                   <h4>Problem ${problem.id}</h4>
                   <span class="correct-answer">Answer: ${answerDisplay}</span>
               </div>
               <div class="problem-review-content">
                   <div class="problem-review-text">
                       <p><strong>Question:</strong> ${problem.question}</p>
                       <p><strong>Given:</strong> ${problem.description}</p>
                       ${hintsUsed[index] > 0 ? `
                           <div class="problem-hints">
                               <h5>Hints Used:</h5>
                               <ul>
                                   ${problem.hints.slice(0, hintsUsed[index]).map((hint, i) => 
                                       `<li>${i + 1}. ${hint}</li>`
                                   ).join('')}
                               </ul>
                           </div>
                       ` : ''}
                   </div>
                   <div class="problem-review-image">
                       <img src="${problem.image}" alt="Circuit diagram for problem ${problem.id}" 
                            class="problem-review-image">
                   </div>
               </div>
           </div>
       `;
   }).join('');
   
   clearInterval(gameInterval);
}

function handleSubmit() {
    const problem = problems[currentProblem];
    let isCorrect = false;

    if (problem.inputType === 'single') {
        const answer = document.getElementById('singleAnswer').value;
        isCorrect = answer === problem.answer;
    } else if (problem.inputType === 'fraction') {
        const numerator = document.getElementById('numeratorAnswer').value;
        const denominator = document.getElementById('denominatorAnswer').value;
        isCorrect = numerator === problem.answer.numerator && 
                   denominator === problem.answer.denominator;
    }

    if (isCorrect) {
        const correctAlert = elements.correctAlert;
        correctAlert.setAttribute('data-problem', problem.id);
        
        document.getElementById('solvedProblemNumber').textContent = problem.id;
        
        // 마지막 문제(2-2)인 경우 
        if (problem.id === "2-2") {
            correctAlert.classList.add('final');
            correctAlert.querySelector('.door-text').textContent = 'ESCAPED!';
            
        }
        
        correctAlert.classList.add('visible');
        correctAlert.classList.remove('hidden');
        
        setTimeout(() => {
            correctAlert.classList.add('show-animation');
            
            if (problem.id === "2-2") {
                // 마지막 문제는 더 오래 보여주고, 폭죽과 빛 효과가 충분히 보이도록 함
                setTimeout(() => {
                    correctAlert.classList.remove('show-animation', 'visible');
                    correctAlert.classList.add('hidden');
                    elements.gameCard.style.display = 'none';
                    showSuccess();
                }, 3000); // 4초로 늘림
            } else {
                setTimeout(() => {
                    correctAlert.classList.remove('show-animation', 'visible');
                    correctAlert.classList.add('hidden');
                    currentProblem++;
                    updateProblemDisplay();
                }, 3000);
            }
        }, 100);
    
    } else {
        // Wrong answer feedback
        const inputs = problem.inputType === 'single' 
            ? [document.getElementById('singleAnswer')]
            : [document.getElementById('numeratorAnswer'), 
               document.getElementById('denominatorAnswer')];
        
        inputs.forEach(input => input.classList.add('shake'));
        
        timeLeft = Math.max(0, timeLeft - 10); // Penalty: -10 seconds
        updateTimerDisplay();
        
        setTimeout(() => {
            inputs.forEach(input => input.classList.remove('shake'));
        }, 820);
    }
}


function handleHint() {
   const availableHints = getAvailableHints();
   if (hintsUsed[currentProblem] < availableHints) {
       hintsUsed[currentProblem]++;
       
       // 새로운 힌트 요소 생성
       const hintElement = document.createElement('div');
       hintElement.className = 'hint-item';
       
       const iconSpan = document.createElement('span');
       iconSpan.className = 'icon';
       iconSpan.textContent = '💡';
       
       const textSpan = document.createElement('span');
       textSpan.textContent = `Hint ${hintsUsed[currentProblem]}: ${problems[currentProblem].hints[hintsUsed[currentProblem] - 1]}`;
       
       hintElement.appendChild(iconSpan);
       hintElement.appendChild(textSpan);
       
       // 힌트 목록의 시작 부분에 새 힌트 추가
       elements.hintsList.insertBefore(hintElement, elements.hintsList.firstChild);
       
       elements.hintsAvailable.textContent = availableHints - hintsUsed[currentProblem];
       updateHintTimeDisplay();
   }
}

// Game initialization
function initGame() {
    updateProblemDisplay();
    updateTimerDisplay();
    
    gameInterval = setInterval(() => {
        if (timeLeft <= -180) {
            showGameOver();
            return;
        }
        
        // 0초가 되었을 때 추가 시간 알림
        if (timeLeft === 0 && !hasShownExtraTimeAlert) {
            showExtraTimeAlert();
        }
        
        timeLeft--;
        problemTimers[currentProblem]++;
        updateTimerDisplay();
        updateHintTimeDisplay();
        elements.hintsAvailable.textContent = getAvailableHints() - hintsUsed[currentProblem];
    }, 1000);
    
    // Event Listeners
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.hintBtn.addEventListener('click', handleHint);
    
    // Enter key functionality
    document.getElementById('singleAnswer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
    document.getElementById('numeratorAnswer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
    document.getElementById('denominatorAnswer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
 }


function showExtraTimeAlert() {
    hasShownExtraTimeAlert = true;
    const extraTimeAlert = document.getElementById('extraTimeAlert');
    extraTimeAlert.classList.remove('hidden');
    extraTimeAlert.classList.add('visible');
    
    setTimeout(() => {
        extraTimeAlert.classList.add('show-animation');
        
        // 3초 후에 알림 닫기
        setTimeout(() => {
            extraTimeAlert.classList.remove('show-animation', 'visible');
            extraTimeAlert.classList.add('hidden');
        }, 3000);
    }, 100);
}
// Start the game
function startGame() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameCard').style.display = 'block';  // 게임 카드 보이기
    initGame();  // 게임 초기화 및 시작
}

// DOM이 로드되면 게임 요소들 초기화
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements 재할당
    elements.problemNumber = document.getElementById('problemNumber');
    elements.hintsAvailable = document.getElementById('hintsAvailable');
    elements.timeLeft = document.getElementById('timeLeft');
    elements.circuitImage = document.getElementById('circuitImage');
    elements.question = document.getElementById('question');
    elements.description = document.getElementById('description');
    elements.hintsList = document.getElementById('hintsList');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.hintBtn = document.getElementById('hintBtn');
    elements.correctAlert = document.getElementById('correctAlert');
    elements.successCard = document.getElementById('successCard');
    elements.gameOverAlert = document.getElementById('gameOverAlert');
    elements.gameCard = document.getElementById('gameCard');
    elements.timeUsed = document.getElementById('timeUsed');
    elements.timeRemaining = document.getElementById('timeRemaining');
    elements.totalHints = document.getElementById('totalHints');
    elements.hintTimeDisplay = document.getElementById('hintTimeDisplay');
    elements.extraTimeAlert = document.getElementById('extraTimeAlert'); 

    // 시작 화면만 보이고 게임 카드는 숨기기
    document.getElementById('gameCard').style.display = 'none';
});



