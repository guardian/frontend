// @flow
import { containerClassname, enhance, setPosition } from './wizard';

// Not yet implemented in our codebase, see https://github.com/tmpvar/jsdom/issues/961
HTMLElement.prototype.dataset = {};

const steps = ['1', '2', '3', '4'];

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="${containerClassname}">
                <div class="manage-account-wizard__step">1</div>
                <div class="manage-account-wizard__step">2</div> 
                <div class="manage-account-wizard__step">3</div> 
                <div class="manage-account-wizard__step">4</div> 
                <div class="manage-account-wizard__controls-pager">
                    <div class="js-manage-account-wizard__next"></div>
                    <div class="js-manage-account-wizard__prev"></div>
                </div>
            </div>
        `;
    }
    return enhance(document.getElementsByClassName(containerClassname)[0]);
});

test('containerClassname must be manage-account-wizard', () => {
    expect(containerClassname).toEqual('manage-account-wizard');
});

test('data-position is set', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    expect(wizardEl.dataset.position).toEqual('0');
});

test('data-position is updated', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    return setPosition(wizardEl, 2).then(() => {
        expect(wizardEl.dataset.position).toEqual('2');
    });
});

test('data-position is updated when value is off-range', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    return setPosition(wizardEl, 99).then(() => {
        expect(wizardEl.dataset.position).toEqual('0');
    });
});

test('move-next works', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    const moveEl = document.getElementsByClassName(
        'js-manage-account-wizard__next'
    )[0];
    moveEl.dispatchEvent(new Event('click'));
    setTimeout(() => {
        expect(wizardEl.dataset.position).toEqual('1');
    }, 100);
});

test('move-prev works', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    const moveEl = document.getElementsByClassName(
        'js-manage-account-wizard__prev'
    )[0];

    return setPosition(wizardEl, 2).then(() => {
        moveEl.dispatchEvent(new Event('click'));
        setTimeout(() => {
            expect(wizardEl.dataset.position).toEqual('1');
        }, 100);
    });
});

test('only the first element should be visible', () => {
    steps.forEach((step, index) => {
        const stepEl = document.querySelector(
            `.manage-account-wizard__step:nth-child(${index + 1})`
        );
        expect(
            stepEl &&
                stepEl.classList.contains('manage-account-wizard__step--hidden')
        ).toEqual(index !== 0);
    });
});

test('only the second element should be visible after moving', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    return setPosition(wizardEl, 2).then(() => {
        steps.forEach((step, index) => {
            const stepEl = document.querySelector(
                `.manage-account-wizard__step:nth-child(${index + 1})`
            );
            expect(
                stepEl &&
                    stepEl.classList.contains(
                        'manage-account-wizard__step--hidden'
                    )
            ).toEqual(index !== 2);
        });
    });
});

test('wizard gets completed on final step', () => {
    const wizardEl = document.getElementsByClassName(containerClassname)[0];
    return setPosition(wizardEl, steps.length - 1).then(() => {
        expect(
            wizardEl.classList.contains('manage-account-wizard--completed')
        ).toEqual(true);
    });
});
