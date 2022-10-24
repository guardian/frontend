import Chance from 'chance';
import config from 'lib/config';
import { fetchJson } from './fetch-json';

const chance = new Chance();

global.fetch = jest.fn();
const fetchSpy = global.fetch;

describe('Fetch JSON util', () => {
	beforeAll(() => {
		window.guardian.config.page.ajaxUrl = 'ajax.url/';
	});

	it('returns a promise which rejects on network errors', (done) => {
		const error = new Error(chance.string());
		fetchSpy.mockReturnValueOnce(Promise.reject(error));

		fetchJson('error-path')
			.catch((ex) => {
				expect(ex).toBe(error);
			})
			.then(done)
			.catch(done.fail);
	});

	it('returns a promise with empty object on 204 errors', (done) => {
		const empty = {};
		fetchSpy.mockReturnValueOnce(
			Promise.resolve({
				ok: true,
				status: 204,
				json() {
					return Promise.resolve(empty);
				},
			}),
		);

		fetchJson('204-no-content')
			.then((response) => {
				expect(response).toStrictEqual(empty);
			})
			.then(done)
			.catch(done.fail);
	});

	it('returns a promise which rejects invalid json responses', (done) => {
		fetchSpy.mockReturnValueOnce(
			Promise.resolve({
				ok: true,
				json() {
					return chance.string().json();
				},
			}),
		);

		fetchJson('404-error-response')
			.catch((ex) => {
				expect(ex instanceof Error).toBe(true);
				expect(ex.message).toMatch(/JSON/i);
			})
			.then(done)
			.catch(done.fail);
	});

	it('resolves a correct response in json', (done) => {
		const jsonData = {
			[chance.string()]: chance.string(),
		};

		fetchSpy.mockReturnValueOnce(
			Promise.resolve({
				ok: true,
				json() {
					return Promise.resolve(jsonData);
				},
			}),
		);

		fetchJson('correct-json')
			.then((response) => {
				expect(response).toEqual(jsonData);
			})
			.then(done)
			.catch(done.fail);
	});

    it('handles fully qualified URLs', (done) => {
        fetchSpy.mockReturnValueOnce(
            Promise.resolve({
                ok: true,
                json() {
                    return Promise.resolve({})
                }
            })
        )

        const url = 'https://example.com';
        fetchJson(url).then((response) => {
            expect(response).toEqual({});
            expect(fetchSpy).toHaveBeenLastCalledWith(url, {})
        }).then(done)
        .catch(done.fail)

    })
});
