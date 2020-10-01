// @flow
import config from 'lib/config';

export const permutive: ThirdPartyTag = {
    shouldRun: config.get('switches.permutive', false),
    url: '//cdn.permutive.com/d6691a17-6fdb-4d26-85d6-b3dd27f55f08-web.js',
    name: 'permutive'
};
