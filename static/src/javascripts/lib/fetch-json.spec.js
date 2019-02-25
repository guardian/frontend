// @flow

import Chance from 'chance';
import fetchJson from './fetch-json';

const chance = new Chance();

jest.mock('lib/config', () => {
    const defaultConfig = {
        page: {
            ajaxUrl: 'foo',
        },
    };

    return Object.assign({}, defaultConfig, {
        get: (path: string = '', defaultValue: any) =>
            path
                .replace(/\[(.+?)\]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
    });
});

jest.mock('lib/fetch', () => jest.fn());
const fetchSpy: any = require('lib/fetch');

describe('Fetch JSON util', () => {
    it('returns a promise which rejects on network errors', done => {
        const error = new Error(chance.string());
        fetchSpy.mockReturnValueOnce(Promise.reject(error));

        fetchJson('error-path')
            .catch(ex => {
                expect(ex).toBe(error);
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
                expect(ex instanceof Error).toBe(true);
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
