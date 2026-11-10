/* ==========================================================
   เครื่องเล่นเพลง: เพลงสังเคราะห์ในตัว + ไฟล์ mp3 ของคุณ สลับเพลงได้
   ปกติไม่ต้องแก้ไฟล์นี้ — ไปเพิ่มเพลงที่ config.js แทน
   ========================================================== */
const Music = (() => {
  const tracks = CONFIG.tracks;
  let idx = 0, playing = false, ctx = null, timer = null, noteI = 0, audioEl = null;

  const toggleBtn = document.getElementById('musicToggle'), menuBtn = document.getElementById('trackToggle');
  const list = document.getElementById('trackList');
  const iconPlay = document.getElementById('iconPlay'), iconPause = document.getElementById('iconPause'), label = document.getElementById('musicLabel');

  // แปลงชื่อโน้ต (เช่น "E4") เป็นความถี่เสียง (Hz)
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const freq = n => {
    const m = /^([A-G])(#|b)?(\d)$/.exec(n);
    const s = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (m[3] - 4) * 12;
    return 261.63 * Math.pow(2, s / 12);
  };
  // แปลงข้อความโน้ต "C4:1 E4:2" เป็นอาร์เรย์ของ {n: โน้ต, b: จำนวนจังหวะ}
  const parse = str => str.trim().split(/\s+/).map(t => { const [n, b] = t.split(':'); return { n, b: parseFloat(b) || 1 }; });

  // ลักษณะเสียงของเครื่องดนตรีแต่ละแบบ
  const TIMBRE = {
    pluck: { type: 'triangle', atk: .01, dec: 1.6, vol: .16, lp: 2400 },            // กู่เจิ้ง
    bell:  { type: 'sine',     atk: .01, dec: 1.8, vol: .12, lp: 5000, over: 2 },    // กล่องดนตรี
    flute: { type: 'sine',     atk: .12, dec: 1.2, vol: .10, lp: 3000, vib: true }   // ขลุ่ย
  };

  // เล่นโน้ตหนึ่งตัว
  function tone(f, durSec, t, vol = 1) {
    const T = TIMBRE[t.timbre] || TIMBRE.pluck, now = ctx.currentTime;
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(), o = ctx.createOscillator();
    o.type = T.type; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = T.lp;
    g.gain.setValueAtTime(.0001, now);
    g.gain.exponentialRampToValueAtTime(T.vol * vol, now + T.atk);
    g.gain.exponentialRampToValueAtTime(.0001, now + Math.max(T.dec, durSec));
    o.connect(lp); lp.connect(g); g.connect(ctx.destination);
    if (T.vib) {                                             // เสียงสั่นเล็กน้อยแบบขลุ่ย
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5; lg.gain.value = 4; l.connect(lg); lg.connect(o.frequency); l.start(now); l.stop(now + T.dec + .2);
    }
    if (T.over) {                                            // เสียงแหลมซ้อน ให้เหมือนระฆังเล็ก
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.frequency.value = f * T.over; g2.gain.value = .25; o2.connect(g2); g2.connect(g); o2.start(now); o2.stop(now + T.dec + .2);
    }
    o.start(now); o.stop(now + T.dec + .2);
  }

  // เดินไปทีละโน้ต วนซ้ำเมื่อจบเพลง
  function step(track, seq) {
    if (!playing) return;
    const { n, b } = seq[noteI % seq.length], beat = 60 / track.tempo * b;
    if (n !== 'R') {
      tone(freq(n), beat, track);
      if (track.bass && noteI % 4 === 0) tone(freq(n) / 2, beat * 2, track, .6);   // เสียงทุ้มทุก 4 โน้ต
    }
    noteI++; timer = setTimeout(() => step(track, seq), beat * 1000);
  }

  // อัปเดตหน้าตาปุ่ม (ไอคอน ข้อความ เพลงที่เลือก)
  function ui() {
    iconPlay.hidden = playing; iconPause.hidden = !playing;
    label.textContent = playing ? CONFIG.ui.musicPause : CONFIG.ui.musicPlay;
    [...list.children].forEach((li, i) => li.firstChild.classList.toggle('active', i === idx));
  }
  function stop() { playing = false; clearTimeout(timer); if (audioEl) { audioEl.pause(); audioEl = null; } }
  function start() {
    const t = tracks[idx]; playing = true; noteI = 0;
    if (t.type === 'file') {                                 // เพลง mp3
      audioEl = new Audio(t.src); audioEl.loop = true; audioEl.play().catch(e => console.log('เล่นไฟล์ไม่ได้:', e));
    } else {                                                 // เพลงสังเคราะห์
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      step(t, parse(t.notes));
    }
  }
  function toggle() { playing ? stop() : start(); ui(); }
  function select(i) { stop(); idx = i; start(); ui(); list.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }

  // สร้างเมนูรายชื่อเพลงจาก CONFIG.tracks
  tracks.forEach((t, i) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.textContent = t.name; b.onclick = () => select(i);
    li.appendChild(b); list.appendChild(li);
  });
  toggleBtn.addEventListener('click', toggle);
  menuBtn.addEventListener('click', () => { list.hidden = !list.hidden; menuBtn.setAttribute('aria-expanded', String(!list.hidden)); });
  // คลิกที่อื่นให้เมนูปิด
  document.addEventListener('click', e => { if (!e.target.closest('.music')) list.hidden = true; });
  ui();

  return { startIfNeeded: () => { if (!playing) { start(); ui(); } } };
})();
