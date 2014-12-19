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
                            '<div class="container__body js-hide fc-show-more--hidden" ' +
                                'data-title="' + containerId + '" data-id="' + containerId + '">' +
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
            sessionStorage.clear();
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
            expect($(".button", $container).length > 0).toBeTruthy();
            expect($(".button", $container).text()
                .replace(/(\r\n|\n|\r)/g,"") // Replace line breaks
                .replace(/^\s\s*/, ''))      // Replace spaces at the beginning
                .toEqual("More US news");
        });

        it("should change button text", function() {
            sut.addShowMoreButton();

            bean.fire($('.button', $container)[0], 'click');
            expect($('.button', $container).text()
                .replace(/(\r\n|\n|\r)/g,"") // Replace line breaks
                .replace(/^\s\s*/, ''))      // Replace spaces at the beginning
                .toEqual('Less');
        });

        it("should show/hide content", function() {
            sut.addShowMoreButton();

            bean.fire($('.button', $container)[0], 'click');
            expect($('.container__body', $container).hasClass('fc-show-more--hidden')).toBeFalsy();

            bean.fire($('.button', $container)[0], 'click');
            expect($('.container__body', $container).hasClass('fc-show-more--hidden')).toBeTruthy();
        });

        it("should change the button state", function() {
            sut.addShowMoreButton();

            var $button = $('.button', $container);

            expect($button.hasClass("button--primary")).toBeTruthy();
            expect($button.attr("data-link-name")).toEqual("Less " + containerId);
            expect($('.i', $button).hasClass("i-plus-white")).toBeTruthy();

            bean.fire($('.button', $container)[0], 'click');

            expect($button.hasClass("button--tertiary")).toBeTruthy();
            expect($button.attr("data-link-name")).toEqual("More " + containerId);
            expect($('.i', $button).hasClass("i-minus-blue")).toBeTruthy();
        });

        it("should store the state in sessionStorage", function() {
            var result = '{"value":{"' + containerId + '":"more"}}';

            sut.addShowMoreButton();

            bean.fire($('.button', $container)[0], 'click');

            expect(window.sessionStorage.getItem('gu.prefs.section-states')).toEqual(result);
        });
    });
});
