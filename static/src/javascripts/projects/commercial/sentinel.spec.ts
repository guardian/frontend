import { mocked } from 'ts-jest/utils';
import raven_ from 'lib/raven';
import config_ from '../../lib/config';
import type { amIUsed as amIUsed_ } from './sentinel';

const { amIUsed }: { amIUsed: typeof amIUsed_ } = jest.requireActual(
	'./sentinel',
);

const raven = raven_;

const config = config_ as {
	get: (s: string, d: boolean) => boolean;
};

jest.mock('lib/raven', () => ({
	captureMessage: jest.fn(),
}));

jest.mock('../../lib/config', () => ({
	get: jest.fn(),
}));

describe('sentinel', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('does not send a message when switches.sentinelLogger is false', () => {
		mocked(config.get).mockReturnValue(false);
		amIUsed('moduleName', 'functioName');
		expect(raven.captureMessage).not.toHaveBeenCalled();
	});

	test('does send a message when switches.sentinelLogger is true', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functioName');
		expect(raven.captureMessage).toHaveBeenCalledTimes(1);
	});

	test('does not attach a label when it is not present', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			'moduleName.functionName',
			expect.any(Object),
		);
	});

	test('does attach a label when it is present', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functionName', 'label=test');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			'moduleName.functionName.label=test',
			expect.any(Object),
		);
	});

	test('does log the event at the info level', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ level: 'info' }),
		);
	});

	test('does use the commercial-sentinel tag', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functionName');
		expect(raven.captureMessage).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ tags: { tag: 'commercial-sentinel' } }),
		);
	});
});
