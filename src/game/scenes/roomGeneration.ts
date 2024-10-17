import { Math as PMath } from "phaser";
import { createNoise2D } from "simplex-noise";
import { Cell } from "../../types/Cell";
import { Direction } from "../../utils/direction";
import { distanceFromCenter } from "../../utils/distanceFromCenter";
import { scale } from "../../utils/scale";
import { RoomScene } from "./RoomScene";
import {
  cellNeighboursAnEdge,
  checkIfNeighbourIsOutside,
  findPath,
  makeGrid,
} from "./roomSceneHelpers";

export const generateRoom = (scene: RoomScene): Cell[] => {
  scene.data.reset();
  scene.data.set("size", scene.size);
  scene.data.set("width", (scene.size + 1) * 10);
  scene.data.set("height", PMath.FloorTo(scene.data.get("width") * (9 / 16)));
  scene.data.set("density", scene.roomConfig.density);
  scene.data.set("emptiness", scene.roomConfig.emptiness);

  const noise2D = createNoise2D(() => scene.r.frac());
  const randDataGen = new PMath.RandomDataGenerator();
  const [width, height] = [scene.data.get("width"), scene.data.get("height")];
  let fillableCells: Cell[] = new Array(height)
    .fill("")
    .map((_, y) =>
      new Array(width).fill("").map((_, x) => {
        const d = distanceFromCenter(x, y, width, height);
        const noisedVal = scale([-1, 1], [0, 1])(noise2D(x / 12, y / 12));

        const insideShape =
          d + scale([0, 1], [-height / 9, height / 9])(noisedVal) <
          (width < height ? width : height) / 3;

        return {
          id: randDataGen.uuid(),
          x,
          y,
          isOutside: !insideShape,
          n: noisedVal,
        };
      })
    )
    .flat();

  const insideCells = [...fillableCells].filter((c) => !c.isOutside);

  fillableCells = [...fillableCells].map((c) => {
    const edgeCell = checkIfNeighbourIsOutside(c, [...insideCells]);
    if (!edgeCell) {
      return c;
    }

    return {
      ...c,
      isEdge: !c.isOutside && edgeCell,
    };
  });

  const currentRoom = {
    neighbours: {
      top: scene.r.frac() > 0.5,
      bottom: scene.r.frac() > 0.5,
      right: scene.r.frac() > 0.5,
      left: scene.r.frac() > 0.5,
    },
  };

  let exits = (Object.keys(currentRoom.neighbours) as Direction[])
    .map((k) => {
      return {
        side: k,
        exit: currentRoom.neighbours[k],
        cell: {
          ...scene.r.shuffle(
            fillableCells
              .filter((c) => !c.isOutside)
              .sort((a, b) => {
                if (k === "top") {
                  return a.y - b.y;
                }
                if (k === "bottom") {
                  return b.y - a.y;
                }
                if (k === "right") {
                  return b.x - a.x;
                }
                if (k === "left") {
                  return a.x - b.x;
                }
                return 1;
              })
              .slice(0, 10)
          )[0],
        },
      };
    })
    .filter((room) => room.exit);

  exits = [...exits].map((e) => {
    return {
      ...e,
      cell: {
        ...e.cell,
        x:
          e.side === "left"
            ? e.cell.x + 2
            : e.side === "right"
            ? e.cell.x - 2
            : e.cell.x,
        y:
          e.side === "top"
            ? e.cell.y + 2
            : e.side === "bottom"
            ? e.cell.y - 2
            : e.cell.y,
      },
    };
  });

  const farEnough = [...insideCells].filter(
    (c) =>
      !exits.some(
        (e) =>
          Math.sqrt(Math.pow(e.cell.x - c.x, 2) + Math.pow(e.cell.y - c.y, 2)) <
          5
      )
  );

  const poiCell =
    farEnough[
      PMath.FloorTo(scale([0, 1], [0, farEnough.length - 1])(scene.r.frac()))
    ];

  fillableCells = [...fillableCells].map((c) => {
    const isClose =
      exits.some(
        (e) =>
          Math.sqrt(Math.pow(e.cell.x - c.x, 2) + Math.pow(e.cell.y - c.y, 2)) <
          1.5
      ) ||
      Math.sqrt(Math.pow(poiCell.x - c.x, 2) + Math.pow(poiCell.y - c.y, 2)) <
        2.5;
    if (!isClose) {
      return c;
    }
    return {
      ...c,
      isPath: true,
      isWall: false,
      isOutside: false,
      isFloor: true,
    };
  });

  if (poiCell) {
    fillableCells[fillableCells?.findIndex((c) => c.id === poiCell.id)] = {
      ...poiCell,
      isWall: false,
      skull: true,
    };
  }

  const grid = makeGrid(fillableCells);

  const allPaths = [...exits]
    .map((exit) =>
      [...exits].map((e) => findPath(exit?.cell, grid, e?.cell)).flat()
    )
    .flat();

  const poiPath =
    poiCell && exits?.length ? findPath(exits?.[0]?.cell, grid, poiCell) : [];

  fillableCells = [...fillableCells].map((c) => {
    const containsPath =
      !!allPaths?.find((p) => p === `${c.x} - ${c.y}`) ||
      !!poiPath?.find((p) => p === `${c.x} - ${c.y}`);
    if (!containsPath) {
      return c;
    }
    return {
      ...c,
      isPath: containsPath,
      isWall: false,
      isOutside: false,
    };
  });

  fillableCells = [...fillableCells].map((c) => {
    const newWall =
      cellNeighboursAnEdge(c, fillableCells) || (c.isEdge && !c.isPath);
    if (!newWall) {
      return { ...c, isFloor: c.isEdge && !c.isWall && !c.isOutside };
    }
    return {
      ...c,
      isWall: true,
      isOutside: false,
    };
  });

  fillableCells = [...fillableCells].map((c) => {
    return { ...c, isFloor: !(c.isWall || c.isEdge || c.isPath) };
  });

  const chosen = scene.r.shuffle(exits)[0];

  if (chosen) {
    fillableCells = [...fillableCells].map((c) => {
      if (c.isOutside || c.isWall) {
        return c;
      }

      const d = Math.sqrt(
        Math.pow(chosen.cell.x - c.x, 2) + Math.pow(chosen.cell.y - c.y, 2)
      );
      const isClose = d > 1.5 && d < 3.5;
      return { ...c, isRubble: isClose };
    });
  }

  const wallOptions = [...fillableCells]
    .filter((c) => c.isFloor && !c.isPath && !c.isOutside && !c.isRubble)
    .sort((a, b) => a.n - b.n)
    .splice(0, (insideCells.length * scene.data.get("density")) / 100);

  fillableCells = [...fillableCells].map((c) => {
    const included = wallOptions.find((opt) => opt.id === c.id);
    if (!included) {
      return c;
    }
    return {
      ...c,
      isFloor: false,
      isWall: true,
      isPath: false,
      isOutside: false,
    };
  });

  const rubbleOptions = [...fillableCells]
    .filter((c) => c.isFloor && !c.isPath && !c.isOutside)
    .sort((a, b) => a.n - b.n)
    .splice(0, (insideCells.length * scene.data.get("density")) / 2 / 100);

  fillableCells = [...fillableCells].map((c) => {
    const included = rubbleOptions.find((opt) => opt.id === c.id);
    if (!included || c.isWall) {
      return c;
    }
    return {
      ...c,
      isRubble: true,
      isWall: false,
      isOutside: false,
    };
  });

  scene.poi = fillableCells.find((c) => c.skull)!;

  return fillableCells;
};

