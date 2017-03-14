// @flow

import { _closestPoly } from './closest';

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
        <div class="greatgrandparent">
            <div class="greatgrandparent findthisone">
                <div class="grandparent">
                    <div class="parent">
                        <div class="child" id="child">child content</div>
                    </div>
                </div>
            </div>
        </div>`;
    }
});

describe('closest', () => {
    test('Finds the parent element when selector exists', () => {
        const nestedChild = document.querySelector('.child');
        expect(_closestPoly(nestedChild, '.parent')).toEqual(
            document.querySelector('.parent')
        );
    });

    test('Finds the grandparent element when selector exists', () => {
        const nestedChild = document.querySelector('.child');
        expect(_closestPoly(nestedChild, '.grandparent')).toEqual(
            document.querySelector('.grandparent')
        );
    });

    test('Finds the first element when multiple selectors exist', () => {
        const nestedChild = document.querySelector('.child');
        expect(_closestPoly(nestedChild, '.greatgrandparent')).toEqual(
            document.querySelector('.findthisone')
        );
    });

    test('Returns null if there is no element with the selector', () => {
        const nestedChild = document.querySelector('.child');
        expect(_closestPoly(nestedChild, '.nonelement')).toEqual(null);
    });
});
