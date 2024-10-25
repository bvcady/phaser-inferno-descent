import { Math } from "phaser";
import { Cell } from "../../types/Cell";

const A = "floor";
const B = "wall";

const V = Math.Vector2;

export const displayTileOptions: Map<string, [Math.Vector2 | string]> =
  new Map()
    .set([A, A, B, A].toString(), [new V(0, 0), "OUTER_BOTTOM_LEFT"])
    .set([B, A, A, B].toString(), [new V(0, 1), "DUAL_DOWN_RIGHT"])
    .set([A, B, A, A].toString(), [new V(0, 2), "OUTER_TOP_RIGHT"])
    .set([A, A, A, A].toString(), [new V(0, 3), "EMPTY"])
    .set([A, B, A, B].toString(), [new V(1, 0), "EDGE_RIGHT"])
    .set([A, B, B, B].toString(), [new V(1, 1), "INNER_BOTTOM_RIGHT"])
    .set([B, B, A, A].toString(), [new V(1, 2), "EDGE_TOP"])
    .set([A, A, A, B].toString(), [new V(1, 3), "OUTER_BOTTOM_RIGHT"])
    .set([B, B, B, B].toString(), [new V(2, 1), "FULL"])
    .set([B, A, B, B].toString(), [new V(2, 0), "INNER_BOTTOM_LEFT"])
    .set([B, B, A, B].toString(), [new V(2, 2), "INNER_TOP_RIGHT"])
    .set([A, B, B, A].toString(), [new V(2, 3), "DUAL_UP_RIGHT"])
    .set([A, A, B, B].toString(), [new V(3, 0), "EDGE_BOTTOM"])
    .set([B, B, B, A].toString(), [new V(3, 1), "INNER_TOP_LEFT"])
    .set([B, A, B, A].toString(), [new V(3, 2), "EDGE_LEFT"])
    .set([B, A, A, A].toString(), [new V(3, 3), "OUTER_TOP_LEFT"]);

console.log(displayTileOptions);

const neighbours = [new V(0, 0), new V(1, 0), new V(0, 1), new V(1, 1)];

interface Props {
  pos: Math.Vector2;
  cells: Cell[];
  displayTiles?: Map<string, Math.Vector2 | undefined>;
  shouldlog?: boolean;
}

export const getDisplaySprite = ({ pos, cells, shouldlog }: Props) => {
  const getWorldTile = (coords: Math.Vector2): string => {
    const foundCell = cells.find((c) => c.x === coords.x && c.y === coords.y);
    if (foundCell) {
      if (foundCell.isWall) return "wall";
    }
    return "floor";
  };
  pos.subtract({ x: 1, y: 1 });
  const bottomRight = getWorldTile(pos.clone().add(neighbours[3]));
  const bottomLeft = getWorldTile(pos.clone().add(neighbours[2]));
  const topRight = getWorldTile(pos.clone().add(neighbours[1]));
  const topLeft = getWorldTile(pos.clone().add(neighbours[0]));
  const key = [topLeft, topRight, bottomLeft, bottomRight].toString();

  if (shouldlog) {
    console.log(pos);
    console.log(key);
    console.log(displayTileOptions.get(key));
  }

  return displayTileOptions.get(key)?.[0] as Math.Vector2;
};

// export const setDisplayTile = ({ pos, cells, displayTiles }: Props) => {
//   const getWorldTile = (coords: Math.Vector2): string => {
//     const foundCell = cells.find((c) => c.x === coords.x && c.y === coords.y);
//     if (foundCell) {
//       if (foundCell.isFloor) return "floor";
//     }
//     return "wall";
//   };

//   const calculateDisplayTile = (coords: Math.Vector2) => {
//     const topLeft = getWorldTile(coords.clone().subtract(neighbours[3]));
//     const topRight = getWorldTile(coords.clone().subtract(neighbours[2]));
//     const botLeft = getWorldTile(coords.clone().subtract(neighbours[1]));
//     const botRight = getWorldTile(coords.clone().subtract(neighbours[0]));

//     const displayTileOptionVector = displayTileOptions.get(
//       [topLeft, topRight, botLeft, botRight].toString()
//     );
//     return displayTileOptionVector;
//   };

//   for (let i = 0; i < neighbours.length; i++) {
//     const newPos: Math.Vector2 = pos.clone().add(neighbours[i]);

//     displayTiles?.set(
//       [newPos.x, newPos.y].toString(),
//       calculateDisplayTile(newPos)
//     );
//   }
// };
