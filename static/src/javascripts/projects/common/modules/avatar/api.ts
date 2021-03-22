import { ajax } from 'lib/ajax';
import config from 'lib/config';

const apiUrl = `${config.get('page.avatarApiUrl')}/v1`;
const staticUrl = `${config.get('page.avatarImagesUrl')}/user`;


const request = (
    method,
    path,
    data
) => {
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
const getActive = () => request('GET', '/avatars/user/me/active');

const updateAvatar = (data) =>
    request('POST', '/avatars', data);

// The deterministic URL always returns an image. If the user has no avatar,
// a default image is returned.
const deterministicUrl = (userId) => `${staticUrl}/${userId}`;

export default {
    request,
    getActive,
    updateAvatar,
    deterministicUrl,
};
