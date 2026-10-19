// TAPNext++ specimen — the functions printed in the receipt card are these, verbatim (Function.prototype.toString).
const T = window.TRACKS, P = T.tracks, Q = T.query_frame, N = T.frames;

function visibleCount(frame) {
  let n = 0;
  for (const p of P) if (p[frame][2] >= 0.5) n++;
  return n;
}

function centroid(frame) {
  let x = 0, y = 0, n = 0;
  for (const p of P) if (p[frame][2] >= 0.5) { x += p[frame][0]; y += p[frame][1]; n++; }
  return n ? [x / n, y / n, n] : null;
}

// visible points more than 80 px from where they started. Grid points stuck on the road never count.
function movedPoints(frame) {
  return P.filter(p => p[frame][2] >= 0.5 && Math.hypot(p[frame][0] - p[Q][0], p[frame][1] - p[Q][1]) > 80).map(p => p[frame]);
}

// phases are read off the count and the centroid, not hand-placed. A small state machine:
//   tracked    -> occluded   when fewer than 56 of 72 stay visible
//   occluded   -> lost       when fewer than 8 remain; remember where the moved points were last seen
//   lost       -> wrong car  when 20+ come back AND the centroid sits above the tracked lane (y < 500)
//   lost       -> in the gap when 6+ moved points come back ahead of that spot (the SUV was driving right)
//   in the gap -> lost       when none are left ahead of it
//   wrong car  -> lost       when fewer than 8 remain
function phases() {
  const out = []; let state = "tracked", lostX = Infinity;
  for (let f = Q; f < N; f++) {
    const n = visibleCount(f), c = centroid(f), m = movedPoints(f), ahead = m.filter(p => p[0] > lostX).length;
    if (state === "tracked" && n < 56) state = "occluded";
    else if (state === "occluded" && n < 8) { state = "lost"; lostX = m.reduce((s, p) => s + p[0], 0) / m.length; }
    else if (state === "lost" && n >= 20 && c && c[1] < 500) state = "wrong car";
    else if (state === "lost" && ahead >= 6) state = "in the gap";
    else if (state === "in the gap" && ahead === 0) state = "lost";
    else if (state === "wrong car" && n < 8) state = "lost";
    const cur = out[out.length - 1];
    if (cur && cur.name === state) cur.to = f; else out.push({ name: state, from: f, to: f });
  }
  return out;
}

function drawTrails(ctx, frame, sx, sy, TAIL = 24) {
  const x0 = P.map(p => p[Q][0]), xmin = Math.min(...x0), xmax = Math.max(...x0);
  ctx.lineWidth = 2.5; ctx.lineCap = "round";
  for (let i = 0; i < P.length; i++) {
    const p = P[i], hue = 185 - 145 * ((x0[i] - xmin) / (xmax - xmin || 1));
    for (let k = 1; k <= TAIL; k++) {
      const a = frame - k, b = a + 1;
      if (a < Q || p[a][2] < 0.5 || p[b][2] < 0.5) break;
      ctx.strokeStyle = `hsla(${hue},85%,55%,${(1 - k / TAIL) * 0.9})`;
      ctx.beginPath(); ctx.moveTo(p[a][0] * sx, p[a][1] * sy); ctx.lineTo(p[b][0] * sx, p[b][1] * sy); ctx.stroke();
    }
    if (p[frame][2] >= 0.5) {
      ctx.fillStyle = `hsl(${hue},85%,55%)`;
      ctx.beginPath(); ctx.arc(p[frame][0] * sx, p[frame][1] * sy, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}
