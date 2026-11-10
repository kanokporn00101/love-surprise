/* ==========================================================
   ลอจิกหลัก: ใส่ข้อความ สลับหน้า ปุ่มวิ่งหนี และปุ่มกลับหน้าหลัก
   ========================================================== */
const $ = id => document.getElementById(id);

// เอาข้อความจาก CONFIG.text ใส่ลงในทุกองค์ประกอบที่มี data-text
document.querySelectorAll('[data-text]').forEach(el => {
  const v = CONFIG.text[el.dataset.text];
  if (v !== undefined) el.textContent = v;
});
// ตั้งค่ารูปคู่ (ถ้าไม่ใส่รูป จะลบกรอบรูปออก)
if (CONFIG.couplePhoto) $('couplePhoto').src = CONFIG.couplePhoto; else $('photoCard').remove();

/* ---------- การสลับหน้า ---------- */
const sWelcome = $('scene-welcome'), sLetter = $('scene-letter'), sQuestion = $('scene-question');
const homeBtn = $('homeBtn');
homeBtn.hidden = true;                                       // หน้าแรกไม่ต้องมีปุ่มกลับ

function show(scene) {
  [sWelcome, sLetter, sQuestion].forEach(s => s.classList.toggle('active', s === scene));
  homeBtn.hidden = scene === sWelcome;                       // หน้าอื่นๆ แสดงปุ่มกลับหน้าหลัก
  Effects.floaties(8);
}

/* ---------- หน้า 1 -> 2 ---------- */
$('startBtn').onclick = () => { show(sLetter); if (CONFIG.autoPlayMusic) Music.startIfNeeded(); };

/* ---------- หน้า 2: เปิดซองจดหมาย ---------- */
const envelope = $('envelope'), letterPaper = $('letterPaper'), toQuestionBtn = $('toQuestionBtn');
envelope.onclick = () => {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open'); Effects.floaties(12);
  const r = envelope.getBoundingClientRect();
  for (let i = 0; i < 3; i++) setTimeout(() => Effects.firework(r.left + r.width / 2, r.top + r.height / 2), i * 200);
  setTimeout(() => { letterPaper.classList.add('show'); toQuestionBtn.hidden = false; }, 400);
};
toQuestionBtn.onclick = () => show(sQuestion);

/* ---------- หน้า 3: ปุ่ม "不爱" วิ่งหนี ---------- */
const noBtn = $('noBtn'), yesBtn = $('yesBtn'), tease = $('teaseMsg');
let dodge = 0, placeholder = null;                           // dodge = จำนวนครั้งที่ปุ่มหนี

function runAway() {
  // การ์ดมี filter/transform ทำให้ position:fixed อ้างอิงการ์ด
  // จึงย้ายปุ่มไปไว้ที่ body ตอนหนีครั้งแรก (และวางที่กั้นตำแหน่งเดิมไว้)
  if (noBtn.parentNode !== document.body) {
    const r = noBtn.getBoundingClientRect();
    placeholder = document.createElement('span');
    placeholder.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px`;
    noBtn.parentNode.insertBefore(placeholder, noBtn);
    document.body.appendChild(noBtn);
    Object.assign(noBtn.style, { position: 'fixed', zIndex: 999, left: r.left + 'px', top: r.top + 'px' });
  }
  dodge++;
  const b = noBtn.getBoundingClientRect(), pad = 20;
  noBtn.style.left = Math.max(pad, Math.random() * (innerWidth - b.width - pad)) + 'px';
  noBtn.style.top = Math.max(pad, Math.random() * (innerHeight - b.height - pad)) + 'px';
  noBtn.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
  const t = CONFIG.text.teaseTexts; tease.textContent = t[(dodge - 1) % t.length];
  yesBtn.style.transform = `scale(${Math.min(1 + dodge * .08, 1.4)})`;   // ปุ่ม "爱" ใหญ่ขึ้นเรื่อยๆ
}
noBtn.addEventListener('mouseenter', runAway);
noBtn.addEventListener('touchstart', e => { e.preventDefault(); runAway(); }, { passive: false });
noBtn.addEventListener('click', e => { e.preventDefault(); runAway(); });

// กดปุ่ม "爱" -> ฉลองใหญ่
yesBtn.onclick = () => {
  noBtn.style.display = 'none'; tease.textContent = '';
  $('celebrationBox').hidden = false;
  Effects.finale(); Effects.lanterns(12); Effects.floaties(25);
};
$('releaseLanternsBtn').onclick = () => { Effects.lanterns(8); Effects.floaties(15); };

/* ---------- กลับหน้าหลัก: รีเซ็ตทุกอย่างให้เหมือนเริ่มใหม่ ---------- */
function goHome() {
  // รีเซ็ตหน้าจดหมาย
  envelope.classList.remove('open'); letterPaper.classList.remove('show'); toQuestionBtn.hidden = true;
  // รีเซ็ตหน้าคำถาม: เอาปุ่ม "不爱" กลับที่เดิม
  if (placeholder) { placeholder.replaceWith(noBtn); placeholder = null; }
  noBtn.removeAttribute('style'); yesBtn.style.transform = '';
  tease.textContent = ''; dodge = 0; $('celebrationBox').hidden = true;
  show(sWelcome);
}
homeBtn.onclick = goHome;
$('backHomeBtn').onclick = goHome;

/* ---------- กดดวงจันทร์ -> พลุ ---------- */
$('moon').onclick = e => {
  const r = e.currentTarget.getBoundingClientRect();
  Effects.firework(r.left + r.width / 2, r.top + r.height / 2); Effects.floaties(6);
};
