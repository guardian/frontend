// @flow
import config from 'lib/config';
import { constructQuery } from 'lib/url';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';

const videoAdUrl = (): string => {
    const queryParams = {
        ad_rule: 1,
        correlator: new Date().getTime(),
        cust_params: encodeURIComponent(constructQuery(getPageTargeting())),
        env: 'vp',
        gdfp_req: 1,
        impl: 's',
        iu: config.get('page.adUnit'),
        output: 'xml_vast2',
        scp: encodeURIComponent('slot=video'),
        sz: '400x300',
        unviewed_position_start: 1,
    };

    return `https://${config.get('page.dfpHost')}/gampad/ads?${constructQuery(
        queryParams
    )}`;
};

export { videoAdUrl };
