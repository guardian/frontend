// @flow
import { addSpinner, removeSpinner } from './switchboardLabel';

beforeEach(() => {
    document.body.innerHTML = `
        <div class="originalClassName"></div>
    `;
});

test('adds a spinner', () => {
    const el = document.querySelector('.originalClassName');
    addSpinner(el).then(() => {
        expect(el.classList.contains('is-updating')).toEqual(true);
        expect(document.body.classList.contains('is-updating-cursor')).toEqual(
            true
        );
    });
});

test('removes a spinner', () => {
    const el = document.querySelector('.originalClassName');
    addSpinner(el)
        .then(() => removeSpinner(el))
        .then(() => {
            expect(el.className).toEqual('originalClassName');
            expect(
                document.body.classList.contains('is-updating-cursor')
            ).toEqual(false);
        });
});
