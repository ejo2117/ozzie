import { NormalizedWindPoint, Position, Position3D } from '@lib/types';

class Boid3D {
	x: number;
	y: number;
	z: number;
	dx: number;
	dy: number;
	dz: number;
	history: Position3D[];
	origin: Position3D;
	windiness: NormalizedWindPoint;
	constructor({ x, y, z, dx, dy, dz, history, origin, windiness }: Boid3D) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.dx = dx;
		this.dy = dy;
		this.dz = dz;
		this.history = history;
		this.origin = origin;
		this.windiness = windiness;
	}
}

export default Boid3D;
