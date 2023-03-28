/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { _ } from './prepare-permutive';

jest.mock('../../../../lib/raven');

const testPageConfig = {
	pageId: 'world/2019/nov/29',
	headline: 'Headline',
	contentType: 'Article',
	section: 'world',
	author: 'author1',
	keywords: 'world/nato,World news,France',
	webPublicationDate: 1575048268000,
	series: 'politics series',
	isPaidContent: false,
	edition: 'UK',
	toneIds: 'tone/news, tone/analysis',
};

const testUserConfig = {
	id: '123',
	accountCreatedDate: 1575048268000,
	displayName: 'display name',
	emailVerified: true,
	rawResponse: 'rawResponse',
};

const testOphanConfig = {
	pageViewId: 'pageViewId',
	browserId: 'browserId',
};

describe('Generating Permutive payload utils', () => {
	describe('isEmpty', () => {
		it('returns true for empty values', () => {
			const emptyValues = ['', undefined, null, [], {}];
			expect(true).toBe(true);
			emptyValues.forEach((emptyValue) =>
				expect(_.isEmpty(emptyValue)).toBe(true),
			);
		});

		it('returns false for non empty values', () => {
			const values = [
				'word',
				-1,
				0,
				42,
				2.35,
				['word'],
				{ word: true },
				true,
				false,
			];
			// @ts-expect-error -- this could be redundant, but let's not trust the window types
			values.forEach((value) => expect(_.isEmpty(value)).toBe(false));
		});
	});
	describe('removeEmpty', () => {
		it('returns a clean object without empty fields', () => {
			const emptyPayload = {
				content: {
					pageId: '',
					keywords: [],
					webPublicationDate: null,
					series: undefined,
					empty: {},
				},
				user: {},
			};

			const filledPayload = {
				content: {
					premium: false,
					id: 'Some Id',
					title: 'Title',
					type: 'Article',
					authors: ['The Author'],
				},
			};
			expect(
				_.removeEmpty({
					content: {
						...emptyPayload.content,
						...filledPayload.content,
					},
				}),
			).toEqual({ ...filledPayload });
		});
	});
	describe('generatePayload', () => {
		it('safely removes invalid authors or keywords', () => {
			const invalidValues = [undefined, null, '', {}, []];
			const expected = { user: { identity: false } };
			invalidValues.forEach((invalid) =>
				expect(
					_.generatePayload({
						// @ts-expect-error -- this could be redundant, but let's not trust the window types
						page: { author: invalid, keywords: invalid },
					}),
				).toEqual(expected),
			);
		});
		it('splits authors and keywords to an array correctly and trims whitespace', () => {
			const valid = {
				page: {
					...testPageConfig,
					author: ' author1 , author2 ',
					keywords: ' environment , travel ',
				},
				ophan: testOphanConfig,
			};

			const expected = {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				content: expect.objectContaining({
					authors: ['author1', 'author2'],
					keywords: ['environment', 'travel'],
				}),
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				user: expect.objectContaining({
					identity: false,
				}),
			};
			expect(_.generatePayload(valid)).toEqual(expected);
		});

		it('removes invalid date', () => {
			const invalidDates = ['bad date', '', null, undefined, [], {}];
			const expected = { user: { identity: false } };
			invalidDates.forEach((invalid) => {
				expect(
					_.generatePayload({
						// @ts-expect-error -- this could be redundant, but let's not trust the window types
						page: { webPublicationDate: invalid },
					}),
				).toEqual(expected);
			});
		});
		it('generates payload with valid ISO date', () => {
			const validConfig = {
				page: { ...testPageConfig, webPublicationDate: 1575037372000 },
				ophan: testOphanConfig,
			};

			const payload = _.generatePayload(validConfig);

			expect(payload).toHaveProperty(
				'content.publishedAt',
				'2019-11-29T14:22:52.000Z',
			);
			expect(payload).toHaveProperty('user.identity', false);
		});
		it('generates valid payload for `content` sub schema', () => {
			const config1 = {
				page: {
					...testPageConfig,
					isPaidContent: false,
					pageId: '',
					contentType: 'Network Front',
					section: 'uk',
				},
				ophan: testOphanConfig,
			};
			const expected1 = {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				content: expect.objectContaining({
					premium: false,
					type: 'Network Front',
					section: 'uk',
				}),
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				user: expect.objectContaining({
					identity: false,
				}),
			};
			const config2 = {
				page: {
					...testPageConfig,
					pageId: 'world/2019/nov/29',
					headline: 'Headline',
					contentType: 'Article',
					section: 'world',
					author: 'author1',
					keywords: 'world/nato,World news,France',
					webPublicationDate: 1575048268000,
					series: 'politics series',
				},
				ophan: testOphanConfig,
			};
			const expected2 = {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				content: expect.objectContaining({
					id: 'world/2019/nov/29',
					title: 'Headline',
					type: 'Article',
					section: 'world',
					authors: ['author1'],
					keywords: ['world/nato', 'World news', 'France'],
					publishedAt: '2019-11-29T17:24:28.000Z',
					series: 'politics series',
				}),
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				user: expect.objectContaining({
					identity: false,
				}),
			};
			const config3 = {
				page: {
					...testPageConfig,
					pageId: 'the-abcs-of-recruiting-teachers-remotely/2020/may/01/',
					headline: 'Teacher training',
					contentType: 'Article',
					section: 'the-abcs-of-recruiting-teachers-remotely',
					author: 'Ross Morrison McGill',
					keywords: 'The ABCs of recruiting teachers remotely',
					webPublicationDate: 1588334970000,
					tones: 'Advertisement Features', // ignored
					toneIds: 'tone/advertisement-features,tone/minutebyminute',
					edition: 'UK',
				},
				ophan: testOphanConfig,
			};
			const expected3 = {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				content: expect.objectContaining({
					id: 'the-abcs-of-recruiting-teachers-remotely/2020/may/01/',
					title: 'Teacher training',
					type: 'Article',
					section: 'the-abcs-of-recruiting-teachers-remotely',
					authors: ['Ross Morrison McGill'],
					keywords: ['The ABCs of recruiting teachers remotely'],
					publishedAt: '2020-05-01T12:09:30.000Z',
					tone: [
						'tone/advertisement-features',
						'tone/minutebyminute',
					],
				}),
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the assertion is any for some reason
				user: expect.objectContaining({
					edition: 'UK',
					identity: false,
				}),
			};

			expect(_.generatePayload(config1)).toEqual(expected1);
			expect(_.generatePayload(config2)).toEqual(expected2);
			expect(_.generatePayload(config3)).toEqual(expected3);
		});
		it('generates valid payload for `user` sub schema', () => {
			const config1 = { page: testPageConfig, ophan: testOphanConfig };

			const config2 = {
				page: {
					...testPageConfig,
					edition: 'UK',
				},
				ophan: testOphanConfig,
			};

			const payload2 = _.generatePayload(config2);

			const config3 = {
				page: testPageConfig,
				user: {
					...testUserConfig,
					id: '42',
				},
				ophan: testOphanConfig,
			};
			const payload3 = _.generatePayload(config3);

			expect(_.generatePayload(config1)).toHaveProperty(
				'user.identity',
				false,
			);

			expect(payload2).toHaveProperty('user.identity', false);
			expect(payload2).toHaveProperty('user.edition', 'UK');

			expect(payload3).toHaveProperty('user.identity', true);
		});
	});
	describe('generatePermutiveIdentities', () => {
		it('returns array containing ophan-tagged id if browser ID is present', () => {
			expect(
				_.generatePermutiveIdentities({
					page: testPageConfig,
					ophan: { browserId: 'abc123', pageViewId: 'def456' },
				}),
			).toEqual([{ tag: 'ophan', id: 'abc123' }]);
		});
		it('returns an empty array if there is no browser ID present', () => {
			expect(
				_.generatePermutiveIdentities({
					page: testPageConfig,
					ophan: { pageViewId: 'pvid' },
				}),
			).toEqual([]);
		});
		it('returns an empty array if an empty browser ID is present', () => {
			expect(
				_.generatePermutiveIdentities({
					page: testPageConfig,
					ophan: { browserId: '', pageViewId: 'pvid' },
				}),
			).toEqual([]);
		});
		it('returns an empty array if ophan config object is completely missing', () => {
			expect(
				_.generatePermutiveIdentities({
					page: testPageConfig,
				}),
			).toEqual([]);
		});
	});
	describe('runPermutive', () => {
		const validConfigForPayload = {
			page: { ...testPageConfig, section: 'uk' },
		};

		it('catches errors and calls the logger correctly when no global permutive', () => {
			const logger = jest.fn();
			_.runPermutive(
				{
					page: testPageConfig,
				},
				undefined,
				logger,
			);
			const err = (logger.mock.calls[0] as Error[])[0];
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe('Global Permutive setup error');
		});
		it('calls the permutive addon method with the correct payload', () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();

			_.runPermutive(validConfigForPayload, mockPermutive, logger);
			expect(mockPermutive.addon).toHaveBeenCalledWith('web', {
				page: {
					content: expect.objectContaining({ section: 'uk' }) as {
						section: 'uk';
					},
					user: expect.objectContaining({ identity: false }) as {
						identity: false;
					},
				},
			});
			expect(logger).not.toHaveBeenCalled();
		});
		it("calls permutive's identify method, passing the ophan browser ID", () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();
			const bwid = '1234567890abcdef';
			const config = {
				ophan: { browserId: bwid, pageViewId: 'pvid' },
				...validConfigForPayload,
			};

			_.runPermutive(config, mockPermutive, logger);
			expect(mockPermutive.identify).toHaveBeenCalledWith([
				{ tag: 'ophan', id: bwid },
			]);
			expect(logger).not.toHaveBeenCalled();
		});
		it("calls permutive's identify before it calls addon, if the browser ID is present", () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();
			const bwid = '1234567890abcdef';
			const config = {
				ophan: { browserId: bwid, pageViewId: 'pvid' },
				...validConfigForPayload,
			};

			_.runPermutive(config, mockPermutive, logger);
			const [identifyCallOrder] =
				mockPermutive.identify.mock.invocationCallOrder;
			const [addonCallOrder] =
				mockPermutive.addon.mock.invocationCallOrder;
			expect(identifyCallOrder).toBeLessThan(addonCallOrder);
		});
		it('does not call the identify method if no browser ID is present', () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();

			_.runPermutive(validConfigForPayload, mockPermutive, logger);
			expect(mockPermutive.identify).not.toHaveBeenCalled();
			expect(logger).not.toHaveBeenCalled();
		});
	});
});
