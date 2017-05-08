import dfpEnv from 'commercial/modules/dfp/dfp-env';
export default getAdvertById;

function getAdvertById(id) {
    return id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;
}
