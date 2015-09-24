import $ from 'common/utils/$';
import MoreTags from 'common/modules/onward/more-tags';
import fixtures from 'helpers/fixtures';

describe('MoreTabs', function () {

    var ACTIVE_STATE = 'is-available';

    beforeEach(function () {
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
                            '<li class="inline-list__item js-more-tags modern-hidden">' +
                                '<button class="u-button-reset u-fauxlink js-more-tags__link"' +
                                'data-link-name="more-tags">more…</button>' +
                            '</li>' +
                            '<li class="inline-list__item modern-hidden modern-hidden-tag">' +
                                '<a class=" "' +
                                'href="/world/russia"' +
                                'data-link-name="keyword: world/russia"' +
                                'itemprop="keywords">Russia</a>,' +
                            '</li>' +
                            '<li class="inline-list__item modern-hidden modern-hidden-tag">' +
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

    afterEach(function () {
        fixtures.clean('more-tags-fixtures');
    });

    it('should initially hide the \'more...\' link', function () {
        expect($('.js-more-tags').hasClass('modern-hidden')).toBeTruthy();
        expect($('.modern-hidden-tag').hasClass('modern-hidden')).toBeTruthy();
    });

    it('should reveal the \'more...\' link when initialised', function () {

        new MoreTags().init();

        expect($('.js-more-tags').hasClass(ACTIVE_STATE)).toBeTruthy();

        // but the tags should remain hidden
        expect($('.modern-hidden-tag').hasClass('modern-hidden')).toBeTruthy();
    });

    it('should reveal the hidden keywords when clicked', function () {

        new MoreTags().init();

        document.querySelector('.js-more-tags__link').click();

        expect($('.modern-hidden-tag').hasClass('modern-hidden')).toBeFalsy();

        // but the more link should now be hidden
        expect($('.js-more-tags').hasClass(ACTIVE_STATE)).toBeFalsy();
    });
});

