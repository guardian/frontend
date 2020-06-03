// @flow
import fetchJSON from 'lib/fetch-json';

type TickerEndType = 'unlimited' | 'hardstop';
type TickerCountType = 'money' | 'people';

export type TickerSettings = {
    endType: TickerEndType,
    countType: TickerCountType,
    countLabelCopy: string,
    currencySymbol?: string,
}

export const parseTickerSettings = (obj: Object): ?TickerSettings => {
  const endType = obj.endType === 'unlimited' || obj.endType ===  'hardstop' ? obj.endType : null;
  const countType = obj.countType === 'money' || obj.countType ===  'people' ? obj.countType : null;
  const countLabelCopy = obj.countLabelCopy;

  if (endType && countType && countLabelCopy && (countType === 'people' || obj.currencySymbol)) {
      return {
          endType,
          countType,
          countLabelCopy,
          currencySymbol: obj.currencySymbol,
      }
  }

  return null;
};

const count = {};
let goal;
let total;

const goalReached = () => total >= goal;

const getCurrencySymbol: string = (tickerSettings: TickerSettings) =>
    tickerSettings.countType === 'money' ? tickerSettings.currencySymbol : '';

/**
 * The filled bar begins 100% to the left, and is animated rightwards.
 */
const percentageToTranslate = (end: number) => {
    const percentage = (total / end) * 100 - 100;

    return percentage >= 0 ? 0 : percentage;
};

const animateBar = (parentElement: HTMLElement, tickerType: TickerEndType) => {
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
    counterElement: HTMLElement,
    tickerSettings: TickerSettings,
) => {
    // Count is local to the parent element
    const newCount = count[parentElementSelector] + Math.floor(total / 100);

    const finishedCounting =
        newCount <= count[parentElementSelector] || newCount >= total; // either we've reached the total or the count isn't going up because total is too small

    const currencySymbol = getCurrencySymbol(tickerSettings);

    if (finishedCounting) {
        counterElement.innerHTML = `${currencySymbol}${total.toLocaleString()}`;
    } else {
        count[parentElementSelector] = newCount;
        counterElement.innerHTML = `${currencySymbol}${count[
            parentElementSelector
        ].toLocaleString()}`;

        window.requestAnimationFrame(() =>
            increaseCounter(parentElementSelector, counterElement, tickerSettings)
        );
    }
};

const populateStatusSoFar = (
    parentElementSelector: string,
    parentElement: HTMLElement,
    tickerSettings: TickerSettings,
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
            if (tickerSettings.endType === 'unlimited') {
                labelElement.innerHTML = `Contributions are still being accepted`;
                labelElement.classList.remove('is-hidden');
            }
        } else {
            labelElement.innerHTML = tickerSettings.countLabelCopy;
            labelElement.classList.remove('is-hidden');
            increaseCounter(parentElementSelector, counterElement, tickerSettings);
        }
    }
};

const populateGoal = (parentElement: HTMLElement, tickerSettings: TickerSettings) => {
    const goalElement = parentElement.querySelector('.js-ticker-goal');

    if (goalElement) {
        const countElement = goalElement.querySelector('.js-ticker-count');
        const labelElement = goalElement.querySelector('.js-ticker-label');

        if (countElement && labelElement) {
            const amount =
                goalReached() && tickerSettings.endType === 'unlimited' ? total : goal;
            countElement.innerHTML = `${getCurrencySymbol(tickerSettings)}${amount.toLocaleString()}`;

            if (goalReached()) {
                labelElement.innerHTML = tickerSettings.countLabelCopy;
            }
        }
    }
};

const animate = (parentElementSelector: string, tickerSettings: TickerSettings) => {
    const parentElement = document.querySelector(parentElementSelector);

    if (parentElement && parentElement instanceof HTMLElement) {
        if (goalReached()) {
            parentElement.classList.add('epic-ticker__goal-reached');
        }

        populateGoal(parentElement, tickerSettings);

        window.setTimeout(() => {
            count[parentElementSelector] = 0;
            window.requestAnimationFrame(() =>
                populateStatusSoFar(
                    parentElementSelector,
                    parentElement,
                    tickerSettings,
                )
            );
            animateBar(parentElement, tickerSettings.endType);
        }, 500);

        parentElement.classList.add(`epic-ticker__${tickerSettings.endType}`);
        parentElement.classList.remove('is-hidden');
    }
};

const dataSuccessfullyFetched = () =>
    !(Number.isNaN(Number(total)) || Number.isNaN(Number(goal)));

const getTickerUrl = (countType: TickerCountType): string =>
    countType === 'people' ? 'https://support.theguardian.com/supporters-ticker.json' : 'https://support.theguardian.com/ticker.json';

const fetchDataAndAnimate = (
    parentElementSelector: string,
    tickerSettings: TickerSettings,
) => {
    if (dataSuccessfullyFetched()) {
        animate(parentElementSelector, tickerSettings);
    } else {
        fetchJSON(getTickerUrl(tickerSettings.countType), {
            mode: 'cors',
        }).then(data => {
            total = parseInt(data.total, 10);
            goal = parseInt(data.goal, 10);
            total = 151000

            if (dataSuccessfullyFetched()) {
                animate(parentElementSelector, tickerSettings);
            }
        });
    }
};

export const initTicker = (
    parentElementSelector: string,
    tickerSettings?: TickerSettings = {
        endType: 'unlimited',
        countType: 'people',
        countLabelCopy: 'supporters in Australia'
    }
) => {
    fetchDataAndAnimate(
        parentElementSelector,
        tickerSettings,
    );
};
