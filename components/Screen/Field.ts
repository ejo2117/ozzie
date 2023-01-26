import { NormalizedWindPoint } from '@lib/types';
import { randomInt } from '@utils/math';
import Controller from './Controller';
import Sprite from './Sprite';
import { COLORS, getProjectionBounds, getUserTheme, ingestCSV, randomLissajousArgs, scaleContextForData } from './screen__utils';

type FieldConfig = {
	width: number;
	height: number;

	theme: keyof typeof COLORS;
	bpm: number;
};

class SpriteField {
	width: number;
	height: number;

	animationId: number;

	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	data: NormalizedWindPoint[];
	sprites: Sprite[];

	// configurable
	theme: keyof typeof COLORS;
	bpm: number;
	// bounds: { bounds: [[number, number], [number, number]]; translationOffset: [number, number] };

	controller: Controller;

	constructor({ canvas, data, width, theme, bpm }: Pick<SpriteField, 'canvas' | 'data' | 'width' | 'theme' | 'bpm'>) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d')!;
		this.theme = theme;
		this.bpm = bpm;

		this.data = data;
		this.width = width;
		this.height = this.getBoundsFromData(data, width);

		this.sprites = this.createSprites();
		// this.animate();
		this.animationId = window.requestAnimationFrame(() => this.animate());

		//@ts-ignore
		this.controller = new Controller({ field: this, sprite: {} as Sprite });
	}

	getBoundsFromData(points, width) {
		const { bounds } = getProjectionBounds(points, width);

		const adjustedHeight = Math.ceil(bounds[1][1] - bounds[0][1]);
		const dpi = window.devicePixelRatio;

		this.canvas.height = adjustedHeight * dpi;
		this.canvas.width = width * dpi;

		this.context.scale(dpi, dpi);

		return adjustedHeight * dpi;
	}

	createSprites() {
		const sprites = [] as Sprite[];
		const createdAt = performance.now();

		for (let i = 0; i < this.data.length; i++) {
			const element = this.data[i];
			sprites.push(
				new Sprite(
					{
						weight: element.dirCat,
						speed: element.speed,
						created: createdAt,
						behavior: randomLissajousArgs(100, 100, 5, 2),
						previousPosition: element.position,
						scaleFactor: scaleContextForData(this.data)(element.speed),
						radius: randomInt(1, 5),
					},
					this
				)
			);
		}
		return sprites;
	}

	refreshSprites() {
		const current = [...this.sprites];
		const refreshed = this.createSprites().map((sprite, i) => ({
			...sprite,
			previousPosition: current[i].previousPosition,
		})) as Sprite[];
		this.sprites = refreshed;
	}

	animate() {
		let now: number, sprite: Sprite;

		if (!this) {
			return;
		}

		this.context.fillStyle = getUserTheme().includes('l') ? '#fff' : '#000';
		this.context.clearRect(0, 0, this.width, this.height);

		now = performance.now();

		for (sprite of this.sprites) {
			sprite.render(sprite.move((now - sprite.created) / 1000));
		}

		window.requestAnimationFrame(() => this.animate());
	}
}

export default SpriteField;
