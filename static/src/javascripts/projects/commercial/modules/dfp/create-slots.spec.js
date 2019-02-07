// @flow
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { adSizes } from 'commercial/modules/ad-sizes';
import bonzo from 'bonzo';

const imHtml = `
<div id="dfp-ad--im"
    class="js-ad-slot ad-slot ad-slot--im"
    data-link-name="ad slot im"
    data-name="im"
    aria-hidden="true"
    data-mobile="1,1|2,2|88,85|fluid"
    data-label="false"
    data-refresh="false"></div>
`;

const inline1Html = `
<div id="dfp-ad--inline1"
    class="js-ad-slot ad-slot ad-slot--inline ad-slot--inline1"
    data-link-name="ad slot inline1"
    data-name="inline1"
    aria-hidden="true"
    data-mobile="1,1|2,2|300,250|300,274|620,350|fluid"
    data-desktop="1,1|2,2|300,250|620,1|620,350|300,274|fluid">
</div>
`;

const inline1BlockthroughHtml = `
<span class="bt-uid-tg" uid="5a98587091-157" style="display: none !important" aria-hidden="true"></span>
`;

jest.mock('lib/config', () => ({ page: { edition: 'UK' } }));

describe('Create Ad Slot', () => {
    it('should exist', () => {
        expect(createSlots).toBeDefined();
    });

    [
        {
            type: 'im',
            htmls: [imHtml],
        },
        {
            type: 'inline',
            classes: 'inline',
            name: 'inline1',
            htmls: [inline1Html, inline1BlockthroughHtml],
        },
    ].forEach((expectation: Object) => {
        it(`should create "${expectation.type}" ad slot`, () => {
            const adSlots = createSlots(expectation.type, {
                name: expectation.name,
                classes: expectation.classes,
            });

            adSlots.forEach((adSlot, i) => {
                expect(adSlot.outerHTML).toBe(
                    expectation.htmls[i].replace(/\n/g, '').replace(/\s+/g, ' ')
                );
            });
        });
    });

    it('should create "inline1" ad slot for inline-extra slots', () => {
        const adSlots = createSlots('inline', { classes: 'inline-extra' });
        const adSlot = adSlots[0];

        expect(bonzo(adSlot).hasClass('ad-slot--inline-extra')).toBeTruthy();
    });

    it('should create "inline1" ad slot with additional size', () => {
        const adSlots = createSlots('inline', {
            sizes: { desktop: [adSizes.leaderboard] },
        });
        const adSlot = adSlots[0];

        expect(
            bonzo(adSlot)
                .attr('data-desktop')
                .indexOf(adSizes.leaderboard.toString())
        ).toBeTruthy();
    });
});
