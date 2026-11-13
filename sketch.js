
const GAME_W = 400;
const GAME_H = 800;
const BRICK_COUNT = 8;

let ball;
let bat;
let bricks = [];
let score = 0;
let gameOver = false;

function setup() {
  const canvas = createCanvas(GAME_W, GAME_H);
  canvas.parent("game-container");
  resetGame();
}

function resetGame() {
  score = 0;
  gameOver = false;

  ball = new Ball();
  bat = new Bat(height - 100, 100, 30);
  bricks = [];

  const brickW = width / BRICK_COUNT;

  for (let i = 0; i < BRICK_COUNT; i++) {
    bricks.push(new Bricks(i * brickW, brickW, 20));
  }
}

function draw() {
  background(0, 255, 255);

  for (const brick of bricks) {
    brick.show();
  }

  bat.show();
  ball.show();

  if (!gameOver) {
    ball.move();
    ball.checkBat(bat);

    for (const brick of bricks) {
      ball.checkBricks(brick);
    }

    if (bricks.every(b => b.layers <= 0)) {
      gameOver = true;
    }

    if (ball.y - ball.d / 2 > height) {
      gameOver = true;
    }
  }

  fill(0);
  noStroke();
  textSize(16);
  text(`점수: ${score}`, 10, 10);

  if (gameOver) {
    fill(0, 0, 0, 170);
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(30);

    text(
      bricks.every(b => b.layers <= 0)
        ? "성공!"
        : "게임 종료",
      width / 2,
      height / 2
    );

    textSize(16);
    text("화면을 클릭하여 다시 시작", width / 2, height / 2 + 40);
  }
}

function mouseMoved() {
  if (bat) {
    bat.x = constrain(mouseX, bat.w / 2, width - bat.w / 2);
  }
}

function mouseDragged() {
  if (bat) {
    bat.x = constrain(mouseX, bat.w / 2, width - bat.w / 2);
  }
}

function touchMoved() {
  if (bat) {
    bat.x = constrain(touchX, bat.w / 2, width - bat.w / 2);
  }
  return false;
}

function mousePressed() {
  if (gameOver) resetGame();
}

function touchStarted() {
  if (gameOver) resetGame();
  return false;
}

class Ball {
  constructor() {
    this.x = random(width);
    this.y = random(height / 2 - 100, height / 2 + 100);
    this.sx = 5;
    this.sy = -5;
    this.d = 50;
    this.mascot = new Sky(this.x, this.y, this.d);
  }

  move() {
    this.x += this.sx;
    this.y += this.sy;

    if (this.x - this.d / 2 < 0) {
      this.x = this.d / 2;
      this.sx = abs(this.sx);
    }

    if (this.x + this.d / 2 > width) {
      this.x = width - this.d / 2;
      this.sx = -abs(this.sx);
    }

    if (this.y - this.d / 2 < 0) {
      this.y = this.d / 2;
      this.sy = abs(this.sy);
    }
  }

  show() {
    this.mascot.x = this.x;
    this.mascot.y = this.y;
    this.mascot.show();
  }

  checkBricks(brick) {
    if (brick.layers <= 0) return false;

    const bottom = this.y + this.d / 2;
    const top = this.y - this.d / 2;
    const brickBottom = brick.layers * brick.h;

    if (
      this.x > brick.x &&
      this.x < brick.x + brick.w &&
      bottom >= 0 &&
      top <= brickBottom &&
      this.sy < 0
    ) {
      brick.layers--;
      this.sy = abs(this.sy);
      this.y = brickBottom + this.d / 2;
      score++;
      return true;
    }

    return false;
  }

  checkBat(paddle) {
    const bottom = this.y + this.d / 2;
    const paddleTop = paddle.y - paddle.h / 2;

    const inside =
      this.x > paddle.x - paddle.w / 2 &&
      this.x < paddle.x + paddle.w / 2;

    if (
      this.sy > 0 &&
      inside &&
      bottom >= paddleTop &&
      bottom <= paddleTop + 14
    ) {
      this.sy = -abs(this.sy);
      this.y = paddleTop - this.d / 2;

      const offset = (this.x - paddle.x) / (paddle.w / 2);
      this.sx = constrain(offset * 5, -5, 5);
    }
  }
}

class Bat {
  constructor(y, w, h) {
    this.x = width / 2;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show() {
    this.x = constrain(this.x, this.w / 2, width - this.w / 2);

    noStroke();
    fill(100, 50, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
    rectMode(CORNER);
  }
}

class Bricks {
  constructor(x, w, h) {
    this.x = x;
    this.w = w;
    this.h = h;
    this.layers = 5;
  }

  show() {
    noStroke();

    for (let i = 0; i < this.layers; i++) {
      if (i === 0) fill(0, 0, 255);
      else if (i === 1) fill(0, 255, 0);
      else if (i === 2) fill(255, 255, 0);
      else if (i === 3) fill(255, 0, 255);
      else fill(255, 0, 0);

      rect(this.x, i * this.h, this.w, this.h);
    }
  }
}

class Sky {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;
  }

  show() {
    push();
    translate(this.x, this.y);
    noStroke();

    fill(255);
    ellipse(-this.d, this.d * 0.45, this.d * 0.95, this.d * 1.05);
    ellipse(-this.d, -this.d * 0.18, this.d * 0.78, this.d * 0.78);

    fill(0);
    ellipse(-this.d, -this.d * 0.2, this.d * 0.07);
    ellipse(-this.d * 0.82, -this.d * 0.2, this.d * 0.07);

    fill(255, 165, 0);
    triangle(
      -this.d, -this.d * 0.08,
      -this.d, -this.d * 0.18,
      -this.d * 0.86, -this.d * 0.1
    );

    fill(255, 0, 0);
    triangle(
      -this.d * 1.18, this.d * 0.05,
      -this.d * 0.82, this.d * 0.05,
      -this.d, this.d * 0.32
    );

    stroke(184, 115, 51);
    strokeWeight(2);

    line(-this.d * 1.32, this.d * 0.15, -this.d * 1.62, -this.d * 0.2);
    line(-this.d * 1.62, -this.d * 0.2, -this.d * 1.75, -this.d * 0.42);
    line(-this.d * 0.68, this.d * 0.15, -this.d * 0.38, -this.d * 0.2);
    line(-this.d * 0.38, -this.d * 0.2, -this.d * 0.25, -this.d * 0.42);

    pop();
  }
}
