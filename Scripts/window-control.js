(() => {
  const root = document.documentElement;
  const shutter = document.getElementById("windowShutter");
  const windowShell = document.getElementById("airplaneWindow");
  const STORAGE_KEY = "desktop_shutter_open";

  let openAmount = parseFloat(localStorage.getItem(STORAGE_KEY) ?? "0");
  if (Number.isNaN(openAmount)) openAmount = 0;

  let isDragging = false;
  let startY = 0;
  let startOpen = openAmount;
  const DRAG_DISTANCE = 220;

  const lerp = (a, b, t) => a + (b - a) * t;

  function mixRgba(dark, light, t) {
    const r = Math.round(lerp(dark[0], light[0], t));
    const g = Math.round(lerp(dark[1], light[1], t));
    const b = Math.round(lerp(dark[2], light[2], t));
    const a = lerp(dark[3], light[3], t).toFixed(3);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function applyTheme(t) {
    root.style.setProperty("--open", t.toFixed(4));
    root.style.setProperty("--bg-top", mixRgba([5, 8, 17, 1], [238, 242, 247, 1], t));
    root.style.setProperty("--bg-bottom", mixRgba([9, 18, 36, 1], [219, 228, 240, 1], t));
    root.style.setProperty("--text-primary", mixRgba([230, 237, 247, 1], [15, 23, 42, 1], t));
    root.style.setProperty("--text-secondary", mixRgba([143, 163, 191, 1], [71, 85, 105, 1], t));
    root.style.setProperty("--text-muted", mixRgba([86, 104, 130, 1], [100, 116, 139, 1], t));
    root.style.setProperty("--glass-bg", mixRgba([13, 20, 36, 0.62], [255, 255, 255, 0.68], t));
    root.style.setProperty("--glass-border", mixRgba([148, 185, 255, 0.18], [255, 255, 255, 0.9], t));
    root.style.setProperty("--glass-highlight", mixRgba([148, 185, 255, 0.25], [255, 255, 255, 1], t));
    root.style.setProperty("--glass-shadow", mixRgba([0, 0, 0, 0.55], [15, 23, 42, 0.12], t));
    root.style.setProperty("--frame-outer-1", mixRgba([40, 54, 82, 1], [255, 255, 255, 1], t));
    root.style.setProperty("--frame-outer-2", mixRgba([10, 16, 29, 1], [203, 213, 225, 1], t));
    root.style.setProperty("--frame-inner-1", mixRgba([24, 35, 56, 1], [226, 232, 240, 1], t));
    root.style.setProperty("--frame-inner-2", mixRgba([5, 8, 16, 1], [148, 163, 184, 1], t));
    root.style.setProperty("--shutter-top", mixRgba([22, 32, 51, 1], [226, 232, 240, 1], t));
    root.style.setProperty("--shutter-bottom", mixRgba([12, 19, 34, 1], [203, 213, 225, 1], t));
    root.style.setProperty("--shutter-rib", mixRgba([255, 255, 255, 0.05], [15, 23, 42, 0.08], t));
  }

  function applyOpen(value, save = false) {
    openAmount = Math.max(0, Math.min(1, value));
    applyTheme(openAmount);
    shutter.setAttribute("aria-valuenow", Math.round(openAmount * 100));
    if (save) localStorage.setItem(STORAGE_KEY, openAmount.toFixed(4));
  }

  function snapTo(target) {
    const duration = 360;
    const initial = openAmount;
    const startTime = performance.now();
    function step(now) {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      applyOpen(initial + (target - initial) * eased, p === 1);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Allow dragging anywhere on the window shell or shutter
  windowShell.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startY = e.clientY;
    startOpen = openAmount;
    windowShell.setPointerCapture(e.pointerId);
  });

  windowShell.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY; // Drag UP = Light, Drag DOWN = Dark
    applyOpen(startOpen + deltaY / DRAG_DISTANCE);
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    if (windowShell.hasPointerCapture(e.pointerId)) {
      windowShell.releasePointerCapture(e.pointerId);
    }
    applyOpen(openAmount, true);
  }

  windowShell.addEventListener("pointerup", endDrag);
  windowShell.addEventListener("pointercancel", endDrag);
  windowShell.addEventListener("dblclick", () => snapTo(openAmount > 0.5 ? 0 : 1));

  applyOpen(openAmount);
})();