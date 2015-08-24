import ko from 'knockout';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        baseModel.navSections = ko.observableArray(this.getNavSection(baseModel));

        this.subscribeOn(baseModel.state, () => {
            baseModel.navSections(this.getNavSection(baseModel));
        });
    }

    getNavSection(baseModel) {
        return [].concat(baseModel.state().defaults.navSections);
    }
}
