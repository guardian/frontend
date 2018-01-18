// @flow
import renderAdvertLabel from 'commercial/modules/dfp/render-advert-label';
import bonzo from 'bonzo';

jest.mock('lib/detect', () => {});
jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

const adverts = {};
const labelSelector = '.ad-slot__label';

describe('Rendering advert labels', () => {
    beforeAll(() => {
        adverts.withLabel = bonzo(
            bonzo.create('<div class="js-ad-slot"></div>')
        );

        adverts.labelDisabled = bonzo(
            bonzo.create('<div class="js-ad-slot" data-label="false"></div>')
        );

        adverts.alreadyLabelled = bonzo(
            bonzo.create(`
                <div class="js-ad-slot">
                    <div class="ad-slot__label">Advertisement</div>
                </div>
            `)
        );

        // the override should work regardless of whether the other conditions are true, including an existing label
        adverts.requiredOverride = bonzo(
            bonzo.create(`
                <div class="js-ad-slot">
                    <div class="ad-slot__label">Advertisement</div>
                    <div class="js-advertisement-label-required-true"></div>
                </div>
            `)
        );

        adverts.notRequiredOverride = bonzo(
            bonzo.create(`
                <div class="js-ad-slot">
                    <div class="js-advertisement-label-required-false"></div>
                </div>
            `)
        );

        adverts.frame = bonzo(
            bonzo.create('<div class="js-ad-slot ad-slot--frame"></div>')
        );
    });

    it(`Can add a label`, () =>
        renderAdvertLabel(adverts.withLabel[0]).then(() => {
            const label = adverts.withLabel[0].querySelector(labelSelector);
            expect(label).not.toBeNull();
        }));

    it(`The label has a message`, () =>
        renderAdvertLabel(adverts.withLabel[0]).then(() => {
            const label = adverts.withLabel[0].querySelector(labelSelector);
            expect(label.textContent).toBe('Advertisement');
        }));

    it(`Won't add a label if it has an attribute data-label='false'`, () =>
        renderAdvertLabel(adverts.labelDisabled[0]).then(() => {
            const label = adverts.labelDisabled[0].querySelector(labelSelector);
            expect(label).toBeNull();
        }));

    it(`Won't add a label if the adSlot already has one`, () =>
        renderAdvertLabel(adverts.alreadyLabelled[0]).then(() => {
            const label = adverts.alreadyLabelled[0].querySelectorAll(
                labelSelector
            );
            expect(label.length).toBe(1);
        }));

    it(`Won't add a label to frame ads`, () =>
        renderAdvertLabel(adverts.frame[0]).then(() => {
            const label = adverts.frame[0].querySelector(labelSelector);
            expect(label).toBeNull();
        }));

    it(`Won't add a label to ads with explicit no-label override`, () =>
        renderAdvertLabel(adverts.notRequiredOverride[0]).then(() => {
            const label = adverts.notRequiredOverride[0].querySelector(
                labelSelector
            );
            expect(label).toBeNull();
        }));

    it(`Will add a label to ads with explicit label override`, () =>
        renderAdvertLabel(adverts.requiredOverride[0]).then(() => {
            const labels = adverts.requiredOverride[0].querySelectorAll(
                labelSelector
            );
            expect(labels.length).toBe(2);
        }));
});
