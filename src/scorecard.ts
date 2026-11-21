try {
  const saved = localStorage.getItem("portfolio-theme");
  if (saved === "dark" || saved === "light")
    document.documentElement.style.colorScheme = saved;
} catch {
  console.warn("Saved theme unavailable; using system preference.");
}

const rubric = document.querySelector<HTMLElement>("#rubric")!;
for (const [skill, prompt] of [
  [
    "Reasoning",
    "Did they clarify the constraints and explain why their approach fits?",
  ],
  [
    "Correctness",
    "Did they trace an ordinary input and an edge case that might break the solution?",
  ],
  ["Complexity", "Did they explain where the time and space costs come from?"],
  [
    "Communication",
    "Did they explain a key decision and respond clearly to a follow-up?",
  ],
]) {
  const group = document.createElement("fieldset");
  group.innerHTML = `<legend>${skill}</legend><p>${prompt}</p>
    <div class="scores">${[0, 1, 2].map((n) => `<label><input type="radio" name="${skill}" value="${n}"> ${n}</label>`).join("")}</div>
    <label>Observation <textarea rows="2" aria-label="${skill} observation"></textarea></label>
    <p class="printed-note"></p>`;
  const note = group.querySelector("textarea")!;
  note.addEventListener("input", () => {
    group.querySelector(".printed-note")!.textContent = note.value;
  });
  rubric.append(group);
}
document
  .getElementById("print")!
  .addEventListener("click", () => window.print());
