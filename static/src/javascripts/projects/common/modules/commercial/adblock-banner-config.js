// @flow
import { banners } from './adblock-banners';

const getBanners = function(edition: string): Array<any> {
    const editionFilter = banner =>
        typeof banner.editions[edition] !== 'undefined';

    const mergeVariantConfigurations = banner =>
        banner.variants.map(variant =>
            Object.assign(
                {
                    edition,
                    template: banner.template,
                },
                banner.defaults,
                variant,
                banner.editions[edition] || {}
            )
        );
    return banners.filter(editionFilter).map(mergeVariantConfigurations);
};

export { getBanners };
