// @flow
import { isInUsOrCa, isInAuOrNz } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';
import { isInTcfv2Test } from 'commercial/modules/cmp/tcfv2-test';

export type LotameData = {
    ozoneLotameData: Array<string>,
    ozoneLotameProfileId: string,
};

let lotameData: LotameData;

const ozoneLotameCallback = (obj) => {
    lotameData = {
        ozoneLotameData: obj.getAudiences(),
        ozoneLotameProfileId: obj.getProfileId(),
    };
}

const onLoad = () => {
    // More details here: https://my.lotame.com/t/g9hxvnw/detailed-reference-guide
    const lotameTagInput = {
        data: {},
        config: {
            clientId: 12666,
            onProfileReady(o){ ozoneLotameCallback(o);},
        }
    };

    // Lotame initialization
    const lotameConfig = lotameTagInput.config || {};
    const namespace = {};
    window[`lotame_${  lotameConfig.clientId}`] = {};
    namespace.config = lotameConfig;
    namespace.data = lotameTagInput.data || {};
    namespace.cmd = namespace.cmd || [];
};


export const getLotameData: () => LotameData = () => lotameData;

export const lotame: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.lotame', false) && isInTcfv2Test() && !(isInUsOrCa() || isInAuOrNz()),
    url: '//tags.crwdcntrl.net/lt/c/12666/lt.min.js',
    onLoad,
    sourcepointId: '5ed6aeb1b8e05c241a63c71f',
});
