const chalk = require('chalk');
const config = '--error';

const error = ctx => {
    ctx.messages.push(
        `Run ${chalk.blue('./sbt scalafmt')} to format Scala files.`
    );
};

module.exports = {
    description: 'scalafmt check',
    task: [
        {
            description: 'scalaFmtCheck',
            task: `./sbt scalafmtCheckAll ${config}`,
            onError: error,
        },
    ]
}
