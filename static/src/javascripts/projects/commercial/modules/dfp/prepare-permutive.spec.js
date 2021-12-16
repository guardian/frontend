import { _ } from './prepare-permutive';

jest.mock('../../../../lib/raven');

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
						page: { author: invalid, keywords: invalid },
					}),
				).toEqual(expected),
			);
		});
		it('splits authors and keywords to an array correctly', () => {
			const valid = {
				page: {
					author: 'author1,author2',
					keywords: 'environment,travel',
				},
			};

			const expected = {
				content: {
					authors: ['author1', 'author2'],
					keywords: ['environment', 'travel'],
				},
				user: {
					identity: false,
				},
			};
			expect(_.generatePayload(valid)).toEqual(expected);
		});
		it('splits authors and keywords to an array correctly and trims whitespace', () => {
			const valid = {
				page: {
					author: 'author1, author2',
					keywords: 'environment , travel',
				},
			};

			const expected = {
				content: {
					authors: ['author1', 'author2'],
					keywords: ['environment', 'travel'],
				},
				user: {
					identity: false,
				},
			};
			expect(_.generatePayload(valid)).toEqual(expected);
		});
		it('removes invalid date', () => {
			const invalidDates = ['bad date', '', null, undefined, [], {}];
			const expected = { user: { identity: false } };
			invalidDates.forEach((invalid) => {
				expect(
					_.generatePayload({
						page: { webPublicationDate: invalid },
					}),
				).toEqual(expected);
			});
		});
		it('generates payload with valid ISO date', () => {
			const validConfig = { page: { webPublicationDate: 1575037372000 } };
			const expected = {
				content: { publishedAt: '2019-11-29T14:22:52.000Z' },
				user: { identity: false },
			};
			expect(_.generatePayload(validConfig)).toEqual(expected);
		});
		it('generates valid payload for `content` sub schema', () => {
			const config1 = {
				page: {
					isPaidContent: false,
					pageId: '',
					contentType: 'Network Front',
					section: 'uk',
				},
			};
			const expected1 = {
				content: {
					premium: false,
					type: 'Network Front',
					section: 'uk',
				},
				user: {
					identity: false,
				},
			};
			const config2 = {
				page: {
					pageId: 'world/2019/nov/29',
					headline: 'Headline',
					contentType: 'Article',
					section: 'world',
					author: 'author1',
					keywords: 'world/nato,World news,France',
					webPublicationDate: 1575048268000,
					series: 'politics series',
				},
			};
			const expected2 = {
				content: {
					id: 'world/2019/nov/29',
					title: 'Headline',
					type: 'Article',
					section: 'world',
					authors: ['author1'],
					keywords: ['world/nato', 'World news', 'France'],
					publishedAt: '2019-11-29T17:24:28.000Z',
					series: 'politics series',
				},
				user: {
					identity: false,
				},
			};
			const config3 = {
				page: {
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
			};
			const expected3 = {
				content: {
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
				},
				user: {
					edition: 'UK',
					identity: false,
				},
			};

			expect(_.generatePayload(config1)).toEqual(expected1);
			expect(_.generatePayload(config2)).toEqual(expected2);
			expect(_.generatePayload(config3)).toEqual(expected3);
		});
		it('generates valid payload for `user` sub schema', () => {
			const config1 = { page: {}, user: {} };
			const expected1 = {
				user: {
					identity: false,
				},
			};
			const config2 = {
				page: {
					edition: 'UK',
				},
			};
			const expected2 = {
				user: {
					identity: false,
					edition: 'UK',
				},
			};
			const config3 = {
				page: {},
				user: {
					id: 42,
				},
			};
			const expected3 = {
				user: {
					identity: true,
				},
			};
			expect(_.generatePayload(config1)).toEqual(expected1);
			expect(_.generatePayload(config2)).toEqual(expected2);
			expect(_.generatePayload(config3)).toEqual(expected3);
		});
	});
	describe('generatePermutiveIdentities', () => {
		it('returns array containing ophan-tagged id if browser ID is present', () => {
			expect(
				_.generatePermutiveIdentities({
					ophan: { browserId: 'abc123' },
				}),
			).toEqual([{ tag: 'ophan', id: 'abc123' }]);
		});
		it('returns an empty array if there is no browser ID present', () => {
			expect(
				_.generatePermutiveIdentities({
					ophan: { pageViewId: 'pvid' },
				}),
			).toEqual([]);
		});
		it('returns an empty array if an empty browser ID is present', () => {
			expect(
				_.generatePermutiveIdentities({ ophan: { browserId: '' } }),
			).toEqual([]);
		});
		it('returns an empty array if ophan config object is completely missing', () => {
			expect(_.generatePermutiveIdentities({})).toEqual([]);
		});
	});
	describe('runPermutive', () => {
		const validConfigForPayload = { page: { section: 'uk' } };

		it('catches errors and calls the logger correctly when no global permutive', () => {
			const logger = jest.fn();
			_.runPermutive({}, undefined, logger);
			const err = logger.mock.calls[0][0];
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe('Global Permutive setup error');
		});
		it('calls the permutive addon method with the correct payload', () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();

			_.runPermutive(validConfigForPayload, mockPermutive, logger);
			expect(mockPermutive.addon).toHaveBeenCalledWith('web', {
				page: { content: { section: 'uk' }, user: { identity: false } },
			});
			expect(logger).not.toHaveBeenCalled();
		});
		it("calls permutive's identify method, passing the ophan browser ID", () => {
			const mockPermutive = { addon: jest.fn(), identify: jest.fn() };
			const logger = jest.fn();
			const bwid = '1234567890abcdef';
			const config = {
				ophan: { browserId: bwid },
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
				ophan: { browserId: bwid },
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
