// @flow

import test from 'utils/test-render';
import FourOhFour from './index';

jest.mock('./style.js.scss', () => ({
    message: {
        color: 'hotpink',
    },
}));

describe('404', () => {
    test(<FourOhFour />);
});
