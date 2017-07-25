// @flow

import test from 'utils/test-render';
import FourOhFour from './index';

jest.mock('./style.scss', () => ({
    message: {
        color: 'hotpink',
    },
}));

describe('404', () => {
    test(<FourOhFour />);
});
