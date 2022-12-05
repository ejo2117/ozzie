import { ExcludeMethods } from '@lib/types';
import SpriteField from './Field';
import Sprite from './Sprite';
import { COLORS } from './utils';

class Controller {
	field: SpriteField;
	sprite: Sprite;
	toggle: HTMLButtonElement;
	container: HTMLElement;
	visibility: boolean;

	themeSelect: HTMLSelectElement;

	// UI

	constructor({ field }: Pick<Controller, 'field' | 'sprite'>) {
		this.field = field;

		this.toggle = document.getElementById('openControls') as HTMLButtonElement;
		this.container = document.getElementById('controls') as HTMLElement;
		this.themeSelect = this.container.querySelector('select');

		this.toggle.addEventListener('click', () => this.setVisibility(!this.visibility));
		this.themeSelect.addEventListener('change', e => this.changeTheme(this.themeSelect.value as keyof typeof COLORS));
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
}

export default Controller;
