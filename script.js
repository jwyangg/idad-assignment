// Modal popup
window.onload = () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closePopup");

  // Hiding popup after clicking start
  closeBtn.addEventListener("click", async () => {
    popup.style.display = "none";
    await Tone.start(); // unlock audio context right when "Start" is clicked
  });
};

//////////////////////////

let synthSettings = {
  oscillator: {
    type: "fatsawtooth",
  },
  envelope: {
    attack: 0.5,
  },
};
// let synth = new Tone.synth(synthSettings).toDestination();
////////////////////////// sawtooth, sine(def), square, triangle (fat is full sound)

// Tone.js synth linking
const synth = new Tone.Synth(synthSettings).toDestination();

// Container for bubbles
const container = document.getElementById("bubbleContainer");

document.body.addEventListener("click", async (e) => {
  await Tone.start();
  createBubble(e.clientX, e.clientY);
});

function createBubble(x, y) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Randomising size of bubbles
  const size = Math.random() * 80 + 20;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";

  bubble.style.left = x - size / 2 + "px";
  bubble.style.top = y - size / 2 + "px";

  container.appendChild(bubble);

  // Playing random sounds for each generated bubble click
  const notes = ["C3", "C4", "D3", "D4", "E3", "E4", "G3", "G4", "A3", "A4"];
  const note = notes[Math.floor(Math.random() * notes.length)];
  synth.triggerAttackRelease(note, "8n");

  // Bubble disappearing animation
  setTimeout(() => {
    bubble.remove();
  }, 3000);
}
