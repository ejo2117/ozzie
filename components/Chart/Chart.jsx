import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import VectorField from './VectorField/VectorField';

const Chart = () => {
	const [data, setData] = useState(null);

	const requestRef = useRef();
	const previousTimeRef = useRef();

	const animate = time => {
		if (!data) return;

		if (previousTimeRef.current != undefined) {
			const deltaTime = time - previousTimeRef.current;

			// pass a function to setData, generating new state based off latest state
			setData(prevData => oscillate(prevData, deltaTime));
		}

		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	const oscillate = (data, factor) => {
		console.log('changing data..');
		return data
			? data.map((d, i) => {
					if (!i) {
						console.log(d);
					}
					return {
						...d,
						...{ dir: Math.round((parseFloat(d.dir) + factor).toFixed(2)) },
					};
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

	useEffect(() => {
		if (data) {
			requestRef.current = requestAnimationFrame(animate);
		}

		return () => {
			cancelAnimationFrame(requestRef.current);
		};
	}, [data]);

	data && console.log('parent render w ', data[0]);

	return data ? (
		<>
			<div id='chart'>
				<VectorField
					d3={d3}
					width={975}
					margin={10}
					data={data}
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
