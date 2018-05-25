// @flow
import { defaultConfig } from 'commercial/modules/cmp/cmp-env';

/* eslint-disable no-console */

const logLevels = ['debug', 'info', 'warn', 'error'];

export const log = logLevels.reduce((logger, funcName, index) => {
    // $FlowFixMe
    logger[funcName] = (...args) => {
        const consoleFunc = funcName === 'debug' ? 'log' : funcName;
        const { logging } = defaultConfig;
        if (logging && console && typeof console[consoleFunc] === 'function') {
            const enabledLevelIndex = logLevels.indexOf(
                logging.toString().toLocaleLowerCase()
            );
            if (
                logging === true ||
                (enabledLevelIndex > -1 && index >= enabledLevelIndex)
            ) {
                const [message, ...rest] = [...args];
                console[consoleFunc](
                    `${funcName.toUpperCase()}: (CMP) ${message}`,
                    ...rest
                );
            }
        }
    };
    return logger;
}, {});
