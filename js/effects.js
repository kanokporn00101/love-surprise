/* ==========================================================
   เอฟเฟกต์ภาพ: ดาวระยิบ ดาวตก พลุ โคมลอย หัวใจ/ดอกไม้ลอย
   ========================================================== */
const Effects = (() => {
  /* ---------- ท้องฟ้ากลางคืน: ดาว + ดาวตก ---------- */
  const sky = document.getElementById('sky-canvas'), sctx = sky.getContext('2d');
  let W, H, stars = [], meteors = [];

  function initStars() {
    W = sky.width = innerWidth; H = sky.height = innerHeight; stars = [];
    const n = Math.floor(W * H / CONFIG.starDensity);      // จำนวนดาวตามขนาดจอ
    for (let i = 0; i < n; i++) stars.push({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .3,
      a: Math.random(), v: Math.random() * .02 + .005,       // a = ความสว่าง, v = ความเร็วกะพริบ
      c: Math.random() > .3 ? '#ffffff' : '#ffe9c8'
    });
  }
  addEventListener('resize', initStars); initStars();

  // สุ่มสร้างดาวตกทุก 2.8 วินาที
  setInterval(() => {
    if (Math.random() > .4) meteors.push({ x: Math.random() * W * 1.2, y: Math.random() * H * .4, len: Math.random() * 80 + 40, v: Math.random() * 8 + 6, o: 1 });
  }, 2800);

  function drawSky() {
    sctx.clearRect(0, 0, W, H);
    for (const s of stars) {                                 // วาดดาว
      s.a += s.v; if (s.a > 1 || s.a < .1) s.v = -s.v;
      sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.283);
      sctx.fillStyle = s.c; sctx.globalAlpha = Math.abs(s.a);
      sctx.shadowBlur = s.r > 1.2 ? 6 : 0; sctx.shadowColor = '#fff'; sctx.fill();
    }
    sctx.globalAlpha = 1; sctx.shadowBlur = 0;
    const ang = Math.PI / 4;
    for (let i = meteors.length - 1; i >= 0; i--) {          // วาดดาวตก
      const m = meteors[i]; m.x -= m.v * Math.cos(ang); m.y += m.v * Math.sin(ang); m.o -= .015;
      if (m.o <= 0) { meteors.splice(i, 1); continue; }
      const tx = m.x + m.len * Math.cos(ang), ty = m.y - m.len * Math.sin(ang);
      const g = sctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(255,245,230,${m.o})`); g.addColorStop(1, 'rgba(255,245,230,0)');
      sctx.beginPath(); sctx.moveTo(m.x, m.y); sctx.lineTo(tx, ty); sctx.strokeStyle = g; sctx.lineWidth = 2; sctx.stroke();
    }
    requestAnimationFrame(drawSky);
  }
  drawSky();

  /* ---------- พลุ (ระเบิดเป็นรูปหัวใจหรือวงกลม) ---------- */
  const fw = document.getElementById('fireworks-canvas'), fctx = fw.getContext('2d');
  const sizeFw = () => { fw.width = innerWidth; fw.height = innerHeight; };
  addEventListener('resize', sizeFw); sizeFw();
  let parts = [];

  // ยิงพลุหนึ่งลูกที่ตำแหน่ง (x, y); heart = true จะระเบิดเป็นรูปหัวใจ
  function firework(x, y, heart = true) {
    const n = heart ? 45 : 35, base = CONFIG.fireworkColors[Math.floor(Math.random() * CONFIG.fireworkColors.length)];
    for (let i = 0; i < n; i++) {
      let vx, vy;
      if (heart) {                                           // สมการหัวใจ
        const t = 6.283 / n * i, f = Math.random() * .35 + .18;
        vx = 16 * Math.pow(Math.sin(t), 3) * f;
        vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * f;
      } else {                                               // ระเบิดวงกลม
        const a = Math.random() * 6.283, s = Math.random() * 4 + 1; vx = Math.cos(a) * s; vy = Math.sin(a) * s;
      }
      parts.push({ x, y, vx, vy, c: Math.random() > .3 ? base : '#fff', a: 1, d: Math.random() * .012 + .012, r: Math.random() * 2.5 + 1.8 });
    }
  }

  // พลุชุดใหญ่ตอนจบ (14 ลูก ทยอยยิง)
  function finale() {
    for (let i = 0; i < 14; i++) setTimeout(() => firework(
      Math.random() * innerWidth * .8 + innerWidth * .1, Math.random() * innerHeight * .5 + innerHeight * .1, i % 3 !== 2
    ), i * 320);
  }

  function drawFw() {
    fctx.clearRect(0, 0, fw.width, fw.height);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += .04; p.a -= p.d;   // vy += แรงโน้มถ่วง
      if (p.a <= 0) { parts.splice(i, 1); continue; }
      fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 6.283);
      fctx.fillStyle = p.c; fctx.globalAlpha = p.a; fctx.shadowBlur = 8; fctx.shadowColor = p.c; fctx.fill();
    }
    fctx.globalAlpha = 1; fctx.shadowBlur = 0;
    requestAnimationFrame(drawFw);
  }
  drawFw();

  /* ---------- โคมลอย (วาดด้วย SVG ไม่ใช้อิโมจิ) ---------- */
  // อยากเปลี่ยนสีโคม แก้ค่า fill ด้านล่างได้เลย
  const lanternSVG = `<svg viewBox="0 0 60 84" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="3" width="16" height="7" rx="3.500" fill="#fff4dc"/>
    <ellipse cx="30" cy="42" rx="25" ry="30" fill="#ffb3c6"/>
    <ellipse cx="30" cy="42" rx="12" ry="30" fill="none" stroke="#fff" stroke-width="1.500" opacity=".55"/>
    <rect x="20" y="69" width="20" height="7" rx="3.500" fill="#fff4dc"/>
    <path d="M30 76v7" stroke="#fff4dc" stroke-width="2.500" stroke-linecap="round"/></svg>`;

  // ปล่อยโคมหนึ่งดวง ลอยจากด้านล่างขึ้นข้างบนแล้วหายไป
  function skyLantern() {
    const el = document.createElement('div'), dur = Math.random() * 8 + 10;   // ใช้เวลา 10-18 วินาที
    el.className = 'sky-lantern'; el.innerHTML = lanternSVG;
    el.style.left = (Math.random() * (innerWidth - 60) + 30) + 'px';
    el.style.setProperty('--drift', (Math.random() - .5) * 120 + 'px');
    el.style.animationDuration = dur + 's';
    document.body.appendChild(el); setTimeout(() => el.remove(), dur * 1000);
  }
  function lanterns(n = 5) { for (let i = 0; i < n; i++) setTimeout(skyLantern, i * 400); }
  setInterval(() => { if (Math.random() > .5) skyLantern(); }, CONFIG.lanternEveryMs);   // ปล่อยเองเป็นระยะ

  /* ---------- หัวใจ / ดาวประกาย / ดอกไม้ ที่ลอยขึ้น (SVG) ---------- */
  const shapes = [
    c => `<svg viewBox="0 0 24 24" fill="${c}"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.800-8 11-8 11z"/></svg>`,
    c => `<svg viewBox="0 0 24 24" fill="${c}"><path d="M12 2l2.400 7.600L22 12l-7.600 2.400L12 22l-2.400-7.600L2 12l7.600-2.400z"/></svg>`,
    c => `<svg viewBox="0 0 24 24" fill="${c}">${[0, 72, 144, 216, 288].map(r => `<circle cx="12" cy="6.500" r="4" transform="rotate(${r} 12 12)"/>`).join('')}<circle cx="12" cy="12" r="2.200" fill="#ffe3a3"/></svg>`
  ];
  const tints = ['#ff9db8', '#ffb8cc', '#ffe3a3', '#cbbcff'];   // สีของชิ้นที่ลอย

  function floaties(n = 10) {
    for (let i = 0; i < n; i++) setTimeout(() => {
      const el = document.createElement('div'), sz = Math.random() * 16 + 16;
      el.className = 'floaty';
      el.innerHTML = shapes[Math.floor(Math.random() * shapes.length)](tints[Math.floor(Math.random() * tints.length)]);
      Object.assign(el.style, { left: Math.random() * 90 + 5 + 'vw', bottom: '10px', width: sz + 'px', animationDuration: Math.random() * 2.500 + 3 + 's' });
      document.body.appendChild(el); setTimeout(() => el.remove(), 5500);
    }, i * 150);
  }

  return { firework, finale, lanterns, floaties };
})();
