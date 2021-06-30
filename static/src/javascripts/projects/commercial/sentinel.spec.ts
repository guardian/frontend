//import raven from 'lib/raven';
import config_ from '../../lib/config';
//import { amIUsed } from './sentinel';
import type { amIUsed as amIUsed_ } from './sentinel';

const { amIUsed }: { amIUsed: typeof amIUsed_ } = jest.requireActual(
	'./sentinel',
);

const config = (config_ as unknown) as {
	get: jest.MockedFunction<(s: string, d: boolean) => boolean>;
};

//const PROD_ENDPOINT = '//logs.guardianapis.com/log';

const DEV_ENDPOINT = '//logs.code.dev-guardianapis.com/log';

/*
jest.mock('lib/raven', () => ({
	captureMessage: jest.fn(),
}));
*/
jest.mock('./sentinel', () => ({
	amIUsed: jest.fn(),
}));

jest.mock('../../lib/config', () => ({
	get: jest.fn(),
}));

const mockSendBeacon = () => {
	navigator.sendBeacon = jest.fn();
};

beforeEach(() => {
	mockSendBeacon();
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('sentinel', () => {
	test('does not send a message when switches.sentinelLogger is false', () => {
		config.get.mockReturnValue(false);
		amIUsed('functionName', 'moduleName');
		expect(navigator.sendBeacon as jest.Mock).not.toHaveBeenCalled();
	});

	test('does send a message when switches.sentinelLogger is true', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functioName');
		expect(navigator.sendBeacon as jest.Mock).toHaveBeenCalledTimes(1);
	});

	test('does not attach a label when it is not present', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(navigator.sendBeacon as jest.Mock).toHaveBeenCalledWith(
			DEV_ENDPOINT,
			expect.any(String),
		);
	});
	/*
	test('does attach a label when it is present', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName', 'label=test');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			'moduleName.functionName.label=test',
			expect.any(Object),
		);
	});

	test('does log the event at the info level', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ level: 'info' }),
		);
	});

	test('does use the commercial-sentinel tag', () => {
		config.get.mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ tags: { tag: 'commercial-sentinel' } }),
		);
	});
	*/
});
