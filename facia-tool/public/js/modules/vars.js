import CONST from 'constants/defaults';
import isEqual from 'underscore';

export const priority = (function (pathname) {
    let priority = pathname.match(/^\/?([^\/]+)/);
    if (priority && priority[1] !== 'editorial') {
        return priority[1];
    }
})(window.location.pathname);

export {CONST};

export let model;
export function setModel (currentModel) {
    model = currentModel;
}

let currentRes;
export function differs (res) {
    return isEqual(res, currentRes);
}

export let state = {
    config: {}
};
export function update (res) {
    currentRes = res;
    state.config = res.config;
    if (model) {
        model.switches(res.switches);
    }
}

export let pageConfig;
export function init (res) {
    currentRes = res;
    pageConfig = res.defaults;

    CONST.types = res.defaults.dynamicContainers
        .concat(res.defaults.fixedContainers)
        .concat(CONST.extendDynamicContainers);

    CONST.typesDynamic = res.defaults.dynamicContainers;

    CONST.frontAgeAlertMs = {
        front:      60000 * 2 * (res.defaults.highFrequency || 1),
        editorial:  60000 * 2 * (res.defaults.standardFrequency || 5),
        commercial: 60000 * 2 * (res.defaults.lowFrequency || 60)
    };

    CONST.identity = {
        email: res.defaults.email,
        avatarUrl: res.defaults.avatarUrl
    };

    update(res);
}

