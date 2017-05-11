const pa11y = require('pa11y');
const reporter = require('./reporter');
const { options, host, paths } = require('./config');

const test = pa11y(options);

module.exports = {
    description: `Running accessibility check ...`,
    task: paths.map(path => ({
        description: `${path}`,
        task: ctx =>
            new Promise((resolve, reject) => {
                test.run(`${host}/${path}`, (err, results) => {
                    if (err) {
                        reject(err);
                    }

                    const messages = results.map(reporter);
                    messages.forEach(message => ctx.messages.push(message));

                    if (results.length) {
                        ctx.error = true;
                    }

                    resolve();
                });
            }),
    })),
};
