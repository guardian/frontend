// @flow
import { React } from 'react/addons';
import { init } from './preferences.js';

jest.mock('react/addons', () => ({
    React: {
        createClass: jest.fn(),
    },
}));

describe('preferences', () => {
    it('should exist', () => {
        expect(init).toBeDefined();
    });

    it('should not initialise if the placeholder is missing', () => {
        init();
        expect(React.createClass).not.toHaveBeenCalled();
    });
});
