import { NormalizedWindPoint } from '@lib/types';
import { fetchAndNormalizeWeatherData, ingestCSV } from '../../components/Screen/utils';
import { WeatherRequestParams } from './get-weather';

class Sky {
	weather: NormalizedWindPoint[];
	constructor(parameters: WeatherRequestParams) {
		ingestCSV().then(value => (this.weather = value));
	}
}
