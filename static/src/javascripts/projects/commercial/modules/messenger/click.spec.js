// @flow
import type { JestMockT } from 'jest';

import { trackNativeAdLinkClick } from 'common/modules/analytics/google';
import { register } from 'commercial/modules/messenger';
import { _ } from './click';

const { sendClick } = _;

// Jest understands `register.mock.calls`, however, Flow gets angry because:
// 'property mock not found in statics of function'. This is a helper to allow
// `expect(register.mock.calls[0][0]).toBe('click');` to pass linting
const foolFlow = (mockFn: any) => ((mockFn: any): JestMockT);

jest.mock('common/modules/analytics/google', () => ({
    trackNativeAdLinkClick: jest.fn(),
}));

jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

describe('Cross-frame messenger: sendClick', () => {
    it('should call register', () => {
        expect(register).toHaveBeenCalled();
        expect(foolFlow(register).mock.calls[0][0]).toBe('click');
    });

    it('should call trackNativeAdLinkClick', () => {
        const fakeAdSlot = document.createElement('div');
        sendClick(fakeAdSlot, 'name');

        expect(trackNativeAdLinkClick).toHaveBeenCalled();
        expect(foolFlow(trackNativeAdLinkClick).mock.calls[0][1]).toBe('name');
    });
});
