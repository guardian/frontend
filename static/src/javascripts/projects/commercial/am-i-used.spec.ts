import type { amIUsed as amIUsed_, AmIUsedLoggingEvent } from './am-i-used';

const { amIUsed }: { amIUsed: typeof amIUsed_ } =
	jest.requireActual('./am-i-used');

jest.mock('../../lib/config');

const CODE_ENDPOINT = '//logs.code.dev-guardianapis.com/log';
const PROD_ENDPOINT = '//logs.guardianapis.com/log';
const TEST_URL = 'http://testurl.theguardian.com/';

const owner = 'commercial.amiused';
const defaultEvent: AmIUsedLoggingEvent = {
	label: owner,
};

jest.mock('../../lib/config', () => ({
	get: jest.fn(),
}));

navigator.sendBeacon = jest.fn();

afterEach(() => {
	jest.clearAllMocks();
});

describe('amIUsed', () => {
	test('should not send an event when switches.sentinelLogger is false', () => {
		window.guardian.config.switches.sentinelLogger = false;
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).not.toHaveBeenCalled();
	});

	test('should send an event when switches.sentinelLogger is true', () => {
		window.guardian.config.switches.sentinelLogger = true;
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
	});

	test('should use the correct logging CODE endpoint', () => {
		window.guardian.config.switches.sentinelLogger = true;
		window.guardian.config.page.isDev = true;
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledWith(
			CODE_ENDPOINT,
			expect.any(String),
		);
	});

	test('should use the correct logging DEV endpoint', () => {
		window.guardian.config.switches.sentinelLogger = true;
		window.guardian.config.page.isDev = false;
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledWith(
			PROD_ENDPOINT,
			expect.any(String),
		);
	});

	test('should not attach any extra properties if the property parameter is not passed', () => {
		amIUsed('moduleName', 'functionName');
		expect((navigator.sendBeacon as jest.Mock).mock.calls).toEqual([
			[
				CODE_ENDPOINT,
				JSON.stringify({
					...defaultEvent,
					properties: [
						{ name: 'module_name', value: 'moduleName' },
						{ name: 'function_name', value: 'functionName' },
						{ name: 'URL', value: TEST_URL },
					],
				}),
			],
		]);
	});

	test('should attach extra properties if they are passed as a parameter', () => {
		amIUsed('moduleName', 'functionName', { comment: 'test' });
		expect((navigator.sendBeacon as jest.Mock).mock.calls).toEqual([
			[
				CODE_ENDPOINT,
				JSON.stringify({
					...defaultEvent,
					properties: [
						{ name: 'module_name', value: 'moduleName' },
						{ name: 'function_name', value: 'functionName' },
						{ name: 'URL', value: TEST_URL },
						{ name: 'comment', value: 'test' },
					],
				}),
			],
		]);
	});

	test('should chain optional parameters to the properties array', () => {
		amIUsed('moduleName', 'functionName', {
			conditionA: 'true',
			conditionB: 'false',
		});
		expect((navigator.sendBeacon as jest.Mock).mock.calls).toEqual([
			[
				CODE_ENDPOINT,
				JSON.stringify({
					...defaultEvent,
					properties: [
						{ name: 'module_name', value: 'moduleName' },
						{ name: 'function_name', value: 'functionName' },
						{ name: 'URL', value: TEST_URL },
						{ name: 'conditionA', value: 'true' },
						{ name: 'conditionB', value: 'false' },
					],
				}),
			],
		]);
	});

	test('should correctly assign commercial.amiused as a label', () => {
		amIUsed('moduleName', 'functionName');
		expect((navigator.sendBeacon as jest.Mock).mock.calls).toEqual([
			[
				CODE_ENDPOINT,
				JSON.stringify({
					...defaultEvent,
					label: owner,
					properties: [
						{ name: 'module_name', value: 'moduleName' },
						{ name: 'function_name', value: 'functionName' },
						{ name: 'URL', value: TEST_URL },
					],
				}),
			],
		]);
	});
});
