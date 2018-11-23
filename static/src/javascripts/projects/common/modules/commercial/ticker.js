let count = 0,
    interval,
    goal,
    total;

export function initTicker() {
    getData();
}

function getData() {
    fetch('https://interactive.guim.co.uk/docsdata-test/1ySn7Ol2NQLvvSw_eAnVrPuuRnaGOxUmaUs6svtu_irU.json')
        .then(resp => resp.json())
        .then((data) => {
            const showCount = data.sheets.Sheet1[0].showCount === 'TRUE';
            total = parseInt(data.sheets.Sheet1[0].total);
            goal = parseInt(data.sheets.Sheet1[0].goal);

            if (showCount) {
                populateText();
                setTimeout(function() {
                    animateCount();
                    animateBar();
                }, 500);
            }
        });
}

function populateText() {
    document.querySelector('.epic-ticker__goal .epic-ticker__count').innerHTML = '$' + goal.toLocaleString();
}

function animateCount() {
    if (interval === undefined) {
        interval = setInterval(increaseCounter, 30);
    }
}

function increaseCounter() {
    count += Math.floor(total / 100);
    document.querySelector('.epic-ticker__so-far .epic-ticker__count').innerHTML = "$" + count.toLocaleString();
    if (count >= total) {
        clearInterval(interval);
        document.querySelector('.epic-ticker__so-far .epic-ticker__count').innerHTML = "$" + total.toLocaleString();
    }
}

function animateBar() {
    document.querySelector('.epic-ticker__filled-progress').style.transform = 'translateX(' + percentageTotalAsNegative() + '%)';
}

function percentageTotalAsNegative() {
    let percentage = total / goal * 100 - 100;
    if (percentage > 0) {
        percentage = 0;
    }
    return percentage;
}
