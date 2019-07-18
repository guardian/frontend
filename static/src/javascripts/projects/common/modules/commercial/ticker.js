// @flow
import { getLocalCurrencySymbolSync } from 'lib/geolocation';
import fetchJSON from 'lib/fetch-json';

type TickerType = 'unlimited' | 'hardstop';

const count = {};
let goal;
let total;

const goalReached = () => total >= goal;

/**
 * The filled bar begins 100% to the left, and is animated rightwards.
 */
const percentageToTranslate = (end: number) => {
    const percentage = (total / end) * 100 - 100;

    return percentage >= 0 ? 0 : percentage;
};

const animateBar = (parentElement: HTMLElement, tickerType: TickerType) => {
    const progressBarElement = parentElement.querySelector(
        '.js-ticker-filled-progress'
    );

    if (progressBarElement && progressBarElement instanceof HTMLElement) {
        // If we've exceeded the goal then extend the bar 15% beyond the total
        const end =
            tickerType === 'unlimited' && total > goal
                ? total + total * 0.15
                : goal;

        const barTranslate = percentageToTranslate(end);
        progressBarElement.style.transform = `translate3d(${barTranslate}%, 0, 0)`;

        if (end > goal) {
            // Show a marker for the goal that has been exceeded
            const marker = parentElement.querySelector(
                '.js-ticker-goal-marker'
            );
            if (marker) {
                marker.classList.remove('is-hidden');
                const markerTranslate = (goal / end) * 100 - 100;
                marker.style.transform = `translate3d(${markerTranslate}%, 0, 0)`;
            }
        }
    }
};

const increaseCounter = (
    parentElementSelector: string,
    counterElement: HTMLElement
) => {
    // Count is local to the parent element
    const newCount = count[parentElementSelector] + Math.floor(total / 100);

    const finishedCounting =
        newCount <= count[parentElementSelector] || newCount >= total; // either we've reached the total or the count isn't going up because total is too small

    if (finishedCounting) {
        counterElement.innerHTML = `${getLocalCurrencySymbolSync()}${total.toLocaleString()}`;
    } else {
        count[parentElementSelector] = newCount;
        counterElement.innerHTML = `${getLocalCurrencySymbolSync()}${count[
            parentElementSelector
        ].toLocaleString()}`;

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
            countElement.innerHTML = `${getLocalCurrencySymbolSync()}${amount.toLocaleString()}`;

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

const dataSuccessfullyFetched = () =>
    !(Number.isNaN(Number(total)) || Number.isNaN(Number(goal)));

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
