let questions = [];
let currentIndex = 0;
let selectedSubject = "";
let termData = {};
let currentSequence = [];
let placedSteps = [];

document.getElementById("termSelect").addEventListener("change", async (e) => {
  const termFile = e.target.value;
  if (!termFile) return;

  try {
    const res = await fetch(termFile);
    termData = await res.json();

    const subjectSelect = document.getElementById("subjectSelect");
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    Object.keys(termData).forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subjectSelect.appendChild(opt);
    });
    subjectSelect.disabled = false;
  } catch (err) {
    console.error("Error loading term file:", err);
  }
});

document.getElementById("startBtn").addEventListener("click", () => {
  const subject = document.getElementById("subjectSelect").value;
  if (!subject) {
    alert("Please select a subject first!");
    return;
  }
  selectedSubject = subject;
  questions = [...termData[subject]];
  currentIndex = 0;

  // Shuffle questions for variety
  shuffle(questions);

  showQuestion();
});

document.getElementById("hintBtn").addEventListener("click", () => {
  const hintBox = document.getElementById("hintBox");
  if (questions[currentIndex] && questions[currentIndex].hint) {
    hintBox.textContent = "💡 Hint: " + questions[currentIndex].hint;
    hintBox.style.display = "block";
  }
});

function showQuestion() {
  if (currentIndex >= questions.length) {
    celebrate();
    return;
  }

  const q = questions[currentIndex];
  document.getElementById("question").textContent = q.text;

  const dropSlot = document.getElementById("dropSlot");
  dropSlot.innerHTML = `Drop steps here... (0 / ${q.steps.length + 1})`;
  placedSteps = [];

  // Spread solution array so last step is accepted
  currentSequence = [...q.steps, ...q.solution];
  let allOptions = [...currentSequence, ...q.distractors];
  shuffle(allOptions);

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  allOptions.forEach(opt => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = opt;
    div.draggable = true;

    div.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.setData("text", opt);
    });

    optionsDiv.appendChild(div);
  });

  dropSlot.addEventListener("dragover", (ev) => ev.preventDefault());
  dropSlot.addEventListener("drop", (ev) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");

    if (data === currentSequence[placedSteps.length]) {
      // Correct step
      placedSteps.push(data);

      // Update drop slot
      dropSlot.innerHTML = "";
      placedSteps.forEach(s => {
        const stepEl = document.createElement("div");
        stepEl.textContent = s;
        dropSlot.appendChild(stepEl);
      });

      // Progress tracking
      const progress = document.createElement("div");
      progress.style.fontStyle = "italic";
      progress.style.color = "#007847";
      progress.textContent = `(${placedSteps.length} / ${currentSequence.length}) steps completed`;
      dropSlot.appendChild(progress);

      dropSlot.classList.add("correct");
      setTimeout(() => dropSlot.classList.remove("correct"), 800);

      if (placedSteps.length === currentSequence.length) {
        currentIndex++;
        setTimeout(showQuestion, 1000);
      }
    } else {
      // Wrong step → shake only, no hint
      const optionDivs = document.querySelectorAll(".option");
      optionDivs.forEach(o => {
        if (o.textContent === data) {
          o.classList.add("shake");
          setTimeout(() => o.classList.remove("shake"), 500);
        }
      });
    }
  });
}

// Celebration with confetti-container
function celebrate() {
  const celebration = document.getElementById("celebration");

  // Remove existing confetti container if exists
  let oldContainer = document.getElementById("confetti-container");
  if (oldContainer) oldContainer.remove();

  // Create confetti container
  const confettiContainer = document.createElement("div");
  confettiContainer.id = "confetti-container";
  confettiContainer.style.position = "fixed";
  confettiContainer.style.top = "0";
  confettiContainer.style.left = "0";
  confettiContainer.style.width = "100%";
  confettiContainer.style.height = "100%";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = "10001"; // below modal
  document.body.appendChild(confettiContainer);

  // Generate confetti
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.textContent = "🎊";
    confetti.style.position = "absolute";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.fontSize = 20 + Math.random() * 20 + "px";
    confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
    confettiContainer.appendChild(confetti);

    setTimeout(() => confetti.remove(), 5000);
  }

  // Show modal above confetti
  celebration.style.display = "block";
  celebration.style.zIndex = "10002";
  celebration.innerHTML = `
    <h2>🎉 Congratulations! You finished all questions! 🎉</h2>
    <button onclick="restartGame()">Play Again</button>
  `;
}

// Restart game function
function restartGame() {
  document.getElementById("celebration").style.display = "none";
  const oldContainer = document.getElementById("confetti-container");
  if (oldContainer) oldContainer.remove();
  currentIndex = 0;
  showQuestion();
}

// Confetti fall animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes fall {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}`;
document.head.appendChild(style);

// Always keep SA flag visible
document.addEventListener("DOMContentLoaded", () => {
  const flagBanner = document.querySelector('.flag-banner');
  if (flagBanner) flagBanner.style.zIndex = "10000";
});

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
