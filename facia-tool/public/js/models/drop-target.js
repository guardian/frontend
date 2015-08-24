import BaseClass from 'models/base-class';

export default class DropTarget extends BaseClass {
    constructor() {
        super();
        this.dropTarget = true;
    }

    normalizeDropTarget() {
        return {
            isAfter: false,
            target: this
        };
    }
}
