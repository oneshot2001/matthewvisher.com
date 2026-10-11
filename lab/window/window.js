// The Window: head-coupled perspective drawn by hand on a 2D canvas.
// Camera frames go to the face detector in this tab and nowhere else. Before the
// camera opens, lock() adds a policy that refuses every request, to any server.

const PX_PER_CM = 38;               // CSS reference pixel is 1/96 in; real screens vary
const HFOV = 60 * Math.PI / 180;    // typical laptop webcam, assumed
const IPD = 6.3;                    // average adult distance between pupils, cm
const REST = { x: 0, y: 0, z: 60 }; // where we assume your eyes are without a camera
const VENDOR = '/lab/window/vendor/';
const LOCK = "default-src 'none'";

const stage = document.querySelector('.lab-window');
const canvas = stage.querySelector('canvas');
const ctx = canvas.getContext('2d');
const startBtn = stage.querySelector('[data-start]');
const stopBtn = stage.querySelector('[data-stop]');
const statusOut = stage.querySelector('[data-status]');
const lockOut = stage.querySelector('[data-lock]');
const refusedOut = stage.querySelector('[data-refused]');
const keptOut = stage.querySelector('[data-kept]');
const video = stage.querySelector('video');

const css = getComputedStyle(document.documentElement);
const C = {
  room: css.getPropertyValue('--charcoal').trim(),
  line: css.getPropertyValue('--muted-on-dark').trim(),
  dot: css.getPropertyValue('--lemon').trim(),
};

// Discs as fractions of the window: x, y of the half-width/height, z of the room depth.
// Negative z sits behind the glass; the last two float in front of it.
const DISCS = [[-0.55, 0.35, -0.85], [0.6, -0.4, -0.7], [-0.2, -0.5, -0.45], [0.35, 0.45, -0.3],
  [0.7, 0.1, -0.15], [-0.6, -0.15, 0.08], [0.1, 0.05, 0.18]];

let W, H, D, cw, ch;
let eye = { ...REST }, aim = { ...REST }, dirty = true;
let detector, detectorReady, stream, attempt = 0, lastFrame = -1, calibY = null, locked = false, refused = 0;

function resize() {
  const dpr = devicePixelRatio || 1;
  cw = canvas.clientWidth; ch = canvas.clientHeight;
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  W = cw / 2 / PX_PER_CM; H = ch / 2 / PX_PER_CM; D = 4 * H;
  dirty = true;
}

// The screen is the plane z = 0. A point is drawn where the line from your eye to it
// crosses the glass; t is how much nearer or farther than the glass it looks.
function project(x, y, z) {
  const t = eye.z / (eye.z - z);
  return [cw / 2 + (eye.x + t * (x - eye.x)) * PX_PER_CM, ch / 2 - (eye.y + t * (y - eye.y)) * PX_PER_CM, t];
}

function line(a, b) {
  const p = project(...a), q = project(...b);
  ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
}

function draw() {
  ctx.fillStyle = C.room;
  ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = C.line; ctx.lineWidth = 1;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  for (let i = 1; i <= 6; i++) { // depth rings, ending at the back wall
    const z = -D * i / 6;
    line([-W, -H, z], [W, -H, z]); line([W, -H, z], [W, H, z]);
    line([W, H, z], [-W, H, z]); line([-W, H, z], [-W, -H, z]);
  }
  for (let i = 1; i < 8; i++) { // lines running back along floor, ceiling and back wall
    const x = -W + 2 * W * i / 8;
    line([x, -H, 0], [x, -H, -D]); line([x, H, 0], [x, H, -D]); line([x, -H, -D], [x, H, -D]);
  }
  for (let i = 1; i < 5; i++) { // and along the side walls
    const y = -H + 2 * H * i / 5;
    line([-W, y, 0], [-W, y, -D]); line([W, y, 0], [W, y, -D]); line([-W, y, -D], [W, y, -D]);
  }
  ctx.stroke();

  const r = 0.09 * H;
  const discs = DISCS.map(([fx, fy, fz]) => [fx * W, fy * H, fz * D]).sort((a, b) => a[2] - b[2]);
  for (const [x, y, z] of discs) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); line([x, y, -D], [x, y, z]); ctx.stroke();
    const [px, py, t] = project(x, y, z);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.dot;
    ctx.beginPath(); ctx.arc(px, py, r * t * PX_PER_CM, 0, 2 * Math.PI); ctx.fill();
  }
}

function track() {
  if (!stream || video.readyState < 2 || video.currentTime === lastFrame) return;
  lastFrame = video.currentTime;
  const face = detector.detectForVideo(video, performance.now()).detections[0];
  if (!face) { keptOut.textContent = 'No face in view.'; return; }
  const [right, left] = face.keypoints; // BlazeFace keypoints start with the two eyes
  const vw = video.videoWidth, vh = video.videoHeight;
  const F = vw / 2 / Math.tan(HFOV / 2); // focal length in camera pixels
  const z = Math.min(150, Math.max(25, IPD * F / Math.hypot((right.x - left.x) * vw, (right.y - left.y) * vh)));
  const x = (0.5 - (right.x + left.x) / 2) * vw * z / F; // the camera's image isn't mirrored
  let y = (0.5 - (right.y + left.y) / 2) * vh * z / F;
  if (calibY === null) calibY = y; // the camera sits above the glass; call your first pose level
  y -= calibY;
  aim = { x, y, z };
  keptOut.textContent = `Eyes ${Math.abs(x).toFixed(0)} cm ${x < 0 ? 'left' : 'right'}, ` +
    `${Math.abs(y).toFixed(0)} cm ${y < 0 ? 'down' : 'up'}, ${z.toFixed(0)} cm away.`;
}

function frame() {
  requestAnimationFrame(frame);
  try { track(); } catch (err) { stop(); fallback('Tracking stopped on an error.'); }
  const k = 0.25;
  const dx = aim.x - eye.x, dy = aim.y - eye.y, dz = aim.z - eye.z;
  if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 0.01) {
    eye = { x: eye.x + dx * k, y: eye.y + dy * k, z: eye.z + dz * k };
    dirty = true;
  }
  if (dirty) { draw(); dirty = false; }
}

// Policies can only be added, never removed, so this holds until you reload.
function lock() {
  if (locked) return;
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = LOCK;
  document.head.append(meta);
  locked = true;
  lockOut.innerHTML = "<b>On.</b> default-src 'none'. Reload to remove it.";
}

function record(e) {
  // Once locked, the header and the lock both report each refusal; count the lock's copy.
  // (The header alone can still refuse base-uri, form-action, frame-ancestors; this page uses none.)
  if (locked && e.originalPolicy.includes('script-src')) return;
  refused += 1;
  refusedOut.textContent = '';
  const b = document.createElement('b');
  b.className = 'no';
  b.textContent = String(refused);
  refusedOut.append(b, ` · last: ${e.blockedURI || e.effectiveDirective}`);
}
refusals.forEach(record); // caught by refusals.js before this file ran
document.addEventListener('securitypolicyviolation', record);

function loadDetector() {
  return import(VENDOR + 'vision_bundle.mjs').then(({ FaceDetector }) => FaceDetector.createFromOptions(
    { wasmLoaderPath: VENDOR + 'vision_wasm_internal.js', wasmBinaryPath: VENDOR + 'vision_wasm_internal.wasm' },
    { baseOptions: { modelAssetPath: VENDOR + 'blaze_face_short_range.tflite' }, runningMode: 'VIDEO' }));
}

function fallback(msg) {
  statusOut.textContent = `${msg} Move your pointer, or drag a finger sideways, across the window instead.`;
  startBtn.disabled = false;
}

// stop() bumps attempt, so a start still waiting on the tracker or the camera gives up.
async function start() {
  const mine = ++attempt;
  startBtn.disabled = true;
  statusOut.textContent = 'Loading the tracker from this site…';
  try {
    detector = await (detectorReady ??= loadDetector());
  } catch (err) {
    detectorReady = undefined;
    if (mine === attempt) fallback('This browser couldn’t run the tracker.');
    return;
  }
  if (mine !== attempt) return;
  lock();
  let s;
  try {
    statusOut.textContent = 'Locked. Asking for the camera…';
    s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
    if (mine !== attempt) { s.getTracks().forEach((t) => t.stop()); return; }
    stream = s;
    video.srcObject = s;
    await video.play();
    if (mine !== attempt) return;
  } catch (err) {
    s?.getTracks().forEach((t) => t.stop());
    if (mine !== attempt) return;
    stream = null; video.srcObject = null;
    fallback('No camera.');
    return;
  }
  calibY = null;
  startBtn.hidden = true; stopBtn.hidden = false;
  statusOut.textContent = 'Camera on. Move your head. Closing one eye helps.';
}

function stop() {
  attempt += 1;
  stream?.getTracks().forEach((t) => t.stop());
  stream = null; video.srcObject = null; lastFrame = -1;
  aim = { ...REST };
  startBtn.hidden = false; startBtn.disabled = false; stopBtn.hidden = true;
  statusOut.textContent = locked ? 'Camera off. The lock stays on.' : 'Camera off.';
  keptOut.textContent = 'Camera off.';
}

canvas.addEventListener('pointermove', (e) => {
  if (stream) return;
  const r = canvas.getBoundingClientRect();
  aim = { x: ((e.clientX - r.left) / r.width - 0.5) * 3 * W, y: (0.5 - (e.clientY - r.top) / r.height) * 3 * H, z: REST.z };
});
canvas.addEventListener('pointerleave', () => { if (!stream) aim = { ...REST }; });
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden && (stream || startBtn.disabled)) stop(); });
new ResizeObserver(resize).observe(canvas);
resize();
requestAnimationFrame(frame);
