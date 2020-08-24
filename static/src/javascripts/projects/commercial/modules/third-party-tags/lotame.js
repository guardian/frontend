// @flow
import config from 'lib/config';
import { isInAuOrNz, isInUsOrCa } from 'common/modules/commercial/geo-utils';

export type LotameData = {
    ozoneLotameData: Array<string>,
    ozoneLotameProfileId: string,
};

let lotameData: LotameData;

const ozoneLotameCallback = obj => {
    lotameData = {
        ozoneLotameData: obj.getAudiences(),
        ozoneLotameProfileId: obj.getProfileId(),
    };
};

const beforeLoad = () => {
    // More details here: https://my.lotame.com/t/g9hxvnw/detailed-reference-guide
    /* eslint-disable */
    !(function() {
        var lotameTagInput = {
            data: {},
            config: {
                clientId: 12666,
                onProfileReady: function(o) {
                    ozoneLotameCallback(o);
                },
                onTagReady: function(o) {
                    console.log(['onTagReady: ', o]);
                },
            },
        };

        // Lotame initialization
        var lotameConfig = lotameTagInput.config || {};
        var namespace = (window['lotame_' + lotameConfig.clientId] = {});
        namespace.config = lotameConfig;
        namespace.data = lotameTagInput.data || {};
        namespace.cmd = namespace.cmd || [];
    })();
    /* eslint-enable */
};

export const getLotameData: () => LotameData = () => lotameData;

export const lotame: () => ThirdPartyTag = () => ({
    shouldRun:
        config.get('switches.lotame', false) && !(isInUsOrCa() || isInAuOrNz()),
    url: '//tags.crwdcntrl.net/lt/c/12666/lt.min.js',
    beforeLoad,
    sourcepointId: '5ed6aeb1b8e05c241a63c71f',
});
