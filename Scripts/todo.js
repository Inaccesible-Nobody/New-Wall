(() => {
  const listEl = document.getElementById("todoList");
  const inputEl = document.getElementById("todoInput");
  const addTrigger = document.getElementById("todoAddTrigger");
  const STORAGE_KEY = "desktop_todos";

  let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || [
    { id: 1, text: "Finish the prototype", done: false },
    { id: 2, text: "Read something", done: false },
    { id: 3, text: "Take a break", done: true }
  ];

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function render() {
    listEl.innerHTML = "";
    todos.forEach((item) => {
      const li = document.createElement("li");
      li.className = `todo-item${item.done ? " is-done" : ""}`;

      const check = document.createElement("button");
      check.className = "todo-check";
      check.textContent = item.done ? "✓" : "";
      check.addEventListener("click", () => {
        item.done = !item.done;
        save();
        render();
      });

      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = item.text;
      span.title = "Double-click to edit";
      span.addEventListener("dblclick", () => {
        const edited = prompt("Edit task:", item.text);
        if (edited !== null && edited.trim()) {
          item.text = edited.trim();
          save();
          render();
        }
      });

      const del = document.createElement("button");
      del.className = "todo-del";
      del.textContent = "✕";
      del.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== item.id);
        save();
        render();
      });

      li.append(check, span, del);
      listEl.appendChild(li);
    });
  }

  function addTask() {
    const text = inputEl.value.trim();
    if (!text) return;
    todos.push({ id: Date.now(), text, done: false });
    inputEl.value = "";
    save();
    render();
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  addTrigger.addEventListener("click", () => {
    if (inputEl.value.trim()) addTask();
    else inputEl.focus();
  });

  render();
})();