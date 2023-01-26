import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { SpriteField } from '@lib/sprites';
import { COLORS, fetchAndNormalizeWeatherData, ingestCSV, TRAILS } from '@utils/screen';
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

const Canvas = ({ weather = null }) => {
	const canvasRef = useRef<HTMLCanvasElement>();
	const flockRef = useRef<Flock>();
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
				const points = await ingestCSV();

				flockRef.current = new Flock({
					bpm: 125,
					context: canvasRef.current.getContext('2d'),
					height: canvasRef.current.height,
					numBoids: 50,
					points,
					theme: 'rainbow',
					trail: true,
					trails: { origin: false, path: false },
					visualRange: 75,
					width: canvasRef.current.width,
					weather: weather?.points,
				});

				animationIdRef.current = flockRef.current.animationId;
			}
		};
		setup();

		return () => window.cancelAnimationFrame(animationIdRef.current);
	}, [canvasRef.current]);

	return (
		<>
			<button id='openControls'>Controls</button>
			<section id='controls' data-visible='false'>
				<select name='theme'>
					{Object.keys(COLORS).map(key => (
						<option value={key} key={key}>
							{key}
						</option>
					))}
				</select>
				<select name='trails'>
					{TRAILS.map(key => (
						<option value={key} key={key}>
							{key}
						</option>
					))}
				</select>
				<label htmlFor='margin'></label>
				<input type='range' id='margin' min={0} max={10} step={0.1} />
				<input id='trail' type={'checkbox'}></input>
				<label htmlFor='trail'>Show Trails?</label>
				<input id='sprite' type={'checkbox'}></input>
				<label htmlFor='sprite'>Show Sprite?</label>
			</section>
			<canvas ref={canvasRef}></canvas>
		</>
	);
};

export default Canvas;
