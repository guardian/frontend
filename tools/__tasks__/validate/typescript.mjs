import chalk from 'chalk';

const { blue, underline } = chalk

const error = ctx => {
    ctx.messages.push(
        `${blue('make fix')} can correct simple errors automatically.`
    );
    ctx.messages.push(
        `Your editor may be able to catch eslint errors as you work:\n${underline(
            'http://eslint.org/docs/user-guide/integrations#editors'
        )}`
    );
};

export const description = 'Compile TS';
export const task = [
    {
        description: 'Compile',
        task: `tsc --noEmit`,
        onError: error,
    },
];
export const concurrent = true;
