define(['common', 'helpers/fixtures', 'modules/navigation/profile', 'modules/cookies'], function(common, fixtures, Profile, Cookies) {

    describe('Profile navigation', function() {
        var context,
            contentElem,
            containerId = 'profile-control-container',
            cookieData = 'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY',
            controlFixtures = {
                id: containerId,
                fixtures: [
                    '<div class="' + Profile.CONFIG.classes.container + ' js-hidden">' +
                        '<a href="/signin" data-link-name="User profile" data-toggle="nav-popup-profile" class="control control--profile">' +
                            '<i class="i i-nav-divider"></i>' +
                            '<span class="' + Profile.CONFIG.classes.content + ' control__info">Your profile</span>' +
                            '<i class="i i-profile"></i>' +
                        ' </a>' +
                    '</div>',
                    '<div class="nav-popup-profile js-profile-nav-popup nav-popup nav-popup--box is-off"></div>'
                ]
            };

        fixtures.render(controlFixtures);
        context = document.getElementById(containerId);
        contentElem = context.querySelector('.' + Profile.CONFIG.classes.content);

        describe('Profile Nav control', function() {
            var profile = new Profile(context);

            beforeEach(function() {
                // Assume signed out state
                Cookies.cleanUp(['GU_U']);
                profile.init();
            });

            it('renders the signin prompt when not signed in', function() {
                expect(contentElem.innerHTML).toBe(Profile.CONFIG.signinText);
            });

            it('renders your username when signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                expect(contentElem.innerHTML).toBe('jamesgorrie');
            });

            it('renders the signout link when signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                var signout = profile.dom.popup.querySelectorAll('.' + Profile.CONFIG.classes.signout);
                expect(signout.length).toBe(1);
            });

            it('renders the profile popup when signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                var popup = profile.dom.popup.querySelectorAll('.' + Profile.CONFIG.classes.signout);
                expect(popup.length).toBe(1);
            });

            it('does not render the profile popup when not signed in', function() {
                var popup = context.querySelectorAll('.' + Profile.CONFIG.classes.popup);
                expect(popup.length).toBe(0);
            });

            it('does not render the signout link more than once when signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                var signout = profile.dom.popup.querySelectorAll('.' + Profile.CONFIG.classes.signout);
                expect(signout.length).toBe(1);
                profile.init();
                expect(signout.length).toBe(1);
            });
        });
    });

});
