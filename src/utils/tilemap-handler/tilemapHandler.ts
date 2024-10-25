import { Math, Tilemaps } from "phaser";
import { Cell } from "../../types/Cell";

const A = 1;
const B = 0;

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

export const setDisplayTile = ({
  pos,
  cells,
  displayTiles,
  criteria = "isWall",
}: Props) => {
  const placeholders = [0, 0, 0, 0];

  for (let i = 0; i < neighbours.length; i++) {
    const newPos: Math.Vector2 = pos.clone().add(neighbours[i]);

    // check if the the neighbouring cells are a wall or do not exist
    const neighbouringCell =
      cells.find((c) => c.x === newPos.x && c.y === newPos.y)?.[criteria] ??
      true
        ? 1
        : 0;

    placeholders[i] = neighbouringCell;
  }

  return displayTiles?.set(
    [pos.x, pos.y].toString(),
    displayTileOptions.get(placeholders.toString())
  );
};

// const getCellFromTileMap = (
//   tm: Tilemaps.Tilemap,
//   coord: Math.Vector2,
//   layer = 0
// ) => {
//   return tm.getTileAt(coord.x, coord.y, false, layer);
// };

// const getWorldTile = (coords: Math.Vector2) => {
//   // get a cell from a tilemap
//   const atlasCoord = getCellFromTileMap(
//     dualGridTileMap as Tilemaps.Tilemap,
//     coords
//   );
// };

// export const calculateDisplayTile = (coords: Math.Vector2) => {

//   const topRight = get
//   // get 4 world tile neighbours
//   // TileType botRight = getWorldTile(coords - NEIGHBOURS[0]);
//   // TileType botLeft = getWorldTile(coords - NEIGHBOURS[1]);
//   // TileType topRight = getWorldTile(coords - NEIGHBOURS[2]);
//   // TileType topLeft = getWorldTile(coords - NEIGHBOURS[3]);
//   // // return tile (atlas coord) that fits the neighbour rules
//   // return neighboursToAtlasCoord[new(topLeft, topRight, botLeft, botRight)];
// };

// // TileType getWorldTile(Vector2I coords) {
// //         Vector2I atlasCoord = GetCellAtlasCoords(0, coords);
// //         if (atlasCoord == grassPlaceholderAtlasCoord)
// //             return Grass;
// //         else
// //             return Dirt;
// //     }
// }

