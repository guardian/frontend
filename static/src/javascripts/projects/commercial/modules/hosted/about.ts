

import fastdom from "lib/fastdom-promise";
import $ from "lib/$";
import crossIcon from "svgs/icon/cross.svg";
import paidContent from "svgs/commercial/paid-content.svg";

const template = (): string => `
        <div class="survey-overlay-simple js-survey-overlay u-h" data-link-name="hosted page about overlay" role="dialog" aria-label="about hosted content">
            <div class="survey-container">
                <h3 class="survey-text__header">
                    Advertiser content
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
                        Advertiser content. This article was paid for, produced and controlled by the advertiser rather 
                        than the publisher. It is subject to regulation by the Advertising Standards Authority. This 
                        content is produced by the advertiser with no involvement from Guardian News and Media staff.
                    </p>
                </div>
            </div>
        </div>
    `;

export const init = () => fastdom.mutate(() => {
  $(document.body).append(template());
}).then(() => {
  const aboutBtns = document.querySelectorAll('.js-hosted-about');
  const closeBtn = document.querySelector('.js-survey-close');
  const overlay = document.querySelector('.js-survey-overlay');
  if (!overlay || !aboutBtns || !closeBtn) return;

  aboutBtns.forEach(btn => {
    btn.addEventListener('click', (e: Event): unknown => {
      e.preventDefault();
      fastdom.mutate(() => overlay.classList.remove('u-h'));
    });
  });
  closeBtn.addEventListener('click', () => {
    fastdom.mutate(() => overlay.classList.add('u-h'));
  });
});