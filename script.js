// const canvas = document.getElementById("playingCanvas")

const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 30 + 10; // random size between 10–40
    this.speed = Math.random() * 2 + 1; // float speed
    this.alpha = 1; // opacity
    this.hue = Math.random() * 360; // random color
  }

  update() {
    this.y -= this.speed;
    this.alpha -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

canvas.addEventListener("click", (e) => {
  // spawn only ONE bubble per click
  bubbles.push(new Bubble(e.clientX, e.clientY));
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((bubble, index) => {
    bubble.update();
    bubble.draw();

    if (bubble.alpha <= 0) {
      bubbles.splice(index, 1); // remove invisible bubbles
    }
  });

  requestAnimationFrame(animate);
}

animate();

// resize canvas dynamically
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
