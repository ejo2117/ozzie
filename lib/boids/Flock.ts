import { ExcludeMethods } from '@lib/types';
import { COLORS, getBeatAlignment } from '../../components/Screen/utils';
import Boid from './Boid';
const DRAW_TRAIL = false;

function distance(boid1, boid2) {
	return Math.sqrt((boid1.x - boid2.x) * (boid1.x - boid2.x) + (boid1.y - boid2.y) * (boid1.y - boid2.y));
}

// Implements Ben Eater's boids as an ES6 Class.
// Key difference between the Flock/Boid and the Field/Sprite relationship is that our Flock controls movement for each Boid, since movement requires an awareness of other Boids
class Flock {
	context: CanvasRenderingContext2D;
	boids: Boid[];
	numBoids: number;
	visualRange: number;
	trail: boolean;
	width: number;
	height: number;

	constructor({ context, numBoids, visualRange, trail, width, height }: Omit<ExcludeMethods<Flock>, 'boids'>) {
		this.trail = trail;
		this.numBoids = numBoids;
		this.visualRange = visualRange;
		this.width = width;
		this.height = height;
		this.boids = this.initBoids();
		this.context = context;

		window.requestAnimationFrame(() => this.animate());
	}

	initBoids() {
		const result = [];
		for (var i = 0; i < this.numBoids; i += 1) {
			result.push(
				new Boid({
					x: Math.random() * this.width,
					y: Math.random() * this.height,
					dx: Math.random() * 10 - 5,
					dy: Math.random() * 10 - 5,
					history: [],
				})
			);
		}
		return result;
	}

	// Constrain a boid to within the window. If it gets too close to an edge,
	// nudge it back in and reverse its direction.
	keepWithinBounds(boid: Boid) {
		const margin = 200;
		const turnFactor = 1;

		if (boid.x < margin) {
			boid.dx += turnFactor;
		}
		if (boid.x > this.width - margin) {
			boid.dx -= turnFactor;
		}
		if (boid.y < margin) {
			boid.dy += turnFactor;
		}
		if (boid.y > this.height - margin) {
			boid.dy -= turnFactor;
		}
	}

	// Find the center of mass of the other boids and adjust velocity slightly to
	// point towards the center of mass.
	flyTowardsCenter(boid: Boid) {
		const centeringFactor = 0.005; // adjust velocity by this %

		let centerX = 0;
		let centerY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (distance(boid, otherBoid) < this.visualRange) {
				centerX += otherBoid.x;
				centerY += otherBoid.y;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			centerX = centerX / numNeighbors;
			centerY = centerY / numNeighbors;

			boid.dx += (centerX - boid.x) * centeringFactor;
			boid.dy += (centerY - boid.y) * centeringFactor;
		}
	}

	// Move away from other boids that are too close to avoid colliding
	avoidOthers(boid: Boid) {
		const minDistance = 20; // The distance to stay away from other boids
		const avoidFactor = 0.05; // Adjust velocity by this %
		let moveX = 0;
		let moveY = 0;
		for (let otherBoid of this.boids) {
			if (otherBoid !== boid) {
				if (distance(boid, otherBoid) < minDistance) {
					moveX += boid.x - otherBoid.x;
					moveY += boid.y - otherBoid.y;
				}
			}
		}

		boid.dx += moveX * avoidFactor;
		boid.dy += moveY * avoidFactor;
	}

	avoidScreenCenter(boid: Boid) {
		const minDistance = 75;
		const avoidFactor = 1;
		let moveX = 0;
		let moveY = 0;

		if (distance(boid, { x: this.width / 2, y: this.height / 2 }) < minDistance) {
			moveX += boid.x - this.width / 2;
			moveY += boid.y - this.height / 2;
		}
		boid.dx += moveX * avoidFactor;
		boid.dy += moveY * avoidFactor;
	}

	// Find the average velocity (speed and direction) of the other boids and
	// adjust velocity slightly to match.
	matchVelocity(boid: Boid) {
		const matchingFactor = 0.05; // Adjust by this % of average velocity

		let avgDX = 0;
		let avgDY = 0;
		let numNeighbors = 0;

		for (let otherBoid of this.boids) {
			if (distance(boid, otherBoid) < this.visualRange) {
				avgDX += otherBoid.dx;
				avgDY += otherBoid.dy;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			avgDX = avgDX / numNeighbors;
			avgDY = avgDY / numNeighbors;

			boid.dx += (avgDX - boid.dx) * matchingFactor;
			boid.dy += (avgDY - boid.dy) * matchingFactor;
		}
	}

	// Speed will naturally vary in flocking behavior, but real animals can't go
	// arbitrarily fast.
	limitSpeed(boid: Boid) {
		const speedLimit = 15;

		const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
		if (speed > speedLimit) {
			boid.dx = (boid.dx / speed) * speedLimit;
			boid.dy = (boid.dy / speed) * speedLimit;
		}
	}

	drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
		const angle = Math.atan2(boid.dy, boid.dx);
		ctx.translate(boid.x, boid.y);
		ctx.rotate(angle);
		ctx.translate(-boid.x, -boid.y);
		ctx.fillStyle = COLORS['rainbow'](angle, [0, 2 * Math.PI]);
		ctx.beginPath();
		ctx.arc(boid.x, boid.y, 8, 0, 2 * Math.PI);
		// ctx.moveTo(boid.x, boid.y);
		// ctx.lineTo(boid.x - 15, boid.y + 5);
		// ctx.lineTo(boid.x - 15, boid.y - 5);
		// ctx.lineTo(boid.x, boid.y);
		ctx.fill();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (this.trail) {
			ctx.strokeStyle = COLORS['rainbow'](boid.history.length, [0, 50]);
			ctx.beginPath();
			ctx.moveTo(boid.history[0][0], boid.history[0][1]);
			for (const point of boid.history) {
				ctx.lineTo(point[0], point[1]);
			}
			ctx.stroke();
		}
	}

	animate() {
		if (this) {
			// Update each boid
			for (let boid of this.boids) {
				// Update the velocities according to each rule
				this.flyTowardsCenter(boid);
				this.avoidOthers(boid);
				this.avoidScreenCenter(boid);
				this.matchVelocity(boid);
				this.limitSpeed(boid);
				this.keepWithinBounds(boid);

				// Update the position based on the current velocity
				boid.x += boid.dx;
				boid.y += boid.dy;
				boid.history.push([boid.x, boid.y]);
				boid.history = boid.history.slice(-50);
			}

			// Clear the canvas and redraw all the boids in their current positions
			this.context.clearRect(0, 0, this.width, this.height);
			for (let boid of this.boids) {
				this.drawBoid(this.context, boid);
			}
		}
		// Schedule the next frame
		window.requestAnimationFrame(() => this.animate());
	}
}

export default Flock;
