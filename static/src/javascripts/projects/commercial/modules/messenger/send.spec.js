import { postMessage } from './post-message';
import { send } from './send';

jest.mock('./post-message', () => ({
	postMessage: jest.fn(),
}));

describe('Cross-frame messenger: send', () => {
	it('should exist', () => {
		expect(send).toBeDefined();
	});

	it('should post a message with an id', () => {
		const type = 'a_type';
		const value = 'a_payload';
		const id = send(type, value);
		expect(id).toMatch(/[a-z0-9]{10}/);
		expect(postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				id,
				iframeId: expect.any(String),
				type,
				value,
			}),
			expect.any(Object),
			'*',
		);
	});
});
