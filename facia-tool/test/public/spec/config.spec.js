import $ from 'jquery';
import drag from 'test/utils/drag';
import configAction from 'test/utils/config-actions';
import * as dom from 'test/utils/dom-nodes';
import ConfigLoader from 'test/utils/config-loader';
import textInside from 'test/utils/text-inside';

describe('Config', function () {
    beforeEach(function () {
        this.testInstance = new ConfigLoader();
    });
    afterEach(function () {
        this.testInstance.dispose();
    });

    it('/config/fronts', function (done) {
        var mockConfig = this.testInstance.mockConfig,
            baseModel;

        this.testInstance.load()
        .then(model => {
            baseModel = model;

            return createFrontWithCollection();
        })
        .then(function (request) {
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.initialCollection.displayName).toEqual('gossip');
            expect(data.initialCollection.type).toEqual('dynamic/test');
            expect(data.priority).toEqual('test');

            return dragAnotherCollectionInside();
        })
        .then(function (request) {
            expect(request.front).toEqual('test/front');
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.priority).toEqual('test');
            expect(data.collections).toEqual(['sport', 'gossip']);

            expect(textInside('.content-pane:nth(0) .cnf-collection:nth(0)')).toBe('1 Sport also on uk');
            expect(textInside('.content-pane:nth(1) .cnf-collection:nth(1)')).toBe('2 Sport also on test/front');

            return dragInsideTheSameCollection();
        })
        .then(function (request) {
            expect(request.front).toEqual('test/front');
            var data = request.data;
            expect(data.id).toEqual('test/front');
            expect(data.priority).toEqual('test');
            expect(data.collections).toEqual(['gossip', 'sport']);
        })
        .then(done)
        .catch(done.fail);

        function createFrontWithCollection () {
            return configAction(mockConfig, baseModel, () => {
                dom.click(dom.$('.title .linky'));
                dom.type($('.cnf-form input[type=text]'), 'test/front');
                // There's an onchange event, no need to click on save

                var newFront = dom.$('.cnf-front.open');
                dom.click(newFront.querySelector('.tool--container'));
                dom.type(newFront.querySelector('.cnf-form input[type=text]'), 'gossip');

                dom.click(newFront.querySelector('.cnf-form .type-option-chosen'));
                dom.click(newFront.querySelector('.cnf-form .type-picker .type-option'));

                dom.click(newFront.querySelector('button.tool'));

                return {
                    fronts: {
                        'test/front': {
                            collections: ['gossip'],
                            priority: 'test'
                        }
                    },
                    collections: {
                        'gossip': {
                            type: 'dynamic/test',
                            displayName: 'gossip'
                        }
                    }
                };
            });
        }

        function dragAnotherCollectionInside () {
            return configAction(mockConfig, baseModel, () => {
                // Open the front in the second panel
                $('.content-pane:nth(1) .title--text:nth(1)').click();
                var collectionToDrag = $('.content-pane:nth(1) .cnf-collection')[1];
                var collectionToDropTo = $('.content-pane:nth(0) .cnf-fronts .cnf-collection')[0];
                var droppableContainer = $('.content-pane:nth(0) .cnf-fronts .droppable')[0];
                var droppableTarget = drag.droppable(droppableContainer);
                var sourceCollection = new drag.Collection(collectionToDrag);

                droppableTarget.dragstart(collectionToDrag, sourceCollection);
                droppableTarget.drop(collectionToDropTo, sourceCollection);

                return {
                    fronts: {
                        'test/front': {
                            collections: ['sport', 'gossip'],
                            priority: 'test'
                        }
                    }
                };
            });
        }

        function dragInsideTheSameCollection () {
            return configAction(mockConfig, baseModel, () => {
                // Open the front in the second panel
                var collectionToDrag = $('.content-pane:nth(0) .cnf-collection')[1];
                var collectionToDropTo = $('.content-pane:nth(0) .cnf-collection')[0];
                var droppableContainer = $('.content-pane:nth(0) .cnf-fronts .droppable')[0];
                var droppableTarget = drag.droppable(droppableContainer);
                var sourceCollection = new drag.Collection(collectionToDrag);

                droppableTarget.dragstart(collectionToDrag, sourceCollection);
                droppableTarget.drop(collectionToDropTo, sourceCollection);

                return {
                    fronts: {
                        'test/front': {
                            collections: ['gossip', 'sport'],
                            priority: 'test'
                        }
                    }
                };
            });
        }
    });
});
