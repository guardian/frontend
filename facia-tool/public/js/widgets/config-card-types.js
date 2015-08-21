import ko from 'knockout';
import _ from 'underscore';
import * as vars from 'modules/vars';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        baseModel.types = ko.observableArray(_.pluck(vars.CONST.types, 'name'));
        var groups = {};
        _.each(vars.CONST.types, type => {
            groups[type.name] = type.groups;
        });
        baseModel.typesGroups = groups;
    }
}
