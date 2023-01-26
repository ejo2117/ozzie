import { NormalizedWindPoint } from '@lib/types';
import { fetchAndNormalizeWeatherData, ingestCSV } from '@utils/screen';
import { WeatherRequestParams } from './get-weather';
import * as THREE from 'three';

class Sky {
	weather: NormalizedWindPoint[];
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	constructor(parameters: WeatherRequestParams) {
		ingestCSV().then(value => {
			this.weather = value;
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.1, 1000);

			this.renderer = new THREE.WebGLRenderer();

			this.renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(this.renderer.domElement);
		});
	}
}
