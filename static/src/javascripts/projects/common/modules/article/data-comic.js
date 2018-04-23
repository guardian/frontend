// @flow

import fastdom from 'fastdom';

const comicGrid = () => `
        <div class="comic-grid">
            <div class="one">One</div>
            <div class="two">Two</div>
            <div class="three">Three</div>
            <div class="four">Four</div>
            <div class="five">Five</div>
            <div class="six">Six</div>
        </div>`;

const toggle = (el: Element) => {
    // re-draw el as comic grid
    if (el) {
        const html = comicGrid();
        fastdom.write(() => {
            el.insertAdjacentHTML('beforebegin', html);
            el.classList.add('u-h');
        });
    }
};

const init = () =>
    // set up comic stuff
    fastdom.write(() => {
        const button = document.querySelector(`.toggle-data-comic__button`);
        const articleBody = document.querySelector(`.content__article-body`);
        if (button && articleBody) {
            button.addEventListener('click', () => {
                toggle(articleBody);
            });
        }
    });

export { init, toggle };
