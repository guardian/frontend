// @flow
import { init } from './preferences.js';

jest.mock('react/addons', () => ({
    React: {
        createClass: jest.fn(),
    },
}));

const initialiseSummaryTagsSettings = jest.fn();

describe('preferences', () => {
    it('should exist', () => {
        expect(init).toBeDefined();
    });

    it('should not initialise if the placeholder is missing', () => {
        init();
        expect(initialiseSummaryTagsSettings).not.toHaveBeenCalled();
    });
});
