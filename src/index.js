const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.font = '50px Impact';

const clickCanvas = document.querySelector('.click-canvas');
const clickCtx = clickCanvas.getContext('2d');
clickCanvas.width = window.innerWidth;
clickCanvas.height = window.innerHeight;

const btn = document.querySelector('.btn');

const rollTiming = 400; //ms
let rolls = [];
let booms = [];
let lastTime = 0;
let nexRollTime = 0;
let score = 0;
let gameTime = 10;

btn.addEventListener('click', () => {
  btn.style.opacity = 0;
  resetData();
  starGameHandler();
});

class Roll {
  constructor() {
    this.image = new Image();
    this.image.src = './src/roll.png';
    this.imgWidth = 440;
    this.imgHeight = 600;
    this.frame = 0;
    this.maxFrame = 28;
    this.size = Math.random() * 0.2 + 0.2;
    this.width = this.imgWidth * this.size;
    this.height = this.imgHeight * this.size;
    this.x = canvas.width;
    this.y = 0;
    this.moveX = Math.random() * 8 + 2;
    this.moveY = Math.random() * 12 - 3;
    this.markDelete = false;
    this.currentTime = 0;
    this.frameTiming = Math.random() * 50 + 50;
    this.randomColor = [
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
    ];
    this.color = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`;
  }
  update(timestamp) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.moveY = this.moveY * -1;
    }
    this.x -= this.moveX;
    this.y -= this.moveY;

    this.currentTime += timestamp;
    if (this.currentTime > this.frameTiming) {
      this.currentTime = 0;
      if (this.frame > this.maxFrame) {
        this.frame = 0;
      } else {
        this.frame++;
      }
    }

    if (this.x < 0 - this.width) {
      this.markDelete = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.imgWidth,
      0,
      this.imgWidth,
      this.imgHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    clickCtx.fillStyle = this.color;
    clickCtx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Boom {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = './src/boom.png';
    this.imageWidth = 200;
    this.imageHeight = 179;
    this.x = x;
    this.y = y;
    this.size = size;
    this.markDelete = false;
    this.frameTiming = 15000; //ms
    this.currentTime = 0;
    this.frame = 0;
  }
  update(timestamp) {
    this.currentTime += timestamp;
    if (this.currentTime > this.frameTiming) {
      this.currentTime = 0;
      this.frame++;
    }

    if (this.frame > 5) {
      this.markDelete = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.imageWidth,
      0,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.size,
      this.size
    );
  }
}

function scoreDrawHandler() {
  ctx.fillStyle = 'blue';
  ctx.fillText(`Score: ${score}`, 45, 70);
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 55, 70);
}

function timerDrawHandler() {
  ctx.fillStyle = 'blue';
  ctx.fillText(`Time: ${gameTime}s`, 45, 130);
  ctx.fillStyle = 'white';
  ctx.fillText(`Time: ${gameTime}s`, 55, 130);
}

function gameOverDrawHandler() {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'blue';
  ctx.fillText(
    `GAME OVER , your score is ${score}`,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = 'white';
  ctx.fillText(
    `GAME OVER , your score is ${score}`,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
}

function animateHandler(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clickCtx.clearRect(0, 0, canvas.width, canvas.height);
  let currentTime = timestamp - lastTime;
  lastTime = timestamp;
  nexRollTime += currentTime;
  scoreDrawHandler();
  timerDrawHandler();
  if (nexRollTime > rollTiming) {
    rolls.push(new Roll());
    nexRollTime = 0;
  }

  [...rolls, ...booms].forEach((object) => {
    object.update(timestamp);
  });
  [...rolls, ...booms].forEach((object) => {
    object.draw();
  });

  rolls = rolls.filter((object) => !object.markDelete);
  booms = booms.filter((object) => !object.markDelete);
  if (gameTime !== 0) {
    requestAnimationFrame(animateHandler);
  } else {
    gameOverDrawHandler();
    btn.style.opacity = 1;
  }
}

window.addEventListener('click', function (e) {
  const getClickColor = clickCtx.getImageData(e.x, e.y, 1, 1).data;

  rolls.forEach((roll) => {
    if (
      roll.randomColor[0] === getClickColor[0] ||
      roll.randomColor[1] === getClickColor[1] ||
      roll.randomColor[2] === getClickColor[2]
    ) {
      roll.markDelete = true;
      booms.push(new Boom(roll.x, roll.y, roll.width));
      score++;
    }
  });
});

function resetData() {
  rolls = [];
  booms = [];
  lastTime = 0;
  nexRollTime = 0;
  score = 0;
  gameTime = 10;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  clickCanvas.width = window.innerWidth;
  clickCanvas.height = window.innerHeight;
  ctx.font = '50px Impact';
}

function starGameHandler() {
  animateHandler(0);
  const timer = setInterval(() => {
    if (gameTime === 0) {
      clearInterval(timer);
    } else {
      gameTime--;
    }
  }, 1000);
}
