import { NormalizedWindPoint, WindPoint } from '@lib/types';
import getWeather from '@lib/weather/get-weather';
import * as d3 from 'd3';
import { GeoGeometryObjects, json } from 'd3';
import { randomArbitrary, randomInt, randomlyNegative } from '@utils/math';

/*-- CONSTANTS --*/

const { abs, sin, PI } = Math;

const PROJECTION = d3.geoEquirectangular();
// const WIDTH = typeof window !== 'undefined' ? window.innerWidth : 800;
const COLORS = {
	rainbow: (x: number, range: [number, number]) => d3.scaleSequential(range, d3.interpolateRainbow)(x),
	blackwhite: (x: number, range: [number, number]) =>
		d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('white', 'black'))(x),
	furnace: (x: number, range: [number, number]) => d3.scaleSequential(range, d3.interpolateHsl('#233D4D', '#FE7F2D'))(x),
	red: (x: number, range: [number, number]) => d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('#DE9151', '#F34213'))(x),
	mint: (x: number, range: [number, number]) =>
		d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('#040403', '#9DDBAD'))(x),
	prep: (x: number, range: [number, number]) =>
		d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('#2EC0F9', '#A63A50'))(x),
	cougar: (x: number, range: [number, number]) => d3.scaleSequential(range, d3.interpolateHsl('#FB8B24', '#D90368'))(x),
	rose: (x: number, range: [number, number]) => d3.scaleSequential(range, d3.interpolateHsl('#FDE8E9', '#E3BAC6'))(x),
};

const TRAILS = ['path', 'origin'];

/*-- FUNCTIONS --*/

/** Ingests Wind Data from a CSV at the provided path.  */
const ingestCSV = async (pathToFile = './wind.csv') => {
	const csv = await d3.csv<keyof WindPoint>(pathToFile);
	const parsed = csv.slice(0, csv.length - 1).reduce((result, current, i) => {
		if (!(i % 12)) {
			result.push({
				longitude: +current.longitude!,
				latitude: +current.latitude!,
				dir: +current.dir!,
				dirCat: +current.dirCat!,
				speed: +current.speed!,
			});
		}
		return result;
	}, [] as WindPoint[]);
	return normalizePoints(parsed);
};

/** Ingests Wind Data from [Oikolab API](https://docs.oikolab.com/#1-introduction) */
const fetchAndNormalizeWeatherData = async () => {
	const { data } = await getWeather(
		{
			param: ['wind_speed', 'wind_direction'],
		},
		{
			'start': '2022-12-01',
			'end': '2022-12-10',
			'lat': (41.878113).toString(),
			'lon': (-87.629799).toString(),
			'api-key': process.env.NEXT_PUBLIC_OIKOLAB_WEATHER_API,
		}
	);
	const points = { speed: [], dir: [] };
	for (let i = 0; i < data.data.length; i++) {
		const point = data.data[i];
		points['speed'].push(point[4]);
		points['dir'].push(point[5]);
	}

	return { points };
};

/** Gets boundaries for the 2D plane contianing the projected data */
const getProjectionBounds = (data: WindPoint[], width) => {
	const projectionInput = {
		type: 'MultiPoint',
		coordinates: data.map(d => [d.longitude, d.latitude]),
		/** intentionally empty to satisy TS */
		geometries: {} as GeoGeometryObjects[],
	};
	const bounds = d3.geoPath(PROJECTION.fitWidth(width, projectionInput)).bounds(projectionInput);
	const translationOffset = PROJECTION.translate();

	// PROJECTION.translate

	return { bounds, translationOffset };
};

/** Adds a `position` containing a projected [x, y] point to every object in the data array.
 *
 * @See typeof `PROJECTION`
 */

const normalizePoints = (data: WindPoint[]) => {
	const points = [] as NormalizedWindPoint[];

	for (const point of data) {
		const position = PROJECTION([point.longitude, point.latitude]);
		if (!position || !position[0]) continue;
		points.push({
			...point,
			position,
		});
	}

	return points;
};

/** At time `t` seconds, this function returns the absolute amplitude of a sine wave that crests on every beat, given a `bpm`  */
const getBeatAlignment = (bpm: number, t: number, crestFactor = 1) => abs(sin((bpm / 60) * PI * t)) ** crestFactor;

const scaleContextForData = (data: WindPoint[]) => {
	return d3.scaleSqrt([0, d3.max<number>(data.map(d => d.speed))]);
};

const getUserTheme = () => {
	if (typeof document === 'undefined') {
		return 'l';
	}
	return getComputedStyle(document.body, ':after').content;
};

const randomLissajousArgs = (maxWidth: number, maxHeight: number, tx: number, ty: number) => {
	return [
		randomInt(100, maxWidth) * randomlyNegative(),
		randomInt(100, maxHeight) * randomlyNegative(),
		randomArbitrary(tx, tx) * randomlyNegative(),
		randomArbitrary(tx, ty) * randomlyNegative(),
	] as [number, number, number, number];
};

const randomFromArray = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export {
	COLORS,
	TRAILS,
	fetchAndNormalizeWeatherData,
	getBeatAlignment,
	getProjectionBounds,
	getUserTheme,
	ingestCSV,
	normalizePoints,
	randomFromArray,
	randomLissajousArgs,
	scaleContextForData,
};
