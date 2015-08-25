import Promise from 'Promise';
import BaseClass from 'models/base-class';

export default class extends BaseClass {
    constructor(baseModel) {
        super(baseModel);
        Promise.resolve().then(() => this.loaded).then(() => {
            baseModel.extensionCreated(this);
        });
    }
}
