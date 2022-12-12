import { checkBrazeDependencies } from './checkBrazeDependencies';

let mockBrazeUuid: string | null;
jest.mock('./getBrazeUuid', () => ({
	getBrazeUuid: () => {
		return Promise.resolve(mockBrazeUuid);
	},
}));

let mockConsentsPromise: Promise<boolean>;
jest.mock('./hasRequiredConsents', () => ({
	hasRequiredConsents: () => {
		return mockConsentsPromise;
	},
}));

let mockConfigRecord: Record<string, string | boolean | undefined>;
jest.mock('../../../../../lib/config', () => ({
	get: (key: string) => mockConfigRecord[key],
}));

describe('checkBrazeDependecies', () => {
	afterEach(() => {
		// Wait for any unsettled promises to complete at the end of each test. Once
		// we encounter a failure in our list of checks we don't need to wait on
		// subsequent operations to complete which is why there might be unsettled
		// promises.
		const flushPromises = new Promise(setImmediate);
		return flushPromises;
	});

	it('succeeds if all dependencies are fulfilled', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(true);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
			consent: true,
			isNotPaidContent: true,
			brazeUuid: 'fake-uuid',
		});
	});

	it('fails if the switch is disabled', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': false,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('brazeSwitch');
			expect(got.failure.data).toEqual(false);
		}
	});

	it('returns the apiKey if the switch is disabled', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': false,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			apiKey: 'fake-api-key',
		});
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('brazeSwitch');
		}
	});

	it('fails if the api key is not set', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': undefined,
			'page.isPaidContent': false,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('apiKey');
			expect(got.failure.data).toEqual(undefined);
		}
	});

	it('fails if the brazeUuid is not available', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = null;
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
		});
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('brazeUuid');
			expect(got.failure.data).toEqual(null);
		}
	});

	it('fails if the required consents are not given', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(false);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			brazeUuid: 'fake-uuid',
			apiKey: 'fake-api-key',
		});
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('consent');
			expect(got.failure.data).toEqual(false);
		}
	});

	it('fails if the page is a paid content page', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': true,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
			consent: true,
			brazeUuid: 'fake-uuid',
		});
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('isNotPaidContent');
			expect(got.failure.data).toEqual(false);
		}
	});

	it('fails if any underlying async operation fails', async () => {
		mockConfigRecord = {
			'page.brazeApiKey': 'fake-api-key',
			'page.isPaidContent': false,
			'switches.brazeSwitch': true,
		};
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.reject(new Error('something went wrong'));

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			brazeUuid: 'fake-uuid',
			apiKey: 'fake-api-key',
		});
		// Condition to keep TypeScript happy
		if (!got.isSuccessful) {
			expect(got.failure.field).toEqual('consent');
			expect(got.failure.data).toEqual('something went wrong');
		}
	});
});
