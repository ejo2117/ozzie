import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sprite, { FieldConfig } from './Sprite';
import { Position } from '@lib/types';
import { getProjectionBounds } from './utils';
import { randomArbitrary, randomInt } from '../../utils/math';

const getUserTheme = () => {
	if (typeof document === 'undefined') {
		return 'l';
	}
	return getComputedStyle(document.body, ':after').content;
};

const randomLissajousArgs = (maxWidth: number, maxHeight: number, tx: number, ty: number) => {
	return [randomInt(100, maxWidth), randomInt(100, maxHeight), randomArbitrary(1, tx), randomArbitrary(1, ty)] as [
		number,
		number,
		number,
		number
	];
};

const Field = () => {
	// TODO - Make these stateful for config via UI.
	// Constants
	const WIDTH = typeof window === 'undefined' ? 500 : window.innerWidth;
	const HEIGHT = typeof window === 'undefined' ? 500 : window.innerHeight;

	// Hooks
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [csvData, setCsvData] = useState();
	const [context, setContext] = useState<CanvasRenderingContext2D>();
	const [sprites, setSprites] = useState<Sprite[]>();

	// Set Context on Mount
	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.height = window.innerHeight;
			canvasRef.current.width = window.innerWidth;
			setContext(canvasRef.current.getContext('2d')!);
		}
	}, [canvasRef.current]);

	// Create Sprites
	useEffect(() => {
		if (context) {
			const results = [];
			const createdAt = performance.now();

			// Relevant Container Information
			const FieldInfo: FieldConfig = {
				context,
				height: window.innerHeight,
				width: window.innerWidth,
				bpm: 120,
				theme: 'red',
			};

			for (let i = 0; i < 10; i++) {
				results.push(
					new Sprite(
						{
							weight: 4,
							created: createdAt,
							behavior: randomLissajousArgs(WIDTH - 64, HEIGHT - 64, 4, 4),
							previousPosition: [i * 5, i * 5],
						},
						FieldInfo
					)
				);
			}
			setSprites(results);
		}
	}, [context]);

	// Logic
	const update = useCallback(() => {
		if (!context || !sprites) return;

		let now: number, sprite: Sprite;

		context.fillStyle = getUserTheme().includes('l') ? '#fff' : '#000';
		// Wipes Canvas on each update
		context.fillRect(0, 0, window.innerWidth, window.innerHeight);
		// context.save()

		// put aside so all sprites are drawn for the same ms
		now = performance.now();

		for (sprite of sprites) {
			sprite.render(sprite.move((now - sprite.created) / 1000));

			// Debug movement head
			// const head = sprite.render(sprite.move((now - sprite.created) / 1000))
			// console.log([Math.floor(head[0]), Math.floor(head[1])]);
		}

		window.requestAnimationFrame(() => update());
	}, [context, sprites]);

	try {
		window.requestAnimationFrame(() => update());
	} catch (error) {
		// assume window is not available
	}

	return <canvas ref={canvasRef}></canvas>;
};

export default Field;
