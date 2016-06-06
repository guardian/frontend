define([], function () {
    function setVideoOnNav(text, complete) {
        var videoIcon = document.querySelector('.inline-video-icon').cloneNode(true);

        var topNavigation = document.querySelector('.top-navigation');
        var secondNavItem = document.querySelectorAll('.top-navigation__item')[1];
        var navItem = secondNavItem.cloneNode(true);

        var navItemLink = navItem.querySelector('.top-navigation__action');

        videoIcon.classList.add('video-nav-test-icon');
        navItemLink.href = '/video';
        navItemLink.setAttribute('data-link-name', 'nav : primary : watch');
        navItemLink.innerHTML = text;
        navItemLink.appendChild(videoIcon);
        topNavigation.insertBefore(navItem, secondNavItem);
    }


    return function () {
        this.id = 'VideoNav';
        this.start = '2016-06-06';
        this.expiry = '2016-06-13';
        this.author = 'James Gorrie';
        this.description = 'Use video carousel as video nav';
        this.audience = .2;
        this.audienceOffset = 0;
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
