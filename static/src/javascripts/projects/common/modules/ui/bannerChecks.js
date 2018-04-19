// @flow
// const shortTrueCheck = () => new Promise(resolve => {
//     setTimeout(() => {
//         resolve(true)
//     }, 200)
// });
// const shortFalseCheck = () => new Promise(resolve => {
//     setTimeout(() => {
//         resolve(false)
//     }, 199)
// });
// const longFalseCheck = () => new Promise(resolve => {
//     setTimeout(() => {
//         resolve(false)
//     }, 2000)
// });
// const longTrueCheck = () => new Promise(resolve => {
//     setTimeout(() => {
//         resolve(true)
//     }, 2000)
// });

type BannerCheck = {
    check: () => Promise<boolean>,
    show: () => void,
};

let checks: Array<BannerCheck> = [
    // {
    //     check: shortTrueCheck,
    //     show: () => {},
    // }, {
    //     check: shortFalseCheck,
    //     show: () => {},
    // }, {
    //     check: longTrueCheck,
    //     show: () => {},
    // }, {
    //     check: shortFalseCheck,
    //     show: () => {},
    // }, {
    //     check: shortTrueCheck,
    //     show: () => {},
    // },
];

const results = new Array(checks.length).fill('pending', 0);

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

const pushToResults = (result: boolean, index: number): void => {
    results[index] = result;

    if (arrayIsSolved(results)) {
        checks[index].show();
    }
};

const init = (): void => {
    checks.forEach((check, index) => {
        check.check().then(result => {
            pushToResults(result, index);
        });
    });
};

// used for testing purposes
const replaceChecks = (testChecks: Array<BannerCheck>): void => {
    checks = testChecks;
};

export { init };

export const _ = {
    replaceChecks,
};
