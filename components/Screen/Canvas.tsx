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
					theme: 'blackwhite',
					bpm: 120,
				});
			}
		};
		setup();
	}, [canvasRef.current]);

	return <canvas ref={canvasRef}></canvas>;
};

export default Canvas;
