import { blue } from 'chalk';
const config = '--error';

const error = ctx => {
    ctx.messages.push(
        `Run ${blue('./sbt scalafmt')} to format Scala files.`
    );
};

export const description = 'scalafmt check';
export const task = [
    {
        description: 'scalafmtCheckAll',
        task: `./sbt scalafmtCheckAll ${config}`,
        onError: error,
    },
];
