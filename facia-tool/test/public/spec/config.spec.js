define([
    'test/utils/async-test',
    'test/utils/drag',
    'mock/collection',
    'test/utils/config-actions',
    'test/utils/dom-nodes'
], function(
    test,
    drag,
    mockCollection,
    configAction,
    dom
){
    describe('Config', function () {
        test('config', '/config/fronts', function (done) {

            createFrontWithCollection()
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
            })
            .then(done);

            function createFrontWithCollection () {
                return configAction(function () {
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
                return configAction(function () {
                    var collectionToDrag = document.querySelectorAll('.cnf-collection')[1];
                    var collectionToDropTo = document.querySelector('.cnf-fronts .cnf-collection');
                    var droppableContainer = document.querySelector('.cnf-fronts .droppable');
                    var droppableTarget = drag.droppable(droppableContainer);
                    var sourceCollection = new drag.Collection(collectionToDrag);

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
        });
    });
});
