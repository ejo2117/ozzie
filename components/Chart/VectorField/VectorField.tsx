import type { GeoProjection } from 'd3';
import { FC, useCallback, useEffect, useRef } from 'react';

import useHasMounted from '../../../hooks/useHasMounted';

interface IDataFormat {
	// point: [x: number, y: number];
	longitude: number;
	latitude: number;
	dir: number;
	dirCat: number;
	speed: number;
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

const getVectorFieldHeight = (props: Omit<IVectorFieldProps, 'height'>) => {
	const { d3, data, projection, width, margin } = props;

	const points = { type: 'MultiPoint', coordinates: data?.map(d => [d.longitude, d.latitude]) };

	const [[x0, y0], [x1, y1]] = d3
		.geoPath(projection.fitWidth(width - margin * 2, points))
		.bounds(points);

	const [tx, ty] = projection?.translate();
	const height = Math.ceil(y1 - y0);

	projection?.translate([tx + margin, ty + margin]);

	return height + margin * 2;
};

const scale = (data: any[], d3) => {
	return d3.scaleSqrt([0, d3.max(data, d => d.speed)], [0, 2]);
};

const color = (dir, d3) => {
	// console.log('[COLOR 0]:', d3.scaleSequential([0, 360], d3.interpolateRainbow));

	return d3.scaleSequential([0, 360], d3.interpolateRainbow)(dir);
};

const draw = (node: HTMLCanvasElement, props: Omit<IVectorFieldProps, 'height'>) => {
	const { d3, data, width, projection } = props;
	if (node) {
		const canvas = node;
		// Get height based on data
		const height = getVectorFieldHeight(props);

		// Fixes blurriness on Retina Displays
		const dpi = window.devicePixelRatio;
		canvas.width = Math.floor(width * dpi);
		canvas.height = Math.floor(height * dpi);

		const context = canvas.getContext('2d');
		const path = d3.geoPath(projection, context);

		if (context) {
			context.canvas.style.maxWidth = '100%';
			context.scale(dpi, dpi);
			context.fillRect(0, 0, width, height);
			context.strokeStyle = '#eee';
			context.lineWidth = 1.5;
			context.lineJoin = 'round';

			for (const { longitude, latitude, speed, dir } of data) {
				context.save();
				context.translate(...projection([longitude, latitude]));
				context.scale(scale(data, d3), scale(data, d3));
				context.rotate((dir * Math.PI) / 180);

				context.beginPath();
				context.moveTo(-2, -2);
				context.lineTo(2, -2);
				context.lineTo(0, 8);
				context.closePath();

				context.fillStyle = color(dir, d3);
				context.fill();

				context.restore();
			}
		}
	}
};

const VectorField: FC<Omit<IVectorFieldProps, 'height'>> = props => {
	console.log('render w', props.data[0]);
	const hasMounted = useHasMounted();

	const canvasRef = useCallback(
		(node: HTMLCanvasElement) => {
			console.log('drawing? ', hasMounted);
			if (hasMounted) {
				draw(node, props);
			}
		},
		[props.data]
	);

	return <canvas ref={canvasRef}></canvas>;
};

export default VectorField;
