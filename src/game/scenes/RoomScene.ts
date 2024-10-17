import { GameObjects, Math as PMath, Scene } from "phaser";
import { Cell } from "../../types/Cell";

import { EventBus } from "../EventBus";
import { generateRoom } from "./roomGeneration";

export class RoomScene extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  walls: GameObjects.Sprite[];
  floorTiles: GameObjects.GameObject[];
  items: GameObjects.GameObject[] = [];
  size: number;
  roomConfig: {
    density: number;
    emptiness: number;
  };
  r: PMath.RandomDataGenerator;
  poi: Cell;
  playerPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  cells: Cell[];

  private player: Phaser.Physics.Arcade.Sprite;

  private one = 12;
  private half = this.one / 2;
  private quarter = this.half / 2;
  private eight = this.quarter / 2;

  private onBeat = false;

  constructor(
    roomName: string,
    size: number = 4,
    roomConfig = { density: 10, emptiness: 5 }
  ) {
    super(roomName);
    this.size = size;
    this.roomConfig = roomConfig;
    this.r = new PMath.RandomDataGenerator([
      Math.random().toString(36).substring(4).toLocaleUpperCase(),
    ]);
  }

  preload() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.reset();
  }

  reset() {
    this.cells = generateRoom(this);

    this.cells.forEach((c) => {
      const getColor = () => {
        if (c.isWall) {
          return 0x000000;
        }
        if (c.skull) {
          return 0xf12912;
        }
        if (c.isPath || c.isFloor) {
          return 0xffffff;
        }
        return 0x004400;
      };
      if (c.isOutside) {
        return;
      }
      if (c.isWall) {
        const wall = this.physics.add
          .sprite(c.x * 400, c.y * 400 - 100, "wall")
          .setDepth(c.y * 400);
      }

      this.add
        .rectangle(c.x * 400, c.y * 400, 380, 380, getColor())
        .setDepth(-1);
      // if (c.isFloor || c.isPath)
      //   this.add
      //     .rectangle(
      //       c.x * 400,
      //       c.y * 400,
      //       94,
      //       94,
      //       0x000000,
      //       1 - scale([0, 1], [0.75, 1])(c.n)
      //     )
      //     .setDepth(-1);
      if (c.isPath)
        this.add.circle(c.x * 400, c.y * 400, 10, 0x00ff00).setDepth(-1);
      if (c.isRubble) {
        this.add
          .sprite(c.x * 400, (c.y - 0.125) * 400, "rock")
          .setDepth((c.y - 0.5) * 400)
          .setScale(0.8);
      }
    });
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0011);
    this.camera.zoomTo(0.33, 500, PMath.Easing.Quadratic.In);
    this.input.keyboard?.on("keyup", (e: KeyboardEvent) => {
      if (
        !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        return;
      }
      const dir = e.key === "ArrowRight" || e.key === "ArrowLeft" ? "x" : "y";
      const inc = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;

      if (
        this.cells.find(
          (c) =>
            c.x === this.playerPosition.x + (dir === "x" ? inc : 0) &&
            c.y === this.playerPosition.y + (dir === "y" ? inc : 0) &&
            !c.isOutside &&
            !c.isWall &&
            !c.isRubble
        )
      )
        this.targetPosition = {
          ...this.playerPosition,
          [dir]: this.playerPosition[dir] + inc,
        };

      console.log({ tp: this.targetPosition });
    });

    this.playerPosition = { x: this.poi.x, y: this.poi.y };
    this.targetPosition = { x: this.poi.x, y: this.poi.y };

    this.player = this.physics.add.sprite(
      this.playerPosition.x * 400,
      this.playerPosition.y * 400,
      "player"
    );

    this.camera.startFollow(this.player, false, 0.01, 0.01);


    EventBus.emit("current-scene-ready", this);
  }

  update(time: number, delta: number): void {
    if ((time/500) % this.quarter < this.eight) {
      if (!this.onBeat) {
        console.log('beat')
        console.log(this.physics.world.fps);
        this.onBeat = true;
        if (this.targetPosition) {
          this.playerPosition = this.targetPosition;
          this.targetPosition = this.playerPosition;
          return;
        }
      }
    } else {
      this.onBeat = false;
    }

    // if (time % this.eight/2 < this.eight/4) {

    //    const closeEnough = PMath.Distance.Between(this.playerPosition.x*400, this.playerPosition.y*400, this.player.x, this.player.y) < 50
    //     this.player.x - this.playerPosition.x * 400 > 50;




    //  }


    this.player.setDepth(this.player.y);
  }
}

