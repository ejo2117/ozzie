import { Position } from '@lib/types';
import { COLORS, getBeatAlignment, scaleContextForData } from './utils';

type TemporalPoint = [Position, number];

export type FieldConfig = {
	context: CanvasRenderingContext2D;
	height: number;
	width: number;
	bpm: number;
	theme: keyof typeof COLORS;
};

class Sprite {
	context: CanvasRenderingContext2D;
	created: number;
	weight: number;
	bpm: number;
	behavior: [number, number, number, number];
	previousPosition: Position;

	render: (args: TemporalPoint) => Position;
	move: (t: number) => TemporalPoint;
	container: FieldConfig;
	theme: keyof typeof COLORS;
	scaleFactor: number;

	constructor(
		{ scaleFactor, weight, created = performance.now(), previousPosition = [0, 0], behavior }: Partial<Sprite>,
		{ context, bpm, theme }: FieldConfig
	) {
		this.weight = weight;
		this.created = created;
		this.scaleFactor = scaleFactor;

		this.context = context;
		this.bpm = bpm;
		this.theme = theme;

		this.move = this.generateLissajousMovement(...behavior);
		// this.move = this.generateStaticMovement(previousPosition);
		this.render = this.generateRenderer();

		this.previousPosition = previousPosition;
	}

	generateRenderer() {
		return ([position, time]: TemporalPoint) => {
			this.drawCircle(position, time);
			// For debugging
			return position;
		};
	}

	generateStaticMovement(position: Position) {
		return (t: number) => [position, t] as TemporalPoint;
	}

	/**
	 * Given parameters, returns an "orbit" function.
	 *
	 * The "orbit" specifies a point in 2D space at time `t`
	 *
	 * `dx` - width of orbit
	 *
	 * `dy` - height of orbit
	 *
	 * `tx / ty` =  Number of horizontal "peaks" within the orbit
	 * @memberof Sprite
	 */
	generateLissajousMovement(dx: number, dy: number, tx: number, ty: number) {
		return (t: number) =>
			[
				[this.previousPosition[0] + dx * Math.sin(tx * t), this.previousPosition[1] + dy * Math.cos(ty * t)],
				t,
			] as TemporalPoint;
	}

	drawCircle([x, y]: Position, t: number) {
		const BEAT_AGGRESSION = 10;
		const BEAT = getBeatAlignment(this.bpm, t) * BEAT_AGGRESSION;
		const RADIUS = BEAT * 1 + 5;
		// const ACCELERATION = (y - this.previousPosition[1]) / (x - this.previousPosition[0]);
		const HUE = Math.sin(t) * 1;

		// this.context.translate(x, y);

		this.context.scale(this.scaleFactor, this.scaleFactor);
		this.context.beginPath();
		this.context.arc(x, y, RADIUS, 0, 2 * Math.PI);
		this.context.closePath();
		this.context.fillStyle = COLORS[this.theme](HUE, [0, 1]);
		this.context.fill();
		this.context.restore();
	}
}

export default Sprite;
