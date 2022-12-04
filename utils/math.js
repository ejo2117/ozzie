const randomInt = (min = 0, max = 1) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomArbitrary = (min = 0, max = 1) => {
	return Math.random() * (max - min) + 1;
};

const PI = Math.PI;

export { randomInt, randomArbitrary, PI };
