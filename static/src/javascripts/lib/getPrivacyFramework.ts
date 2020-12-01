import { isInUsa } from 'common/modules/commercial/geo-utils';

let frameworks: Record<string, boolean>;

export const getPrivacyFramework = () => {
    if (typeof frameworks === 'undefined') {
        const isInUS = isInUsa();

        frameworks = {
            ccpa: isInUS,
            tcfv2: !isInUS,
        };
    }
    return frameworks;
};
