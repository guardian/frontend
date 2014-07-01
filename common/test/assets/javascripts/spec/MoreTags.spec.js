define([
    'common/utils/$',
    'common/modules/onward/more-tags',
    'helpers/fixtures'
    ], function(
    $,
    MoreTags,
    fixtures
    ) {

    describe("MoreTabs", function() {
        beforeEach(function() {
            fixtures.render({
                id: 'more-tags-fixtures',
                fixtures: [
                        '<div class="content__keywords" data-link-name="article keywords">' +
                            '<ul class="inline-list">' +
                                '<li class="inline-list__item">Tags:</li>' +
                                '<li class="inline-list__item ">' +
                                    '<a class=" "' +
                                    'href="/world/ukraine"' +
                                    'data-link-name="keyword: world/ukraine"' +
                                    'itemprop="keywords">Ukraine</a>,' +
                                '</li>' +
                                '<li class="inline-list__item ">' +
                                    '<a class=" "' +
                                    'href="/world/usforeignpolicy"' +
                                    'data-link-name="keyword: world/usforeignpolicy"' +
                                    'itemprop="keywords">US foreign policy</a>,' +
                                '</li>' +
                                '<li class="inline-list__item js-more-tags js-hidden">' +
                                    '<button class="u-button-reset u-fauxlink js-more-tags__link"' +
                                    'data-link-name="more-tags">more…</button>' +
                                '</li>' +
                                '<li class="inline-list__item js-hidden js-hidden-tag">' +
                                    '<a class=" "' +
                                    'href="/world/russia"' +
                                    'data-link-name="keyword: world/russia"' +
                                    'itemprop="keywords">Russia</a>,' +
                                '</li>' +
                                '<li class="inline-list__item js-hidden js-hidden-tag">' +
                                    '<a class=" "' +
                                    'href="/world/vladimir-putin"' +
                                    'data-link-name="keyword: world/vladimir-putin"' +
                                    'itemprop="keywords">Vladimir Putin</a>,' +
                                '</li>' +
                            '</ul>' +
                        '</div>'

                ]
            });


        });

        afterEach(function() {
            fixtures.clean('more-tags-fixtures');
        });

        it("should initially hide the 'more...' link", function(){
            expect($('.js-more-tags').hasClass('js-hidden')).toBeTruthy();
            expect($('.js-hidden-tag').hasClass('js-hidden')).toBeTruthy();
        });

        it("should reveal the 'more...' link when initialised", function(){

            new MoreTags().init();

            expect($('.js-more-tags').hasClass('js-hidden')).toBeFalsy();

            // but the tags should remain hidden
            expect($('.js-hidden-tag').hasClass('js-hidden')).toBeTruthy();
        });

        it("should reveal the hidden keywords when clicked", function(){

            new MoreTags().init();

            document.querySelector('.js-more-tags__link').click();

            expect($('.js-hidden-tag').hasClass('js-hidden')).toBeFalsy();

            // but the more link should now be hidden
            expect($('.js-more-tags').hasClass('js-hidden')).toBeTruthy();
        });
    });
});
