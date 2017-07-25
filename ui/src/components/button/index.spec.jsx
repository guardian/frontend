// @flow

import test from 'utils/test-render';
import Button from '.';

jest.mock('./style.scss', () => ({
    button: {
        backgroundColor: 'hotpink',
    },
}));

describe('Button', () => {
    test(<Button>test button</Button>);
});
