import { Cell } from "../../types/Cell";

import Graph from 'node-dijkstra'

export const checkIfNeighbourIsOutside = (
  cell: Cell,
  checkCells: Cell[],
  distance: number = 1
) => {
  if (!checkCells.find((c) => c.x === cell.x && c.y === cell.y - distance)) {
    return true;
  }
  if (!checkCells.find((c) => c.x === cell.x && c.y === cell.y + distance)) {
    return true;
  }
  if (!checkCells.find((c) => c.x === cell.x + distance && c.y === cell.y)) {
    return true;
  }
  if (!checkCells.find((c) => c.x === cell.x - distance && c.y === cell.y)) {
    return true;
  }
  return false;
};

export const cellNeighboursAnEdge = (cell: Cell, checkCells: Cell[]) => {
  if (!cell.isOutside) {
    return false;
  }

  const isClose = checkCells
    ?.filter((c) => !c.isOutside && !c.isWall)
    .some(
      (c) =>
        Math.sqrt(Math.pow(cell.x - c.x, 2) + Math.pow(cell.y - c.y, 2)) < 2.5
    );

  return isClose;
};

export const findPath = (startCell: Cell, route: Graph, endCell: Cell) => {
  return route.path(
    `${startCell.x} - ${startCell.y}`,
    `${endCell.x} - ${endCell.y}`
  ) as string[];
};

export const makeGrid = (grid: Cell[]) => {
  const route = new Graph();
  grid.forEach((gridItem) => {
    const connections = new Map();
    const neighbours = [
      grid.find((g) => g.x === gridItem.x && g.y === gridItem.y - 1),
      grid.find((g) => g.x === gridItem.x && g.y === gridItem.y + 1),
      grid.find((g) => g.x === gridItem.x - 1 && g.y === gridItem.y),
      grid.find((g) => g.x === gridItem.x + 1 && g.y === gridItem.y),
    ].filter((i) => !!i);
    // .filter((i) => !i.isOutside);

    neighbours?.forEach((n) => {
      const index = `${n.x} - ${n.y}`;
      connections.set(
        index,
        Math.pow(1 - (n.isEdge || n.isOutside ? 0 : n.n), 3)
      );
    });

    const c = Object.fromEntries(connections);

    return route.addNode(`${gridItem.x} - ${gridItem.y}`, c);
  });
  return route;
};