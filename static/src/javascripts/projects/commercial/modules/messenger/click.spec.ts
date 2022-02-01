import { trackNativeAdLinkClick } from '../../../common/modules/analytics/google';
import { _ } from './click';

const { sendClick } = _;

jest.mock('../../../common/modules/analytics/google', () => ({
	trackNativeAdLinkClick: jest.fn(),
}));

describe('Cross-frame messenger: sendClick', () => {
	it('should call (trackNativeAdLinkClick as jest.Mock)', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		const fakeAdSlot = document.createElement('div');
		sendClick(fakeAdSlot, 'name');

		expect(trackNativeAdLinkClick as jest.Mock).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			['', 'name'],
		]);
	});

	it('should call (trackNativeAdLinkClick as jest.Mock) with div id', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		const fakeAdSlot = document.createElement('div');
		fakeAdSlot.setAttribute('id', 'fakeAdSlotId');
		sendClick(fakeAdSlot, 'name');

		expect(trackNativeAdLinkClick as jest.Mock).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			['fakeAdSlotId', 'name'],
		]);
	});
});
