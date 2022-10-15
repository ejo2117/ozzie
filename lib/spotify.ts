import { nanoid } from 'nanoid';

const requestUserAuthorization = () => {
	const scope = '';

	const authParams = {
		client_id: '',
		response_type: 'code',
		redirect_uri: 'http://localhost:3000',
		state: '',
		scope: '',
		// PKCE
		code_challenge_method: '',
		code_challenge: '',
	};
};

export { requestUserAuthorization };
