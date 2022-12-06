import Flock from '@lib/boids/Flock';
import { ExcludeMethods } from '@lib/types';
import SpriteField from './Field';
import Sprite from './Sprite';
import { COLORS } from './utils';

class Controller {
	field: Flock;
	sprite: Sprite;
	toggle: HTMLButtonElement;
	container: HTMLElement;
	visibility: boolean;

	themeSelect: HTMLSelectElement;
	trailsCheckbox: HTMLInputElement;

	// UI

	constructor({ field }: Pick<Controller, 'field' | 'sprite'>) {
		this.field = field;

		this.toggle = document.getElementById('openControls') as HTMLButtonElement;
		this.container = document.getElementById('controls') as HTMLElement;
		this.themeSelect = this.container.querySelector('select');
		this.trailsCheckbox = this.container.querySelector('#trails');

		this.toggle.addEventListener('click', () => this.setVisibility(!this.visibility));
		this.themeSelect.addEventListener('change', e => this.changeTheme(this.themeSelect.value as keyof typeof COLORS));
		//@ts-ignore
		this.trailsCheckbox.addEventListener('click', e => this.setTrails(e.target.checked));
	}

	changeTheme(t: keyof typeof COLORS) {
		this.field.theme = t;
		this.field.refreshSprites();
		this.setVisibility(false);
	}

	setVisibility(bool: boolean) {
		this.visibility = bool;
		this.container.dataset['visible'] = bool.toString();
	}

	setTrails(bool: boolean) {
		this.field.trail = bool;
		this.setVisibility(false);
	}
}

export default Controller;
