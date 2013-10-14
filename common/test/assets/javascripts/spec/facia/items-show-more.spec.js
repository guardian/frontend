define(['modules/facia/image-upgrade', 'bonzo', 'common'], function(ImageUpgrade, bonzo, common) {

    describe('Image Upgrade', function() {

        var imageUpgrade,
            item,
            $item,
            // store existing connection and performance values
            windowPerformance = window.performance,
            navigatorConnection = navigator.connection,
            $style = bonzo(bonzo.create('<style></style>'))
                         .html('body:after { content: "wide"; }');

        beforeEach(function() {
            item = bonzo.create(
                '<li class="item--no-image">' +
                    '<div class="item__image-container">' +
                        '<img class="item__image" data-src="src" data-src-main="src-main" data-src-mobile="src-mobile" data-src-main-mobile="src-main-mobile" />' +
                    '</div>' +
                '</li>'
            );
            $item = bonzo(item);
            window.performance = null;
            navigator.connection = null;
            // add breakpoint style
            $style.appendTo('head');
        });

        afterEach(function() {
            window.performance = windowPerformance;
            navigator.connection = navigatorConnection;
            $style.remove();
        });

        it('should be able to initialise', function() {
            var imageUpgrade = new ImageUpgrade(item);
            expect(imageUpgrade).toBeDefined();
        });

        it('should upgrade image', function() {
            var imageUpgrade = new ImageUpgrade(item);
            imageUpgrade.upgrade();
            expect($item.hasClass('item--no-image')).toBeFalsy();
            expect($item.hasClass('item--image-upgraded')).toBeTruthy();
            expect(common.$g('img', $item[0]).attr('src')).toEqual('src');
        });

        it('should upgrade image to main if required', function() {
            var imageUpgrade = new ImageUpgrade(item, true);
            imageUpgrade.upgrade();
            expect(common.$g('img', $item[0]).attr('src')).toEqual('src-main');
        });

        it('should not upgrade if connection speed is "low"', function() {
            var imageUpgrade = new ImageUpgrade(item);
            navigator = {
                connection: {
                    type: 3
                }
            };
            imageUpgrade.upgrade();
            expect($item.hasClass('item--no-image')).toBeTruthy();
            expect($item.hasClass('item--image-upgraded')).toBeFalsy();
            expect(common.$g('img', $item[0]).attr('src')).toBeFalsy();
        });

        it('should display mobile images if at mobile breakpoint', function() {
            var imageUpgrade = new ImageUpgrade(item);
            $style.html('body:after { content: "mobile"; }');
            imageUpgrade.upgrade();
            expect(common.$g('img', $item[0]).attr('src')).toEqual('src-mobile');
        });

        it('should display main mobile images if required', function() {
            var imageUpgrade = new ImageUpgrade(item, true);
            $style.html('body:after { content: "mobile"; }');
            imageUpgrade.upgrade();
            expect(common.$g('img', $item[0]).attr('src')).toEqual('src-main-mobile');
        });

    });

});
