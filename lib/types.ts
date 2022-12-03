export type WindPoint = {
    longitude: number,
    latitude: number,
    dir: number,
    dirCat: number,
    speed: number,
}

export type NormalizedWindPoint = WindPoint & {
    position: [number, number] | null;
}