import { Scene } from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
  _s: number;
  facing?: "right" | "left" | "up" | "down";
  _r: number;
  isMoving: boolean = false;
  dir: 'x' | 'y';
  inc: number;
  frameRate: number


  constructor(scene: Scene, x: number, y: number, scale: number) {
    super(scene, x, y, "main_guy");
    this._s = scale;
    this._r = 0;
    this.frameRate = 4;

    scene.add.existing(this);
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("main_guy", {
        frames: [5],
      }),
      repeat: 1,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("main_guy", {
        frames: [6],
      }),
      repeat: 1,
    });
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("main_guy", {
        frames: [0, 1, 0, 2],
      }),
      frameRate: this.frameRate/4,
      repeat: -1,
      delay: 2000,
      showBeforeDelay: true,
    });
    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNumbers("main_guy", {
        frames: [5, 4],
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.anims.create({
      key: "walk_left",
      frames: this.anims.generateFrameNumbers("main_guy", {
        frames: [6, 7],
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.play("idle", true);
    this.setActive(true);
    this.setOrigin(0.5, 0.98);
  }

  update(): void {
    this.setRotation(this._r);
  }
}

