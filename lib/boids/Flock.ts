import { ExcludeMethods, NormalizedWindPoint, Position, WindPoint } from '../types';
import { COLORS, getBeatAlignment, randomFromArray, randomLissajousArgs } from '../../components/Screen/utils';
import Boid from './Boid';
import React from 'react';
import Sprite from '../../components/Screen/Sprite';
import Controller from '../../components/Screen/Controller';
import { randomInt } from '../../utils/math';
const DRAW_TRAIL = false;

function distance(boid1, boid2) {
	return Math.sqrt((boid1.x - boid2.x) * (boid1.x - boid2.x) + (boid1.y - boid2.y) * (boid1.y - boid2.y));
}

// Implements Ben Eater's boids as an ES6 Class.
//
// The key difference between the Flock/Boid and the Field/Sprite relationship
// is that our Flock controls movement for each Boid, since movement requires an awareness of other Boids,
// whereas each Sprite is responsible for its own movement behavior
class Flock {
	context: CanvasRenderingContext2D;
	boids: Boid[];
	numBoids: number;
	visualRange: number;
	trail: boolean;
	width: number;
	height: number;
	foci: Sprite;
	animationId: number;
	theme: keyof typeof COLORS;
	bpm: number;

	controller: Controller;
	obstacle: Position;
	lastUpdate: number;

	points: NormalizedWindPoint[];
	trails: any;

	constructor({
		bpm,
		context,
		height,
		numBoids,
		points,
		theme,
		trail,
		trails,
		visualRange,
		width,
	}: Omit<ExcludeMethods<Flock>, 'boids' | 'foci' | 'animationId' | 'controller' | 'obstacle' | 'lastUpdate'>) {
		this.trails = trail && trails;
		this.points = points;
		this.numBoids = numBoids;
		this.visualRange = visualRange;
		this.width = width;
		this.height = height;
		this.context = context;
		this.theme = theme;
		this.bpm = bpm;
		this.lastUpdate = performance.now();

		this.foci = this.initFoci();
		this.obstacle = this.foci.previousPosition;

		this.boids = this.initBoids();

		this.controller = new Controller({ field: this, sprite: {} as Sprite });

		this.animationId = window.requestAnimationFrame(() => this.animate());

		window.addEventListener('resize', this.resize);

		console.log(this);

		return this;
	}

	initFoci(numFoci = 1) {
		const createdAt = performance.now();
		return new Sprite(
			{
				weight: 10,
				speed: 10,
				created: createdAt,
				behavior: [150, 150, 5, 2],
				previousPosition: [this.width / 2, this.height / 2],
				scaleFactor: 0.4,
				radius: 20,
			},
			{
				context: this.context,
				height: this.height,
				width: this.width,
				bpm: 125,
				theme: this.theme,
			}
		);
	}

	createBoidOrigin(using: keyof typeof types, index: number) {
		const { width, height } = this;
		console.log(width, height);

		const margin = 200;

		const xAxis = Array(Math.floor(width / margin))
			.fill(null)
			.map((_, i) => i * margin);
		const yAxis = Array(Math.floor(height / margin))
			.fill(null)
			.map((_, i) => i * margin);

		const pointsWithinBounds = xAxis.flatMap(x => yAxis.map(y => [x, y] as Position));

		const types = {
			random: [Math.random() * width, Math.random() * height] as Position,
			grid: pointsWithinBounds[index % pointsWithinBounds.length],
			spiral: [] as unknown as Position,
		};

		return types[using];
	}

	initBoids() {
		const result: Boid[] = [];
		for (let i = 0; i < this.numBoids; i += 1) {
			const origin: Position = this.createBoidOrigin('grid', i);
			result.push(
				new Boid({
					x: origin[0],
					y: origin[1],
					dx: Math.random() * 10 - 5,
					dy: Math.random() * 10 - 5,
					history: [],
					origin,
					windiness: this.points[i],
				})
			);
		}
		return result;
	}

	// Constrain a boid to within the window. If it gets too close to an edge,
	// nudge it back in and reverse its direction.
	keepWithinBounds(boid: Boid) {
		const margin = 0;
		const turnFactor = 10;

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
	flyTowardsCenter(boid: Boid, center?: Position) {
		const centeringFactor = 0.005; // adjust velocity by this %

		const target = center ?? [0, 0];

		let centerX = target[0];
		let centerY = target[1];
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

	// Adjust velocity based on Wind
	floatInWind(boid: Boid) {
		const { speed, dir } = boid.windiness;
		const centeringFactor = 0.001; // adjust velocity by this %

		const radians = dir * (Math.PI / 180);

		const destinationX = boid.x + Math.cos(radians) * speed * centeringFactor;
		const destinationY = boid.y + Math.sin(radians) * speed * centeringFactor;

		boid.dx += speed * Math.cos(radians);
		boid.dy += speed * Math.sin(radians);
		boid.x = destinationX;
		boid.y = destinationY;
	}

	// Move away from other boids that are too close to avoid colliding
	avoidOthers(boid: Boid) {
		const minDistance = 20; // The distance to stay away from other boids
		const avoidFactor = 0.005; // Adjust velocity by this %
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

	// Move away from an obstacle that has its own movement behavior
	avoidSprite(boid: Boid, focalPoint?: Sprite) {
		const obstacle = this.obstacle ?? [this.width / 2, this.height / 2];
		const minDistance = 75;
		const avoidFactor = 1;
		let moveX = 0;
		let moveY = 0;

		if (distance(boid, { x: obstacle[0], y: obstacle[1] }) < minDistance) {
			moveX += boid.x - obstacle[0];
			moveY += boid.y - obstacle[1];
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
		const speedLimit = 1;

		const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
		if (speed > speedLimit) {
			boid.dx = (boid.dx / speed) * speedLimit;
			boid.dy = (boid.dy / speed) * speedLimit;
		}
	}

	// Limit range of movement to restrict flocking behavior
	limitDistanceFromOrigin(boid: Boid) {
		const maxDistance = 50;
		const bounceFactor = 10;

		if (distance(boid, { x: boid.origin[0], y: boid.origin[1] }) > maxDistance) {
			boid.dx *= -1;
			boid.dy *= -1;
		}
	}

	drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
		if (!boid?.origin) {
			console.log(boid);
		}

		const angle = Math.atan2(boid.dy, boid.dx);
		ctx.translate(boid.x, boid.y);
		ctx.rotate(angle);
		ctx.translate(-boid.x, -boid.y);
		ctx.fillStyle = COLORS[this.theme](angle, [0, (2 * Math.PI) / 4]);
		ctx.beginPath();
		ctx.arc(boid.x, boid.y, 8, 0, 2 * Math.PI);
		ctx.fill();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (this.trails['path']) {
			ctx.strokeStyle = COLORS[this.theme](angle, [0, (2 * Math.PI) / 4]);
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(boid.history[0][0], boid.history[0][1]);
			for (const point of boid.history) {
				ctx.lineTo(point[0], point[1]);
			}
			ctx.stroke();
		}

		if (this.trails['origin']) {
			ctx.strokeStyle = COLORS[this.theme](angle, [0, (2 * Math.PI) / 4]);
			ctx.lineWidth = 5;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(boid.origin[0], boid.origin[1]);
			ctx.lineTo(boid.x, boid.y);
			// ctx.lineTo(boid.x - 5, boid.y);
			// ctx.arcTo(boid.x, boid.y, boid.x + 5, boid.y, 5);
			// ctx.lineTo(boid.x + 5, boid.y);
			ctx.stroke();
		}
	}

	animate() {
		if (this) {
			const now = performance.now();

			// Check time, and randomly update theme, etc. every 45 seconds
			if ((now - this.lastUpdate) / 1000 > 45) {
				this.theme = randomFromArray(Object.keys(COLORS).filter(t => t !== this.theme));
				// this.trail = !!randomInt(0, 1);
				this.refreshSprites();
				this.lastUpdate = now;
			}

			// Update each boid
			for (let boid of this.boids) {
				// Update the velocities according to each rule
				// this.flyTowardsCenter(boid, this.obstacle);
				this.flyTowardsCenter(boid);
				// this.floatInWind(boid);
				this.avoidOthers(boid);
				this.avoidSprite(boid);
				this.matchVelocity(boid);
				this.keepWithinBounds(boid);
				this.limitSpeed(boid);
				this.limitDistanceFromOrigin(boid);

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
			this.obstacle = this.foci.render(this.foci.move((now - this.foci.created) / 1000));
		}
		// Schedule the next frame
		window.requestAnimationFrame(() => this.animate());
	}

	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.width = width;
		this.height = height;
	}

	refreshSprites() {
		// const current = this.foci ?? { previousPosition: [0, 0] };
		const refreshed = new Sprite(
			{
				weight: 10,
				speed: 10,
				created: performance.now(),
				behavior: [this.width / 2 - 128, this.height / 2 - 128, 4, 2],
				previousPosition: [this.width / 2, this.height / 2],
				scaleFactor: 0.4,
				radius: 20,
			},
			{
				context: this.context,
				height: this.height,
				width: this.width,
				bpm: 125,
				theme: this.theme,
			}
		);

		this.foci = refreshed;
	}
}

export default Flock;
