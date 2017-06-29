// @flow
import hostedAbout from 'commercial/modules/hosted/about';

jest.mock(
    'commercial/modules/survey/survey-simple',
    () =>
        class {
            attach() {
                const overlay = global.document.createElement('div');
                overlay.classList.add('js-survey-overlay');
                overlay.classList.add('u-h');
                global.document.body.appendChild(overlay);
                return Promise.resolve(this);
            }
        }
);

const hostedAboutPopup: any = hostedAbout.init;

describe('Hosted About Popup', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = '<div class="js-hosted-about"></div>';
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        const overlay: any = document.querySelector('.js-survey-overlay');
        if (overlay) overlay.parentNode.removeChild(overlay);
    });

    it('should exist', () => {
        expect(hostedAboutPopup).toBeDefined();
    });

    it('should hide popup after initialization', done => {
        hostedAboutPopup()
            .then(() => {
                expect(
                    (document.querySelector(
                        '.js-survey-overlay'
                    ): any).classList.toString()
                ).toEqual(expect.stringContaining('u-h'));
            })
            .then(done)
            .catch(done.fail);
    });

    it('should show popup after clicking on the button', done => {
        hostedAboutPopup()
            .then(() => {
                (document.querySelector('.js-hosted-about'): any).click();
                expect(
                    (document.querySelector(
                        '.js-survey-overlay'
                    ): any).classList.toString()
                ).not.toEqual(expect.stringContaining('u-h'));
            })
            .then(done)
            .catch(done.fail);
    });
});
