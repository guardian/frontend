import config from 'lib/config';

const apiUrl = `${String(config.get('page.avatarApiUrl'))}/v1`;
const staticUrl = `${String(config.get('page.avatarImagesUrl'))}/user`;

const request = (
	method: string,
	path: string,
	data?: Record<string, unknown>,
): Promise<Response> => {
	const url = apiUrl + path;

	const body = ['GET', 'HEAD'].includes(method.toUpperCase())
		? undefined
		: JSON.stringify(data);

	return fetch(url, {
		body,
		method,
		mode: 'cors',
		credentials: 'include',
	});
};

// A user's 'active' avatar is only available to signed-in users as it
// includes avatars in a pre-mod state.
const getActive = (): Promise<Response> =>
	request('GET', '/avatars/user/me/active');

const updateAvatar = (data: Record<string, unknown>): Promise<Response> =>
	request('POST', '/avatars', data);

// The deterministic URL always returns an image. If the user has no avatar,
// a default image is returned.
const deterministicUrl = (userId: number): string => `${staticUrl}/${userId}`;

// eslint-disable-next-line import/no-default-export -- that’s how it was set up
export default {
	request,
	getActive,
	updateAvatar,
	deterministicUrl,
};
