define([
    'bonzo',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'text!facia/views/button-show-more.html',
    'facia/modules/ui/container-show-more'
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
            containerId = 'US news',
            sut;

        beforeEach(function () {
            container = bonzo.create(
                    '<section class="container">' +
                        '<div class="facia-container__inner">' +
                            '<div class="container__body js-hide" data-title="' + containerId + '">' +
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
            expect(sut.getContainerTitle()).toEqual("US news");
        });

        it("should return empty string if there is no data attribute", function() {
            $(".container__body", $container).removeAttr("data-title");

            expect(sut.getContainerTitle()).toEqual("");
        });

        it("should add button to the container", function() {
            spyOn(sut, "getContainerTitle").and.callThrough();

            sut.addShowMoreButton();

            expect(sut.getContainerTitle).toHaveBeenCalled();
            expect($(".button", $container).length > 0).toBeTruthy;
            expect($(".button", $container).text()
                .replace(/(\r\n|\n|\r)/g,"") // Replace line breaks
                .replace(/^\s\s*/, ''))      // Replace spaces at the beginning
                .toEqual("More US news");
        });

        it("should hide button after click", function() {
            sut.addShowMoreButton();

            bean.fire($('.button', $container)[0], 'click');
            expect($('.button', $container).css('display')).toBe('none');
        });
    });
});
