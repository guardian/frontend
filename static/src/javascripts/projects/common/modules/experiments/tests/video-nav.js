define(['common/utils/$'], function ($) {
    var videoIconHtml = '<span class="inline-video-icon inline-icon video-nav-test-icon">' +
        '<svg width="36" height="23" viewBox="0 0 36 23">' +
            '<path d="M3.2 0L0 3.3v16.4L3.3 23H22V0H3.2m30.4 1L25 9v5l8.6 8H36V1h-2.4"></path>' +
        '</svg>' +
    '</span>';


    function setVideoOnNav(text) {
        var videoIcon = $.create(videoIconHtml).get(0);

        var topNavigation = document.querySelector('.top-navigation');
        var secondNavItem = document.querySelectorAll('.top-navigation__item')[1];
        var navItem = secondNavItem.cloneNode(true);

        var navItemLink = navItem.querySelector('.top-navigation__action');

        navItemLink.href = '/video';
        navItemLink.setAttribute('data-link-name', 'nav : primary : watch');
        navItemLink.innerHTML = text;
        navItemLink.appendChild(videoIcon);
        topNavigation.insertBefore(navItem, secondNavItem);
    }


    return function () {
        this.id = 'VideoNav';
        this.start = '2016-06-06';
        this.expiry = '2016-06-15';
        this.author = 'James Gorrie';
        this.description = 'Use video carousel as video nav';
        this.audience = .2;
        this.audienceOffset = .1;
        this.audienceCriteria = 'On a front with the carousel';
        this.idealOutcome = 'People love it.';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'standard-nav',
            test: function () {}
        }, {
            id: 'video-nav',
            test: function () {
                setVideoOnNav('watch');
            }
        }];

    };

});
