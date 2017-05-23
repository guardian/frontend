// @flow
import { initLiveblogAdverts, _ } from './liveblog-adverts';

const { getSlotName } = _;

describe('Liveblog Dynamic Adverts', () => {
    it('should exist', () => {
        expect(initLiveblogAdverts).toBeDefined();
    });

    it('should return the correct slot name', () => {
        const firstMobileSlot = getSlotName(true, 0);
        const otherMobileSlot = getSlotName(true, 2);
        const desktopSlot = getSlotName(false, 0);

        expect(firstMobileSlot).toBe('top-above-nav');
        expect(otherMobileSlot).toBe('inline2');
        expect(desktopSlot).toBe('inline1');
    });
});
