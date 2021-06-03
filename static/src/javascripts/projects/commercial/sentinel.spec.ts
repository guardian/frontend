import { mocked } from 'ts-jest/utils';
import raven_ from 'lib/raven';
import config_ from '../../lib/config';
import { amIUsed } from './sentinel';

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
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('does not send a message when switches.sentinelLogger defaults to false', () => {
		amIUsed('moduleName', 'functioName');
		expect(raven.captureMessage).not.toHaveBeenCalled();
	});

	test('does not send a message when switches.sentinelLogger is false', () => {
		amIUsed('moduleName', 'functioName');
		mocked(config.get).mockReturnValue(false);
		expect(raven.captureMessage).not.toHaveBeenCalled();
	});

	test('does send a message when switches.sentinelLogger is true', () => {
		mocked(config.get).mockReturnValue(true);
		amIUsed('moduleName', 'functioName');
		expect(raven.captureMessage).toHaveBeenCalledTimes(1);
	});
});
