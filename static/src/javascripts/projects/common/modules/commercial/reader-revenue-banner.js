// @flow

import type { Banner } from 'common/modules/ui/bannerPicker';
import { fetchBannerData, renderBanner } from 'common/modules/commercial/contributions-service';


const messageCode = 'reader-revenue-banner';

let data = null;

const show = () => renderBanner(data);

const canShow = (): Promise<boolean> => {
    const enabled = true;

    // Temporarily disable banner while service is developed to serve actual banner and logic
    if(!enabled) {
        return Promise.resolve(false);
    }

    return fetchBannerData()
        .then(response => {
            data = response;
            return data !== null;
        });
};


export const readerRevenueBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
