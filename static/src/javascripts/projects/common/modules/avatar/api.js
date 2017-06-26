// @flow
import { ajax } from 'lib/ajax';
import config from 'lib/config';

const apiUrl = `${config.page.avatarApiUrl}/v1`;
const staticUrl = `${config.page.avatarImagesUrl}/user`;

type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const request = (
    method: HttpVerb,
    path: string,
    data?: string | Object
): Object => {
    const params = {
        url: apiUrl + path,
        type: 'json',
        data,
        processData: false,
        method,
        crossOrigin: true,
        withCredentials: true,
    };

    return ajax(params);
};

// A user's 'active' avatar is only available to signed-in users as it
// includes avatars in a pre-mod state.
const getActive = (): Object => request('GET', '/avatars/user/me/active');

const updateAvatar = (data?: Object): Object =>
    request('POST', '/avatars', data);

// The deterministic URL always returns an image. If the user has no avatar,
// a default image is returned.
const deterministicUrl = (userId: string): string => `${staticUrl}/${userId}`;

export default {
    request,
    getActive,
    updateAvatar,
    deterministicUrl,
};
