// @flow
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import crossIcon from 'svgs/icon/cross.svg';
import paidContent from 'svgs/commercial/paid-content.svg';

class surveySimple {
    constructor(config: {
        header: string,
        paragraph1: string,
        paragraph2: string,
        paragraph3: string,
    }) {
        this.config = config || {};
    }

    attach() {
        return fastdom.write(() => {
            $(document.body).append(this.template());
            const closeBtn = document.querySelector('.js-survey-close');
            closeBtn.addEventListener('click', () => {
                fastdom.write(() => {
                    $('.js-survey-overlay').addClass('u-h');
                });
            });
        });
    }

    template() {
        return `
            <div class="survey-overlay-simple js-survey-overlay u-h" data-link-name="hosted page about overlay" role="dialog" aria-label="about hosted content">
                <div class="survey-container">
                    <h3 class="survey-text__header">
                        ${this.config.header}
                        <div class="survey-close js-survey-close">
                            <button class="site-message__close-btn js-site-message-close" data-link-name="hide about hosted message">
                                <span class="u-h">Close</span>
                                ${crossIcon.markup}
                            </button>
                        </div>
                    </h3>
                    <div class="survey-icon">
                        ${paidContent.markup}
                    </div>
                    <div class="survey-text">
                        <p class="survey-text__paragraph">
                            ${this.config.paragraph1}
                        </p>
                        <p class="survey-text__paragraph">
                            ${this.config.paragraph2}
                        </p>
                        <p class="survey-text__paragraph">
                            ${this.config.paragraph3}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

export default surveySimple;
