import Flock from '@lib/boids/Flock';
import { ExcludeMethods } from '@lib/types';
import SpriteField from './Field';
import Sprite from './Sprite';
import { COLORS, TRAILS } from './screen__utils';

class Controller {
	field: Flock;
	sprite: Sprite;
	toggle: HTMLButtonElement;
	container: HTMLElement;
	visibility: boolean;

	themeSelect: HTMLSelectElement;
	trailsCheckbox: HTMLInputElement;
	trailsSelect: HTMLSelectElement;

	// UI

	constructor({ field }: Pick<Controller, 'field' | 'sprite'>) {
		this.field = field;

		this.toggle = document.getElementById('openControls') as HTMLButtonElement;
		this.container = document.getElementById('controls') as HTMLElement;
		this.themeSelect = this.container.querySelector('select[name="theme"]');
		this.trailsCheckbox = this.container.querySelector('#trail');
		this.trailsSelect = this.container.querySelector('select[name="trails"]');

		this.toggle.addEventListener('click', () => this.setVisibility(!this.visibility));
		this.themeSelect.addEventListener('change', e => this.changeTheme(this.themeSelect.value as keyof typeof COLORS));
		this.trailsSelect.addEventListener('change', e => this.setTrails(this.themeSelect.value as keyof typeof TRAILS));
		//@ts-ignore
		this.trailsCheckbox.addEventListener('click', e => this.setTrails(e.target.checked));
	}

	changeTheme(t: keyof typeof COLORS) {
		this.field.theme = t;
		this.field.refreshSprites();
		// this.setVisibility(false);
	}

	setVisibility(bool: boolean) {
		this.visibility = bool;
		this.container.dataset['visible'] = bool.toString();
	}

	setTrails(t: keyof typeof TRAILS) {
		this.field.trails[t] = true;
		// this.setVisibility(false);
	}
}

export default Controller;
