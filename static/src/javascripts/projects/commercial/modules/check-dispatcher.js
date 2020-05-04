// @flow
import { checks } from 'common/modules/check-mediator-checks';
import { resolveCheck } from 'common/modules/check-mediator';

/**
    Any check added to checksToDispatch should also
    be added to the array of checks in './check-mediator-checks'.
* */
const checksToDispatch = {

};

const initCheckDispatcher = (): void => {
    Object.keys(checksToDispatch).forEach(key => {
        if (checks.includes(key)) {
            resolveCheck(key, checksToDispatch[key]());
        }
    });
};

export { initCheckDispatcher };
