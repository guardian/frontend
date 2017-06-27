// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import detect from 'lib/detect';
import { addTrackingPixel } from 'commercial/modules/creatives/add-tracking-pixel';
import addViewabilityTracker from 'commercial/modules/creatives/add-viewability-tracker';
import revealerStr from 'raw-loader!commercial/views/creatives/revealer.html';

class Revealer {
    adSlot: HTMLElement;
    params: Object;

    constructor(adSlot: HTMLElement, params: Object) {
        params.id = `revealer-${Math.floor(Math.random() * 10000).toString(
            16
        )}`;
        this.adSlot = adSlot;
        this.params = params;
    }

    create() {
        const revealerTpl = template(revealerStr);
        const markup = revealerTpl(this.params);

        return fastdom
            .write(() => {
                this.adSlot.insertAdjacentHTML('beforeend', markup);
                // #? `classList.add` takes multiple arguments, but we are using it
                // here with arity 1 because polyfill.io has incorrect support with IE 10 and 11.
                // One may revert to adSlot.classList.add('ad-slot--revealer', 'ad-slot--fabric', 'content__mobile-full-width');
                // When support is correct or when we stop supporting IE <= 11
                this.adSlot.classList.add('ad-slot--revealer');
                this.adSlot.classList.add('ad-slot--fabric');
                this.adSlot.classList.add('content__mobile-full-width');
                if (this.params.trackingPixel) {
                    addTrackingPixel(
                        this.params.trackingPixel + this.params.cacheBuster
                    );
                }
                if (this.params.researchPixel) {
                    addTrackingPixel(
                        this.params.researchPixel + this.params.cacheBuster
                    );
                }
                if (this.params.viewabilityTracker) {
                    addViewabilityTracker(
                        this.adSlot,
                        this.params.id,
                        this.params.viewabilityTracker
                    );
                }
            })
            .then(() => fastdom.read(detect.getViewport))
            .then(viewport =>
                fastdom.write(() => {
                    const background = this.adSlot.getElementsByClassName(
                        'creative__background'
                    )[0];
                    // for the height, we need to account for the height of the location bar, which
                    // may or may not be there. 70px padding is not too much.
                    if (background) {
                        background.style.height = `${viewport.height + 70}px`;
                    }
                    return true;
                })
            );
    }
}

export { Revealer };
