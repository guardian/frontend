import type { Banner } from 'common/modules/ui/bannerPicker';
import { fetchBannerData, renderBanner } from 'common/modules/commercial/contributions-service';


const messageCode = 'reader-revenue-banner';

let data = null;

const show = (): Promise<boolean> => {
    renderBanner(data);
};

const canShow = (): Promise<boolean> =>
    fetchBannerData()
        .then(moduleData => {
            data = moduleData;
            return data !== null;
        });


export const readerRevenueBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
