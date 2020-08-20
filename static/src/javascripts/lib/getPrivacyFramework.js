// @flow strict
import config from 'lib/config';
import { isInUsa } from 'projects/common/modules/commercial/geo-utils.js';

const switches = config.get('switches');

let frameworks: { [key: string]: boolean };

export const getPrivacyFramework = () => {
    if (typeof frameworks === 'undefined') {
        const isInUS = isInUsa();

        frameworks = {
            ccpa: isInUS && switches.ccpaCmpUi,
            tcfv1: !isInUS && !switches.tcfv2Dcr,
            tcfv2: !isInUS && switches.tcfv2Dcr,
        };
    }
    return frameworks;
};
