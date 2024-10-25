import * as Phaser from "phaser";
import { Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { RoomScene } from "./scenes/RoomScene";

//  Find out more information about the Game Config at:`
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  fps: {
    limit: 60,
    target: 60,
    forceSetTimeOut: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 900,
  },
  type: Phaser.WEBGL,
  width: 1200,
  parent: "game-container",
  scene: [Boot, RoomScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
