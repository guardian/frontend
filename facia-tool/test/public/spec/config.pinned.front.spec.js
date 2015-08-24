import $ from 'jquery';
import BaseModel from 'models/base-model';
import columns from 'models/available-columns';
import extensions from 'models/available-extensions';
import mainLayout from 'views/templates/main.scala.html!text';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import * as dom from 'test/utils/dom-nodes';
import inject from 'test/utils/inject';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Config Pinned Front', function () {
    beforeEach(function (done) {
        var baseModel = new BaseModel(columns, [
            extensions.cardTypes
        ], {
            params: { layout: 'config' },
            location: { pathname: 'training' },
            on: () => {},
            off: () => {}
        }, {
            config: { fronts: {} },
            defaults: {
                types: [{ name: 'type-one' }]
            }
        });
        this.ko = inject(mainLayout + verticalLayout);
        this.scope = mockjax.scope();

        this.baseModel = baseModel;
        this.ko.apply(baseModel).then(() => baseModel.loaded).then(done);
    });
    afterEach(function () {
        this.scope.clear();
        this.ko.dispose();
    });

    it('keeps the pinned front while refreshing', function (done) {
        var baseModel = this.baseModel, scope = this.scope;

        attemptCreateMultipleFronts()
        .then(expectAlertShown)
        .then(expectOnlyOneFrontVisible)
        .then(updateConfiguration)
        .then(expectPinnedFrontStillVisible)
        .then(createFront)
        .then(updateConfigurationAgain)
        .then(expectPinnedFrontStillVisibleForCollection)
        .then(createACollection)
        .then(updateConfigurationWhileCollectionOpen)
        .then(expectOpenCollectionPinned)
        .then(saveCollection)
        .then(expectFrontScrolledTo)
        .then(possibleToCreateNewFronts)
        .then(done)
        .catch(done.fail);

        function attemptCreateMultipleFronts () {
            // Only one pinned front at the same time
            $('.title .linky').click();
            $('.title .linky').click();
            $('.title .linky').click();
            return wait.ms(100);
        }

        function expectAlertShown () {
            expect(textInside('.modalDialog-message')).toMatch(/one front at a time/i);
            $('.button-action').click();
            return wait.ms(100);
        }
        function expectOnlyOneFrontVisible () {
            expect($('.cnf-front').length).toBe(1);
        }
        function updateConfiguration () {
            baseModel.update({
                config: {
                    fronts: {
                        one: { priority: 'training' },
                        two: { priority: 'training' }
                    }
                },
                defaults: {}
            });
        }
        function expectPinnedFrontStillVisible () {
            expect($('.cnf-front').length).toBe(3);
            expect($('.cnf-front:nth(0) .input-url-path').length).toBe(1);
        }
        function createFront () {
            dom.type('.input-url-path', 'new-front');
            $('.create-new-front').click();
        }
        function updateConfigurationAgain () {
            baseModel.update({
                config: {
                    fronts: {
                        one: { priority: 'training' },
                        two: { priority: 'training' },
                        three: { priority: 'training' }
                    }
                },
                defaults: {}
            });
        }
        function expectPinnedFrontStillVisibleForCollection () {
            expect($('.cnf-front').length).toBe(4);
            expect($('.cnf-front:nth(0) .linky.tool--container').length).toBe(1);
        }
        function createACollection () {
            $('.cnf-front:nth(0) .linky.tool--container').click();
            dom.type('.title--input', 'nice collection');
            $('.type-option-chosen').click();
            $('.type-option-value:nth(1)').click();
        }
        function updateConfigurationWhileCollectionOpen () {
            baseModel.update({
                config: {
                    fronts: {
                        one: { priority: 'training' },
                        two: { priority: 'training' },
                        three: { priority: 'training' },
                        four: { priority: 'training' }
                    }
                },
                defaults: {}
            });
        }
        function expectOpenCollectionPinned () {
            expect($('.cnf-front').length).toBe(5);
            expect($('.cnf-front:nth(0) .title--input').val()).toBe('nice collection');
        }
        function saveCollection () {
            return new Promise(resolve => {
                scope({
                    url: '/config/fronts',
                    method: 'post',
                    responseText: {}
                });
                baseModel.once('config:needs:update', callback => {
                    callback({
                        config: {
                            fronts: {
                                one: { priority: 'training' },
                                two: { priority: 'training' },
                                three: { priority: 'training' },
                                four: { priority: 'training' },
                                'new-front': {
                                    priority: 'training',
                                    collections: ['nice']
                                }
                            },
                            collections: {
                                nice: { displayName: 'nice collection' }
                            }
                        },
                        defaults: {}
                    });
                    resolve();
                });
                $('.tool-save-container').click();
            });
        }
        function expectFrontScrolledTo () {
            expect($('.cnf-front').length).toBe(5);
            expect(textInside('.cnf-front:nth(1) .cnf-collection__name')).toBe('nice collection');
        }
        function possibleToCreateNewFronts () {
            $('.title .linky').click();
            expect($('.cnf-front:nth(0) .input-url-path').length).toBe(1);
        }
    });
});
