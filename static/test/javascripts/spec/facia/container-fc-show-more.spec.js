define([
    'bonzo',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'text!facia/views/button-show-more.html',
    'facia/modules/ui/container-fc-show-more'
], function (
    bonzo,
    bean,
    qwery,
    $,
    template,
    showMoreBtn,
    containerFcShowMore
    ) {

    describe('Container Show More', function() {

        var container,
            $container,
            containerId = 'pictures-and-video',
            sut;

        beforeEach(function () {
            container = bonzo.create(
                    '<section class="container" data-link-name="' + containerId + '">' +
                        '<div class="facia-container__inner">' +
                            '<div class="container__body js-hide">' +
                                '<div class="js-hide"></div>' +
                            '</div>' +
                        '</div>' +
                    '</section>'
            )[0];
            $container = bonzo(container);

            sut = new containerFcShowMore($(".container__body", $container));
        });

        afterEach(function () {
            sut = null;
        });

        it("should get section (container) id", function() {
            expect(sut.getContainerType()).toEqual("pictures and video");
        });

        it("should add button to the container", function() {
            spyOn(sut, "getContainerType").and.callThrough();

            sut.addShowMoreButton();

            expect(sut.getContainerType).toHaveBeenCalled();
            expect($(".button", $container).length > 0).toBeTruthy;
            expect($container.text()
                .replace(/(\r\n|\n|\r)/g,"") // Replace line breaks
                .replace(/^\s\s*/, ''))      // Replace spaces at the beginning
                .toEqual("More pictures and video");
        });

        it("should hide button after click", function() {
            sut.addShowMoreButton();

            bean.fire($('.button', $container)[0], 'click');
            expect($('.button', $container).css('display')).toBe('none');
        });
    });
});
