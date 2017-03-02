import fetchJson from 'common/utils/fetch-json';

function getEmail(browserId) {
    const baseUrl = 'https://tailor.guardianapis.com/email';

    return fetchJson(`${baseUrl}/${browserId}?emailIds=1950,218,3701`, {
        method: 'get',
    });
}

export default {
    getEmail,
};
