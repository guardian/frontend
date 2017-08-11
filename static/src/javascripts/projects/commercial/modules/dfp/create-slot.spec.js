// @flow
import createSlot from 'commercial/modules/dfp/create-slot';
import adSizes from 'commercial/modules/ad-sizes';
import bonzo from 'bonzo';

const imHtml = `
<div id="dfp-ad--im"
    class="js-ad-slot ad-slot ad-slot--im"
    data-link-name="ad slot im"
    data-name="im"
    data-mobile="1,1|2,2|88,85|fluid"
    data-label="false"
    data-refresh="false"></div>
`;

const inline1Html = `
<div id="dfp-ad--inline1"
    class="js-ad-slot ad-slot ad-slot--inline ad-slot--inline1"
    data-link-name="ad slot inline1"
    data-name="inline1"
    data-mobile="1,1|2,2|300,250|fluid"
    data-desktop="1,1|2,2|300,250|620,1|620,350|fluid"></div>
`;

jest.mock('lib/config', () => ({ page: { edition: 'UK' } }));

describe('Create Ad Slot', () => {
    it('should exist', () => {
        expect(createSlot).toBeDefined();
    });

    [
        {
            type: 'im',
            html: imHtml,
        },
        {
            type: 'inline',
            classes: 'inline',
            name: 'inline1',
            html: inline1Html,
        },
    ].forEach((expectation: Object) => {
        it(`should create "${expectation.type}" ad slot`, () => {
            const adSlot = createSlot(expectation.type, {
                name: expectation.name,
                classes: expectation.classes,
            });

            expect(adSlot.outerHTML).toBe(
                expectation.html.replace(/\n/g, '').replace(/\s+/g, ' ')
            );
        });
    });

    it('should create "inline1" ad slot for inline-extra slots', () => {
        const adSlot = createSlot('inline', { classes: 'inline-extra' });

        expect(bonzo(adSlot).hasClass('ad-slot--inline-extra')).toBeTruthy();
    });

    it('should create "inline1" ad slot with additional size', () => {
        const adSlot = createSlot('inline', {
            sizes: { desktop: [adSizes.leaderboard] },
        });

        expect(
            bonzo(adSlot)
                .attr('data-desktop')
                .indexOf(adSizes.leaderboard.toString())
        ).toBeTruthy();
    });
});
