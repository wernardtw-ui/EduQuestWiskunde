let currentTerm = null;
let questions = [];
let currentQuestionIndex = 0;

// Load a term (term1, term2, etc.)
function loadTerm(term) {
    fetch(`${term}.json`)
        .then(response => response.json())
        .then(data => {
            currentTerm = term;
            questions = data;
            currentQuestionIndex = 0;
            document.getElementById('game-area').style.display = 'block';
            showQuestion();
        })
        .catch(err => {
            console.error("Error loading term:", err);
            alert("Kon nie die vrae laai nie. Maak seker " + term + ".json bestaan.");
        });
}

// Show current question
function showQuestion() {
    const q = questions[currentQuestionIndex];
    const questionText = document.getElementById('questionText');
    const slotsDiv = document.getElementById('slots');
    const optionsDiv = document.getElementById('options');

    questionText.innerHTML = q.text;

    // Clear slots & options
    slotsDiv.innerHTML = '';
    optionsDiv.innerHTML = '';

    // Create slots
    q.solution.forEach((_, i) => {
        const slot = document.createElement('div');
        slot.className = 'drop-slot';
        slot.dataset.index = i;
        slot.addEventListener('dragover', allowDrop);
        slot.addEventListener('drop', drop);
        slotsDiv.appendChild(slot);
    });

    // Create options (shuffled)
    const shuffledOptions = shuffleArray([...q.solution, ...q.distractors]);
    shuffledOptions.forEach(optionText => {
        const option = document.createElement('div');
        option.className = 'option';
        option.draggable = true;
        option.innerText = optionText;
        option.addEventListener('dragstart', dragStart);
        optionsDiv.appendChild(option);
    });

    // Add hint button if available
    if (q.hint) {
        const hintBtn = document.createElement('button');
        hintBtn.className = 'hint-btn';
        hintBtn.innerText = '💡 Hint';
        hintBtn.onclick = () => alert(q.hint);
        questionText.appendChild(hintBtn);
    }
}

// Drag-and-drop functions
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const slotIndex = e.target.dataset.index;
    const q = questions[currentQuestionIndex];
    const correctAnswer = q.solution[slotIndex];

    if (draggedItem.innerText === correctAnswer) {
        // ✅ Correct animation
        e.target.innerText = draggedItem.innerText;
        e.target.classList.add('filled');
        e.target.classList.add('correct');
        setTimeout(() => e.target.classList.remove('correct'), 800);
        draggedItem.style.display = 'none';
        checkAllSlotsFilled();
    } else {
        // ❌ Incorrect animation
        draggedItem.classList.add('shake');
        setTimeout(() => draggedItem.classList.remove('shake'), 500);
    }
}

// Check if all slots filled correctly
function checkAllSlotsFilled() {
    const slots = document.querySelectorAll('.drop-slot');
    const allFilled = Array.from(slots).every(slot => slot.classList.contains('filled'));
    if (allFilled) {
        alert("👍 Goed gedaan! Klik Volgende Vraag om voort te gaan.");
    }
}

// Next question
function nextQuestion() {
    if (!currentTerm) return;
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        alert("Jy het al die vrae voltooi! 🎉");
    }
}

// Utility: shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
