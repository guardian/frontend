import config from '../../lib/config';
import type { amIUsed as amIUsed_, AmIUsedLoggingEvent } from './am-i-used';

const { amIUsed }: { amIUsed: typeof amIUsed_ } =
	jest.requireActual('./sentinel');

jest.mock('../../lib/config');

const CODE_ENDPOINT = '//logs.code.dev-guardianapis.com/log';
const PROD_ENDPOINT = '//logs.guardianapis.com/log';
const TEST_URL = 'http://testurl.theguardian.com/';

const owner = 'commercial.sentinel';
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

describe('sentinel', () => {
	test('should not send an event when switches.sentinelLogger is false', () => {
		(config.get as jest.Mock).mockReturnValue(false);
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).not.toHaveBeenCalled();
	});

	test('should send an event when switches.sentinelLogger is true', () => {
		(config.get as jest.Mock).mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
	});

	test('should use the correct logging CODE endpoint', () => {
		(config.get as jest.Mock)
			.mockReturnValueOnce(true) // for `switches.sentinelLogger`
			.mockReturnValueOnce(true); // for `page.isDev`
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledWith(
			CODE_ENDPOINT,
			expect.any(String),
		);
	});

	test('should use the correct logging DEV endpoint', () => {
		(config.get as jest.Mock)
			.mockReturnValueOnce(true) // for `switches.sentinelLogger`
			.mockReturnValueOnce(false); // for `page.isDev`
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon).toHaveBeenCalledWith(
			PROD_ENDPOINT,
			expect.any(String),
		);
	});

	test('should not attach any extra properties if the property parameter is not passed', () => {
		(config.get as jest.Mock).mockReturnValue(true);
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
		(config.get as jest.Mock).mockReturnValue(true);
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
		(config.get as jest.Mock).mockReturnValue(true);
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

	test('should correctly assign commercial.sentinel as a label', () => {
		(config.get as jest.Mock).mockReturnValue(true);
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
