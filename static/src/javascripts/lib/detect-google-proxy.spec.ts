import { isGoogleProxy } from './detect-google-proxy';

const fakeUserAgent = (userAgent: string) => {
	Object.defineProperty(navigator, 'userAgent', {
		get: () => userAgent,
		configurable: true,
	});
};

describe('Detect Google Proxy', () => {
	it('isGoogleWebPreview should return false with a valid User Agent', () => {
		fakeUserAgent('Firefox');
		expect(isGoogleProxy()).toBe(false);
	});

	it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
		fakeUserAgent('Google Web Preview');
		expect(isGoogleProxy()).toBe(true);
	});

	it('isGoogleWebPreview should return true with Google Web Preview useragent', () => {
		fakeUserAgent('googleweblight');
		expect(isGoogleProxy()).toBe(true);
	});
});
