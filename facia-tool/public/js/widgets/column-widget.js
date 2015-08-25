import BaseWidget from 'widgets/base-widget';
import ko from 'knockout';

export default class ColumnWidget extends BaseWidget {
    constructor(params, element) {
        super(params, element);
        this.column = params.column;
        this.baseModel = ko.contextFor(element).$root;
        params.column.registerMainWidget(this);
    }
}
