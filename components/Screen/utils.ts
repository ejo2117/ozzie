import { NormalizedWindPoint, WindPoint } from '@lib/types';
import * as d3 from 'd3'
import { GeoGeometryObjects } from 'd3';

/*-- CONSTANTS --*/

const PROJECTION = d3.geoEquirectangular()
const WIDTH = typeof window !== 'undefined' ? window.innerWidth : 400;
const COLORS = {
    rainbow: (x: number, range: [number,number]) => d3.scaleSequential(range, d3.interpolateRainbow)(x),
    blackwhite: (x: number, range: [number,number]) => d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('white', 'black'))(x),
    furnace: (x: number, range: [number,number]) => d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('#233D4D', '#FE7F2D'))(x),
    red: (x: number, range: [number,number]) => d3.scaleSequential(range, d3.interpolateRgb.gamma(0.5)('#DE9151', '#F34213'))(x),
}


/*-- FUNCTIONS --*/

/** Ingests Wind Data from a CSV at the provided path.  */
const ingestCSV = async (pathToFile = './wind.csv') => {
    const csv = await d3.csv<keyof WindPoint>(pathToFile);
    const parsed = csv.reduce((result, current) => {
        result.push(
            {
                longitude: +current.longitude!,
                latitude: +current.latitude!,
                dir: +current.dir!,
                dirCat: +current.dirCat!,
                speed: +current.speed!
            }
        )
        return result
    }, [] as WindPoint[])
    return parsed
}

/** Gets boundaries for the 2D plane contianing the projected data */
const getProjectionBounds = (data: WindPoint[]) => {
    const projectionInput = {
        type: 'MultiPoint',
        coordinates: data.map(d => [d.longitude, d.latitude]),
        /** intentionally empty to satisy TS */
        geometries: {} as GeoGeometryObjects[]
    }

    return d3.geoPath(
        PROJECTION.fitWidth(WIDTH, projectionInput)
    ).bounds(projectionInput)
}

/** Projects the data to an `Array` of [x, y] points */ 
const normalizePoints = (data: WindPoint[]) => {

    const points = [] as NormalizedWindPoint[];
    
    for (const point of data) {
        const position = PROJECTION([point.longitude, point.latitude])
        points.push({
            ...point,
            position
        })
    }

    return points;
}


 
export { COLORS, getProjectionBounds, ingestCSV, normalizePoints }