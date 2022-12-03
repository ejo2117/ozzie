import { NormalizedWindPoint, WindPoint } from '@lib/types';
import * as d3 from 'd3'
import { GeoGeometryObjects } from 'd3';

const PROJECTION = d3.geoEquirectangular()
const WIDTH = window.innerWidth ?? 400;

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
 
export { normalizePoints, getProjectionBounds, ingestCSV }