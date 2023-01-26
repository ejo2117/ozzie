import { NormalizedWindPoint, Position } from '@lib/types';

class Boid {
	x: number;
	y: number;
	dx: number;
	dy: number;
	history: Position[];
	origin: Position;
	windiness: NormalizedWindPoint;
	constructor({ x, y, dx, dy, history, origin, windiness }: Boid) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.history = history;
		this.origin = origin;
		this.windiness = windiness;
	}
}

export default Boid;
