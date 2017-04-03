// @flow

import closest from './closest';

const closestProto = Element.prototype.closest;
let nestedChild;

beforeAll(() => {
    // Remove the closest method from Element so we test the polyfill
    delete Element.prototype.closest;

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

    nestedChild = document.querySelector('.child');
});

afterAll(() => {
    // Flow moans that I'm assigning something to a prototype
    // $FlowFixMe
    Element.prototype.closest = closestProto;
});

describe('closest', () => {
    test("Element.prototype.closest doesn't exist", () => {
        expect('closest' in Element.prototype).toBe(false);
    });

    test('Finds the parent element when selector exists', () => {
        expect(closest(nestedChild, '.parent')).toEqual(
            document.querySelector('.parent')
        );
    });

    test('Finds the grandparent element when selector exists', () => {
        expect(closest(nestedChild, '.grandparent')).toEqual(
            document.querySelector('.grandparent')
        );
    });

    test('Finds the first element when multiple selectors exist', () => {
        expect(closest(nestedChild, '.greatgrandparent')).toEqual(
            document.querySelector('.findthisone')
        );
    });

    test('Returns null if there is no element with the selector', () => {
        expect(closest(nestedChild, '.nonelement')).toEqual(null);
    });
});
