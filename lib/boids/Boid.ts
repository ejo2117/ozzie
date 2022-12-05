import { Position } from '@lib/types';

class Boid {
	x: number;
	y: number;
	dx: number;
	dy: number;
	history: Position[];
	constructor({ x, y, dx, dy, history }: Boid) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.history = history;
	}
}

export default Boid;
