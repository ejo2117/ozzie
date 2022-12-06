import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Sprite, { FieldConfig } from './Sprite';
import { NormalizedWindPoint, Position } from '@lib/types';
import { getProjectionBounds, getUserTheme, ingestCSV, randomLissajousArgs, scaleContextForData } from './utils';
import { randomArbitrary, randomInt } from '../../utils/math';

const Field = () => {
	// TODO - Make these stateful for config via UI.
	// Constants
	const WIDTH = typeof window === 'undefined' ? 500 : window.innerWidth;
	const HEIGHT = typeof window === 'undefined' ? 500 : window.innerHeight;

	// Refs
	const animationRequestRef = useRef<number>();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Hooks
	const [csvData, setCsvData] = useState<NormalizedWindPoint[]>();
	const [context, setContext] = useState<CanvasRenderingContext2D>();
	const [sprites, setSprites] = useState<Sprite[]>();

	// Setup Canvas on Mount and set Context
	useEffect(() => {
		const setupCanvas = async canvas => {
			console.log('setup canvas.');
			const points = await ingestCSV();

			const { bounds, translationOffset } = getProjectionBounds(points, WIDTH);

			// y1 - y0
			const adjustedHeight = Math.ceil(bounds[1][1] - bounds[0][1]);

			const DPI = window.devicePixelRatio;

			canvasRef.current.height = adjustedHeight * DPI * 2;
			canvasRef.current.width = WIDTH * DPI;
			const context = canvasRef.current.getContext('2d');
			context.scale(DPI, DPI);
			// context.translate(2, HEIGHT * DPI);

			setContext(context);
			setCsvData(points);
		};

		if (canvasRef.current) {
			setupCanvas();
		}
	}, [canvasRef.current]);

	// Create Sprites -- ORBIT TEST
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

	// Create Sprites -- WIND DATA
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
	const update = sprites => {
		console.log('checking...');

		if (sprites) {
			console.log('.');

			// Set background based on
			context.fillStyle = getUserTheme().includes('l') ? '#000' : '#000';
			// Wipes Canvas on each update
			// context.scale(window.devicePixelRatio, window.devicePixelRatio);
			context.fillRect(0, 0, window.innerWidth, window.innerHeight);
			// context.save();

			// put aside so all sprites are drawn for the same ms
			const now = performance.now();
			let sprite: Sprite;

			for (sprite of sprites) {
				sprite.render(sprite.move((now - sprite.created) / 1000));

				// Debug movement head
				// const head = sprite.render(sprite.move((now - sprite.created) / 1000))
				// console.log([Math.floor(head[0]), Math.floor(head[1])]);
			}
		}

		window.requestAnimationFrame(() => update(sprites));
	};

	// Another "Mount", specifically for the animation cycle
	useEffect(() => {
		animationRequestRef.current = window.requestAnimationFrame(() => update(sprites));
		return () => window.cancelAnimationFrame(animationRequestRef.current);
	}, []);

	return <canvas ref={canvasRef}></canvas>;
};

export default Field;
