// @ts-nocheck
// D3 Types are crazy
import type { GeoProjection } from 'd3';
import { FC, useCallback, useEffect, useRef } from 'react';

import useHasMounted from '../../../hooks/useHasMounted';

import { randomInt, PI } from '../../../utils/math';

import styles from '../Chart.module.scss';

interface IDataFormat {
	// point: [x: number, y: number];
	longitude: number;
	latitude: number;
	dir: number;
	dirCat: number;
	speed: number;
}

interface ISprite {
	move: ReturnType<typeof generateLissajous>;
	created: number;
	render: (pos: { x: number; y: number }) => void;
}

interface IVectorFieldProps {
	d3: any;
	data: any[];

	width: number;
	height: number;
	margin: number;

	projection: GeoProjection;
	scale: () => void;
	color: () => void;
}

const generateLissajous = (dx: number, dy: number, tx: number, ty: number) => {
	// TODO implement our oscillation
	return t => {
		return {
			x: window.innerWidth / 2 + dx * Math.sin(tx * t),
			y: window.innerHeight / 2 + dy * Math.cos(ty * t),
		};
	};
};

const generateRenderer = (d3, context: CanvasRenderingContext2D, dir, normalizedPoint, data) => {
	// ! need to pass different values in here –– we want our shapes to rotate and scale, but they should have a fixed origin
	return (pos: { x: number; y: number }) => {
		context.translate(normalizedPoint[0], normalizedPoint[1]);
		context.scale(scale(data, d3), scale(data, d3));
		context.rotate(Math.floor((dir * PI) / 180));

		context.beginPath();
		context.moveTo(normalizedPoint[0] - 2, normalizedPoint[1] - 2);
		context.lineTo(normalizedPoint[0] + 2, normalizedPoint[1] - 2);
		context.lineTo(normalizedPoint[0], normalizedPoint[1] + 5);
		context.closePath();

		context.fillStyle = color(dir, d3);
		context.fill();

		context.restore();
	};
};

const getVectorFieldHeight = (props: Omit<IVectorFieldProps, 'height'>) => {
	const { d3, data, projection, width, margin } = props;

	const points = { type: 'MultiPoint', coordinates: data?.map(d => [d.longitude, d.latitude]) };

	const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width - margin * 2, points)).bounds(points);

	const [tx, ty] = projection?.translate();
	const height = Math.ceil(y1 - y0);

	projection?.translate([tx + margin, ty + margin]);

	return height + margin * 2;
};

const scale = (
	data: any[],
	d3: {
		scaleSqrt: (arg0: any[], arg1: number[]) => any;
		max: (arg0: any[], arg1: (d: any) => any) => any;
	}
) => {
	return d3.scaleSqrt([0, d3.max(data, (d: { speed: any }) => d.speed)], [0, 2]);
};

const color = (
	dir: any,
	d3: {
		scaleSequential: (arg0: number[], arg1: any) => { (arg0: any): any; new (): any };
		interpolateRainbow: any;
	}
) => {
	return d3.scaleSequential([0, 360], d3.interpolateRainbow)(dir);
};

const generateSprites = (d3, context: CanvasRenderingContext2D, data: IDataFormat[], projection: GeoProjection) => {
	let sprites = [] as ISprite[];

	// define a movement behavior, a creation timestamp, and a renderer for every data point
	for (const { longitude, latitude, speed, dir } of data) {
		const normalizedPoint = projection([longitude, latitude]) as [number, number];

		sprites.push({
			move: generateLissajous(normalizedPoint[0], normalizedPoint[1], 1, 5),
			created: performance.now(),
			render: generateRenderer(d3, context, dir, normalizedPoint, data),
		});
	}

	return sprites;
};

const update = (context: CanvasRenderingContext2D, sprites: ISprite[], width, height) => {
	let now, sprite;

	now = performance.now();

	// "wipe" canvas on each iteration

	context.fillStyle = '#000';
	context.fillRect(0, 0, width, height);

	for (sprite of sprites) {
		sprite.render(sprite.move((now - sprite.created) / 1000));
	}

	window.requestAnimationFrame(() => update(context, sprites, width, height));
};

const draw = (node: HTMLCanvasElement, props: Omit<IVectorFieldProps, 'height'>) => {
	const { d3, data, width, projection } = props;

	// const width = window.innerWidth;

	if (node) {
		const canvas = node;
		// Get height based on data
		const height = getVectorFieldHeight(props);

		// Fixes blurriness on Retina Displays
		const dpi = window.devicePixelRatio;
		canvas.width = Math.floor(width * dpi);
		canvas.height = Math.floor(height * dpi);

		const context = canvas.getContext('2d') as CanvasRenderingContext2D;

		const sprites = generateSprites(d3, context, data, projection);

		context.canvas.style.maxWidth = '100%';
		context.scale(dpi, dpi);
		context.fillRect(0, 0, width, height);
		context.strokeStyle = '#000';
		context.lineWidth = 1.5;
		context.lineJoin = 'round';

		context.save();

		// window.requestAnimationFrame(() => update(context, sprites, width, height));

		for (const { longitude, latitude, speed, dir, beat = 0, ts = 0 } of data) {
			const beatAlignment = 2;

			context.save();
			context.translate(...projection([longitude, latitude]));
			// context.scale(scale(data, d3), scale(data, d3));
			// context.rotate(ts % 360);

			context.beginPath();
			context.arc(-2, -2, 2 + 1 * beatAlignment, 2 * PI, false);
			// context.moveTo(-2 - beatAlignment, -2 - beatAlignment);
			// context.lineTo(2 + beatAlignment, -2 - beatAlignment);
			// context.lineTo(0, 5 + beatAlignment ** 4);
			context.closePath();

			context.fillStyle = color(dir, d3);
			context.fill();

			context.restore();
		}
	}
};

const VectorField: FC<Omit<IVectorFieldProps, 'height'>> = props => {
	const hasMounted = useHasMounted();

	const canvasRef = useCallback(
		(node: HTMLCanvasElement) => {
			if (hasMounted) {
				draw(node, props);
			}
		},
		[props.data]
	);

	return <canvas className={styles.canvas} ref={canvasRef}></canvas>;
};

export default VectorField;
