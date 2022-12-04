import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sprite, { FieldConfig } from './Sprite';
import { NormalizedWindPoint, Position } from '@lib/types';
import { getProjectionBounds, ingestCSV, scaleContextForData } from './utils';
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
	const [csvData, setCsvData] = useState<NormalizedWindPoint[]>();
	const [context, setContext] = useState<CanvasRenderingContext2D>();
	const [sprites, setSprites] = useState<Sprite[]>();

	// Setup Canvas on Mount
	useEffect(() => {
		const setupCanvas = async () => {
			const points = await ingestCSV();

			const { bounds, translationOffset } = getProjectionBounds(points);

			// y1 - y0
			const adjustedHeight = Math.ceil(bounds[1][1] - bounds[0][1]);

			const DPI = window.devicePixelRatio;

			canvasRef.current.height = adjustedHeight * DPI;
			canvasRef.current.width = WIDTH * DPI;
			const context = canvasRef.current.getContext('2d');
			context.scale(DPI, DPI);

			setContext(context);
			setCsvData(points);
		};

		if (canvasRef.current) {
			setupCanvas();
		}
	}, [canvasRef.current]);

	// Create Sprites -- ORBIT
	// useEffect(() => {
	// 	if (context) {
	// 		const results = [];
	// 		const createdAt = performance.now();

	// 		// Relevant Container Information
	// 		const FieldInfo: FieldConfig = {
	// 			context,
	// 			height: window.innerHeight,
	// 			width: window.innerWidth,
	// 			bpm: 125,
	// 			theme: 'furnace',
	// 		};

	// 		const uniformBehavior = randomLissajousArgs(WIDTH + 20, HEIGHT + 20, 4, 4);

	// 		for (let i = 0; i < 1; i++) {
	// 			results.push(
	// 				new Sprite(
	// 					{
	// 						weight: 4,
	// 						created: createdAt,
	// 						behavior: uniformBehavior,
	// 						previousPosition: [i * 5, i * 5],
	// 					},
	// 					FieldInfo
	// 				)
	// 			);
	// 		}
	// 		setSprites(results);
	// 	}
	// }, [context]);

	// Create Sprites -- WIND
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
				theme: 'rainbow',
			};

			const uniformBehavior = randomLissajousArgs(5, 5, 4, 4);

			for (let i = 0; i < csvData.length; i++) {
				const element = csvData[i];
				results.push(
					new Sprite(
						{
							weight: element.dir,
							created: createdAt,
							behavior: randomLissajousArgs(1, 1, 2, 2),
							previousPosition: element.position,
							scaleFactor: scaleContextForData(csvData)(null),
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

		context.fillStyle = getUserTheme().includes('l') ? '#080593' : '#000';
		// Wipes Canvas on each update
		// context.scale(window.devicePixelRatio, window.devicePixelRatio);
		context.fillRect(0, 0, window.innerWidth, window.innerHeight);
		// context.save();

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
