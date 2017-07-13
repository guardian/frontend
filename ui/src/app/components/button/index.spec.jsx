// @flow

jest.mock('./style.scss', () => ({
    button: {
        backgroundColor: 'hotpink',
    },
}));

const Button = require('.');
const style = require('./style.scss');

console.log(style.button);

describe('Button', () => {
    it('generates the correct object', () => {
        expect(<Button>test button</Button>).toMatchSnapshot();
    });
});
