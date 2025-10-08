// Modal popup
window.onload = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopup");

  // Hiding popup after clicking start
  closeBtn.addEventListener("click", async () => {
    popup.style.display = "none";
    await Tone.start();
  });
};

// Canvas + Tone.js
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// --- Tone.js setup ---
const spawnSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.002, decay: 0.15, sustain: 0.05, release: 0.2 },
}).toDestination();

const popMembrane = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 3,
}).toDestination();
const popPluck = new Tone.PluckSynth().toDestination();
const popNoise = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
}).toDestination();

const popSynths = [popMembrane, popPluck, popNoise];

// --- Sounds ---
function playSpawnSound() {
  const notes = ["C4", "D4", "E4", "G4"];
  const i = Math.floor(Math.random() * (notes.length - 1));
  spawnSynth.triggerAttackRelease(notes[i], "16n");
  setTimeout(() => spawnSynth.triggerAttackRelease(notes[i + 1], "32n"), 60);
}

function playPopSound() {
  const synth = popSynths[Math.floor(Math.random() * popSynths.length)];
  if (synth === popNoise) {
    synth.triggerAttackRelease("16n");
  } else {
    const popNotes = ["C5", "D5", "E5", "G5", "A5", "C6"];
    const note = popNotes[Math.floor(Math.random() * popNotes.length)];
    synth.triggerAttackRelease(note, "16n");
  }
}

// --- Bubble model ---
let bubbles = [];
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 30 + 12;
    this.hue = Math.floor(Math.random() * 360);
    this.vy = Math.random() * 0.4 + 0.1;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.bobSpeed = Math.random() * 0.04 + 0.01;
  }
  update() {
    this.y -= this.vy;
    this.bobPhase += this.bobSpeed;
    this.x += Math.cos(this.bobPhase) * 0.2;
  }
  draw(ctx) {
    ctx.save();
    const g = ctx.createRadialGradient(
      this.x - this.radius * 0.35,
      this.y - this.radius * 0.35,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius
    );
    g.addColorStop(0, `hsla(${this.hue}, 100%, 90%, 0.9)`);
    g.addColorStop(0.6, `hsla(${this.hue}, 90%, 80%, 0.6)`);
    g.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0.25)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,0.6)`;
    ctx.lineWidth = Math.max(1, this.radius * 0.06);
    ctx.stroke();
    ctx.restore();
  }
  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

// --- Interaction ---
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].contains(x, y)) {
      playPopSound();
      bubbles.splice(i, 1);
      return;
    }
  }
  bubbles.push(new Bubble(x, y));
  playSpawnSound();
});

// --- Animation loop ---
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach((b) => {
    b.update();
    b.draw(ctx);
  });
  bubbles = bubbles.filter((b) => b.y + b.radius > -50);
  requestAnimationFrame(animate);
}
animate();
