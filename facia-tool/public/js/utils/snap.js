import urlAbsPath from 'utils/url-abs-path';

function generateId() {
    return 'snap/' + new Date().getTime();
}
function validateId(id) {
    return [].concat(urlAbsPath(id || '').match(/^snap\/\d+$/))[0] || undefined;
}

export {
    generateId,
    validateId
};
