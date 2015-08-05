import Promise from 'Promise';
import mediator from 'utils/mediator';
import BaseClass from 'modules/class';

class BaseWidget extends BaseClass {
    constructor() {
        super();
        Promise.resolve().then(() => {
            mediator.emit('widget:load', this);
        });
    }
}

export default BaseWidget;
