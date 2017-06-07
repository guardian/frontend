// @flow
import mediator from 'lib/mediator';
import register from 'common/modules/analytics/register';
import Component from 'common/modules/component';

class ElectionOnwardContent extends Component {
    static ready(): void {
        register.end('general-election-content');
        mediator.emit('modules:onward:loaded');
        mediator.emit('page:new-content');
        mediator.emit('ui:images:upgradePictures');
    }

    static error(): void {
        register.error('general-election-content');
    }

    constructor(context: Array<Element>): void {
        super();
        register.begin('general-election-content');
        this.context = context;
        this.endpoint = '/container/381f3487-3726-40d7-9742-136bed95a244.json';
        this.fetch(this.context, 'html');
    }
}

export { ElectionOnwardContent };
