import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import Promise from 'Promise';
import 'jquery-ui/ui/effect';
import 'jquery-ui/ui/effect-size';
import 'jquery-ui/ui/effect-scale';
import 'models/common-handlers';
import BaseClass from 'models/base-class';
import Column from 'models/layout/column';
import copiedArticle from 'modules/copied-article';
import * as layoutFromURL from 'utils/layout-from-url';
import updateScrollables from 'utils/update-scrollables';

function columnDataOf (type, columns) {
    return _.find(columns, col => {
        return col.layoutType === type;
    }) || {};
}

export default class Layout extends BaseClass {
    constructor(router, widgets) {
        super();
        this.CONST = {
            addColumnTransition: 300
        };
        this.router = router;

        this.allColumns = widgets;
        this.availableColumns = _.filter(widgets, config => {
            return config.selectable !== false;
        });

        this.configVisible = ko.observable(false);

        this.savedState = {
            columns: ko.observableArray()
        };
        this.currentState = {
            columns: ko.observableArray()
        };
        this.savedLayout = null;

        this.loaded = this.initializeFromLocation();

        this.subscribeOn(this.configVisible, this.locationChange);
        this.listenOn(router, 'change', this.locationChange);
    }

    locationChange() {
        this.initializeFromLocation().then(this.recomputeAllWidths.bind(this));
    }

    initializeFromLocation() {
        var layout = layoutFromURL.get(this.router.params, this.router.path);
        if (_.isEqual(layout, this.savedLayout)) {
            return Promise.resolve();
        } else {
            let columns = _.map(layout, col => this.newConfigInstance(col));
            this.savedState.columns(columns);
            this.applyToCurrentState(columns);
            this.savedLayout = layout;

            return Promise.all(this.currentState.columns().map(col => col.loaded));
        }
    }

    newConfigInstance(config) {
        return new Column(_.extend({}, config, {
            'layout': this
        }, columnDataOf(config.type, this.allColumns)));
    }

    applyToCurrentState(columns) {
        var currentColumns = this.currentState.columns() || [];
        this.currentState.columns(_.map(columns, (column, position) => {
            var current = currentColumns[position] || new Column(column.opts);
            if (column.sameAs(current)) {
                current.config(column.config());
            } else {
                current = column;
            }
            return current;
        }));
    }

    toggleConfigVisible() {
        this.configVisible(!this.configVisible());
    }

    save() {
        this.savedState.columns(this.currentState.columns().slice());
        this.applyToCurrentState(this.savedState.columns());
        this.onColumnChange();
        this.configVisible(false);
    }

    cancel() {
        this.configVisible(false);
        this.currentState.columns(this.savedState.columns().slice());
    }

    onColumnChange() {
        this.savedState.columns(this.currentState.columns().slice());
        this.router.navigate({
            layout: layoutFromURL.serialize(_.map(this.savedState.columns(), column => column.serializable()))
        });
    }

    addColumn(column) {
        var position = this.currentState.columns.indexOf(column);
        this.currentState.columns.splice(position + 1, 0, this.newConfigInstance({
            type: column.opts.type
        }));
    }

    removeColumn(column) {
        if (this.currentState.columns().length === 1) {
            return;
        }
        var position = this.currentState.columns.indexOf(column);
        this.currentState.columns.splice(position, 1);
    }

    setType(newType, column) {
        var position = this.currentState.columns.indexOf(column);
        this.currentState.columns.splice(position, 1, this.newConfigInstance({
            type: newType
        }));
    }

    serializable() {
        return _.map(this.columns(), function (column) {
            return column.serializable();
        });
    }

    onConfigVisibilityChange() {
        copiedArticle.flush();
        this.recomputeAllWidths();
    }

    recomputeAllWidths() {
        _.each(this.currentState.columns(), function (column) {
            column.recomputeWidth();
        });
    }

    dispose() {
        super.dispose();
        _.chain(this.savedState.columns().concat(this.currentState.columns()))
            .uniq()
            .each(column => column.dispose());
    }
}

ko.bindingHandlers.slideIn = {
    init: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor()),
            $element = $(element);
        $element.css({
            marginLeft: value ? 0 : $(element).outerWidth()
        });
        if (value) {
            $element.show();
        } else {
            $element.hide();
        }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor()),
            $element = $(element);
        if (value) {
            $element.show();
        }
        $element.animate({
            marginLeft: value ? 0 : $(element).outerWidth()
        }, {
            duration: bindingContext.$data.layout.CONST.addColumnTransition,
            complete: function () {
                if (!value) {
                    $element.hide();
                }
                updateScrollables();
                bindingContext.$data.layout.onConfigVisibilityChange();
            }
        });
    }
};
