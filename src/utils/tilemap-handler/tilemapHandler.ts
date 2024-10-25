import { Math, Tilemaps } from "phaser";
import { Cell } from "../../types/Cell";

const A = 0;
const B = 1;

const V = Math.Vector2;

export const displayTileOptions: Map<string, Math.Vector2> = new Map()
  .set([B, B, B, B].toString(), new V(2, 1)) // Default
  .set([A, A, A, B].toString(), new V(1, 3)) // OUTER_BOTTOM_RIGHT
  .set([A, A, B, A].toString(), new V(0, 0)) // OUTER_BOTTOM_LEFT
  .set([A, B, A, A].toString(), new V(0, 2)) // OUTER_TOP_RIGHT
  .set([B, A, A, A].toString(), new V(3, 3)) // OUTER_TOP_LEFT
  .set([A, B, A, B].toString(), new V(1, 0)) // EDGE_RIGHT
  .set([B, A, B, A].toString(), new V(3, 2)) // EDGE_LEFT
  .set([A, A, B, B].toString(), new V(3, 0)) // EDGE_BOTTOM
  .set([B, B, A, A].toString(), new V(1, 2)) // EDGE_TOP
  .set([A, B, B, B].toString(), new V(1, 1)) // INNER_BOTTOM_RIGHT
  .set([B, A, B, B].toString(), new V(2, 1)) // INNER_BOTTOM_LEFT
  .set([B, B, A, B].toString(), new V(2, 2)) // INNER_TOP_RIGHT
  .set([B, B, B, A].toString(), new V(3, 1)) // INNER_TOP_LEFT
  .set([A, B, B, A].toString(), new V(2, 3)) // DUAL_UP_RIGHT
  .set([B, A, A, B].toString(), new V(0, 1)) // DUAL_DOWN_RIGHT
  .set([A, A, A, A].toString(), new V(0, 3)); // FULL

const neighbours = [new V(0, 0), new V(1, 0), new V(0, 1), new V(1, 1)];

interface Props {
  pos: Math.Vector2;
  cells: Cell[];
  displayTiles?: Map<string, Math.Vector2 | undefined>;
  criteria?: "isWall";
  tileMap?: Tilemaps.Tilemap;
}

export const setDisplayTile = ({ pos, cells, displayTiles }: Props) => {
  const getWorldTile = (coords: Math.Vector2): number => {
    const foundCell = cells.find((c) => c.x === coords.x && c.y === coords.y);
    if (foundCell) {
      if (foundCell.isFloor) return 0;
    }
    return 1;
  };

  const calculateDisplayTile = (coords: Math.Vector2) => {
    const topLeft: number = getWorldTile(
      coords.clone().subtract(neighbours[3])
    );
    const topRight: number = getWorldTile(
      coords.clone().subtract(neighbours[2])
    );
    const botLeft: number = getWorldTile(
      coords.clone().subtract(neighbours[1])
    );
    const botRight: number = getWorldTile(
      coords.clone().subtract(neighbours[0])
    );

    const displayTileOptionVector = displayTileOptions.get(
      [topLeft, topRight, botLeft, botRight].toString()
    );
    return displayTileOptionVector;
  };

  for (let i = 0; i < neighbours.length; i++) {
    const newPos: Math.Vector2 = pos.clone().add(neighbours[i]);

    displayTiles?.set(
      [newPos.x, newPos.y].toString(),
      calculateDisplayTile(newPos)
    );
  }
};

