define(['modules/facia/items-show-more', 'bonzo', 'common', 'bean'], function(ItemsShowMore, bonzo, common, bean) {

    describe('Items Show More', function() {

        var itemsShowMore,
            collection,
            items,
            $style,
            clickstreamEvent = 'module:clickstream:click';

        beforeEach(function() {
            collection = bonzo.create(
                '<section>' +
                    '<ul></ul>' +
                '</section>'
            )[0];
            items = common.$g('ul', collection)[0];
            // add items
            var i = 10;
            while(i--) {
                bonzo(items).append('<li class="item">item</li>');
            }
            itemsShowMore = new ItemsShowMore(items);
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
            expect(itemsShowMore).toBeDefined();
        });

        it('should append button after items', function() {
            itemsShowMore.addShowMore();
            expect(bonzo(items).next()[0].nodeName.toLowerCase()).toEqual('button');
        });

        it('should not append button if displaying all items', function() {
            common.$g('.item:nth-child(n+2)', collection).remove();
            itemsShowMore.addShowMore();
            expect(common.$g('button', collection).length).toEqual(0);
        });

        it('should show items when button clicked', function() {
            itemsShowMore.addShowMore();
            bean.fire(common.$g('button', collection)[0], 'click');
            expect(common.$g('.item', items).hasClass('u-h')).toBeFalsy();
        });

        it('should update "data-link-name" after click', function() {
            itemsShowMore.addShowMore();
            var $button = common.$g('button', collection);
            bean.fire($button[0], 'click');
            expect($button.attr('data-link-name')).toEqual('Show more | 1');
        });

        it('should remove button if no more items, after clickstream event', function() {
            itemsShowMore.addShowMore();
            var button = common.$g('button', collection)[0];
            bean.fire(button, 'click');
            common.mediator.emit(clickstreamEvent, {target: button});
            expect(common.$g('button', collection).length).toEqual(0);
        });

        it('should not remove button if more items', function() {
            $style.html('body:after { content: "mobile"; }');
            itemsShowMore.addShowMore();
            bean.fire(common.$g('button', collection)[0], 'click');
            expect(common.$g('button', collection).length).toEqual(1);
        });

        it('should initially show 2 items at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            itemsShowMore.addShowMore();
            expect(common.$g('.item.u-h', items).length).toEqual(8);
        });

        it('should initially 5 items in the "news" container at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            bonzo(collection).attr('data-type', 'news');
            itemsShowMore.addShowMore();
            expect(common.$g('.item.u-h', items).length).toEqual(5);
        });

        it('should show 5 more at mobile breakpoint', function() {
            $style.html('body:after { content: "mobile"; }');
            itemsShowMore.addShowMore();
            bean.fire(common.$g('button', collection)[0], 'click');
            expect(common.$g('.item.u-h', items).length).toEqual(3);
        });

    });

});
