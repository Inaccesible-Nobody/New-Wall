(() => {
  const streamEl = document.getElementById("morseStream");
  const decodedEl = document.getElementById("morseDecoded");
  const statusDot = document.getElementById("morseStatusDot");
  const statusText = document.getElementById("morseStatusText");
  const helpBtn = document.getElementById("morseHelpBtn");
  const modal = document.getElementById("morseModal");
  const modalClose = document.getElementById("morseModalClose");
  const legendGrid = document.getElementById("morseLegendGrid");

  const MORSE_TO_CHAR = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
    "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
    "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
    ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
    "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y",
    "--..": "Z", "-----": "0", ".----": "1", "..---": "2", "...--": "3",
    "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8",
    "----.": "9"
  };

  let currentSymbol = "";
  let decodedText = "";
  let letterTimer = null;
  let wordTimer = null;
  let audioCtx = null;

  function getUnitMs() {
    const wpm = parseInt(localStorage.getItem("desktop_morse_wpm") || "9", 10);
    return Math.round(1200 / Math.max(5, wpm));
  }

  function playTone(units) {
    if (localStorage.getItem("desktop_morse_mute") === "true") return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const durationSec = (units * getUnitMs()) / 1000;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(640, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.006);
    gain.gain.setValueAtTime(0.16, now + Math.max(0.01, durationSec - 0.008));
    gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.01);
  }

  function pulseDot(ms) {
    statusDot.classList.add("is-tx");
    setTimeout(() => statusDot.classList.remove("is-tx"), ms);
  }

  function render() {
    if (!currentSymbol && !decodedText) {
      streamEl.innerHTML = `<span class="morse-placeholder">Press J (·) or K (—)</span>`;
      decodedEl.textContent = "";
      return;
    }
    const pretty = currentSymbol.replace(/\./g, "·").replace(/-/g, "—").split("").join(" ");
    streamEl.textContent = pretty || "·";
    decodedEl.textContent = decodedText;
  }

  function commitLetter() {
    if (!currentSymbol) return;
    decodedText += MORSE_TO_CHAR[currentSymbol] || "?";
    currentSymbol = "";
    render();
  }

  function scheduleTimers() {
    clearTimeout(letterTimer);
    clearTimeout(wordTimer);
    const unit = getUnitMs();
    letterTimer = setTimeout(commitLetter, unit * 3); // 3 units = letter gap
    wordTimer = setTimeout(() => {
      if (decodedText && !decodedText.endsWith(" ")) {
        decodedText += " ";
        render();
      }
    }, unit * 7); // 7 units = word gap
  }

  function isTypingInField(target) {
    return target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
  }

  document.addEventListener("focusin", (e) => {
    if (isTypingInField(e.target)) {
      statusDot.classList.add("is-paused");
      statusText.textContent = "PAUSED";
    }
  });

  document.addEventListener("focusout", () => {
    statusDot.classList.remove("is-paused");
    statusText.textContent = "LISTENING";
  });

  document.addEventListener("keydown", (e) => {
    if (isTypingInField(e.target) || !modal.hidden || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();
    if (key === "j") {
      currentSymbol += ".";
      playTone(1);
      pulseDot(getUnitMs());
      scheduleTimers();
      render();
    } else if (key === "k") {
      currentSymbol += "-";
      playTone(3);
      pulseDot(getUnitMs() * 2.2);
      scheduleTimers();
      render();
    } else if (e.key === "Backspace") {
      clearTimeout(letterTimer);
      clearTimeout(wordTimer);
      if (currentSymbol) currentSymbol = currentSymbol.slice(0, -1);
      else decodedText = decodedText.slice(0, -1);
      render();
    } else if (e.key === "Escape") {
      clearTimeout(letterTimer);
      clearTimeout(wordTimer);
      currentSymbol = "";
      decodedText = "";
      render();
    }
  });

  // Populate Legend Modal
  Object.entries(MORSE_TO_CHAR).forEach(([code, char]) => {
    const cell = document.createElement("div");
    cell.className = "morse-legend-cell";
    cell.innerHTML = `<span>${char}</span><span>${code.replace(/\./g, "·").replace(/-/g, "—")}</span>`;
    legendGrid.appendChild(cell);
  });

  helpBtn.addEventListener("click", () => (modal.hidden = false));
  modalClose.addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  render();
})();