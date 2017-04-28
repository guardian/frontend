const chalk = require('chalk');
const { logLevel } = require('./config');

module.exports = result => {
    const { code, context, message, selector, type, typeCode } = result;
    const lines = [
        `${chalk.underline(type.toUpperCase())}: ${chalk.red(message)}`,
        `${chalk.underline('Code')}: ${code}`,
        `${chalk.underline('Context')}: ${context}`,
        `${chalk.underline('Selector')}: ${selector}`,
    ];
    let output = '';

    if (typeCode <= logLevel) {
        output = lines.join('\n');
    }

    return output;
};
