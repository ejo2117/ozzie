import { forwardRef, useEffect, useRef, useState } from 'react';
import SpriteField from './Field';
import { ingestCSV } from './utils';

type CanvasProps = JSX.IntrinsicElements['canvas'] & {};

const Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>();

	useEffect(() => {
		const setup = async () => {
			if (canvasRef.current) {
				const points = await ingestCSV();
				new SpriteField({
					canvas: canvasRef.current,
					data: points,
					width: 950,
					theme: 'red',
					bpm: 120,
				});
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
			</section>
			<canvas ref={canvasRef}></canvas>
		</>
	);
};

export default Canvas;
