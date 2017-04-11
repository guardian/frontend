const fs = require('fs');
const path = require('path');
const pull = require('lodash.pull');
const modulesToDo = require('./es5to6.json');

const moduleId = process.argv[2];

fs.writeFileSync(
    path.resolve(__dirname, 'es5to6.json'),
    JSON.stringify(
        Object.keys(modulesToDo).reduce(
            (cleaned, human) =>
                Object.assign(cleaned, {
                    [human]: pull(modulesToDo[human], moduleId),
                }),
            {}
        ),
        null,
        2
    )
);
