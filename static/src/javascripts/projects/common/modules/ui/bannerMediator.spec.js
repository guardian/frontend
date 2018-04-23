// @flow
import { init, _ } from 'common/modules/ui/bannerMediator';

const shortTrueCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 200);
    });
const shortFalseCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(false);
        }, 199);
    });
const longFalseCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(false);
        }, 2000);
    });
const longTrueCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });

describe('Banner Mediator picks correct banner to show', () => {
    let checkList;

    // it('should run checkList[0].show', () => {
    //     checkList = [
    //         {
    //             check: shortTrueCheck,
    //             show: jest.fn(),
    //         },
    //     ];

    //     _.resetChecks(checkList);

    //     return init().then(() => {
    //         expect(checkList[0].show).toHaveBeenCalled();
    //     });
    // });

    // it('should not run checkList[0].show', () => {
    //     checkList = [
    //         {
    //             check: shortFalseCheck,
    //             show: jest.fn(),
    //         },
    //     ];

    //     _.resetChecks(checkList);

    //     return init().then(() => {
    //         expect(checkList[0].show).not.toHaveBeenCalled();
    //     });
    // });

    // it('should run checkList[1].show', () => {
    //     checkList = [
    //         {
    //             check: shortFalseCheck,
    //             show: jest.fn(),
    //         },
    //         {
    //             check: shortTrueCheck,
    //             show: jest.fn(),
    //         },
    //     ];

    //     _.resetChecks(checkList);

    //     return init().then(() => {
    //         expect(checkList[0].show).not.toHaveBeenCalled();
    //         expect(checkList[1].show).toHaveBeenCalled();
    //     });
    // });

    it('should run checkList[1].show', () => {
        checkList = [
            {
                check: longFalseCheck,
                show: jest.fn(),
            },
            {
                check: shortTrueCheck,
                show: jest.fn(),
            },
        ];

        _.resetChecks(checkList);

        return init().then(() => {
            expect(checkList[0].show).not.toHaveBeenCalled();
            expect(checkList[1].show).toHaveBeenCalled();
        });
    });

    // it('should run checkList[0].show', () => {
    //     checkList = [
    //         {
    //             check: longTrueCheck,
    //             show: jest.fn(),
    //         },
    //         {
    //             check: shortTrueCheck,
    //             show: jest.fn(),
    //         },
    //     ];

    //     _.resetChecks(checkList);

    //     return init().then(() => {
    //         expect(checkList[0].show).toHaveBeenCalled();
    //         expect(checkList[1].show).not.toHaveBeenCalled();
    //     });
    // });

    // it('should run checkList[1].show', () => {
    //     checkList = [
    //         {
    //             check: shortFalseCheck,
    //             show: jest.fn(),
    //         },
    //         {
    //             check: longTrueCheck,
    //             show: jest.fn(),
    //         },
    //         {
    //             check: shortTrueCheck,
    //             show: jest.fn(),
    //         },
    //         {
    //             check: shortTrueCheck,
    //             show: jest.fn(),
    //         },
    //     ];

    //     _.resetChecks(checkList);

    //     return init().then(() => {
    //         expect(checkList[0].show).not.toHaveBeenCalled();
    //         expect(checkList[1].show).toHaveBeenCalled();
    //         expect(checkList[2].show).not.toHaveBeenCalled();
    //         expect(checkList[3].show).not.toHaveBeenCalled();
    //     });
    // });
});
