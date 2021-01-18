import { getSync as geolocationGetSync } from 'lib/geolocation';

// cache the users location so we only have to look it up once
let geo;
const currentGeoLocation = (() => {
    geo = geo || geolocationGetSync();
    return geo;
});

export const isInUk = () => currentGeoLocation() === 'GB';

export const isInUsa = () => currentGeoLocation() === 'US';

export const isInCanada = () => currentGeoLocation() === 'CA';

export const isInAustralia = () => currentGeoLocation() === 'AU';

export const isInNewZealand = () => currentGeoLocation() === 'NZ';

export const isInUsOrCa = () => isInUsa() || isInCanada();

export const isInAuOrNz = () => isInAustralia() || isInNewZealand();

export const isInRow = () => !isInUk() && !isInUsOrCa() && !isInAuOrNz();

export const _ = { resetModule: () => { geo = undefined } };
