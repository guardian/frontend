import MockDate from 'mockdate';
import config_ from '../../lib/config';
import type { amIUsed as amIUsed_, SentinelLoggingEvent } from './sentinel';

const { amIUsed }: { amIUsed: typeof amIUsed_ } = jest.requireActual(
	'./sentinel',
);

const config = (config_ as unknown) as {
	get: jest.MockedFunction<(s: string, d: boolean) => boolean>;
};

MockDate.set(new Date('2021-01-01T00:00:00Z'));

const CODE_ENDPOINT = '//logs.code.dev-guardianapis.com/log';
const PROD_ENDPOINT = '//logs.guardianapis.com/log';
const TEST_URL = 'http://testurl.theguardian.com/';

const owner = 'commercial.sentinel';
const mockDate = new Date();
const defaultEvent: SentinelLoggingEvent = {
	received_timestamp: mockDate,
	received_date: mockDate.toISOString().slice(0, 10),
	label: owner,
};

jest.mock('../../lib/config', () => ({
	get: jest.fn(),
}));

beforeEach(() => {
	navigator.sendBeacon = jest.fn();
});

afterEach(() => {
	jest.clearAllMocks();
});

afterAll(() => {
	MockDate.reset();
});

describe('sentinel', () => {
	test('should not send an event when switches.sentinelLogger is false', () => {
		config.get.mockReturnValue(false);
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon as jest.Mock).not.toHaveBeenCalled();
	});

	test('should send an event when switches.sentinelLogger is true', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon as jest.Mock).toHaveBeenCalledTimes(1);
	});

	test('should use the correct logging CODE endpoint', () => {
		config.get.mockReturnValueOnce(true).mockReturnValueOnce(true); // first get checks switches.sentinelLogger, the second page.isDev
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon as jest.Mock).toHaveBeenCalledWith(
			CODE_ENDPOINT,
			expect.any(String),
		);
	});

	test('should use the correct logging DEV endpoint', () => {
		config.get.mockReturnValueOnce(true).mockReturnValueOnce(false); // first get checks switches.sentinelLogger, the second page.isDev
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon as jest.Mock).toHaveBeenCalledWith(
			PROD_ENDPOINT,
			expect.any(String),
		);
	});

	test('should not attach any extra properties if the property parameter is not passed', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		console.log((navigator.sendBeacon as jest.Mock).mock.calls);
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
		config.get.mockReturnValue(true);
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

	test('should convert parameter values to strings', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName', {
			conditionA: true,
			conditionB: false,
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
		config.get.mockReturnValue(true);
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
