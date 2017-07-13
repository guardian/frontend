// @flow

import { Sticky } from 'common/modules/ui/sticky';
import { initPaidForBand } from './paidfor-band';

jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        paidforBand: true,
    },
}));

jest.mock('common/modules/ui/sticky', () => ({
    Sticky: class {},
}));

describe('Paid for band', () => {
    it('should exist', () => {
        expect(initPaidForBand).toBeDefined();
    });

    it('should create a Sticky element', () => {
        if (document.body) {
            document.body.innerHTML = '<div class="paidfor-band"></div>';
        }
        (Sticky.prototype: any).init = jest.fn();

        return initPaidForBand().then(() => {
            expect(Sticky.prototype.init).toHaveBeenCalled();
        });
    });
});
