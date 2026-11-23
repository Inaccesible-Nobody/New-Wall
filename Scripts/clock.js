(() => {
  const dateEl = document.getElementById("clockDate");
  const timeEl = document.getElementById("clockTime");
  const reminderEl = document.getElementById("clockReminderText");

  function renderClock() {
    const now = new Date();
    const use24h = localStorage.getItem("desktop_24h") === "true";

    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    dateEl.textContent = `${dayName}, ${monthDay}`.toUpperCase();

    timeEl.textContent = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24h
    });
  }

  function loadReminder() {
    reminderEl.textContent = localStorage.getItem("desktop_reminder") || "Take a break.";
  }

  reminderEl.addEventListener("click", () => {
    const next = prompt("Update clock reminder:", reminderEl.textContent);
    if (next !== null && next.trim()) {
      localStorage.setItem("desktop_reminder", next.trim());
      loadReminder();
    }
  });

  window.addEventListener("desktop:settings-changed", () => {
    renderClock();
    loadReminder();
  });

  loadReminder();
  renderClock();
  setInterval(renderClock, 1000);
})();