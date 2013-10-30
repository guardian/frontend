define(['modules/facia/collection-show-more', 'bonzo', 'common', 'bean'], function(CollectionShowMore, bonzo, common, bean) {

    describe('container Show More', function() {

        var collectionShowMore,
            container,
            collection,
            $template,
            $style,
            clickstreamEvent = 'module:clickstream:click';

        beforeEach(function() {
            container = bonzo.create(
                '<section>' +
                    '<ul class="js-collection--show-more">' +
                        '<script type="text/x-template" class="collection--template"></script>' +
                    '</ul>' +
                '</section>'
            )[0];
            collection = common.$g('ul', container)[0];
            $template = common.$g('.collection--template', collection);
            // add collection
            var i = 10;
            while(i--) {
                bonzo(collection).prepend('<li class="item">item</li>');
                $template.append('<li class="item">item</li>');
            }
            collectionShowMore = new CollectionShowMore(collection);
            // add breakpoint style
            $style = bonzo(bonzo.create('<style></style>'))
                .html('body:after { content: "wide"; }')
                .appendTo('head');
        });

        afterEach(function() {
            $style.remove();
            common.mediator.off(clickstreamEvent);
        });

        it('should be able to initialise', function() {
            expect(collectionShowMore).toBeDefined();
        });

        it('should remove "js-collection--show-more" class from container', function() {
            collectionShowMore.addShowMore();
            expect(bonzo(collection).hasClass('js-collection--show-more')).toBeFalsy();
        });

        it('should append button after collection', function() {
            collectionShowMore.addShowMore();
            expect(bonzo(collection).next()[0].nodeName.toLowerCase()).toEqual('button');
        });

        it('should not append button if displaying all collection', function() {
            common.$g('.item:nth-child(n+2)', container).remove();
            collectionShowMore.addShowMore();
            expect(common.$g('button', container).length).toEqual(0);
        });

        it('should show collection when button clicked', function() {
            collectionShowMore.addShowMore();
            bean.fire(common.$g('button', container)[0], 'click');
            expect(common.$g('.item', collection).hasClass('u-h')).toBeFalsy();
        });

        it('should update "data-link-name" after click', function() {
            collectionShowMore.addShowMore();
            var $button = common.$g('button', container);
            bean.fire($button[0], 'click');
            expect($button.attr('data-link-name')).toEqual('Show more | 1');
        });

        it('should remove button if no more collection, after clickstream event', function() {
            collectionShowMore.addShowMore();
            var button = common.$g('button', container)[0];
            bean.fire(button, 'click');
            bean.fire(button, 'click');
            common.mediator.emit(clickstreamEvent, {target: button});
            expect(common.$g('button', container).length).toEqual(0);
        });

        it('should not remove button if more collection', function() {
            $style.html('body:after { content: "mobile"; }');
            collectionShowMore.addShowMore();
            bean.fire(common.$g('button', container)[0], 'click');
            expect(common.$g('button', container).length).toEqual(1);
        });

        it('should initially show 2 collection at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            collectionShowMore.addShowMore();
            expect(common.$g('.item', collection).length).toEqual(2);
        });

        it('should initially 5 collection in the "news" container at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            bonzo(container).attr('data-type', 'news');
            collectionShowMore.addShowMore();
            expect(common.$g('.item', collection).length).toEqual(5);
        });

        it('should show 5 more at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            collectionShowMore.addShowMore();
            bean.fire(common.$g('button', container)[0], 'click');
            expect(common.$g('.item', collection).length).toEqual(7);
        });

    });

});
