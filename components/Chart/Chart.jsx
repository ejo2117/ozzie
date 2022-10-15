import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import VectorField from './VectorField/VectorField';
import styles from './Chart.module.scss';
// import { PI, randomInt } from '../../utils/math';

const { PI, abs, sin } = Math;

const loadedAt = performance.now();

const syncBPM = bpm => {
	return bpm / 60;
};

const Chart = () => {
	const [data, setData] = useState(null);

	const requestRef = useRef();
	const previousTimeRef = useRef();

	const bpm = 90;

	const animate = time => {
		if (!data) return;

		let now = performance.now();

		if (previousTimeRef.current != undefined) {
			const deltaTime = time - previousTimeRef.current; // time since last animation
			const ts = (now - loadedAt) / 1000; // total seconds elapsed

			// pass a function to setData, generating new state based off latest state
			setData(prevData => oscillate(prevData, deltaTime, ts));
		}

		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	const oscillate = (data, factor, ts) => {
		return data
			? data.map((d, i) => {
					return {
						...d,
						...{
							dir: Math.round(
								(parseFloat(d.dir) + factor * 0.1).toFixed(2) % 361
							),
							beat: abs(sin(syncBPM(bpm) * PI * ts)),
							ts,
							// speed: randomInt(10),
						},
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

	return data ? (
		<>
			<div id='chart'>
				<VectorField
					d3={d3}
					width={975}
					margin={20}
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
