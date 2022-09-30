import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import VectorField from './VectorField/VectorField';

const Chart = () => {
	const [data, setData] = useState(null);
	const canvas = useRef(null);

	// Fetch data to visualize, then cache
	useEffect(() => {
		const fetchData = async () => {
			const csv = await d3.csv('./wind.csv');
			setData(csv);
		};
		fetchData();
	}, []);

	// // Make sure visualize function doesn't run more than it needs to
	// const drawOn = useCallback(canvas => {}, [data]);

	// // Visualize data in the DOM once the container element is available
	// useEffect(() => {
	// 	drawOn(canvas);
	// }, [canvas]);

	return data ? (
		<div id='chart'>
			<VectorField
				d3={d3}
				width={975}
				margin={10}
				data={data}
				projection={d3.geoEquirectangular()}
			></VectorField>
		</div>
	) : null;
};

export const getServerSideProps = async ctx => {
	return {
		props: {
			data: null,
		},
	};
};

export default Chart;
