define([
    'bonzo',
    'bean',
    'common/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/facia/collection-show-more'
], function(bonzo, bean, $, mediator, ajax, CollectionShowMore) {

    describe('Collection Show More', function() {

        var collectionShowMore,
            container,
            collection,
            $style,
            clickstreamEvent = 'module:clickstream:click',
            click = function() {
                bean.fire($('button', container)[0], 'click');
            },
            server,
            response = JSON.stringify({
                html: '<ul class="collection">' + [1, 2, 3, 4, 5, 6].reduce(function(previousValue, currentValue) {
                    return previousValue + '<li class="item" data-link-name="trail | ' + currentValue + '">Item ' + currentValue + '</li>'
                }, '') + '</ul>'
            });

        ajax.init({
            page: {
                ajaxUrl: '',
                edition: 'UK'
            }
        });

        beforeEach(function() {
            container = bonzo.create(
                '<section>' +
                    '<ul class="js-collection--show-more" data-link-context-path="collection/uk/sport/regular-sories">' +
                        '<li class="item" data-link-name="trail | 1">Item 1</li>' +
                    '</ul>' +
                '</section>'
            )[0];
            collection = $('ul', container)[0];
            // add collection
            collectionShowMore = new CollectionShowMore(collection);
            // add breakpoint style
            $style = bonzo(bonzo.create('<style></style>'))
                .html('body:after { content: "mobile"; }')
                .appendTo('head');
            // set up fake server
            server = sinon.fakeServer.create();
            server.respondWith([200, {}, response]);
            server.autoRespond = true;
            // seem to need this, or sinon gets ahead of itself
            server.autoRespondAfter = 20;
        });

        afterEach(function() {
            $style.remove();
            mediator.removeAllListeners();
            server.restore();
        });

        it('should be able to initialise', function() {
            expect(collectionShowMore).toBeDefined();
        });

        describe('button', function() {

            it('should append button after collection', function() {
                collectionShowMore.addShowMore();
                expect(bonzo(collection).next()[0].nodeName.toLowerCase()).toEqual('button');
            });

            it('should emit "modules:collectionShowMore:renderButton" on render of button', function() {
                var emitSpy = sinon.spy(mediator, 'emitEvent');
                collectionShowMore.addShowMore();
                expect(emitSpy).toHaveBeenCalledWith('modules:collectionShowMore:renderButton', [collectionShowMore]);
                emitSpy.restore();
            });

            it('should add default "news" tone', function() {
                collectionShowMore.addShowMore();
                expect($('button', container).hasClass('tone-news')).toBeTruthy();
            });

            it('should add tone in collection\'s "data-tone" attribute', function() {
                var tone = 'feature',
                    $collection = $('ul', container).attr('data-tone', tone),
                    collectionShowMore = new CollectionShowMore($collection[0]);
                collectionShowMore.addShowMore();
                expect($('button', container).hasClass('tone-' + tone)).toBeTruthy();
            });

            it('should hide button if displaying all items', function() {
                $(collection).attr('data-can-show-more', 'false');
                // create again, after culling fixture data
                var collectionShowMore = new CollectionShowMore(collection);
                collectionShowMore.addShowMore();
                expect($('button', container).css('display')).toEqual('none');
            });

            it('should listen to resize if displaying all items', function() {
                var mediatorSpy = sinon.spy(mediator, 'on');
                $(collection).attr('data-can-show-more', 'false');
                // create again, after culling fixture data
                var collectionShowMore = new CollectionShowMore(collection);
                collectionShowMore.addShowMore();
                expect(mediatorSpy).toHaveBeenCalledWith('window:resize');
                mediatorSpy.restore();
            });

            it('should disable while making ajax call', function() {
                collectionShowMore.addShowMore();
                click();
                var $button = $('button', container);
                expect($button.attr('disabled')).toBeTruthy();

                waitsFor(function() {
                    return $('.item', collection).length > 1;
                }, 'server hasn\'t responded', 100);
                runs(function() {
                    expect($button.attr('disabled')).toBeFalsy();
                });
            });
        });

        it('should remove "js-collection--show-more" class from container when clicked', function() {
            collectionShowMore.addShowMore();
            click();
            expect(bonzo(collection).hasClass('js-collection--show-more')).toBeFalsy();
        });

        it('should show collection when button clicked', function() {
            collectionShowMore.addShowMore();
            click();

            waitsFor(function() {
                return $('.item', collection).length > 1;
            }, 'server hasn\'t responded', 100);
            runs(function() {
                expect($('.item', collection).length).toEqual(6);
            });
        });

        it('should update "data-link-name" after click', function() {
            collectionShowMore.addShowMore();
            click();

            waitsFor(function() {
                return $('.item', collection).length > 1;
            }, 'server hasn\'t responded', 100);
            runs(function() {
                expect($('button', container).attr('data-link-name')).toEqual('Show more | 1');
            });
        });

        it('should remove button, if no more items, after clickstream event', function() {
            collectionShowMore.addShowMore();
            click();

            waitsFor(function() {
                return $('.item', collection).length > 1;
            }, 'server hasn\'t responded', 100);
            runs(function() {
                click();
                mediator.emit(clickstreamEvent, {target: $('button', container)[0]});
                expect($('button', container).length).toEqual(0);
            });
        });

        it('should remove any hidden items', function() {
            bonzo(collection).append('<li class="item" style="display: none"></li>');
            collectionShowMore.addShowMore();
            expect($('.item', collection).length).toEqual(2);
            click();
            expect($('.item', collection).length).toEqual(1);
        });

        it('should use items on page if can\'t show more', function() {
            bonzo(collection).attr('data-can-show-more', 'false')
                .append(
                    [1, 2, 3, 4, 5, 6].reduce(function(previousValue, currentValue) {
                        return previousValue + '<li class="item" style="display: none">' + currentValue + '</li>'
                    }, '')
                );
            collectionShowMore.addShowMore();
            click();
            expect($('.item', collection).length).toEqual(6);
            click();
            expect($('.item', collection).length).toEqual(7);
            expect($('button', collection).length).toEqual(0);
        });

        it('should update data-link-name index', function() {
            collectionShowMore.addShowMore();
            click();

            waitsFor(function() {
                return $('.item', collection).length > 1;
            }, 'server hasn\'t responded', 100);
            runs(function() {
                $('.item', collection).each(function(item, index) {
                    expect($(item).attr('data-link-name')).toEqual('trail | ' + (index + 1));
                });
            });
        });

    });

});
