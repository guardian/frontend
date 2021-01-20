import { addCountryGroupToSupportLink } from 'common/modules/commercial/support-utilities';
import { setGeolocation } from 'lib/geolocation';

describe('addCountryGroupToSupportLink', () => {
    test('adds country group to subscribe link', () => {
        setGeolocation('GB');
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/subscribe'
            )
        ).toEqual('https://support.theguardian.com/uk/subscribe');
    });

    test('adds country group to contribute link', () => {
        setGeolocation('FR');
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/contribute'
            )
        ).toEqual('https://support.theguardian.com/eu/contribute');
    });

    test('does not add country group to contribute link with country group already in it', () => {
        setGeolocation('GB');
        expect(
            addCountryGroupToSupportLink(
                'https://support.theguardian.com/int/contribute'
            )
        ).toEqual('https://support.theguardian.com/int/contribute');
    });
});
