import { ajax } from 'lib/ajax';

jest.mock('lib/raven');
jest.mock('lib/config');

global.fetch = jest.fn();
const fetchSpy = global.fetch;

const defaultInit = {
    body: undefined,
    credentials: undefined,
    headers: undefined,
    mode: undefined
}

describe('ajax', () => {
    beforeEach(() => {
        ajax.setHost('http://api.nextgen.guardianapps.co.uk');
        fetchSpy.mockImplementation(() => ({
            then() {},
        }));
    });

    afterEach(() => {
        fetchSpy.mockReset();
    });

    it('should proxy calls to fetch', () => {
        ajax({ url: '/endpoint.json', data: 'value' });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://api.nextgen.guardianapps.co.uk/endpoint.json',
            {
                ...defaultInit,
                mode: 'cors',
                body: JSON.stringify('value'),
        });
    });

    it('should handle contentType', () => {
        ajax({ url: '/endpoint.json', contentType: 'application/json' });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://api.nextgen.guardianapps.co.uk/endpoint.json',
            {
                ...defaultInit,
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
        });
    });

    it('should handle withCredentials', () => {
        ajax({ url: '/endpoint.json', withCredentials: true });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://api.nextgen.guardianapps.co.uk/endpoint.json',
            {
                ...defaultInit,
                mode: 'cors',
                credentials: 'include',
        });
    });

    it('should not touch a url that is already absolute', () => {
        ajax({ url: 'http://apis.guardian.co.uk/endpoint.json' });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://apis.guardian.co.uk/endpoint.json',
            defaultInit
        );
    });

    it('should not touch a url that is already absolute (https)', () => {
        ajax({ url: 'https://apis.guardian.co.uk/endpoint.json' });

        expect(fetchSpy).toHaveBeenCalledWith(
            'https://apis.guardian.co.uk/endpoint.json',
            defaultInit
        );
    });

    it('should not touch a protocol-less url', () => {
        ajax({ url: '//apis.guardian.co.uk/endpoint.json' });

        expect(fetchSpy).toHaveBeenCalledWith(
            '//apis.guardian.co.uk/endpoint.json',
            defaultInit
        );
    });

    it('should be able to update host', () => {
        ajax.setHost('http://apis.guardian.co.uk');
        ajax({ url: '/endpoint.json' });

        expect(fetchSpy).toHaveBeenCalledWith(
            'http://apis.guardian.co.uk/endpoint.json',
            {
                ...defaultInit,
                mode: 'cors',
        });
    });
});
