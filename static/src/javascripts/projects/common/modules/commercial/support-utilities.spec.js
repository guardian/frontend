import { addCountryGroupToSupportLink } from './support-utilities';
import { getCookie } from '../../../../lib/cookies';

jest.mock('../../../../lib/cookies', () => ({
    getCookie: jest.fn(() => null),
}));

jest.mock('lib/raven');

describe('addCountryGroupToSupportLink', () => {
    beforeEach(() => {
        getCookie.mockImplementation(() => null);
    });

    test('adds country group to subscribe link', async () => {
        getCookie.mockImplementation(() => 'GB');
        expect(
            await addCountryGroupToSupportLink(
                'https://support.theguardian.com/subscribe'
            )
        ).toEqual('https://support.theguardian.com/uk/subscribe');
    });

    test('adds country group to contribute link', async () => {
        getCookie.mockImplementation(() => 'FR');
        expect(
            await addCountryGroupToSupportLink(
                'https://support.theguardian.com/contribute'
            )
        ).toEqual('https://support.theguardian.com/eu/contribute');
    });

    test('does not add country group to contribute link with country group already in it', async () => {
        getCookie.mockImplementation(() => 'GB');
        expect(
            await addCountryGroupToSupportLink(
                'https://support.theguardian.com/int/contribute'
            )
        ).toEqual('https://support.theguardian.com/int/contribute');
    });
});
