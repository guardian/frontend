import ko from 'knockout';
import $ from 'jquery';
import _ from 'underscore';
import mediator from 'utils/mediator';
import Layout from 'models/layout';
import Router from 'modules/router';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';
import inject from 'test/utils/inject';
import * as wait from 'test/utils/wait';
import fakePushState from 'test/utils/push-state';

describe('Layout', function () {
    var CONST_TRANSITION = 10;
    beforeEach(function () {
        this.ko = inject(`<div id="_test_container_layout">
            <span class="save-layout" data-bind="click: layout.save.bind(layout)">Save</span>
            <span class="cancel-layout" data-bind="click: layout.cancel.bind(layout)">Cancel</span>
            ${verticalLayout}
            ${mainLayout}
        </div>`);

        var handlers = {
            fronts: function () {},
            latest: function () {}
        },
        location = {
            pathname: '/',
            search: ''
        },
        history = {
            pushState: function () {}
        };

        spyOn(handlers, 'fronts');
        spyOn(handlers, 'latest');
        spyOn(history, 'pushState').and.callFake(fakePushState.bind(location));
        this.router = new Router(handlers, location, history);
        this.widget = [{
            title: 'Front',
            layoutType: 'front',
            widget: 'mock-front-widget'
        }, {
            title: 'Latest',
            layoutType: 'latest',
            widget: 'mock-latest-widget'
        }];
        this.layout = new Layout(this.router, this.widget);
        this.layout.CONST.addColumnTransition = CONST_TRANSITION;
    });
    afterEach(function () {
        this.layout.dispose();
        this.ko.dispose();
    });
    function click (selector) {
        return new Promise(resolve => {
            $(selector).click();
            setTimeout(resolve, CONST_TRANSITION + 10);
        });
    }
    function navigateTo (router, search) {
        return new Promise(resolve => {
            router.location.search = search;
            router.onpopstate();
            setTimeout(resolve, 10);
        });
    }
    function columnsInDOM () {
        return _.map($('.mock-widget'), widget => {
            return _.filter(widget.classList, className => className !== 'mock-widget')[0];
        });
    }

    it('changes the workspace', function (done) {
        var layout = this.layout, saved, current;

        this.ko.apply({ layout }, true)
        // wait for the second widget to load
        .then(() => wait.ms(100))
        .then(() => {
            expect(layout.configVisible()).toBe(false);
            expect(layout.configVisible()).toBe(false);
            expect($('.config-pane', this.ko.container).is(':visible')).toBe(false);
            expect(columnsInDOM()).toEqual(['latest', 'front']);

            layout.toggleConfigVisible();
            expect(layout.configVisible()).toBe(true);
            expect($('.config-pane', this.ko.container).is(':visible')).toBe(true);

            saved = layout.savedState.columns();
            current = layout.currentState.columns();
            expect(saved.length).toBe(2);
            expect(current.length).toBe(2);

            // Add an extra column in the middle
            return click('.fa-plus-circle:nth(0)');
        })
        .then(() => {
            // Plus button clones the source column
            expect(layout.savedState.columns().length).toBe(2);
            expect(layout.savedState.columns()).toBe(saved);
            expect(layout.currentState.columns().length).toBe(3);
            expect($('.config-pane').length).toBe(3);
            expect(columnsInDOM()).toEqual(['latest', 'latest', 'front']);

            // Cancel the workspace change
            return click('.cancel-layout');
        })
        .then(() => {
            expect(layout.savedState.columns().length).toBe(2);
            expect(layout.savedState.columns()).toBe(saved);
            expect(layout.currentState.columns().length).toBe(2);
            expect($('.config-pane').length).toBe(2);
            expect(columnsInDOM()).toEqual(['latest', 'front']);

            // Add another column
            return click('.fa-plus-circle:nth(1)');
        })
        .then(() => {
            expect(layout.savedState.columns()).toBe(saved);
            expect(layout.currentState.columns().length).toBe(3);
            expect($('.config-pane').length).toBe(3);
            expect(columnsInDOM()).toEqual(['latest', 'front', 'front']);

            // Change the type of a column
            return click('.config-pane:nth(2) .checkbox-latest');
        })
        .then(() => {
            expect(columnsInDOM()).toEqual(['latest', 'front', 'latest']);

            return click('.save-layout');
        })
        .then(() => {
            expect(this.router.location.search).toBe('?layout=latest,front,latest');

            return layout.toggleConfigVisible();
        })
        .then(() => {
            expect(columnsInDOM()).toEqual(['latest', 'front', 'latest']);

            // Navigate back to the previous layout
            return navigateTo(this.router, '?layout=front:banana,latest');
        })
        .then(() => {
            expect(columnsInDOM()).toEqual(['front', 'latest']);
            expect($('.mock-widget.front').text()).toBe('banana');

            layout.currentState.columns()[0].setConfig('apple');
        })
        .then(() => {
            expect(this.router.location.search).toBe('?layout=front:apple,latest');

            return click('.fa-minus-circle:nth(1)');
        })
        .then(() => {
            expect(layout.savedState.columns().length).toBe(2);
            expect(layout.currentState.columns().length).toBe(1);
            expect($('.config-pane').length).toBe(1);
            expect(columnsInDOM()).toEqual(['front']);
            expect($('.mock-widget.front').text()).toBe('apple');
        })
        .then(done)
        .catch(done.fail);
    });
});

ko.components.register('mock-front-widget', {
    viewModel: {
        createViewModel: (params) => {
            mediator.emit('widget:load');
            return params;
        }
    },
    template: '<div class="mock-widget front" data-bind="text: column.config"></div>'
});
ko.components.register('mock-latest-widget', {
    viewModel: {
        createViewModel: (params) => {
            mediator.emit('widget:load');
            return params;
        }
    },
    template: '<div class="mock-widget latest"></div>'
});
