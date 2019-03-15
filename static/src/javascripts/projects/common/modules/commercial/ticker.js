// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import fetchJSON from 'lib/fetch-json';

const count = {};
let goal;
let total;

const percentageTotalAsNegative = (end: number) => {
    let percentage = (total / end) * 100 - 100;
    if (percentage > 0) {
        percentage = 0;
    }
    return percentage;
};

const animateBar = (parentElement: HTMLElement) => {
    const progressBarElement = parentElement.querySelector(
        '.js-ticker-filled-progress'
    );

    if (progressBarElement && progressBarElement instanceof HTMLElement) {
        const barTranslate = percentageTotalAsNegative(goal);
        progressBarElement.style.transform = `translateX(${barTranslate}%)`;

        if (total >= goal) {
            const labelElement = parentElement.querySelector(
                '.epic-ticker__count-label'
            );
            if (labelElement) {
                labelElement.innerHTML = `contributed of a ${getLocalCurrencySymbol()}${goal.toLocaleString()} goal`;
            }
        }
    }
};

const increaseCounter = (
    parentElement: HTMLElement,
    parentElementSelector: string,
    tickerElementSelector: string
) => {
    // Count is local to the parent element
    count[parentElementSelector] += Math.floor(total / 100);

    const counterElement = parentElement.querySelector(
        `${tickerElementSelector} .js-ticker-count`
    );

    if (counterElement && counterElement instanceof HTMLElement) {
        counterElement.innerHTML = `${getLocalCurrencySymbol()}${count[
            parentElementSelector
        ].toLocaleString()}`;
        if (count[parentElementSelector] >= total) {
            counterElement.innerHTML = `${getLocalCurrencySymbol()}${total.toLocaleString()}`;
        } else {
            window.requestAnimationFrame(() =>
                increaseCounter(
                    parentElement,
                    parentElementSelector,
                    tickerElementSelector
                )
            );
        }
    }
};

const populateGoal = (parentElement: HTMLElement) => {
    const goalElement = parentElement.querySelector('.js-ticker-goal');

    if (goalElement) {
        const countElement = goalElement.querySelector('.js-ticker-count');
        if (countElement) {
            goalElement.classList.remove('is-hidden');
            countElement.innerHTML = `${getLocalCurrencySymbol()}${goal.toLocaleString()}`;
        }
    }
};

const animate = (parentElementSelector: string) => {
    const parentElement = document.querySelector(parentElementSelector);

    const tickerElementSelector = '.js-ticker-amounts';

    if (parentElement && parentElement instanceof HTMLElement) {
        if (total < goal) {
            populateGoal(parentElement);
        }

        window.setTimeout(() => {
            count[parentElementSelector] = 0;
            window.requestAnimationFrame(() =>
                increaseCounter(
                    parentElement,
                    parentElementSelector,
                    tickerElementSelector
                )
            );
            animateBar(parentElement);
        }, 500);

        parentElement.classList.remove('is-hidden');
    }
};

const dataSuccessfullyFetched = () => total && goal;

const fetchDataAndAnimate = (parentElementSelector: string) => {
    if (dataSuccessfullyFetched()) {
        animate(parentElementSelector);
    } else {
        fetchJSON('https://support.theguardian.com/ticker.json', {
            mode: 'cors',
        }).then(data => {
            total = parseInt(data.total, 10);
            goal = parseInt(data.goal, 10);

            if (dataSuccessfullyFetched()) {
                animate(parentElementSelector);
            }
        });
    }
};

export const initTicker = (parentElementSelector: string) => {
    fetchDataAndAnimate(parentElementSelector);
};
