import config from '../../../lib/config';
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

let mockShouldNotBeShownSupportMessaging: boolean;
jest.mock('common/modules/commercial/user-features', () => ({
	shouldNotBeShownSupportMessaging: () => {
		return mockShouldNotBeShownSupportMessaging;
	},
}));

describe('checkBrazeDependecies', () => {
	it('succeeds if all dependencies are fulfilled', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(true);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
			consent: true,
			isNotPaidContent: true,
			brazeUuid: 'fake-uuid',
			userIsGuSupporter: true,
		});
	});

	it('fails if the switch is disabled', async () => {
		config.set('switches.brazeSwitch', false);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({});
	});

	it('fails if the api key is not set', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', '');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();
		console.log(got);
		console.log(window.guardian);

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
		});
	});

	it('fails if the brazeUuid is not available', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = null;
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
		});
	});

	it('fails if the required consents are not given', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(false);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			brazeUuid: 'fake-uuid',
			apiKey: 'fake-api-key',
		});
	});

	it('fails if support messaging is not hidden', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = false;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
			consent: true,
			brazeUuid: 'fake-uuid',
		});
	});

	it('fails if the page is a paid content page', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', true);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.resolve(true);
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			apiKey: 'fake-api-key',
			consent: true,
			brazeUuid: 'fake-uuid',
			userIsGuSupporter: true,
		});
	});

	it('fails if any underlying async operation fails', async () => {
		config.set('switches.brazeSwitch', true);
		config.set('page.brazeApiKey', 'fake-api-key');
		config.set('page.isPaidContent', false);
		mockBrazeUuid = 'fake-uuid';
		mockConsentsPromise = Promise.reject(new Error('something went wrong'));
		mockShouldNotBeShownSupportMessaging = true;

		const got = await checkBrazeDependencies();

		expect(got.isSuccessful).toEqual(false);
		expect(got.data).toEqual({
			brazeSwitch: true,
			brazeUuid: 'fake-uuid',
			apiKey: 'fake-api-key',
		});
	});
});
