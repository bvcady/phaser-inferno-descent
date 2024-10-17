import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { RoomScene } from "./scenes/RoomScene";
import { Math as PMath } from "phaser";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef<Phaser.Game | null>(null!);

    useLayoutEffect(() => {
      if (game.current === null) {
        game.current = StartGame("game-container");

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref]);

    useEffect(() => {
      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: game.current, scene: scene_instance });
        } else if (ref) {
          ref.current = {
            game: game.current,
            scene: scene_instance,
          };
        }
      });
      return () => {
        EventBus.removeListener("current-scene-ready");
      };
    }, [currentActiveScene, ref]);

    return (
      <div id="game-container" style={{ width: "100dvw", height: "100dvh" }}>
        {/* <button
          onClick={() => {
            game.current?.destroy(true);
            game.current = null;
            game.current = StartGame("game-container", [
              Math.random().toString(36).substring(4).toLocaleUpperCase(),
            ]);
          }}
        >
          Start
        </button> */}
        <button
          onClick={() => {
            game.current?.scene.remove("room_0_0");
            game.current?.scene.add(
              "room_0_0",
              new RoomScene("room_0_0", PMath.Between(3, 6), {
                density: PMath.Between(0, 30),
                emptiness: PMath.Between(0, 100),
              })
            );
            game.current?.scene.getScene("room_0_0")?.scene.start();
          }}
        >
          Go to scene
        </button>
      </div>
    );
  }
);

