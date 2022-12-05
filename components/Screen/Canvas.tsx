import { forwardRef, useEffect, useRef, useState } from 'react';
import SpriteField from './Field';
import { COLORS, ingestCSV } from './utils';
import Flock from '@lib/boids/Flock';

type CanvasProps = JSX.IntrinsicElements['canvas'] & {};

type Controls = {
	theme: keyof typeof COLORS;
	bpm: number;
};

const sizeCanvas = canvas => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
};

const Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>();

	useEffect(() => {
		const setup = async () => {
			if (canvasRef.current) {
				window.addEventListener('resize', sizeCanvas, false);
				sizeCanvas(canvasRef.current);
				// const points = await ingestCSV();
				// new SpriteField({
				// 	canvas: canvasRef.current,
				// 	data: points,
				// 	width: 950,
				// 	theme: 'red',
				// 	bpm: 120,
				// });
				new Flock({
					context: canvasRef.current.getContext('2d'),
					numBoids: 200,
					visualRange: 15,
					trail: false,
					width: window.innerWidth,
					height: window.innerHeight,
				});

				// window.requestAnimationFrame(() => flock.animate());
			}
		};
		setup();
	}, [canvasRef.current]);

	return (
		<>
			<button id='openControls'>Controls</button>
			<section id='controls' data-visible='false'>
				<select name='theme'>
					<option value='rainbow'>Rainbow</option>
					<option value='blackwhite'>Black & White</option>
					<option value='furnace'>Furnace</option>
					<option value='red'>Red</option>
					<option value='mint'>Mint</option>
					<option value='prep'>Prep</option>
				</select>
				<input type={'number'} defaultValue={120} placeholder='BPM'></input>
			</section>
			<canvas ref={canvasRef}></canvas>
		</>
	);
};

export default Canvas;
