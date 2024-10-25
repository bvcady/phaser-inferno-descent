import { GameObjects, Math as PMath, Scene, Tilemaps } from "phaser";
import { Cell } from "../../types/Cell";

import { EventBus } from "../EventBus";
import { Player } from "../player/Player";
import { generateRoom } from "./roomGeneration";
import { getDisplaySprite } from "../../utils/tilemap-handler/getDisplaySprite";

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
  playerPosition: PMath.Vector2;
  targetPosition: PMath.Vector2;
  cells: Cell[];
  wallTiles: Map<string, PMath.Vector2>;

  wallTileMap: Tilemaps.Tilemap;
  wallSprites: { x: number; y: number; vector?: PMath.Vector2 }[];

  private player: Player;

  private one = 1333.333333334;
  private half = this.one / 2;
  private quarter = this.half / 2;
  private eighth = this.quarter / 2;
  private sixteenth = this.eighth / 2;
  private thirtySecond = this.sixteenth / 2;

  private onBeat = false;
  private curBeat = 0;

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
    this.reset();
  }

  reset() {
    this.cells = generateRoom(this);

    this.wallSprites = new Array(this.data.get("height") + 1)
      .fill("")
      .map((_, y) =>
        new Array(this.data.get("width") + 1).fill("").map((_, x) => {
          return {
            x,
            y,
            vector: getDisplaySprite({
              pos: new PMath.Vector2(x, y),
              cells: this.cells,
              shouldlog: this.poi.x === x && this.poi.y === y,
            }),
          };
        })
      )
      .flat();

    this.wallSprites.forEach((s) => {
      if (s.vector) {
        const frame = s.vector.y *4 + s.vector.x;
        if (s.x === this.poi.x && s.y === this.poi.y) {
          console.log(frame, s.vector);
        }
        this.add.sprite(
          s.x * 400 - 200,
          s.y * 400 - 200,
          PMath.Between(0,1) > 0.5 ? "walls_tilemap" : 'walls_tilemap_2',
          frame
        ).setDepth(s.y * 400 - 200);
        this.add.sprite(
          s.x * 400 - 200,
          s.y * 400 - 200 - 200,
          PMath.Between(0,1) > 0.5 ? "walls_tilemap" : 'walls_tilemap_2',
          frame
        ).setDepth(s.y * 400 - 200);;
      }
    });

    this.wallTiles = new Map();

    this.cells.forEach((c) => {
      const getColor = () => {
        if (c.isWall) {
          return 0x000000;
        }
        if (c.skull) {
          return 0xf12912;
        }
        if (c.isPath || c.isFloor) {
          return 0xe1e5d8;
        }
        return 0x004400;
      };
      if (c.isOutside) {
        return;
      }
      if (c.isWall) {
      } else {
        this.add
          .rectangle(c.x * 400, c.y * 400, 340, 340, getColor())
          .setDepth(-1);

        if (c.isPath)
          this.add.circle(c.x * 400, c.y * 400, 40, 0x000000).setDepth(-1);
        if (c.isRubble) {
          this.add
            .sprite(c.x * 400, (c.y - 0.125) * 400, "rock")
            .setDepth((c.y - 0.5) * 400)
            .setScale(0.8);
        }
      }
    });

    // const wallsIterator = this.wallTiles.entries();
    // for (let [key, value] of wallsIterator) {
    //   console.log(key, value);
    //   this.add.rectangle(
    //     Number(key.split(",")[0]) * 400 - 200,
    //     Number(key.split(",")[1]) * 400 - 200,
    //     400,
    //     400,
    //     0x00ff00,
    //     0.2
    //   );
    //   this.add
    //     .sprite(
    //       Number(key.split(",")[0]) * 400 - 200,
    //       Number(key.split(",")[1]) * 400 - 200,
    //       "walls_tilemap",
    //       value.x + value.x * value.y
    //     )
    //     .setDepth(Number(key.split(",")[1]) * 400);
    // }
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0011);
    this.camera.zoomTo(0.33, 500, PMath.Easing.Quadratic.In);

    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (
        !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key) ||
        this.player.isMoving
      ) {
        return;
      }
      this.player.dir =
        e.key === "ArrowRight" || e.key === "ArrowLeft" ? "x" : "y";
      this.player.inc = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;

      if (
        this.cells.find(
          (c) =>
            c.x ===
              this.playerPosition.x +
                (this.player.dir === "x" ? this.player.inc : 0) &&
            c.y ===
              this.playerPosition.y +
                (this.player.dir === "y" ? this.player.inc : 0) &&
            !c.isOutside &&
            !c.isWall &&
            !c.isRubble
        )
      ) {
        this.targetPosition = new PMath.Vector2().copy(this.playerPosition);
        this.targetPosition[this.player.dir] =
          this.playerPosition[this.player.dir] + this.player.inc;
      }
    });

    this.playerPosition = new PMath.Vector2({ x: this.poi.x, y: this.poi.y });
    this.targetPosition = new PMath.Vector2({ x: this.poi.x, y: this.poi.y });

    this.player = new Player(
      this,
      this.playerPosition.x * 400,
      this.playerPosition.y * 400 + 100,
      400
    );

    this.camera.startFollow(this.player, false, 0.03, 0.03);

    EventBus.emit("current-scene-ready", this);
  }

  update(time: number, delta: number): void {
    if (time % this.sixteenth < this.thirtySecond) {
      if (!this.onBeat) {
        this.curBeat += 1;
        this.curBeat = this.curBeat % 1600;

        if (this.curBeat % 4 !== 0) {
          if (this.player.isMoving === false) {
            this.player.play("idle", true);
          }

          return;
        }

        if (this.curBeat % 16 === 0) {
          this.tweens.add({
            targets: this.player,
            scaleX:
              this.curBeat % (16 * 4) === 0 ? PMath.FloatBetween(1, 1.04) : 1,
            scaleY:
              this.curBeat % (16 * 4) === 0
                ? PMath.FloatBetween(1.025, 1.1)
                : 1,
            ease: "Quint.easeOut",
            duration: this.one * 4,
            onComplete: (tween) => {
              tween.remove();
            },
          });
        }
        const p1Vec = new PMath.Vector2(this.targetPosition);
        const p2Vec = new PMath.Vector2(this.playerPosition);
        const n = p1Vec.subtract(p2Vec).normalize();

        if (!this.player.isMoving && n.length() !== 0) {
          getDisplaySprite({
            pos: new PMath.Vector2(
              this.targetPosition.x,
              this.targetPosition.y
            ),
            cells: this.cells,
            shouldlog: true,
          });
          this.tweens.add({
            targets: this.player,
            x: this.targetPosition.x * 400,
            y: this.targetPosition.y * 400 + 100,
            ease: "Stepped",
            easeParams: [4],
            duration: this.half,
            onStart: () => {
              this.player.isMoving = true;
              this.player.play(
                this.player.dir === "x"
                  ? this.player.inc === -1
                    ? "walk_left"
                    : "walk_right"
                  : "idle"
              );
            },
            onComplete: (tween) => {
              this.player.isMoving = false;
              this.playerPosition = this.targetPosition;
              tween.remove();
            },
          });
        }
      }
      this.onBeat = true;
    } else {
      this.onBeat = false;
    }

    this.player.setDepth(this.player.y);
    this.player.update();
  }
}
