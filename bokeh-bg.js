// Animated bokeh background for #bokeh-bg canvas
(function bokehAnimation() {
  const canvas = document.getElementById('bokeh-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = [
    'rgba(0, 180, 216, 0.22)', // teal
    'rgba(0, 119, 182, 0.18)', // blue
    'rgba(72, 202, 228, 0.16)', // light teal
    'rgba(0, 150, 199, 0.13)', // blue
    'rgba(144, 224, 239, 0.10)' // pale blue
  ];
  const bokehs = Array.from({length: 18}, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 80 + Math.random() * 120,
    color: colors[Math.floor(Math.random() * colors.length)],
    dx: (Math.random() - 0.5) * 0.04,
    dy: (Math.random() - 0.5) * 0.04,
    dr: (Math.random() - 0.5) * 0.02
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of bokehs) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x * canvas.width, b.y * canvas.height, b.r, 0, 2 * Math.PI);
      ctx.fillStyle = b.color;
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();
      // Animate
      b.x += b.dx;
      b.y += b.dy;
      b.r += b.dr;
      if (b.x < -0.2 || b.x > 1.2) b.dx *= -1;
      if (b.y < -0.2 || b.y > 1.2) b.dy *= -1;
      if (b.r < 60 || b.r > 200) b.dr *= -1;
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})();
