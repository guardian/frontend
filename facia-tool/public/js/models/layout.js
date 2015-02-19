define([
    'knockout',
    'jquery',
    'jquery-ui/ui/effect',
    'jquery-ui/ui/effect-size',
    'jquery-ui/ui/effect-scale',
    'underscore',
    'models/layout/column',
    'modules/copied-article',
    'modules/vars',
    'utils/layout-from-url',
    'utils/update-scrollables'
],function (
    ko,
    $,
    $effect,
    $effectSize,
    $effectScale,
    _,
    Column,
    copiedArticle,
    vars,
    layoutFromURL,
    updateScrollables
) {
    function Layout () {
        this.initialState = {
            columns: ko.observableArray()
        };
        this.configVisible = ko.observable(false);

        _.each(layoutFromURL.get(), function (col) {
            var config = _.extend(col, {
                'layout': this
            });
            this.initialState.columns.push(new Column(config));
        }, this);
        this.columns = ko.observableArray(this.initialState.columns().slice());

        this.configVisible.subscribe(this.onConfigVisibilityChange.bind(this));
    }

    Layout.prototype.locationChange = function () {
        var allColumns = this.columns();
        _.each(layoutFromURL.get(), function (col, position) {
            if (allColumns[position]) {
                allColumns[position].reset(col);
            }
        });
    };

    Layout.prototype.toggleConfigVisible = function () {
        this.configVisible(!this.configVisible());
    };

    Layout.prototype.save = function () {
        _.each(this.columns(), function (column) {
            column.saveChanges();
        });
        this.initialState.columns(this.columns().slice());
        this.configVisible(false);
    };

    Layout.prototype.cancel = function () {
        this.configVisible(false);
        _.each(this.columns(), function (column) {
            column.dropChanges();
        });
        this.columns(this.initialState.columns().slice());
    };

    Layout.prototype.addColumn = function (column) {
        var position = this.columns.indexOf(column);
        this.columns.splice(position + 1, 0, new Column({
            type: 'front',
            layout: this
        }));
    };

    Layout.prototype.removeColumn = function (column) {
        if (this.columns().length === 1) {
            return;
        }
        var position = this.columns.indexOf(column), that = this;
        $($('.column')[position]).hide('scale', {}, 150, function () {
            that.columns.splice(position, 1);
        });
    };

    Layout.prototype.serializable = function () {
        return _.map(this.columns(), function (column) {
            return column.serializable();
        });
    };

    Layout.prototype.addNewColumn = function (element) {
        element = $(element);
        if (element.is('.column')) {
            element.hide();
            element.show('scale', {}, 200);
        }
    };

    Layout.prototype.onConfigVisibilityChange = function () {
        copiedArticle.flush();
        _.each(this.columns(), function (column) {
            column.recomputeWidth();
        });
    };


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

    return Layout;
});
