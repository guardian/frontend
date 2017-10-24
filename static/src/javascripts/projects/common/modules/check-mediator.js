// @flow
import { checks } from './check-mediator-checks';

// registeredChecks will store references to instances of DefferedCheck
let registeredChecks = {};

class DeferredCheck {
    complete: Promise<any>;
    resolve: Function;
    reject: Function;

    constructor(): void {
        this.complete = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

const registerCheck = (id: string): Object => {
    if (!registeredChecks[id]) {
        registeredChecks[id] = new DeferredCheck();
    }

    return registeredChecks[id];
};

const resolveCheck = (id: string, result?: any): void => {
    const check = registeredChecks[id];

    if (check) {
        check.resolve(result);
    }
};

const rejectCheck = (id: string, reason?: string): void => {
    const check = registeredChecks[id];

    if (check) {
        check.reject(reason);
    }
};

const waitForCheck = (id: string): Promise<any> => {
    const check = registeredChecks[id];

    if (check) {
        return check.complete;
    }

    return Promise.reject(new Error(`No deferred check with id ${id}`));
};

const initCheckMediator = (): void => {
    registeredChecks = {};

    checks.forEach(registerCheck);
};

export { initCheckMediator, resolveCheck, rejectCheck, waitForCheck };
