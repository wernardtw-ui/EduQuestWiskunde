
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
  questions = termData[subject];
  currentIndex = 0;
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
  document.getElementById("dropSlot").innerHTML = "Drop steps here...";
  placedSteps = [];

  currentSequence = [...q.steps, q.solution]; // last is solution
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

  const dropSlot = document.getElementById("dropSlot");
  dropSlot.addEventListener("dragover", (ev) => ev.preventDefault());
  dropSlot.addEventListener("drop", (ev) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");

    if (data === currentSequence[placedSteps.length]) {
      placedSteps.push(data);
      const stepDiv = document.createElement("div");
      stepDiv.textContent = data;
      dropSlot.appendChild(stepDiv);
      dropSlot.classList.add("correct");

      setTimeout(() => dropSlot.classList.remove("correct"), 800);

      if (placedSteps.length === currentSequence.length) {
        currentIndex++;
        setTimeout(showQuestion, 1000);
      }
    } else {
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

function celebrate() {
  const celebration = document.getElementById("celebration");
  celebration.style.display = "block";
  celebration.innerHTML = "<h2>🎉 Congratulations! You finished all questions! 🎉</h2>";

  // Confetti effect
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.textContent = "🎊";
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.fontSize = "20px";
    confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
    confetti.style.zIndex = "9997";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 5000);
  }
}


// Confetti fall animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes fall {
  to {
    transform: translateY(100vh);
    opacity: 0;
  }
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