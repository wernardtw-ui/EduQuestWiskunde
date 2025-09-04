let questions = [];
let currentTopic = null;
let currentQuestionIndex = 0;

function loadTerm(term) {
  const version = Date.now(); // unique number each load
  fetch(`data/${term}.json?v=${version}`)
    .then(res => res.json())
    .then(data => {
      const topicList = document.getElementById("topics");
      topicList.innerHTML = "";
      document.getElementById("game-area").style.display = "none";

      data.topics.forEach(topic => {
        const btn = document.createElement("button");
        btn.textContent = topic.name;
        btn.onclick = () => {
          currentTopic = topic;
          currentQuestionIndex = 0;
          showQuestion();
        };
        topicList.appendChild(btn);
      });
    })
    .catch(err => console.error("Error loading term:", err));
}

function showQuestion() {
  const gameArea = document.getElementById("game-area");
  gameArea.style.display = "block";

  const question = currentTopic.questions[currentQuestionIndex];
  document.getElementById("questionText").textContent = question.text;

  const slots = document.getElementById("slots");
  const options = document.getElementById("options");
  slots.innerHTML = "";
  options.innerHTML = "";

  // Create drop slots (with IDs and hint buttons)
  question.steps.forEach((step, i) => {
    const slotWrapper = document.createElement("div");
    slotWrapper.style.display = "flex";
    slotWrapper.style.alignItems = "center";
    slotWrapper.style.gap = "10px";

    const slot = document.createElement("div");
    slot.className = "drop-slot";
    slot.id = `slotStep${i + 1}`;
    slot.dataset.correct = step.text;
    slot.ondragover = e => e.preventDefault();
    slot.ondrop = e => handleDrop(e, slot);

    const hintBtn = document.createElement("button");
    hintBtn.textContent = "Hint";
    hintBtn.style.background = "#f59e0b";
    hintBtn.style.marginTop = "0";
    hintBtn.onclick = () => alert(step.hint);

    slotWrapper.appendChild(slot);
    slotWrapper.appendChild(hintBtn);
    slots.appendChild(slotWrapper);
  });

  // Shuffle options (steps + distractors)
  let choices = [...question.steps.map(s => s.text), ...question.distractors];
  choices = choices.sort(() => Math.random() - 0.5);

  choices.forEach(choice => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = choice;
    div.draggable = true;
    div.ondragstart = e => {
      div.classList.add("dragging");
      e.dataTransfer.setData("text/plain", choice);
    };
    div.ondragend = () => div.classList.remove("dragging");
    options.appendChild(div);
  });
}

function handleDrop(e, slot) {
  e.preventDefault();
  const draggedText = e.dataTransfer.getData("text/plain");

  if (draggedText === slot.dataset.correct && !slot.classList.contains("filled")) {
    slot.textContent = draggedText;
    slot.classList.add("filled");
    document.querySelectorAll(".option").forEach(opt => {
      if (opt.textContent === draggedText) opt.remove();
    });
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentTopic.questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    alert("Jy het al die vrae in hierdie onderwerp voltooi!");
  }
}
