
import { push, reset } from "./show-errors";

beforeAll(() => {
  if (document.body) {
    document.body.innerHTML = `
            <div class="js-errorHolder"></div>
        `;
  }
});

beforeEach(() => {
  reset();
});

test('renders an error with a custom name', () => push(Error('Test String')).then(() => {
  expect((document.querySelector(`.js-errorHolder > div > p`) || {}).innerHTML).toEqual('Test String.');
}));

test('renders an undefined error', () => push(true).then(() => {
  expect((document.querySelector(`.js-errorHolder > div > p`) || {}).innerHTML).toEqual('Sorry, something went wrong.');
}));

test('renders 3 errors', () => push(Error('Test 1')).then(() => push(Error('Test 2'))).then(() => push(Error('Test 3'))).then(() => {
  expect((document.querySelector(`.js-errorHolder`) || {}).childNodes.length).toEqual(3);
}));

test('stacks repeated errors', () => push(Error('Test 1')).then(() => push(Error('Test 2'))).then(() => push(Error('Test 2'))).then(() => {
  expect((document.querySelector(`.js-errorHolder`) || {}).childNodes.length).toEqual(2);
  expect((document.querySelector(`.js-errorHolder > div:nth-child(2) > p`) || {}).innerHTML).toContain('(2 times)');
}));