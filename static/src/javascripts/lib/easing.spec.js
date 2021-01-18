import Chance from 'chance';
import { easingFunctions, createEasing } from 'lib/easing';

const chance = new Chance();
jest.useRealTimers();

const TESTS = {
    linear: [[2, 0], [3, -1], [4, -2]],
    easeInQuad: [[2, 4], [3, 9]],
    easeOutQuad: [[2, 0], [3, -3], [4, -8]],
    easeInOutQuad: [[0.3, 0.18], [0.5, 0.5], [2, -1], [3, -7]],
    easeInCubic: [[2, 8], [3, 27], [4, 64]],
    easeOutCubic: [[2, 0], [3, -7], [4, -26]],
    easeInOutCubic: [[0.3, 0.108], [0.5, 0.5], [2, -3], [3, -31]],
    easeInQuart: [[2, 16], [3, 81], [4, 256]],
    easeOutQuart: [[2, 0], [3, -15], [4, -80]],
    easeInOutQuart: [[0.3, 0.0648], [0.5, 0.5], [2, -7], [3, -127]],
    easeInQuint: [[2, 32], [3, 243], [4, 1024]],
    easeOutQuint: [[2, 0], [3, -31], [4, -242]],
    easeInOutQuint: [[0.3, 0.03888], [0.5, 0.5], [2, -15], [3, -511]],
};

describe('easing', () => {
    // test easing methods
    Object.keys(TESTS).forEach(name => {
        const values = TESTS[name];

        test(`easingFunctions.${name}()`, () => {
            values.forEach(([actual, expected]) => {
                expect(easingFunctions[name](actual)).toBe(expected);
            });
        });
    });

    test('createEasing()', () => {
        const OriginalDate = global.Date;
        const ELAPSED = chance.integer({ min: 0, max: 100 });
        const DURATION = chance.integer({ min: ELAPSED, max: 300 });
        global.Date = jest.fn(() => new OriginalDate(0));

        const ease = createEasing('linear', DURATION);
        expect(ease()).toBe(0);

        global.Date = jest.fn(
            () => new OriginalDate((1970, 1, 1, 0, 0, 0, ELAPSED))
        );
        expect(ease()).toBe(ELAPSED / DURATION);

        global.Date = OriginalDate;
    });
});
