import ko from 'knockout';
import copiedArticle from 'modules/copied-article';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        baseModel.isPasteActive = ko.observable(false);
        this.listenOn(copiedArticle, 'change', hasArticle => baseModel.isPasteActive(hasArticle));
    }
}
