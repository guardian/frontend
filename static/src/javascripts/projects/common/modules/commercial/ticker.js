// @flow
let count = 0;
let interval;
let goal;
let total;

const percentageTotalAsNegative = () => {
    let percentage = (total / goal) * 100 - 100;
    if (percentage > 0) {
        percentage = 0;
    }
    return percentage;
};

const animateBar = () => {
    const progressBar = document.querySelector('.epic-ticker__filled-progress');

    if (progressBar && progressBar instanceof HTMLElement) {
        progressBar.style.transform = `translateX(${percentageTotalAsNegative()}%)`;
    }
};

const increaseCounter = () => {
    count += Math.floor(total / 100);
    const counter = document.querySelector('.epic-ticker__so-far .epic-ticker__count');

    if (counter && counter instanceof HTMLElement) {
        counter.innerHTML = `$${count.toLocaleString()}`;
        if (count >= total) {
            clearInterval(interval);
            counter.innerHTML = `$${total.toLocaleString()}`;
        }
    }
};

const animateCount = () => {
    if (interval === undefined) {
        interval = setInterval(increaseCounter, 30);
    }
};

const populateText = () => {
    const goal = document.querySelector('.epic-ticker__goal .epic-ticker__count');

    if (goal && goal instanceof HTMLElement) {
        goal.innerHTML = `$${goal.toLocaleString()}`;
    }
};

const getData = () => {
    fetch(
        'https://interactive.guim.co.uk/docsdata-test/1ySn7Ol2NQLvvSw_eAnVrPuuRnaGOxUmaUs6svtu_irU.json'
    )
        .then(resp => resp.json())
        .then(data => {
            const showCount = data.sheets.Sheet1[0].showCount === 'TRUE';
            total = parseInt(data.sheets.Sheet1[0].total, 10);
            goal = parseInt(data.sheets.Sheet1[0].goal, 10);

            if (showCount) {
                populateText();
                setTimeout(() => {
                    animateCount();
                    animateBar();
                }, 500);
            }
        });
};

export const initTicker = () => {
    getData();
};
