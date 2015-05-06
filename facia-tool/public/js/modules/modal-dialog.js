import Promise from 'Promise';
import ko from 'knockout';
import _ from 'underscore';

class ModalDialog {
    constructor() {
        this.isOpen = ko.observable(false);

        this.templateName = ko.observable();
        this.templateData = ko.observable();
    }

    confirm(config) {
        return new Promise((resolve, reject) => {
            this.templateData(_.extend(config.data, {
                ok: () => {
                    this.isOpen(false);
                    resolve();
                },
                cancel: () => {
                    this.isOpen(false);
                    reject();
                }
            }));
            this.templateName(config.name);
            this.isOpen(true);
        });
    }
}

export default new ModalDialog();
