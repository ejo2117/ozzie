export type WeatherRequestParams = {
	param: string | string[];
};

export type RequestOptions = {
	'start': string;
	'end': string;
	'lat': string;
	'lon': string;
	'api-key': string;
};

const createParams = (params: WeatherRequestParams['param'], options: RequestOptions) => {
	const result = new URLSearchParams();
	if (Array.isArray(params)) {
		for (let i = 0; i < params.length; i++) {
			result.append('param', params[i]);
		}
	} else {
		result.append('param', params);
	}
	for (const [key, value] of Object.entries(options)) {
		result.append(key, value);
	}
	return result;
};

const getWeather = async (params: WeatherRequestParams, options: RequestOptions) => {
	const res = await fetch('https://api.oikolab.com/weather?' + createParams(params.param, options), {
		method: 'GET',
	});
	if (!res?.ok) {
		console.error('Could not access weather data.');
		return null;
	}
	const data = await res.json();
	return {
		...data,
		data: JSON.parse(data.data),
	};
};

export default getWeather;
