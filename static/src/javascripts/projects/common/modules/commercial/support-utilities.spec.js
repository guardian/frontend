// @flow

import { addCountryGroupToSupportLink } from 'common/modules/commercial/support-utilities';

describe('addCountryGroupToSupportLink', () => {
    test('adds country group to subscribe link', () => {
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/subscribe',
                'uk'
            )
        ).toEqual('https://support.theguardian.com/uk/subscribe');
    });

    test('adds country group to contribute link', () => {
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/contribute',
                'int'
            )
        ).toEqual('https://support.theguardian.com/int/contribute');
    });

    test('does not add country group to contribute link with country group already in it', () => {
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/int/contribute',
                'uk'
            )
        ).toEqual('https://support.theguardian.com/int/contribute');
    });
});
