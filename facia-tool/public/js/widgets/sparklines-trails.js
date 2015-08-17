import ko from 'knockout';
import * as sparklines from 'utils/sparklines';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        baseModel.isSparklinesEnabled = ko.pureComputed(() => sparklines.isEnabled());
    }
}
