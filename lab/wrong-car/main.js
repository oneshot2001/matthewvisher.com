const FPS = T.fps, v = document.getElementById("v"), c = document.getElementById("c"), ctx = c.getContext("2d");
const lens = document.getElementById("lens"), lctx = lens.getContext("2d");
const sx = 960 / T.width, sy = 540 / T.height;
const PH = phases(), NAMES = { tracked: "TRACKED", occluded: "BEHIND THE POLE", lost: "LOST", "in the gap": "IN THE GAP", "wrong car": "WRONG CAR" };
const WHERE = { tracked: "on the blue SUV, near lane, moving right", occluded: "on the SUV as it goes behind the pole and trees", lost: "fewer than 8 points left, too few to hold a vehicle", "in the gap": "back on the SUV where it shows between the trees", "wrong car": "on a red car in the far lane, moving left" };
const steps = document.getElementById("steps");
PH.forEach((p, i) => { const li = document.createElement("li"); li.innerHTML = `<b>${i + 1}</b><span>${NAMES[p.name]}</span><span>${p.from}–${p.to}</span>`; steps.appendChild(li); });

// curve, built once
const svg = document.getElementById("curve"), L = 60, R = 1180, TOP = 20, BOT = 260, span = 151 - 60;
const X = f => L + (f - 60) / span * (R - L), Y = n => BOT - n / 72 * (BOT - TOP);
const fill = { tracked: "#FFD60A", occluded: "#F1EDE3", lost: "#DAD3C4", "in the gap": "#FFD60A", "wrong car": "#E8744A" };
let bands = PH.map(p => `<rect x="${X(p.from)}" y="${TOP}" width="${X(p.to + 1) - X(p.from)}" height="${BOT - TOP}" fill="${fill[p.name]}" opacity=".35"/>`).join("");
let path = "M" + Array.from({ length: 92 }, (_, i) => `${X(60 + i)},${Y(visibleCount(60 + i))}`).join(" L");
svg.innerHTML = bands + `<line x1="${L}" y1="${BOT}" x2="${R}" y2="${BOT}" stroke="#1C1B18"/><line x1="${L}" y1="${TOP}" x2="${L}" y2="${BOT}" stroke="#1C1B18"/>
  <text x="${L - 8}" y="${Y(72) + 4}" text-anchor="end" font-family="JetBrains Mono" font-size="12" fill="#6B665C">72</text>
  <text x="${L - 8}" y="${BOT + 4}" text-anchor="end" font-family="JetBrains Mono" font-size="12" fill="#6B665C">0</text>
  <text x="${X(60)}" y="${BOT + 20}" font-family="JetBrains Mono" font-size="12" fill="#6B665C">frame 60</text>
  <text x="${X(151)}" y="${BOT + 20}" text-anchor="end" font-family="JetBrains Mono" font-size="12" fill="#6B665C">151</text>
  <path d="${path}" fill="none" stroke="#1C1B18" stroke-width="2"/>
  <circle cx="${X(110)}" cy="${Y(72)}" r="16" fill="none" stroke="#E8744A" stroke-width="2"/>
  <text x="${X(110) + 22}" y="${Y(72) + 4}" font-family="JetBrains Mono" font-size="12" fill="#E8744A">72 visible · 68 on the red car</text>
  <circle id="dot" cx="${X(60)}" cy="${Y(72)}" r="6" fill="#FFD60A" stroke="#1C1B18" stroke-width="2"/>`;

function render(frame) {
  ctx.clearRect(0, 0, 960, 540); drawTrails(ctx, frame, sx, sy);
  const n = visibleCount(frame), cen = centroid(frame), ph = PH.find(p => frame >= p.from && frame <= p.to);
  document.getElementById("fno").textContent = frame;
  document.getElementById("vis").textContent = n;
  document.getElementById("gauge").style.width = (n / 72 * 100) + "%";
  document.getElementById("cen").textContent = cen ? `x ${Math.round(cen[0])} · y ${Math.round(cen[1])}` : "—";
  document.getElementById("lane").textContent = n ? WHERE[ph.name] : "no visible points";
  const pill = document.getElementById("pill"); pill.dataset.state = ph.name; pill.textContent = `${PH.indexOf(ph) + 1} · ${NAMES[ph.name]}`;
  [...steps.children].forEach((li, i) => li.classList.toggle("on", PH[i] === ph));
  document.getElementById("dot").setAttribute("cx", X(frame)); document.getElementById("dot").setAttribute("cy", Y(n));
  // lens: 3x crop of the frame around the visible centroid (or the last tracked position), with the dots
  const last = cen || centroid(lastSeen(frame)) || [T.width / 2, T.height / 2];
  const cw = 180, ch = 180; // crop half-size in track px (360 px square → 340 px lens)
  lctx.fillStyle = "#24221E"; lctx.fillRect(0, 0, 340, 340);
  lctx.drawImage(v, (last[0] - cw) * sx, (last[1] - ch) * sy, cw * 2 * sx, ch * 2 * sy, 0, 0, 340, 340);
  lctx.save(); lctx.translate(-(last[0] - cw) * (340 / (cw * 2)), -(last[1] - ch) * (340 / (ch * 2))); lctx.scale(340 / (cw * 2), 340 / (ch * 2));
  drawTrails(lctx, frame, 1, 1, 12); lctx.restore();
}
function lastSeen(frame) { for (let f = frame; f >= Q; f--) if (visibleCount(f) > 0) return f; return Q; }

const dial = document.getElementById("dial");
let pending = null;
function seekTo(frame) { v.currentTime = (frame + 0.5) / FPS; pending = frame; }
v.addEventListener("seeked", () => { if (pending !== null) { render(pending); pending = null; } });
dial.addEventListener("input", () => seekTo(+dial.value));
// play at once, then pause: iOS stops loading at metadata (loadeddata never fires) and paints seeked frames only once a muted video has played
const p = v.play(), first = () => seekTo(+dial.value); // the dial, not 60: the reader may have moved it already
if (p) p.then(() => { v.pause(); first(); }, first); else first();

// receipt: print the running functions, dial variable marked
const esc = s => s.replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
document.getElementById("src").innerHTML = [phases, movedPoints, visibleCount, centroid, drawTrails].map(fn => esc(fn.toString()).replace(/\bframe\b|\bf\b/g, m => `<mark>${m}</mark>`)).join("\n\n");
