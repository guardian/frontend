// @flow

import test from 'utils/test-render';
import NotFound from './index';

jest.mock('./style.css', () => ({
    message: {
        color: 'hotpink',
    },
}));

describe('404', () => {
    const config = {
        beaconUrl: '',
    };
    test(<NotFound config={config} />);
});
