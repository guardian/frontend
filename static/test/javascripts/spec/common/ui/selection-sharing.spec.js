define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    qwery,
    $,
    fixtures,
    Injector
) {
    describe('Selection sharing', function () {

        var conf =  {
            id: 'selection-sharing-test',
            fixtures: ['<div class="js-article__body"></div>']
        },
            injector = new Injector(),
            selectionSharing;

        beforeEach(function (done) {
            injector.mock({
                'common/utils/client-rects': {
                    getBoundingClientRect: function () {
                        return {
                            left: 0,
                            bottom: 0
                        };
                    }
                },
                'common/utils/detect':  {
                    hasTouchScreen:      function () { return false; },
                    hasPushStateSupport: function () { return true; }
                }
            });
            injector.require(['common/modules/ui/selection-sharing'], function () {
                selectionSharing = arguments[0];

                fixtures.render(conf);
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }

                done();
            });
        });

        afterEach(function () {
            fixtures.clean(conf.id);
            $('.selection-sharing').remove();
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        });

        it('should be initially hidden in the article body', function () {
            selectionSharing.init();
            expect(qwery('.selection-sharing').length).toBe(1);
            expect($('.selection-sharing').hasClass('selection-sharing--active')).toBe(false);
        });

        it('should be visible when text is selected in the article body', function () {
            selectionSharing.init();

            var $jsArticleBody = $('.js-article__body');

            var p1 = document.createElement('p'),
            p2 = document.createElement('p'),
            t1 = document.createTextNode('aa'),
            t2 = document.createTextNode('aa'),
            range = document.createRange();

            p1.appendChild(t1);
            p2.appendChild(t2);

            $jsArticleBody.append(p1);
            $jsArticleBody.append(p2);

            range.setStart(t1, 1);
            range.setEnd(t2, 1);

            if (window.getSelection) {
                window.getSelection().addRange(range);
            }

            // More reliable than testing a throttled event handler.
            selectionSharing.updateSelection();

            expect($('.selection-sharing').hasClass('selection-sharing--active')).toBe(true);
        });

    });
});
