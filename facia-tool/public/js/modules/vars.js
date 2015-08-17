import CONST from 'constants/defaults';

export {CONST};

export let model;
export function setModel (currentModel) {
    model = currentModel;
}

export function init (res) {
    CONST.types = res.defaults.dynamicContainers
        .concat(res.defaults.fixedContainers)
        .concat(CONST.extendDynamicContainers);

    CONST.typesDynamic = res.defaults.dynamicContainers;

    CONST.frontAgeAlertMs = {
        front:      60000 * 2 * (res.defaults.highFrequency || 1),
        editorial:  60000 * 2 * (res.defaults.standardFrequency || 5),
        commercial: 60000 * 2 * (res.defaults.lowFrequency || 60)
    };
}
