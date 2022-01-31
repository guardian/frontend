import { trackNativeAdLinkClick as _trackNativeAdLinkClick } from '../../../common/modules/analytics/google';
import { _ } from './click';

const { sendClick } = _;

jest.mock('../../../common/modules/analytics/google', () => ({
	trackNativeAdLinkClick: jest.fn(),
}));

const trackNativeAdLinkClick = _trackNativeAdLinkClick as jest.Mock;

describe('Cross-frame messenger: sendClick', () => {
	it('should call trackNativeAdLinkClick', () => {
		trackNativeAdLinkClick.mockReset();

		const fakeAdSlot = document.createElement('div');
		sendClick(fakeAdSlot, 'name');

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect(trackNativeAdLinkClick.mock.calls).toEqual([['', 'name']]);
	});

	it('should call trackNativeAdLinkClick with div id', () => {
		trackNativeAdLinkClick.mockReset();

		const fakeAdSlot = document.createElement('div');
		fakeAdSlot.setAttribute('id', 'fakeAdSlotId');
		sendClick(fakeAdSlot, 'name');

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect(trackNativeAdLinkClick.mock.calls).toEqual([
			['fakeAdSlotId', 'name'],
		]);
	});
});
