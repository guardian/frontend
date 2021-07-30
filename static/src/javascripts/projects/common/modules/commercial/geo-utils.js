import { getCountryCode } from '../../../../lib/geolocation';

// cache the users location so we only have to look it up once
let geo;
const currentGeoLocation = (() => {
    geo = geo || getCountryCode();
    return geo;
});

/*
 * Inside the bundle:
 * - static/src/javascripts/projects/commercial/modules/dfp/redplanet.js
 * - static/src/javascripts/projects/commercial/modules/dfp/redplanet.spec.js
 * - static/src/javascripts/projects/commercial/modules/header-bidding/prebid/appnexus.js
 * - static/src/javascripts/projects/commercial/modules/header-bidding/prebid/appnexus.spec.js
 * - static/src/javascripts/projects/commercial/modules/header-bidding/prebid/bid-config.spec.ts
 * - static/src/javascripts/projects/commercial/modules/header-bidding/prebid/bid-config.ts
 * - static/src/javascripts/projects/commercial/modules/header-bidding/utils.spec.js
 * - static/src/javascripts/projects/commercial/modules/header-bidding/utils.ts
 * - static/src/javascripts/projects/commercial/modules/third-party-tags/imr-worldwide-legacy.js
 * - static/src/javascripts/projects/commercial/modules/third-party-tags/imr-worldwide.js
 *
 * Where is this file used outside the commercial bundle?
 * - static/src/javascripts/lib/getPrivacyFramework.js
 * - static/src/javascripts/projects/common/modules/commercial/geo-utils.spec.js
 *
 */



export const isInUk = () => currentGeoLocation() === 'GB';

export const isInUsa = () => currentGeoLocation() === 'US';

export const isInCanada = () => currentGeoLocation() === 'CA';

export const isInAustralia = () => currentGeoLocation() === 'AU';

export const isInNewZealand = () => currentGeoLocation() === 'NZ';

export const isInUsOrCa = () => isInUsa() || isInCanada();

export const isInAuOrNz = () => isInAustralia() || isInNewZealand();

export const isInRow = () => !isInUk() && !isInUsOrCa() && !isInAuOrNz();

export const _ = { resetModule: () => { geo = undefined } };
