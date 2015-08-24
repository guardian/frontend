import BaseClass from 'models/base-class';
import mediator from 'utils/mediator';

var loadSym = Symbol();

class BaseWidget extends BaseClass {
    constructor() {
        super();
        this[loadSym] = setTimeout(() => {
            mediator.emit('widget:load', this);
        }, 20);
    }

    dispose() {
        super.dispose();
        clearTimeout(this[loadSym]);
    }
}

export default BaseWidget;
