// @flow
import $ from 'lib/$';
import { addSpinner, removeSpinner } from './switchboardLabel';

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="originalClassName"></div>
        `;
    }
});

test('adds a spinner', () => {
    const el = $('.originalClassName');
    addSpinner(el).then(() => {
        expect(el.hasClass('is-updating')).toEqual(true);
        expect($(document.body).hasClass('is-updating-cursor')).toEqual(true);
    });
});

test('removes a spinner', () => {
    const el = $('.originalClassName');
    expect(el.length).toEqual(1);

    if (el[0]) {
        addSpinner(el)
            .then(() => removeSpinner(el))
            .then(() => {
                expect(el[0].className).toEqual('originalClassName');
                expect($(document.body).hasClass('is-updating-cursor')).toEqual(
                    false
                );
            });
    }
});
