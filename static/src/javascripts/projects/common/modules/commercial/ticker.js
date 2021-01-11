import fetchJSON from 'lib/fetch-json';




const parseTickerSettings = (obj) => {
  const endType = obj.endType === 'unlimited' || obj.endType ===  'hardstop' ? obj.endType : null;
  const countType = obj.countType === 'money' || obj.countType ===  'people' ? obj.countType : null;
  const copy = obj.copy && obj.copy.countLabel && obj.copy.goalReachedPrimary && obj.copy.goalReachedSecondary ? obj.copy : null;

  if (endType && countType && copy && obj.currencySymbol) {
      return {
          endType,
          countType,
          copy,
          currencySymbol: obj.currencySymbol,
      }
  }

  return null;
};

const count = {};
let goal;
let total;

const goalReached = () => total >= goal;

const getCurrencySymbol = (tickerSettings) =>
    tickerSettings.countType === 'money' ? tickerSettings.currencySymbol : '';

/**
 * The filled bar begins 100% to the left, and is animated rightwards.
 */
const percentageToTranslate = (end) => {
    const percentage = (total / end) * 100 - 100;

    return percentage >= 0 ? 0 : percentage;
};

const animateBar = (parentElement, tickerType) => {
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
    parentElementSelector,
    counterElement,
    tickerSettings,
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
    parentElementSelector,
    parentElement,
    tickerSettings,
) => {
    const counterElement = parentElement.querySelector(
        `.js-ticker-amounts .js-ticker-count`
    );

    const labelElement = parentElement.querySelector(
        `.js-ticker-amounts .js-ticker-label`
    );

    if (counterElement && labelElement) {
        if (goalReached()) {
            counterElement.innerHTML = tickerSettings.copy.goalReachedPrimary;
            if (tickerSettings.endType === 'unlimited') {
                labelElement.innerHTML = tickerSettings.copy.goalReachedSecondary;
                labelElement.classList.remove('is-hidden');
            }
        } else {
            labelElement.innerHTML = tickerSettings.copy.countLabel;
            labelElement.classList.remove('is-hidden');
            increaseCounter(parentElementSelector, counterElement, tickerSettings);
        }
    }
};

const populateGoal = (parentElement, tickerSettings) => {
    const goalElement = parentElement.querySelector('.js-ticker-goal');

    if (goalElement) {
        const countElement = goalElement.querySelector('.js-ticker-count');
        const labelElement = goalElement.querySelector('.js-ticker-label');

        if (countElement && labelElement) {
            const amount =
                goalReached() && tickerSettings.endType === 'unlimited' ? total : goal;
            countElement.innerHTML = `${getCurrencySymbol(tickerSettings)}${amount.toLocaleString()}`;

            if (goalReached()) {
                labelElement.innerHTML = tickerSettings.copy.countLabel;
            }
        }
    }
};

const animate = (parentElementSelector, tickerSettings) => {
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

const getTickerUrl = (countType) =>
    countType === 'people' ? 'https://support.theguardian.com/supporters-ticker.json' : 'https://support.theguardian.com/ticker.json';

const fetchDataAndAnimate = (
    parentElementSelector,
    tickerSettings,
) => {
    if (dataSuccessfullyFetched()) {
        animate(parentElementSelector, tickerSettings);
    } else {
        fetchJSON(getTickerUrl(tickerSettings.countType), {
            mode: 'cors',
        }).then(data => {
            total = parseInt(data.total, 10);
            goal = parseInt(data.goal, 10);

            if (dataSuccessfullyFetched()) {
                animate(parentElementSelector, tickerSettings);
            }
        });
    }
};

const defaultSettings = {
    endType: 'unlimited',
    countType: 'people',
    copy: {
        countLabel: 'supporters in Australia',
        goalReachedPrimary: 'We\'ve hit our goal!',
        goalReachedSecondary: 'but you can still support us',
    },
    currencySymbol: '$',
};

const initTicker = (
    parentElementSelector,
    tickerSettings
) => {
    fetchDataAndAnimate(
        parentElementSelector,
        tickerSettings || defaultSettings,
    );
};

export {
    initTicker,
    parseTickerSettings,
}
