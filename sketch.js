/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Bridge w Bouncing Balls (matter.js + ml5.js)
Video Tutorial: https://youtu.be/K7b5MEhPCuo

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

// ml5.js 
let handPose;
let video;
let hands = [];

const INDEX_FINGER_TIP = 8;

// Matter.js 
const { Engine, Bodies, Composite } = Matter;
let engine;
let balls = [];
let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"]; 

let words = ["虛擬實境", "互動式學習", "虛擬實境", "遊戲化學習", "區塊鏈", "社群媒體", "傳統教育", "擴增實境"];
let correctWords = ["虛擬實境", "互動式學習", "虛擬實境", "遊戲化學習", "擴增實境"]; // 正確的詞彙列表
let score = 0;

let gameTime = 30; // 遊戲時間 30 秒
let startTime;

function preload() {
  try {
    handPose = ml5.handPose({ maxHands: 1, flipped: true }, () => {
      console.log("HandPose model loaded successfully.");
    });
  } catch (error) {
    console.error("Error loading HandPose model:", error);
  }
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  engine = Engine.create();

  // 初始化 5 個詞彙球
  for (let i = 0; i < 5; i++) {
    let word = random(words); // 隨機分配詞彙
    balls.push(new Ball(random(width), 0, word));
  }

  startTime = millis(); // 記錄遊戲開始時間
}

function draw() {
  background(220);
  Engine.update(engine);

  // 顯示攝影機畫面
  image(video, 0, 0, width, height);

  // 計算剩餘時間
  let elapsedTime = (millis() - startTime) / 1000;
  let remainingTime = max(0, gameTime - elapsedTime);

  // 繪製透明小方框
  fill(255, 255, 255, 200); // 白色，透明度 200
  noStroke();
  rect(5, 5, 180, 40, 10); // 繪製圓角矩形

  // 顯示剩餘時間
  fill(0);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(`剩餘時間: ${remainingTime.toFixed(1)} 秒`, 15, 25);

  // 如果時間結束，停止遊戲並顯示重新開始按鈕
  if (remainingTime <= 0) {
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255, 0, 0);
    text("遊戲結束！", width / 2, height / 2 - 60);

    // 顯示分數
    fill(255);
    textSize(28);
    text(`您的分數: ${score}`, width / 2, height / 2);

    noLoop(); // 停止 draw 函數

    // 顯示重新開始按鈕
    const restartButton = createButton("重新開始");
    restartButton.style("font-size", "20px"); // 調整按鈕字型大小
    restartButton.style("padding", "10px 20px"); // 增加按鈕內邊距
    restartButton.position(width / 2 - 60, height / 2 - 60); // 放到分數下方
    restartButton.mousePressed(() => {
      restartButton.remove(); // 移除按鈕
      restartGame(); // 重新開始遊戲
    });
    return;
  }

  if (hands.length > 0 && hands[0].keypoints) {
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    if (index) {
      fill(0, 255, 0);
      noStroke();
      circle(index.x, index.y, 10); // 顯示食指位置

      // 判斷是否碰到詞彙球
      for (let i = balls.length - 1; i >= 0; i--) { // 倒序遍歷以安全移除球
        let ball = balls[i];
        if (ball.isTouched(index.x, index.y)) {
          if (!ball.touched) { // 確保每個球只計算一次分數
            ball.touched = true; // 標記球已被碰到
            if (correctWords.includes(ball.word)) {
              score += 5; // 正確加分
              ball.setColor("#00FF00"); // 球變綠色
            } else {
              score -= 5; // 錯誤扣分
              ball.setColor("#FF0000"); // 球變紅色
            }

            // 延遲移除球，讓顏色變化可見
            setTimeout(() => {
              if (balls.includes(ball)) { // 確保只移除該球
                balls.splice(i, 1); // 從陣列中移除球
              }
            }, 200);
          }
        }
      }
    }
  }

  // 顯示詞彙球
  for (let ball of balls) {
    ball.update();
    ball.display();
  }

  // 持續生成新詞彙球
  if (frameCount % 50 === 0) { // 每隔 60 幀生成一個新球
    let word = random(words);
    balls.push(new Ball(random(width), 0, word));
  }

  // 更新分數顯示
  document.getElementById("score").innerText = `分數: ${score}`;
}

// 定義 Ball 類別
class Ball {
  constructor(x, y, word) {
    this.x = x;
    this.y = y;
    this.word = word;
    this.radius = 50; // 放大詞彙球
    this.speed = random(1, 3); // 增加速度範圍
    this.color = random(colorPalette); // 隨機顏色
    this.touched = false; // 標記球是否已被碰到
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.reset(); // 超出畫布重置
    }
  }

  display() {
    noStroke();
    fill(this.color); // 使用當前顏色
    ellipse(this.x, this.y, this.radius * 2);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16); // 調整文字大小
    textStyle(NORMAL); // 設定文字樣式為正常
    text(this.word, this.x, this.y);
  }

  isTouched(fingerX, fingerY) {
    // 增加碰撞範圍，讓檢測更靈敏
    return dist(this.x, this.y, fingerX, fingerY) < this.radius + 10;
  }

  setColor(color) {
    this.color = color; // 設定球的顏色
  }

  reset() {
    this.x = random(width);
    this.y = 0;
    this.word = random(words); // 隨機分配新詞
    this.color = random(colorPalette); // 隨機分配新顏色
    this.touched = false; // 重置為未被碰到
  }
}

function restartGame() {
  score = 0; // 重置分數
  balls = []; // 清空詞彙球
  for (let i = 0; i < 5; i++) {
    let word = random(words); // 隨機分配詞彙
    balls.push(new Ball(random(width), 0, word));
  }
  startTime = millis(); // 重置遊戲開始時間
  loop(); // 重新啟動 draw 函數
}

// Callback function for when handPose outputs data
function gotHands(results) {
  hands = results; // 實時更新手指位置
}
