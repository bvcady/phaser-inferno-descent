import { Math, Scene } from "phaser";
import { RoomScene } from "./RoomScene";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    this.load.image("background", "assets/bg.png");
    this.load.image("player", "assets/main_guy_1.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("rock", "assets/rock.png");
    this.load.spritesheet("main_guy", "assets/main_guy_anims@6x.png", {
      frameWidth: 600,
      frameHeight: 600,
    });
    this.load.image("walls_tilemap", "assets/walls_tileset@4x.png");
  }

  create() {
    this.scene.remove("room_0_0");

    this.scene.add(
      "room_0_0",
      new RoomScene("room_0_0", Math.Between(3, 6), {
        density: Math.Between(0, 30),
        emptiness: Math.Between(0, 100),
      })
    );

    this.scene.start("room_0_0");

    // this.scene.start("RoomScene");
  }
}

