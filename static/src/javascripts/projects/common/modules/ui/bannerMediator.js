// @flow

type BannerCheck = {
    check: () => Promise<boolean>,
    show: () => void,
};

let checks: Array<BannerCheck> = [];

let results = new Array(checks.length).fill('pending', 0);

const arrayIsSolved = (arr: Array<'pending' | boolean>): boolean => {
    const firstCheckPassedIndex = arr.findIndex(item => item === true);

    if (firstCheckPassedIndex === -1) {
        // no check has passed
        return false;
    }

    if (firstCheckPassedIndex === 0) {
        // highest priority check has already passed
        return true;
    }

    // if firstCheckPassedIndex not 0 then get higher priority checks from array that are pending
    const pendingHigherPriorityCheckIndex = arr
        .slice(0, firstCheckPassedIndex)
        .findIndex(item => item === 'pending');

    // if there are no higher priority checks pending arrayIsSolved is true
    return pendingHigherPriorityCheckIndex === -1;
};

const init = (): Promise<void> =>
    new Promise(resolve => {
        const pushToResults = (result: boolean, index: number): void => {
            results[index] = result;

            if (arrayIsSolved(results)) {
                checks[index].show();
            }

            if (!results.includes('pending')) {
                resolve();
            }
        };

        checks.forEach((check, index) => {
            check.check().then(result => {
                pushToResults(result, index);
            });
        });
    });

// used for testing purposes
const resetChecks = (checkList: Array<BannerCheck>): void => {
    checks = checkList;
    results = new Array(checks.length).fill('pending', 0);
};

export { init };

export const _ = {
    resetChecks,
};
