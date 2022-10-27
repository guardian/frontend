import { reportError as reportErrorMock } from 'lib/report-error';
import {
	fetchNonRefreshableLineItemIds,
	memoizedFetchNonRefreshableLineItemIds,
} from './non-refreshable-line-items';

jest.mock('lib/report-error', () => jest.fn());

describe('nonRefreshableLineItems', () => {
	it('returns the same IDs as the API', async () => {
		const response = {
			ok: true,
			json: () => Promise.resolve([1, 2, 3]),
		};

		Object.defineProperty(window, 'fetch', {
			value: jest.fn().mockReturnValue(Promise.resolve(response)),
			writable: true,
		});

		const ids = await fetchNonRefreshableLineItemIds();

		expect(reportErrorMock).not.toHaveBeenCalled();

		expect(ids).toEqual([1, 2, 3]);
	});

	it('throws error when the API returns a non-array', async () => {
		const response = {
			ok: true,
			json: () => Promise.resolve({ foo: 'bar' }),
		};

		Object.defineProperty(window, 'fetch', {
			value: jest.fn().mockReturnValue(Promise.resolve(response)),
			writable: true,
		});

		await expect(fetchNonRefreshableLineItemIds()).rejects.toThrow(
			'Failed to parse non-refreshable line items as an array',
		);

		expect(reportErrorMock).not.toHaveBeenCalled();
	});

	it('returns undefined when the API returns string array', async () => {
		const response = {
			ok: true,
			json: () => Promise.resolve(['1', '2', '3']),
		};

		Object.defineProperty(window, 'fetch', {
			value: jest.fn().mockReturnValue(Promise.resolve(response)),
			writable: true,
		});

		await expect(fetchNonRefreshableLineItemIds()).rejects.toThrow(
			'Failed to parse element in non-refreshable line item array as number',
		);

		expect(reportErrorMock).not.toHaveBeenCalled();
	});

	it('returns undefined and reports error when the API call fails', async () => {
		const response = {
			ok: false,
			status: 404,
		};

		Object.defineProperty(window, 'fetch', {
			value: jest.fn().mockReturnValue(Promise.resolve(response)),
			writable: true,
		});

		await expect(fetchNonRefreshableLineItemIds()).rejects.toThrow(
			'Failed to fetch non-refreshable line items',
		);

		expect(reportErrorMock).toHaveBeenCalledWith(
			new Error('Failed to fetch non-refreshable line items'),
			{
				feature: 'commercial',
				status: 404,
			},
			false,
		);
	});
});

describe('memoizedFetchNonRefreshableLineItemIds', () => {
	it('should only call fetch once', async () => {
		const response = {
			ok: true,
			json: () => Promise.resolve([1, 2, 3]),
		};

		Object.defineProperty(window, 'fetch', {
			value: jest.fn().mockReturnValue(Promise.resolve(response)),
			writable: true,
		});

		const ids = await memoizedFetchNonRefreshableLineItemIds();
		const ids2 = await memoizedFetchNonRefreshableLineItemIds();
		const ids3 = await memoizedFetchNonRefreshableLineItemIds();

		expect(ids).toEqual([1, 2, 3]);
		expect(ids2).toEqual([1, 2, 3]);
		expect(ids3).toEqual([1, 2, 3]);
		expect(window.fetch).toHaveBeenCalledTimes(1);
	});
});
