// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import fetchJSON from 'lib/fetch-json';

type TickerType = 'unlimited' | 'hardstop';

const count = {};
let goal;
let total;

const goalReached = () => total >= goal;

/**
 * The filled bar begins 100% to the left, and is animated rightwards.
 * If the goal is reached and type is 'unlimited' then only 85% is filled.
 */
const percentageToTranslate = (tickerType: TickerType) => {
    const percentage = (total / goal) * 100 - 100;
    const endOfFillPercentage = () => (tickerType === 'unlimited' ? -15 : 0);

    return percentage >= 0 ? endOfFillPercentage() : percentage;
};

const animateBar = (parentElement: HTMLElement, tickerType: TickerType) => {
    const progressBarElement = parentElement.querySelector(
        '.js-ticker-filled-progress'
    );

    if (progressBarElement && progressBarElement instanceof HTMLElement) {
        const barTranslate = percentageToTranslate(tickerType);
        progressBarElement.style.transform = `translate3d(${barTranslate}%, 0, 0)`;
    }
};

const increaseCounter = (
    parentElementSelector: string,
    counterElement: HTMLElement
) => {
    // Count is local to the parent element
    count[parentElementSelector] += Math.floor(total / 100);

    counterElement.innerHTML = `${getLocalCurrencySymbol()}${count[
        parentElementSelector
    ].toLocaleString()}`;
    if (count[parentElementSelector] >= total) {
        counterElement.innerHTML = `${getLocalCurrencySymbol()}${total.toLocaleString()}`;
    } else {
        window.requestAnimationFrame(() =>
            increaseCounter(parentElementSelector, counterElement)
        );
    }
};

const populateStatusSoFar = (
    parentElementSelector: string,
    parentElement: HTMLElement,
    tickerType: TickerType
) => {
    const counterElement = parentElement.querySelector(
        `.js-ticker-amounts .js-ticker-count`
    );

    const labelElement = parentElement.querySelector(
        `.js-ticker-amounts .js-ticker-label`
    );

    if (counterElement && labelElement) {
        if (goalReached()) {
            counterElement.innerHTML = `We’ve met our goal — thank you`;
            if (tickerType === 'unlimited') {
                labelElement.innerHTML = `Contributions are still being accepted`;
                labelElement.classList.remove('is-hidden');
            }
        } else {
            labelElement.classList.remove('is-hidden');
            increaseCounter(parentElementSelector, counterElement);
        }
    }
};

const populateGoal = (parentElement: HTMLElement, tickerType: TickerType) => {
    const goalElement = parentElement.querySelector('.js-ticker-goal');

    if (goalElement) {
        const countElement = goalElement.querySelector('.js-ticker-count');
        const labelElement = goalElement.querySelector('.js-ticker-label');

        if (countElement && labelElement) {
            const amount =
                goalReached() && tickerType === 'unlimited' ? total : goal;
            countElement.innerHTML = `${getLocalCurrencySymbol()}${amount.toLocaleString()}`;

            if (goalReached()) {
                labelElement.innerHTML = 'contributed';
            }
        }
    }
};

const animate = (parentElementSelector: string, tickerType: TickerType) => {
    const parentElement = document.querySelector(parentElementSelector);

    if (parentElement && parentElement instanceof HTMLElement) {
        if (goalReached()) {
            parentElement.classList.add('epic-ticker__goal-reached');
        }

        populateGoal(parentElement, tickerType);

        window.setTimeout(() => {
            count[parentElementSelector] = 0;
            window.requestAnimationFrame(() =>
                populateStatusSoFar(
                    parentElementSelector,
                    parentElement,
                    tickerType
                )
            );
            animateBar(parentElement, tickerType);
        }, 500);

        parentElement.classList.add(`epic-ticker__${tickerType}`);
        parentElement.classList.remove('is-hidden');
    }
};

const dataSuccessfullyFetched = () => !(Number.isNaN(Number(total)) || Number.isNaN(Number(goal)));

const fetchDataAndAnimate = (
    parentElementSelector: string,
    tickerType: TickerType
) => {
    if (dataSuccessfullyFetched()) {
        animate(parentElementSelector, tickerType);
    } else {
        fetchJSON('https://support.theguardian.com/ticker.json', {
            mode: 'cors',
        }).then(data => {
            total = parseInt(data.total, 10);
            goal = parseInt(data.goal, 10);

            if (dataSuccessfullyFetched()) {
                animate(parentElementSelector, tickerType);
            }
        });
    }
};

export const initTicker = (
    parentElementSelector: string,
    tickerType?: TickerType
) => {
    fetchDataAndAnimate(parentElementSelector, tickerType || 'unlimited');
};
