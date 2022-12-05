const randomInt = (min = 0, max = 1) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomArbitrary = (min = 0, max = 1) => {
	return Math.random() * (max - min) + 1;
};

const randomlyNegative = () => (Math.random() > 0.5 ? 1 : -1);

function distance({ x0, y0 }, { x1, y1 }) {
	return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}

const PI = Math.PI;

export { randomInt, randomArbitrary, randomlyNegative, PI, distance };
