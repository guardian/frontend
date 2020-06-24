// @flow

import type { Banner } from 'common/modules/ui/bannerPicker';
import { fetchBannerData, renderBanner, type BannerDataResponse } from 'common/modules/commercial/contributions-service';
import config from "lib/config";
import { getSync as geolocationGetSync } from 'lib/geolocation';


const messageCode = 'reader-revenue-banner';

let data: ?BannerDataResponse = null;

const show = () => data ? renderBanner(data) : Promise.resolve(false);

const canShow = (): Promise<boolean> => {
    const countryCode = geolocationGetSync();
    const enabled = config.get('switches.remoteBanner') && countryCode === 'AU';

    if (!enabled) {
        return Promise.resolve(false);
    }

    return fetchBannerData()
        .then((response: ?BannerDataResponse)  => {
            if (response) {
                data = response;
                return true;
            }
            return false;
        });
};


export const readerRevenueBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
