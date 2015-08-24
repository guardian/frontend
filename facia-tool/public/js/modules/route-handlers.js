import * as vars from 'modules/vars';
import columns from 'models/available-columns';
import extensions from 'models/available-extensions';
import BaseModule from 'models/base-model';

function getLoader (enabledWidgets, loadedExtensions) {
    return function (router, res) {
        vars.init(res);
        var model = new BaseModule(enabledWidgets, loadedExtensions, router, res);
        vars.setModel(model);
        return model;
    };
}

export default {
    'fronts': getLoader([
        columns.frontsTrail,
        columns.frontsTreats,
        columns.latestTrail,
        columns.clipboardTrail
    ], [
        extensions.detectPressStale,
        extensions.copyPasteArticles,
        extensions.sparklinesTrails
    ]),
    'config': getLoader([
        columns.frontsConfig
    ], [
        extensions.cardTypes,
        extensions.navSections
    ])
};
