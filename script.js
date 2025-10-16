// ___ Modal popup ___
window.onload = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopup");

  // Pop Up Disappearing After Button Click
  closeBtn.addEventListener("click", async () => {
    popup.style.display = "none";
    await Tone.start();
  });
};

// ___ Mode toggle setup ___
let isMoonMode = false;
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  isMoonMode = !isMoonMode;
  document.body.classList.toggle("moon", isMoonMode);
  modeToggle.textContent = isMoonMode ? "🌙" : "🌞";
});

// ___ Canvas setup ___
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

// ___ Tone.js instruments ___
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

//___Sounds___
function playSpawnSound(radius) {
  if (isMoonMode) {
    // Night Mode Sounds
    const minNote = 48;
    const maxNote = 72;
    const normalized = Math.min(Math.max((radius - 12) / 42, 0), 1);
    const midiNote = maxNote - normalized * (maxNote - minNote);
    const freq = Tone.Frequency(midiNote, "midi").toFrequency();
    spawnSynth.triggerAttackRelease(freq, "8n");
  } else {
    // Day Spawn, Linking Bubble Size to Pitch
    const minFreq = 300;
    const maxFreq = 900;
    const normalized = Math.min(Math.max((radius - 12) / 42, 0), 1);
    const freq = maxFreq - normalized * (maxFreq - minFreq);

    // Trigger Main Note
    spawnSynth.triggerAttackRelease(freq, "16n");

    // "Plink" Sound
    setTimeout(() => spawnSynth.triggerAttackRelease(freq * 1.2, "32n"), 60);
  }
}

function playPopSound(radius) {
  const synth = popSynths[Math.floor(Math.random() * popSynths.length)];

  // Pitch Range, Linking Size
  const minNote = 60;
  const maxNote = 84;
  const normalized = Math.min(Math.max((radius - 18) / 40, 0), 1);
  const midiNote = maxNote - normalized * (maxNote - minNote);
  const freq = Tone.Frequency(midiNote, "midi").toFrequency();

  if (isMoonMode) {
    // Night Mode Sound
    if (synth === popNoise) {
      synth.triggerAttackRelease("16n");
    } else {
      synth.triggerAttackRelease(freq * 0.7, "8n");
    }
  } else {
    // Day Mode Sound
    if (synth === popNoise) {
      synth.triggerAttackRelease("16n");
    } else {
      synth.triggerAttackRelease(freq, "16n");
    }
  }
}

// ___ Bubble model ___
let bubbles = [];
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // this.radius = Math.random() * 40 + 18;
    const sizeBuckets = [20, 26, 34, 44, 56];
    this.radius = sizeBuckets[Math.floor(Math.random() * sizeBuckets.length)];

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
    // Changing the Colours in Dark Mode
    if (isMoonMode) {
      const neonHue = (this.hue + 180) % 360;
      const neonColor = `hsla(${neonHue}, 100%, 65%, 0.9)`;
      const g = ctx.createRadialGradient(
        this.x,
        this.y,
        this.radius * 0.2,
        this.x,
        this.y,
        this.radius
      );
      g.addColorStop(0, neonColor);
      g.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 25;
      ctx.fill();
    } else {
      // Normal Day Bubbles
      const g = ctx.createRadialGradient(
        this.x - this.radius * 0.4,
        this.y - this.radius * 0.4,
        this.radius * 0.1,
        this.x,
        this.y,
        this.radius
      );
      g.addColorStop(0, `hsla(${this.hue}, 100%, 95%, 0.95)`);
      g.addColorStop(0.4, `hsla(${(this.hue + 40) % 360}, 90%, 85%, 0.7)`);
      g.addColorStop(0.8, `hsla(${(this.hue + 80) % 360}, 80%, 75%, 0.4)`);
      g.addColorStop(1, `rgba(255, 255, 255, 0.1)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Soft Pastel Gradient
    const g = ctx.createRadialGradient(
      this.x - this.radius * 0.4,
      this.y - this.radius * 0.4,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius
    );

    g.addColorStop(0, `hsla(${this.hue}, 100%, 95%, 0.95)`);
    g.addColorStop(0.4, `hsla(${(this.hue + 40) % 360}, 90%, 85%, 0.7)`);
    g.addColorStop(0.8, `hsla(${(this.hue + 80) % 360}, 80%, 75%, 0.4)`);
    g.addColorStop(1, `rgba(255, 255, 255, 0.1)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Highlights for Bubbles
    const highlight = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      0,
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.5
    );
    highlight.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlight;
    ctx.fill();

    // Outline for Bubbles
    ctx.strokeStyle = `rgba(255, 255, 255, 0.7)`;
    ctx.lineWidth = Math.max(1, this.radius * 0.05);
    ctx.stroke();

    ctx.restore();
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

// ___ Interaction ___
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].contains(x, y)) {
      playPopSound(bubbles[i].radius);
      bubbles.splice(i, 1);
      return;
    }
  }

  const newBubble = new Bubble(x, y);
  bubbles.push(newBubble);
  playSpawnSound(newBubble.radius);
});

// ___ Animation loop ___
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
