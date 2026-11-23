(() => {
  const canvas = document.getElementById("audioVisualizer");
  const ctx = canvas.getContext("2d");

  let audioEnergy = 0;
  let targetEnergy = 0;

  // Lively Wallpaper native desktop audio hook
  window.livelyAudioListener = (audioArray) => {
    if (!audioArray || !audioArray.length) return;
    let sum = 0;
    for (let i = 0; i < audioArray.length; i++) sum += audioArray[i];
    targetEnergy = Math.min(1.6, (sum / audioArray.length) * 4.5);
  };

  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 460;
    const h = canvas.clientHeight || 84;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  let { w, h } = setupCanvas();
  window.addEventListener("resize", () => ({ w, h } = setupCanvas()));

  const waves = [
    { amp: 13, freq: 0.017, speed: 0.022, alpha: 0.9, width: 1.6 },
    { amp: 9,  freq: 0.024, speed: -0.016, alpha: 0.45, width: 1.15 },
    { amp: 6,  freq: 0.031, speed: 0.028, alpha: 0.25, width: 1.0 }
  ];

  let phase = 0;
  function draw() {
    audioEnergy += (targetEnergy - audioEnergy) * 0.12;
    targetEnergy *= 0.94; // smoothly decay back to idle

    ctx.clearRect(0, 0, w, h);
    const midY = h / 2;

    waves.forEach((wave, i) => {
      ctx.beginPath();
      const dynamicAmp = wave.amp * (1 + audioEnergy * 1.4);
      for (let x = 0; x <= w; x += 2) {
        const norm = (x / w) * 2 - 1;
        const envelope = Math.exp(-norm * norm * 4.5);
        const y = midY + Math.sin(x * wave.freq + phase * (i + 1) * 0.65) * dynamicAmp * envelope;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(59, 130, 246, ${wave.alpha})`;
      ctx.lineWidth = wave.width;
      ctx.shadowColor = "rgba(59, 130, 246, 0.55)";
      ctx.shadowBlur = 8;
      ctx.stroke();
    });

    phase += 0.026 + audioEnergy * 0.04;
    requestAnimationFrame(draw);
  }
  draw();

  // Basic interactive Spotify placeholder until OAuth stage
  const playBtn = document.getElementById("spPlay");
  const progressBar = document.getElementById("spotifyProgressBar");
  const progressFill = document.getElementById("spotifyProgressFill");
  let isPlaying = false;

  playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
  });

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    progressFill.style.width = `${pct}%`;
  });
})();