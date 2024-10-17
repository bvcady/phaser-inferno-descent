import { Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      // debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 900,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  type: Phaser.WEBGL,
  pixelArt: false,
  width: "100%",
  height: "100%",
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;

