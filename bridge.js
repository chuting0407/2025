// 定義 Bridge 類別
class Bridge {
  constructor(num, radius, length) {
    this.bodies = [];
    for (let i = 0; i < num; i++) {
      let x = width / 2 + i * length - (num * length) / 2;
      let y = height - 50;
      let body = Bodies.circle(x, y, radius, { isStatic: true }); // 使用 Matter.js 的 Bodies.circle
      this.bodies.push(body);
      Composite.add(engine.world, body); // 將節點加入到 Matter.js 世界中
    }
  }

  display(color) {
    stroke(color || "#000000");
    strokeWeight(4);
    for (let i = 0; i < this.bodies.length - 1; i++) {
      let bodyA = this.bodies[i];
      let bodyB = this.bodies[i + 1];
      line(bodyA.position.x, bodyA.position.y, bodyB.position.x, bodyB.position.y);
    }
  }
}