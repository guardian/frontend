import config from 'lib/config';

const apiUrl = `${config.get<string>(
	'page.avatarApiUrl',
	'/AVATAR_API_URL_NOT_FOUND',
)}/v1`;
const staticUrl = `${config.get<string>(
	'page.avatarImagesUrl',
	'/AVATAR_IMAGES_URL_NOT_FOUND',
)}/user`;

const request = (
	method: string,
	path: string,
	data?: FormData,
): Promise<Response> => {
	const url = apiUrl + path;

	if (method === 'POST') {
		if (!data) throw new Error('POST error: No data provided.');

		return fetch(url, {
			method,
			body: data,
			mode: 'cors',
			credentials: 'include',
		}).then((resp) => resp.json() as Promise<Response>);
	}

	return fetch(url, {
		method,
		mode: 'cors',
		credentials: 'include',
	});
};

// A user's 'active' avatar is only available to signed-in users as it
// includes avatars in a pre-mod state.
const getActive = (): Promise<Response> =>
	request('GET', '/avatars/user/me/active');

// 2021-04-06: updating avatar should only be done from manage.theguardian.com – this can likely be removed.
const updateAvatar = (data: FormData): Promise<Response> =>
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
