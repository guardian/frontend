// @flow strict
import config from 'lib/config';

export const inizio: ThirdPartyTag = {
    shouldRun: config.get('switches.inizio', false),
    url:
        '//cdn.brandmetrics.com/survey/script/e96d04c832084488a841a06b49b8fb2d.js',
};
