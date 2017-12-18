// @flow
import config from 'lib/config';
import mediator from 'lib/mediator';
import { showAdblockMsg } from 'common/modules/commercial/adblock-messages';
import { getBanners } from 'common/modules/commercial/adblock-banner-config';
import { AdblockBanner } from 'common/modules/adblock-banner';
import sample from 'lodash/collections/sample';

const showAdblockBanner = (): void => {
    const banners = getBanners(config.get('page.edition'));
    const flatBanners = banners.map(bannerList => sample(bannerList));
    const bannerToUse = sample(flatBanners);

    if (bannerToUse) {
        new AdblockBanner(bannerToUse.template, bannerToUse).show();
    }
};

const initDonotUseAdblock = (): void => {
    showAdblockMsg().then(adBlockInUse => {
        // Show messages only if adblock is used by non paying member
        if (adBlockInUse) {
            showAdblockBanner();
        }
        mediator.emit('banner-message:complete');
    });
};
export { initDonotUseAdblock };
