// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import fetchJSON from 'lib/fetch-json';

const count = {};
let goal;
let total;

const percentageTotalAsNegative = () => {
    let percentage = (total / goal) * 100 - 100;
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
        progressBarElement.style.transform = `translateX(${percentageTotalAsNegative()}%)`;
    }
};

const increaseCounter = (
    parentElement: HTMLElement,
    parentElementSelector: string
) => {
    // Count is local to the parent element
    count[parentElementSelector] += Math.floor(total / 100);
    const counterElement = parentElement.querySelector(
        '.js-ticker-so-far .js-ticker-count'
    );

    if (counterElement && counterElement instanceof HTMLElement) {
        counterElement.innerHTML = `${getLocalCurrencySymbol()}${count[
            parentElementSelector
        ].toLocaleString()}`;
        if (count[parentElementSelector] >= total) {
            counterElement.innerHTML = `${getLocalCurrencySymbol()}${total.toLocaleString()}`;
        } else {
            window.requestAnimationFrame(() =>
                increaseCounter(parentElement, parentElementSelector)
            );
        }
    }
};

const populateText = (parentElement: HTMLElement) => {
    const goalElement = parentElement.querySelector(
        '.js-ticker-goal .js-ticker-count'
    );

    if (goalElement && goalElement instanceof HTMLElement) {
        goalElement.innerHTML = `${getLocalCurrencySymbol()}${goal.toLocaleString()}`;
    }
};

const animate = (parentElementSelector: string) => {
    const parentElement = document.querySelector(parentElementSelector);

    if (parentElement && parentElement instanceof HTMLElement) {
        populateText(parentElement);
        window.setTimeout(() => {
            count[parentElementSelector] = 0;
            window.requestAnimationFrame(() =>
                increaseCounter(parentElement, parentElementSelector)
            );
            animateBar(parentElement);
        }, 500);
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
