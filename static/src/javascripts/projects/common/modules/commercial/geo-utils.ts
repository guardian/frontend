
import { getSync as geolocationGetSync } from "lib/geolocation";

// cache the users location so we only have to look it up once
let geo;
const currentGeoLocation = (): string => {
  geo = geo || geolocationGetSync();
  return geo;
};

export const isInUk = (): boolean => currentGeoLocation() === 'GB';

export const isInUsa = (): boolean => currentGeoLocation() === 'US';

export const isInCanada = (): boolean => currentGeoLocation() === 'CA';

export const isInAustralia = (): boolean => currentGeoLocation() === 'AU';

export const isInNewZealand = (): boolean => currentGeoLocation() === 'NZ';

export const isInUsOrCa = (): boolean => isInUsa() || isInCanada();

export const isInAuOrNz = (): boolean => isInAustralia() || isInNewZealand();

export const isInRow = (): boolean => !isInUk() && !isInUsOrCa() && !isInAuOrNz();

export const _ = { resetModule: () => {geo = undefined;} };