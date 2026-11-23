(() => {
  const btn = document.getElementById("settingsBtn");
  const modal = document.getElementById("settingsModal");
  const closeBtn = document.getElementById("settingsClose");

  const chk24h = document.getElementById("setting24h");
  const rangeWpm = document.getElementById("settingWpm");
  const valWpm = document.getElementById("settingWpmVal");
  const chkMute = document.getElementById("settingMorseMute");
  const inputReminder = document.getElementById("settingReminder");

  function syncUI() {
    chk24h.checked = localStorage.getItem("desktop_24h") === "true";
    const wpm = localStorage.getItem("desktop_morse_wpm") || "9";
    rangeWpm.value = wpm;
    valWpm.textContent = wpm;
    chkMute.checked = localStorage.getItem("desktop_morse_mute") === "true";
    inputReminder.value = localStorage.getItem("desktop_reminder") || "Take a break.";
  }

  function notify() {
    window.dispatchEvent(new Event("desktop:settings-changed"));
  }

  btn.addEventListener("click", () => {
    syncUI();
    modal.hidden = false;
  });

  closeBtn.addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  chk24h.addEventListener("change", () => {
    localStorage.setItem("desktop_24h", chk24h.checked);
    notify();
  });

  rangeWpm.addEventListener("input", () => {
    valWpm.textContent = rangeWpm.value;
    localStorage.setItem("desktop_morse_wpm", rangeWpm.value);
  });

  chkMute.addEventListener("change", () => {
    localStorage.setItem("desktop_morse_mute", chkMute.checked);
  });

  inputReminder.addEventListener("input", () => {
    localStorage.setItem("desktop_reminder", inputReminder.value.trim() || "Take a break.");
    notify();
  });
})();