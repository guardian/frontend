// @flow

import Chance from 'chance';
import fetchSpy from 'lib/fetch';
import fetchJson from './fetch-json';

const chance = new Chance();

jest.mock('lib/config', () => ({
    page: {
        ajaxUrl: 'foo',
    },
}));

jest.mock('lib/fetch', () => jest.fn());

describe('Fetch JSON util', () => {
    it('returns a promise which rejects on network errors', done => {
        const error = new Error(chance.string());
        fetchSpy.mockReturnValueOnce(Promise.reject(error));

        fetchJson('error-path')
            .catch(ex => {
                expect(ex).toBe(error, 'rejects an error');
            })
            .then(done)
            .catch(done.fail);
    });

    it('returns a promise which rejects invalid json responses', done => {
        fetchSpy.mockReturnValueOnce(
            Promise.resolve({
                text() {
                    return Promise.resolve(chance.string());
                },
            })
        );

        fetchJson('404-error-response')
            .catch(ex => {
                expect(ex instanceof Error).toBe(true, 'rejects an error');
                expect(ex.message).toMatch(/JSON/i);
            })
            .then(done)
            .catch(done.fail);
    });

    it('resolves a correct response in json', done => {
        const jsonData = {
            [chance.string()]: chance.string(),
        };

        fetchSpy.mockReturnValueOnce(
            Promise.resolve({
                text() {
                    return Promise.resolve(JSON.stringify(jsonData));
                },
            })
        );

        fetchJson('correct-json')
            .then(response => {
                expect(response).toEqual(jsonData);
            })
            .then(done)
            .catch(done.fail);
    });
});
