import ko from 'knockout';
import mediator from 'utils/mediator';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        this.alert = ko.observable(false);

        this.listenOn(mediator, 'presser:stale', message => this.alert(message));
        this.listenOn(mediator, 'capi:error', message => this.alert(message));
    }

    pressLiveFront() {
        this.clearAlerts();
        mediator.emit('presser:live');
    }

    clearAlerts() {
        this.alert(false);
        mediator.emit('alert:dismiss');
    }
}
