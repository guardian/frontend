import { push } from './show-errors';

beforeEach(() => {
    document.body.innerHTML = `
        <div class="js-errorHolder"></div>
    `;
});

test('renders an error with a custom name', () => {
    push(Error('Test String')).then(() => {
        expect(
            document.querySelector(`.js-errorHolder > div > p`).innerHTML
        ).toEqual('Test String. ');
    });
});

test('renders an undefined error', () => {
    push(true).then(() => {
        expect(
            document.querySelector(`.js-errorHolder > div > p`).innerHTML
        ).toEqual('Sorry, something went wrong. ');
    });
});

test('renders 3 errors', () => {
    push(true)
        .then(() => push(true))
        .then(() => push(true))
        .then(() => {
            expect(
                document.querySelector(`.js-errorHolder`).childNodes.length
            ).toEqual(3);
        });
});
