// Unified drag-scroll for all galleries with soft overscroll and edge fade
// Usage: enableUnifiedDragScroll(container, {horizontal: true, scale: 1.7})

function enableUnifiedDragScroll(container, opts = {}) {
  window.enableUnifiedDragScroll = enableUnifiedDragScroll;
  const isHorizontal = opts.horizontal !== false;
  const scale = opts.scale || 1;
  let isDown = false, start = 0, last = 0, offset = 0;
  let min = 0, max = 0;

  // Add edge fade overlays
  let fadeL = container.querySelector('.gallery-fade-left');
  let fadeR = container.querySelector('.gallery-fade-right');
  if (!fadeL) {
    fadeL = document.createElement('div');
    fadeL.className = 'gallery-fade-left';
    container.appendChild(fadeL);
  }
  if (!fadeR) {
    fadeR = document.createElement('div');
    fadeR.className = 'gallery-fade-right';
    container.appendChild(fadeR);
  }

  function updateBounds() {
    if (isHorizontal) {
      min = Math.min(container.offsetWidth * -1 + window.innerWidth / scale, 0);
      max = 0;
    } else {
      min = Math.min(container.offsetHeight * -1 + window.innerHeight / scale, 0);
      max = 0;
    }
  }
  function setTransform() {
    if (isHorizontal) {
      container.style.transform = `scale(${scale}) translateX(${offset}px)`;
    } else {
      container.style.transform = `scale(${scale}) translateY(${offset}px)`;
    }
    // Fade overlays
    fadeL.style.opacity = offset < max - 2 ? '1' : '0';
    fadeR.style.opacity = offset > min + 2 ? '1' : '0';
  }
  updateBounds();
  setTransform();

  function onDown(e) {
    isDown = true;
    start = (e.touches ? e.touches[0][isHorizontal ? 'clientX' : 'clientY'] : (isHorizontal ? e.clientX : e.clientY));
    last = start;
    document.body.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!isDown) return;
    const curr = (e.touches ? e.touches[0][isHorizontal ? 'clientX' : 'clientY'] : (isHorizontal ? e.clientX : e.clientY));
    let d = curr - last;
    offset += d;
    // Soft overscroll
    if (offset < min - 60) offset = min - 60 + (offset - (min - 60)) * 0.2;
    if (offset > max + 60) offset = max + 60 + (offset - (max + 60)) * 0.2;
    setTransform();
    last = curr;
  }
  function onUp() {
    isDown = false;
    document.body.style.cursor = '';
    // Clamp to bounds, no inertia
    if (offset < min) offset = min;
    if (offset > max) offset = max;
    setTransform();
  }
  container.addEventListener('mousedown', onDown);
  container.addEventListener('touchstart', onDown, {passive: false});
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, {passive: false});
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
  window.addEventListener('resize', () => { updateBounds(); setTransform(); });
}
