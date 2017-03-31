// @flow

import checks from './check-mediator-checks';

// registeredChecks will store references to instances of DefferedCheck
let registeredChecks = {};

class DeferredCheck {
    complete: Promise<any>;
    resolve: Function;
    reject: Function;

    constructor(
        dependentCheckPromises?: Array<any>,
        dependentChecksPassCondition?: Function
    ): void {
        this.complete = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        if (dependentCheckPromises) {
            Promise.all(dependentCheckPromises).then(results => {
                const hasPassed = result => result;

                if (dependentChecksPassCondition) {
                    this.resolve(
                        dependentChecksPassCondition.call(results, hasPassed)
                    );
                }
            });
        }
    }
}

const registerDefferedCheck = (check: Object): Promise<any> | DeferredCheck => {
    const registerDependentCheck = (dependentCheck: Object): Promise<any> => {
        const registeredCheck = registeredChecks[dependentCheck.id];

        if (registeredCheck) {
            return registeredCheck.complete;
        }

        // eslint-disable-next-line no-use-before-define
        return registerCheck(dependentCheck).complete;
    };

    if (check.dependentChecks) {
        return new DeferredCheck(
            check.dependentChecks.map(registerDependentCheck),
            check.passCondition
        );
    }

    return new DeferredCheck();
};

const registerCheck = (check: Object): Object => {
    const { id } = check;

    if (!registeredChecks[id]) {
        registeredChecks[id] = registerDefferedCheck(check);
    }

    return registeredChecks[id];
};

const init = (): void => {
    checks.forEach(registerCheck);
};

const resolveCheck = (id: string, resolve?: boolean): ?Array<any> => {
    const argsArray = [id, resolve].slice(1);
    const check = registeredChecks[id];

    if (check) {
        return check.resolve.apply(null, argsArray);
    }

    return undefined;
};

const waitForCheck = (id: string): Promise<any> => {
    const check = registeredChecks[id];

    if (check) {
        return check.complete;
    }

    return Promise.reject(`No deferred check with id ${id}`);
};

const testClean = (): void => {
    registeredChecks = {};
};

export default {
    init,
    resolveCheck,
    waitForCheck,

    // exposed for unit testing
    test: {
        testClean,
    },
};
