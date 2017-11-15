// @flow
import $ from 'lib/$';
import { push } from './show-errors';

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
            <div class="js-errorHolder"></div>
        `;
    }
});

test('renders an error with a custom name', () => {
    push(Error('Test String')).then(() => {
        expect($(`.js-errorHolder > div > p`).text()).toEqual('Test String. ');
    });
});

test('renders an undefined error', () => {
    push(true).then(() => {
        expect($(`.js-errorHolder > div > p`).text()).toEqual(
            'Sorry, something went wrong. '
        );
    });
});

test('renders 3 errors', () => {
    push(true)
        .then(() => push(true))
        .then(() => push(true))
        .then(() => {
            expect($(`.js-errorHolder`).children().length).toEqual(3);
        });
});
