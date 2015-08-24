import ko from 'knockout';
import Promise from 'Promise';
import _ from 'underscore';
import $ from 'jquery';
import * as vars from 'modules/vars';
import mediator from 'utils/mediator';
import dates from 'test/fixtures/dates';
import inject from 'test/utils/inject';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Front', function () {
    beforeEach(function () {
        this.scope = mockjax.scope();
        var fronts = {
            uk: {
                id: 'uk',
                collections: ['one', 'non-existing', 'shared', 'uneditable']
            },
            au: {
                id: 'au',
                collections: ['shared', 'two']
            }
        };
        this.model = {
            identity: { email: 'fabio.crisci@theguardian.com' },
            frontsList: ko.observableArray(_.values(fronts)),
            frontsMap: ko.observable(fronts),
            testColumn: {
                config: ko.observable(),
                setConfig: () => {}
            },
            switches: ko.observable({
                'facia-tool-sparklines': false
            }),
            isPasteActive: ko.observable(false),
            state: ko.observable({
                config: {
                    collections: {
                        'one': { displayName: 'Fruits', type: 'long' },
                        'two': { displayName: 'Vegetables', type: 'short' },
                        'shared': { displayName: 'Spices', type: 'long' },
                        'uneditable': { uneditable: true }
                    }
                },
                defaults: { env: 'test' }
            })
        };
        this.ko = inject('<fronts-widget params="column: testColumn"></fronts-widget>');
        this.loadFront = (model, columnConfig) => {
            // TODO Phantom Babel bug
            if (!model) { model = {}; }
            _.extend(model, this.model);
            return new Promise(resolve => {
                model.testColumn.registerMainWidget = widget => setTimeout(() => widget.loaded.then(resolve), 10);
                model.testColumn.config(columnConfig);
                vars.setModel(model);
                this.ko.apply(model);
                this.model = model;
            });
        };
        spyOn(this.model.testColumn, 'setConfig');
    });
    afterEach(function () {
        this.scope.clear();
        this.ko.dispose();
    });

    it('load a front from the select and toggle collection visibility', function (done) {
        var callPresser = 0;
        this.scope({
            url: '/front/lastmodified/uk',
            responseText: { status: 200, responseText: +dates.yesterday },
            onAfterComplete: () => {
                setTimeout(() => mediator.emit('test:lastmodified'), 20);
            }
        }, {
            url: '/collection/one',
            status: 404
        }, {
            url: '/collection/shared',
            status: 404
        }, {
            url: '/press/draft/uk',
            method: 'POST',
            responseText: {},
            onAfterComplete: () => callPresser += 1
        });

        this.loadFront()
        .then(() => {
            var options = [];
            $('.select--front option').each((i, element) => options.push($(element).text()));
            expect(options).toEqual(['choose a front...', 'uk', 'au']);

            // Select one front
            $('.select--front')[0].selectedIndex = 1;
            $('.select--front').change();
        })
        .then(() => {
            expect(this.model.testColumn.setConfig).toHaveBeenCalled();

            expect($('collection-widget').length).toBe(2);
            // Collections are still loading
            return wait.event('front:loaded');
        })
        .then(() => {
            expect($('collection-widget:nth(0) .title').text()).toBe('Fruits');
            expect($('collection-widget:nth(0) .alsoOnToggle').length).toBe(0);
            expect($('collection-widget:nth(1) .title').text()).toBe('Spices');
            expect($('collection-widget:nth(1) .alsoOnToggle').length).toBe(1);

            return wait.event('test:lastmodified');
        })
        .then(() => {
            expect(textInside('.front-age--value')).toBe('1 day ago');

            expect($('.collapse-expand-all').hasClass('expanded')).toBe(true);
            $('.list-header__collapser:nth(0)').click();

            // Wait for the presser action
            return wait.ms(50);
        })
        .then(() => {
            expect(callPresser).toBe(1);
        })
        .then(() => {
            expect($('.collapse-expand-all').hasClass('expanded')).toBe(true);
            expect($('.list-header:nth(0)').hasClass('collapsed')).toBe(true);
            $('.list-header__collapser:nth(1)').click();
        })
        .then(() => {
            expect($('.collapse-expand-all').hasClass('expanded')).toBe(false);
            expect($('.list-header:nth(0)').hasClass('collapsed')).toBe(true);
            expect($('.list-header:nth(1)').hasClass('collapsed')).toBe(true);

            $('.collapse-expand-all').click();
        })
        .then(() => {
            expect($('.collapse-expand-all').hasClass('expanded')).toBe(true);
            expect($('.list-header:nth(0)').hasClass('collapsed')).toBe(false);
            expect($('.list-header:nth(1)').hasClass('collapsed')).toBe(false);

            $('.collapse-expand-all').click();
        })
        .then(() => {
            expect($('.collapse-expand-all').hasClass('expanded')).toBe(false);
            expect($('.list-header:nth(0)').hasClass('collapsed')).toBe(true);
            expect($('.list-header:nth(1)').hasClass('collapsed')).toBe(true);

            $('.list-header__collapser:nth(1)').click();
        })
        .then(() => {
            expect($('.collapse-expand-all').hasClass('expanded')).toBe(false);
            expect($('.list-header:nth(0)').hasClass('collapsed')).toBe(true);
            expect($('.list-header:nth(1)').hasClass('collapsed')).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });

    it('loads from column config and toggle live and draft content', function (done) {
        var callPresser = 0;
        this.scope({
            url: '/collection/one',
            responseText: {
                lastUpdated: new Date(),
                live: [{ id: 'internal-code/page/1' }],
                draft: [{ id: 'internal-code/page/1' }, { id: 'internal-code/page/2' }]
            }
        }, {
            url: '/collection/shared',
            responseText: {
                lastUpdated: new Date(),
                live: [{ id: 'internal-code/page/3' }]
                // no draft
            }
        }, {
            url: '/front/lastmodified/uk',
            status: 404
        }, {
            url: '/stories-visible/long',
            responseText: {}
        }, {
            url: '/api/proxy/search?ids=' + encodeURIComponent('internal-code/page/') + '1*',
            responseText: {
                response: {
                    results: [{
                        fields: {
                            headline: 'First',
                            internalPageCode: '1'
                        },
                        webUrl: '/article-1'
                    }, {
                        fields: {
                            headline: 'Second',
                            internalPageCode: '2'
                        },
                        webUrl: '/article-2'
                    }]
                }
            }
        }, {
            url: '/api/proxy/search?ids=' + encodeURIComponent('internal-code/page/') + '3*',
            responseText: {
                response: {
                    results: [{
                        fields: {
                            headline: 'Third',
                            internalPageCode: '3'
                        },
                        webUrl: '/article-3'
                    }]
                }
            }
        }, {
            url: '/press/draft/uk',
            method: 'POST',
            responseText: {},
            onAfterComplete: () => callPresser += 1
        });

        this.loadFront({}, 'uk')
        .then(() => {
            expect($('.modes > .draft-mode').hasClass('active')).toBe(true);
            expect($('collection-widget').length).toBe(2);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(2);
            expect($('collection-widget:nth(0) .draft-publish').is(':visible')).toBe(true);
            expect($('collection-widget:nth(1) trail-widget').length).toBe(1);
            expect($('collection-widget:nth(1) .draft-publish').is(':visible')).toBe(false);

            // Click on live content
            $('.modes > .live-mode').click();
        })
        .then(() => {
            expect($('.modes > .draft-mode').hasClass('active')).toBe(false);
            expect($('.modes > .live-mode').hasClass('active')).toBe(true);

            expect($('collection-widget').length).toBe(2);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(1);
            expect($('collection-widget:nth(0) .tool.draft-warning').is(':visible')).toBe(true);
            expect($('collection-widget:nth(1) trail-widget').length).toBe(1);
            expect($('collection-widget:nth(1) .tool.draft-warning').is(':visible')).toBe(false);

            // Show unlaunched content
            $('collection-widget:nth(0) .tool.draft-warning').click();
        })
        .then(() => {
            expect($('.modes > .draft-mode').hasClass('active')).toBe(true);
            expect($('collection-widget').length).toBe(2);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(2);
            expect($('collection-widget:nth(0) .draft-publish').is(':visible')).toBe(true);
            expect($('collection-widget:nth(1) trail-widget').length).toBe(1);
            expect($('collection-widget:nth(1) .draft-publish').is(':visible')).toBe(false);

            return wait.ms(50);
        })
        .then(() => {
            expect(callPresser).toBe(1);
        })
        .then(done)
        .catch(done.fail);
    });
});
