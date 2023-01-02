export type WindPoint = {
	longitude: number;
	latitude: number;
	dir: number;
	dirCat: number;
	speed: number;
};

export type NormalizedWindPoint = WindPoint & {
	position: [number, number] | null;
};

/** Point (x, y) in 2D space */
export type Position = [number, number];

export type Position3D = [number, number, number];

export type ExcludeMethods<T> = Pick<
	T,
	{
		[K in keyof T]: T[K] extends Function ? never : K;
	}[keyof T]
>;
