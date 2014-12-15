/* globals _ */
define([
    'knockout',
    'utils/global-listeners'
],function (
    ko,
    globalListeners
) {
    function isNarrow (column) {
        var percentage = parseFloat('0.' + column.style.width().replace('vw', '')),
            width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        return width * percentage <= 550;
    }

    function Column (opts) {
        var column = this;

        this.initialState = {
            'type': ko.observable(opts.type || 'front'),
            'iframeURL': ko.observable(opts.iframeURL || '')
        };
        this.edit = {};
        cloneObservables(this.initialState, this.edit);
        this['nth-of-type'] = ko.observable(opts['nth-of-type']);

        this.layout = opts.layout;
        this.style = {
            width: function () {
                return 100 / opts.layout.columns().length + 'vw';
            },
            left: function (data) {
                return 100 / opts.layout.columns().length * opts.layout.columns.indexOf(data) + 'vw';
            },
            isNarrow: ko.observable()
        };
        _.delay(function () {
            column.recomputeWidth();
        }, 25);

        function isType (what) {
            return this.edit.type() === what;
        }
        this.isFront = ko.computed(isType.bind(this, 'front'), this);
        this.isLatest = ko.computed(isType.bind(this, 'latest'), this);
        this.isOphan = ko.computed(isType.bind(this, 'ophan'), this);
        this.isIframe = ko.computed(isType.bind(this, 'iframe'), this);

        globalListeners.on('resize', _.debounce(function () {
            column.recomputeWidth();
        }, 25));
    }

    Column.prototype.setType = function (what) {
        this.edit.type(what);
    };

    Column.prototype.saveChanges = function () {
        cloneObservables(this.edit, this.initialState);
    };

    Column.prototype.dropChanges = function () {
        cloneObservables(this.initialState, this.edit);
    };

    Column.prototype.serializable = function () {
        var serialized = {};
        _.chain(this.edit).keys().each(function (key) {
            serialized[key] = this.edit[key]();
        }, this);
        return serialized;
    };

    Column.prototype.recomputeWidth = function () {
        this.style.isNarrow(isNarrow(this));
    };


    function cloneObservables (object, into) {
        _.chain(object).keys().each(function (key) {
            if (!into[key]) {
                into[key] = ko.observable(object[key]());
            } else if (into[key]() !==  object[key]()) {
                into[key](object[key]());
            }
        });
    }

    return Column;
});
