import ko from 'knockout';
import _ from 'underscore';
import Promise from 'Promise';
import BaseClass from 'models/base-class';
import * as globalListeners from 'utils/global-listeners';

function isNarrow (column) {
    var percentage = parseInt(column.style.width(), 10),
        width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    return width * percentage / 100 <= 550;
}

export default class Column extends BaseClass {
    constructor(opts) {
        super();
        this.opts = opts;

        this.layout = opts.layout;
        this.component = {
            name: opts.widget,
            params: _.extend({
                column: this
            }, opts.params)
        };
        this.config = ko.observable(opts.config);

        this.style = {
            width: () => {
                return 100 / this.layout.currentState.columns().length + 'vw';
            },
            left: (data) => {
                return 100 / this.layout.currentState.columns().length * this.layout.currentState.columns.indexOf(data) + 'vw';
            },
            isNarrow: ko.observable()
        };

        _.forEach(this.layout.allColumns, function (col) {
            this['is' + col.layoutType] = ko.pureComputed(() => this.opts.type === col.layoutType);
        }, this);

        this.onResizeCallback = _.debounce(() => this.recomputeWidth(), 25);
        this.listenOn(globalListeners, 'resize', this.onResizeCallback);

        this.loaded = new Promise(resolve => this.once('widget:registered', resolve))
        .then(() => {
            // Recompute layout as soon as possible, but wait for the widget to be loaded
            this.recomputeWidth();
            return (this.component.widget.loaded || Promise.resolve()).then(() => this);
        });
    }

    registerMainWidget(innerWidget) {
        this.component.widget = innerWidget;
        this.emit('widget:registered');
    }

    serializable() {
        var serialized = {
            type: this.opts.type
        };
        if (this.config()) {
            serialized.config = this.config();
        }
        return serialized;
    }

    recomputeWidth() {
        this.style.isNarrow(isNarrow(this));
    }

    setConfig(newConfig) {
        if (!_.isEqual(newConfig, this.config())) {
            this.config(newConfig);
        }
        this.layout.onColumnChange();
    }

    sameAs(column) {
        if (!column) {
            return false;
        }
        var opts = this.opts;
        return _.isEqual(opts.widget, column.opts.widget) && _.isEqual(opts.params, column.opts.params);
    }
}
