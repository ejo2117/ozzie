import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import VectorField from './VectorField/VectorField';

const Chart = () => {
	const [data, setData] = useState(null);
	const [transformed, setTransformed] = useState(null);

	const osicllate = data => {
		console.log('funking..');

		return data
			? data.map((d, i) => {
					if (!i) {
						console.log(d);
					}
					return { ...d, ...{ dir: (parseFloat(d.dir) + 80).toFixed(2) } };
			  })
			: [];
	};

	// Fetch data to visualize, then cache
	useEffect(() => {
		const fetchData = async () => {
			const csv = await d3.csv('./wind.csv');
			setData(csv);
		};
		fetchData();
	}, []);

	// Transform existing data
	useEffect(() => {
		if (transformed) {
			setTransformed(osicllate(transformed));
		}
		if (data) {
			console.log('dsawd', osicllate(data));
			setTransformed(osicllate(data));
		}
	}, [data]);

	data && console.log('parent render w ', data[0]);

	const handleClick = () => {
		setTransformed(osicllate(transformed));
	};

	return transformed ? (
		<>
			<button onClick={handleClick}>Click me</button>
			<div id='chart'>
				<VectorField
					d3={d3}
					width={975}
					margin={10}
					data={transformed}
					projection={d3.geoEquirectangular()}
				></VectorField>
			</div>
		</>
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
