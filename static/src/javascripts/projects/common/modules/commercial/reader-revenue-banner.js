// @flow

import type { Banner } from 'common/modules/ui/bannerPicker';
import { fetchBannerData, renderBanner, type BannerDataResponse } from 'common/modules/commercial/contributions-service';


const messageCode = 'reader-revenue-banner';

let data: ?BannerDataResponse = null;

const show = () => data ? renderBanner(data) : Promise.resolve(false);

const canShow = (): Promise<boolean> => {
    const enabled = true;

    // Temporarily disable banner while service is developed to serve actual banner and logic
    if(!enabled) {
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
