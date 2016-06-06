define([], function () {
    function setVideoDropdown(text, complete) {
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
        navItemLink.addEventListener('click', complete);
    }


    return function () {
        this.id = 'VideoNav';
        this.start = '2016-06-02';
        this.expiry = '2016-06-30';
        this.author = 'James Gorrie';
        this.description = 'Use video carousel as video nav';
        this.audience = 1;
        this.audienceOffset = 0;
        this.audienceCriteria = 'On a front with the carousel';
        this.idealOutcome = 'People love it.';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'baseline1',
            test: function () {}
        }, {
            id: 'baseline2',
            test: function () {},
            success: function(complete) {
                setVideoDropdown('watch', complete);
            }
        }];

    };

});
