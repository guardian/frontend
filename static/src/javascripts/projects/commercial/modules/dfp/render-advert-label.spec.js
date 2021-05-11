import bonzo from 'bonzo';
import { renderAdvertLabel } from './render-advert-label';

jest.mock('../../../../lib/detect', () => {});
jest.mock('../../../common/modules/commercial/commercial-features', () => ({
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

        adverts.frame = bonzo(
            bonzo.create('<div class="js-ad-slot ad-slot--frame"></div>')
        );

        adverts.uh = bonzo(
            bonzo.create('<div class="js-ad-slot u-h"></div>')
        );

        adverts.topAboveNav = bonzo(
            bonzo.create(`<div class="js-ad-slot" id="dfp-ad--top-above-nav"></div>`)
        );
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('Can add a label', () =>
        renderAdvertLabel(adverts.withLabel[0]).then(() => {
            const label = adverts.withLabel[0].querySelector(labelSelector);
            expect(label).not.toBeNull();
        }));

    it('The label has a message', () =>
        renderAdvertLabel(adverts.withLabel[0]).then(() => {
            const label = adverts.withLabel[0].querySelector(labelSelector);
            expect(label.textContent).toBe('Advertisement');
        }));

    it('Will not add a label if it has an attribute data-label="false"', () =>
        renderAdvertLabel(adverts.labelDisabled[0]).then(() => {
            const label = adverts.labelDisabled[0].querySelector(labelSelector);
            expect(label).toBeNull();
        }));

    it('Will not add a label if the adSlot already has one', () =>
        renderAdvertLabel(adverts.alreadyLabelled[0]).then(() => {
            const label = adverts.alreadyLabelled[0].querySelectorAll(
                labelSelector
            );
            expect(label.length).toBe(1);
        }));

    it('Will not add a label to frame ads', () =>
        renderAdvertLabel(adverts.frame[0]).then(() => {
            const label = adverts.frame[0].querySelector(labelSelector);
            expect(label).toBeNull();
        }));

    it('Will not add a label to an ad slot with a hidden u-h class', () =>
        renderAdvertLabel(adverts.uh[0]).then(() => {
            const label = adverts.uh[0].querySelector(labelSelector);
            expect(label).toBeNull();
        }));

    it('When the ad is top above nav and the label is toggleable, make the label visible and set width to ad width', () => {
        if (document.body) {
            document.body.innerHTML = `
                <div>
                    <div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="js-ad-slot" id="dfp-ad--top-above-nav"></div>
                </div>
            `;
        }
        Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
            get: function() {
              return this.id === 'dfp-ad--top-above-nav' ? 120 : 60;
            }
          });
        return renderAdvertLabel(adverts.topAboveNav[0]).then(() => {
            const label = document.querySelector(labelSelector);
            expect(label.classList.contains('visible')).toBe(true);
            expect(label.style.width).toEqual('120px');
        });
    });

    it('When the ad is top above nav and the label is NOT toggleable, render the label dynamically', () =>
        renderAdvertLabel(adverts.topAboveNav[0]).then(() => {
            const label = adverts.topAboveNav[0].querySelector(labelSelector);
            expect(label.textContent).toEqual('Advertisement');
        }));

    it('When the ad is top above nav and the label is toggleable, and the ad slot should not have a label applied, make the label display none so it is removed from layout', () => {
        if (document.body) {
            document.body.innerHTML = `
                <div>
                    <div class="ad-slot__label ad-slot__label--toggle hidden">Advertisement</div>
                    <div class="js-ad-slot" id="dfp-ad--top-above-nav">
                        <div class="ad-slot__label"></div>
                    </div>
                </div>
            `;
        }
        return renderAdvertLabel(adverts.topAboveNav[0]).then(() => {
            const label = document.querySelector('.ad-slot__label--toggle');
            expect(label.classList.contains('visible')).toBe(false);
            expect(label.style.display).toEqual('none');
        });
    });
});
