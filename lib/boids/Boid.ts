import { Position } from '@lib/types';

class Boid {
	x: number;
	y: number;
	dx: number;
	dy: number;
	history: Position[];
	origin: Position;
	constructor({ x, y, dx, dy, history, origin }: Boid) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.history = history;
		this.origin = origin;
	}
}

export default Boid;
