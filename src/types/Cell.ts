export type Cell = {
	id: string;
	x: number;
	y: number;
	isEdge?: boolean;
	isWall?: boolean;
	isRubble?: boolean;
	isFloor?: boolean;
	isObstacle?: boolean;
	isOutside?: boolean;
	isPath?: boolean;
	isCollapsed?: boolean;
	n: number;
	options?: string[];
	neighbours?: { top?: Cell; bottom?: Cell; left?: Cell; right?: Cell };
	isAccessible?: boolean;
	exit?: string;
	skull?: boolean;
};

