(() => {
  const widget = document.getElementById("doodleWidget");
  const canvas = document.getElementById("doodleCanvas");
  const ctx = canvas.getContext("2d");
  const penBtn = document.getElementById("doodlePen");
  const eraserBtn = document.getElementById("doodleEraser");
  const expandBtn = document.getElementById("doodleExpand");
  const clearBtn = document.getElementById("doodleClear");
  const STORAGE_KEY = "desktop_doodle_png";

  let mode = "pen";
  let drawing = false;

  function resizeCanvas(restore = true) {
    const saved = restore ? (canvas.width > 0 ? canvas.toDataURL() : localStorage.getItem(STORAGE_KEY)) : null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = saved;
    }
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 18;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2.2;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  function stopDraw() {
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
    localStorage.setItem(STORAGE_KEY, canvas.toDataURL());
  }

  canvas.addEventListener("pointerup", stopDraw);
  canvas.addEventListener("pointercancel", stopDraw);

  penBtn.addEventListener("click", () => {
    mode = "pen";
    penBtn.classList.add("is-active");
    eraserBtn.classList.remove("is-active");
  });

  eraserBtn.addEventListener("click", () => {
    mode = "eraser";
    eraserBtn.classList.add("is-active");
    penBtn.classList.remove("is-active");
  });

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(STORAGE_KEY);
  });

  expandBtn.addEventListener("click", () => {
    widget.classList.toggle("is-expanded");
    setTimeout(() => resizeCanvas(true), 40);
  });

  window.addEventListener("resize", () => resizeCanvas(true));
  resizeCanvas(true);
})();