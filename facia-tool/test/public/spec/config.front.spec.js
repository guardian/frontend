import _ from 'underscore';
import ko from 'knockout';
import $ from 'jquery';
import persistence from 'models/config/persistence';
import * as capi from 'modules/content-api';
import * as vars from 'modules/vars';
import * as dom from 'test/utils/dom-nodes';
import inject from 'test/utils/inject';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Config Front', function () {
    beforeEach(function () {
        this.ko = inject('<fronts-config-widget params="column: $data.testColumn"></fronts-config-widget>');
        this.loadFront = model => {
            // TODO Phantom Babel bug
            if (!model) { model = {}; }
            return this.ko.apply(_.defaults(model, {
                state: ko.observable({
                    config: {
                        fronts: {
                            existing: {}
                        }
                    },
                    defaults: {
                        editions: []
                    }
                }),
                types: ko.observableArray(['type-one', 'type-two']),
                typesGroups: {
                    'type-one': ['group-a', 'group-b']
                }
            }), true);
        };
        this.originalImageCdnDomain = vars.CONST.imageCdnDomain;
        vars.CONST.imageCdnDomain = window.location.host;
        this.originalsearchDebounceMs = vars.CONST.searchDebounceMs;
        vars.CONST.searchDebounceMs = 50;
        spyOn(persistence.front, 'update');
        spyOn(persistence.collection, 'save');
        spyOn(capi, 'fetchContent').and.callFake(query => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (query.indexOf('zero') === 0) {
                        resolve({ content: [] });
                    } else if (query.indexOf('news') === 0){
                        resolve({
                            content: [
                                { id: 'one', fields: { headline: 'First result' } },
                                { id: 'two', fields: { headline: 'Second result' } }
                            ]
                        });
                    } else {
                        reject(new Error('No results'));
                    }
                }, 50);
            });
        });
        spyOn(capi, 'fetchMetaForPath').and.callFake(() => {
            return new Promise(resolve => {
                resolve({
                    webTitle: 'Old title'
                });
            });
        });
    });
    afterEach(function () {
        vars.CONST.imageCdnDomain = this.originalImageCdnDomain;
        vars.CONST.searchDebounceMs = this.originalsearchDebounceMs;
        this.ko.dispose();
    });

    it('create fronts and collections', function (done) {
        var frontWidget;

        this.loadFront()
        .then(widget => {
            frontWidget = widget;
        })
        .then(createFrontAndCollection)
        .then(createCollectionWithCAPI)
        .then(modifyCollectionWithInvalidCAPI)
        .then(removeCollection)
        .then(editMetadata)
        .then(changeImageUrl)
        .then(deleteLastRemainingCollection)
        .then(done)
        .catch(done.fail);

        function createFrontAndCollection () {
            $('.title .linky').click();
            // some form of validation
            dom.type('.input-url-path', '/something////here/');
            // There's an onchange event, no need to click on save

            expect(textInside('.title--text')).toBe('something/here');

            $('.linky.tool--container').click();
            $('#showDateHeader').click();
            dom.type('.title--input', 'new collection');
            $('.type-option-chosen').click();
            $('.type-option-value:nth(1)').click();
            $('.tool-save-container').click();

            // Until persisted the front is still pinned
            expect(frontWidget.fronts().length).toBe(0);
            expect(!!frontWidget.pinnedFront()).toBe(true);
            var front = frontWidget.pinnedFront();
            var collection = front.collections.items()[0];
            expect(front.props.isHidden()).toBe(true);
            expect(persistence.collection.save).toHaveBeenCalledWith(collection);
            expect(collection.meta.showDateHeader()).toBe(true);
            expect(collection.meta.type()).toBe('type-two');
            expect(collection.meta.displayName()).toBe('new collection');
            persistence.collection.save.calls.reset();
        }

        function createCollectionWithCAPI () {
            $('.linky.tool--container').click();
            dom.type('.title--input', 'collection with capi');
            $('.type-option-chosen').click();
            $('.type-option-value:nth(0)').click();
            // sanitize spaces
            dom.type('.apiquery--input', 'ne  ws');

            return wait.ms(vars.CONST.searchDebounceMs)
            .then(() => {
                expect(textInside('.api-query-results')).toBe('Checking...');

                return wait.ms(100);
            })
            .then(() => {
                expect($('.apiquery--input').val()).toBe('news');
                expect($('.api-query-results a').length).toBe(2);
                expect(textInside('.cnf-form__value')).toBe('group-a,group-b');

                $('.tool-save-container').click();
                var front = frontWidget.pinnedFront();
                var collection = front.collections.items()[1];
                expect(persistence.collection.save).toHaveBeenCalledWith(collection);
                expect(collection.meta.type()).toBe('type-one');
                expect(collection.meta.displayName()).toBe('collection with capi');
                expect(collection.meta.apiQuery()).toBe('news');
                persistence.collection.save.calls.reset();
            });
        }

        function modifyCollectionWithInvalidCAPI () {
            $('.cnf-collection:nth(1) .cnf-collection__name').click();
            $('#showTags').click();
            dom.type('.apiquery--input', 'zero');
            return wait.ms(vars.CONST.searchDebounceMs + 100).then(() => {
                expect($('.apiquery--input').val()).toBe('zero');
                expect($('.api-query-results a').length).toBe(0);
                expect(textInside('.api-query-results')).toBe('No matches found');

                dom.type('.apiquery--input', 'fail');
                return wait.ms(vars.CONST.searchDebounceMs);
            })
            .then(() => {
                // Check the interface updates
                expect(textInside('.api-query-results')).toBe('Checking...');
                return wait.ms(100);
            })
            .then(() => {
                expect($('.apiquery--input').val()).toBe('fail');
                expect($('.api-query-results a').length).toBe(0);
                expect(textInside('.api-query-results')).toBe('No matches found');

                $('.tool-save-container').click();
                var front = frontWidget.pinnedFront();
                var collection = front.collections.items()[1];
                expect(persistence.collection.save).toHaveBeenCalledWith(collection);
                expect(collection.meta.type()).toBe('type-one');
                expect(collection.meta.displayName()).toBe('collection with capi');
                expect(collection.meta.apiQuery()).toBe('fail');
                expect(collection.meta.showTags()).toBe(true);
                persistence.collection.save.calls.reset();
            });
        }

        function removeCollection () {
            $('.cnf-collection:nth(1) .cnf-collection__name').click();
            $('.tool--rhs').click();

            var front = frontWidget.pinnedFront();
            expect(persistence.front.update).toHaveBeenCalledWith(front);
            expect(front.collections.items().length).toBe(1);
            expect(front.collections.items()[0].meta.displayName()).toBe('new collection');
            persistence.front.update.calls.reset();
        }

        function editMetadata () {
            $('.linky.tool--metadata').click();
            dom.type('.metadata--title', 'Nicer title');
            $('.toggle--hidden').click();
            $('.save-metadata').click();

            var front = frontWidget.pinnedFront();
            expect(persistence.front.update).toHaveBeenCalledWith(front);
            expect(front.props.webTitle()).toBe('Nicer title');
            expect(front.props.isHidden()).toBe(false);
            persistence.front.update.calls.reset();
        }

        function changeImageUrl () {
            $('.linky.tool--metadata').click();
            var imageUrl = 'http://' + vars.CONST.imageCdnDomain + '/base/test/public/fixtures/square.png';
            dom.type('.metadata--provisionalImage', imageUrl);

            return wait.ms(100).then(() => {
                var front = frontWidget.pinnedFront();
                expect(persistence.front.update).toHaveBeenCalledWith(front);
                expect(front.props.webTitle()).toBe('Nicer title');
                expect(front.props.imageUrl()).toBe(imageUrl);
                expect(front.props.imageWidth()).toBe(140);
                expect(front.props.imageHeight()).toBe(140);
                expect(front.props.isHidden()).toBe(false);
                persistence.front.update.calls.reset();
            });
        }

        function deleteLastRemainingCollection () {
            $('.cnf-collection:nth(0) .cnf-collection__name').click();
            $('.tool--rhs').click();

            var front = frontWidget.pinnedFront();
            expect(persistence.front.update).toHaveBeenCalledWith(front);
            expect(front.collections.items().length).toBe(0);
            persistence.front.update.calls.reset();
        }
    });

    it('updates fronts and collections when config changes', function (done) {
        var state = ko.observable({
            config: {
                fronts: { one: { collections: ['apple'] } },
                collections: {
                    apple: { displayName: 'apple' },
                    pear: { displayName: 'pear' },
                    kiwi: { displayName: 'kiwi' }
                }
            }
        }), frontsList = ko.observableArray([{ id: 'one', collections: ['apple'] }]);

        this.loadFront({state, frontsList})
        .then(() => {
            expect($('.cnf-front').length).toBe(1);

            // update creates a new front
            var otherState = state();
            otherState.config.fronts = {
                one: { collections: ['apple'] },
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'one', collections: ['apple'] }, { id: 'two' }]);
            state(otherState);
            return wait.ms(20);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(2);

            // open one of the fronts
            $('.cnf-front:nth(0) .title--text').click();
        })
        .then(() => {
            expect($('.cnf-front:nth(0) .cnf-collection').length).toBe(1);

            var otherState = state();
            otherState.config.fronts = {
                one: { collections: ['apple', 'kiwi'] },
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'one', collections: ['apple', 'kiwi'] }, { id: 'two' }]);
            state(otherState);
            return wait.ms(20);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(2);
            expect($('.cnf-front:nth(0) .cnf-collection').length).toBe(2);

            // opened front gets removed
            var otherState = state();
            otherState.config.fronts = {
                two: { collections: ['pear'] }
            };
            frontsList([{ id: 'two' }]);
            state(otherState);
        })
        .then(() => {
            expect($('.cnf-front').length).toBe(1);
            expect($('.cnf-front .title--text').text()).toBe('two');
        })
        .then(done)
        .catch(done.fail);
    });
});
