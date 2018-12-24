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
    // If we've exceeded the goal then extend the bar 20% beyond the total
    const end = total > goal ? total + total * 0.2 : goal;

    const progressBarElement = parentElement.querySelector(
        '.js-ticker-filled-progress'
    );

    if (progressBarElement && progressBarElement instanceof HTMLElement) {
        const barTranslate = percentageTotalAsNegative(end);
        progressBarElement.style.transform = `translateX(${barTranslate}%)`;

        if (end !== goal) {
            progressBarElement.classList.add('ticker__filled-progress-over');
            progressBarElement.classList.remove(
                'ticker__filled-progress-under'
            );

            // Show a marker for the goal that has been exceeded
            const marker = parentElement.querySelector(
                '.js-ticker-goal-marker'
            );
            if (marker) {
                marker.classList.remove('is-hidden');
                const markerTranslate = (goal / end) * 100 - 100;
                marker.style.transform = `translateX(${markerTranslate}%)`;
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
    const goalElement = parentElement.querySelector(
        '.js-ticker-goal .js-ticker-count'
    );

    if (goalElement && goalElement instanceof HTMLElement) {
        goalElement.innerHTML = `${getLocalCurrencySymbol()}${goal.toLocaleString()}`;
    }
};

const animate = (parentElementSelector: string) => {
    const parentElement = document.querySelector(parentElementSelector);

    const tickerElementSelector =
        total > goal ? '.js-ticker-over-goal' : '.js-ticker-under-goal';

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

        const tickerElement = parentElement.querySelector(
            tickerElementSelector
        );
        if (tickerElement) {
            tickerElement.classList.remove('is-hidden');
        }
    }
};

const dataSuccessfullyFetched = () => total && goal;

const fetchDataAndAnimate = (parentElementSelector: string) => {
    if (dataSuccessfullyFetched()) {
        animate(parentElementSelector);
    } else {
        fetchJSON('https://support.theguardian.com/ticker.json', {
            headers: {
                'Content-Type': 'application/json',
            },
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
