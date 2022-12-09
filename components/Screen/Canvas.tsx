import React, { forwardRef, useEffect, useRef, useState } from 'react';
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

const Canvas = props => {
	const canvasRef = useRef<HTMLCanvasElement>();
	const animationIdRef = useRef<number>();

	useEffect(() => {
		const setup = async () => {
			if (canvasRef.current) {
				window.addEventListener(
					'resize',
					() => {
						sizeCanvas(canvasRef.current);
					},
					false
				);
				sizeCanvas(canvasRef.current);
				// const points = await ingestCSV();
				// new SpriteField({
				// 	canvas: canvasRef.current,
				// 	data: points,
				// 	width: 950,
				// 	theme: 'red',
				// 	bpm: 120,
				// });
				const flock = new Flock({
					context: canvasRef.current.getContext('2d'),
					numBoids: 100,
					visualRange: 75,
					trail: false,
					width: canvasRef.current.width,
					height: canvasRef.current.height,
					theme: 'prep',
					bpm: 125,
				});

				animationIdRef.current = flock.animationId;

				// window.requestAnimationFrame(() => flock.animate());
			}
		};
		setup();

		return () => window.cancelAnimationFrame(animationIdRef.current);
	}, [canvasRef.current]);

	return (
		<>
			<button id='openControls' style={{ display: 'none' }}>
				Controls
			</button>
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
				<input id='trails' type={'checkbox'}></input>
				<label htmlFor='trails'>Show Trails?</label>
			</section>
			<canvas ref={canvasRef}></canvas>
		</>
	);
};

export default Canvas;
