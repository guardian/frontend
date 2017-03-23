// @flow

import easing from 'lib/easing';

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
    Object.keys(TESTS).forEach(name => {
        const values = TESTS[name];

        test(`functions.${name}()`, () => {
            values.forEach(([actual, expected]) => {
                expect(easing.functions[name](actual)).toBe(expected);
            });
        });
    });
});
