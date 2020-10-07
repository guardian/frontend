// @flow
import { $ } from 'lib/$';
import { addSpinner, removeSpinner, getInfo } from './switch';

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="originalClassName" data-originally-checked="false"><input type="checkbox" checked name="test-name" /></div>
        `;
    }
});

test('gets info', () => {
    const el = $('.originalClassName');
    getInfo(el).then(info => {
        expect(info.checked).toEqual(true);
        expect(info.name).toEqual('test-name');
        expect(info.shouldUpdate).toEqual(true);
    });
});

test('doesnt force update with an empty data-originally-checked', () => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="originalClassName"><input type="checkbox" checked name="test-name" /></div>
        `;
    }
    const el = $('.originalClassName');
    getInfo(el).then(info => {
        expect(info.shouldUpdate).toEqual(false);
    });
});

test('doesnt force update with an invalid data-originally-checked', () => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="originalClassName" data-originally-checked="🔔"><input type="checkbox" checked name="test-name" /></div>
        `;
    }
    const el = $('.originalClassName');
    getInfo(el).then(info => {
        expect(info.shouldUpdate).toEqual(false);
    });
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
