define(['common', 'fixtures', 'modules/navigation/profile', 'modules/cookies'], function(common, fixtures, Profile, Cookies) {

    describe('Profile navigation', function() {
        var context,
            control,
            contentElem,
            server = sinon.fakeServer.create(),
            containerId = 'profile-control-container',
            cookieData = 'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY',
            config = {page: {
                idUrl: 'https://profile.theguardian.co.uk'
            }},
            controlFixtures = {
                id: containerId,
                fixtures: [
                    '<div class="' + Profile.CONFIG.classes.container + ' js-hidden">' +
                    '    <a href="/signin" data-link-name="User profile" data-control-for="nav-popup-profile" class="control control--profile">' +
                    '        <i class="i i-nav-divider"></i>' +
                    '        <span class="' + Profile.CONFIG.classes.content + ' control--profile__info">Your profile</span>' +
                    '        <i class="i i-profile"></i>' +
                    '    </a>' +
                    '</div>',
                    '<div class="nav-popup-profile js-profile-nav-popup nav-popup nav-popup--box is-off"></div>'
                ]
            };

        fixtures.render(controlFixtures);
        context = document.getElementById(containerId);
        contentElem = context.querySelector('.' + Profile.CONFIG.classes.content)

        describe('Profile Nav control', function() {
            var profile = new Profile(context);

            beforeEach(function() {
                profile.dom.popup.innerHTML = '';
            });

            it('renders show the signin prompt when not signed in', function() {
                profile.init();
                expect(contentElem.innerHTML === Profile.CONFIG.signinText);
            });

            it('renders your username when you are signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                expect(contentElem.innerHTML === 'jamesgorrie');
            });

            it('renders the signout link if you are signed in', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                expect(profile.dom.popup.querySelector('.' + Profile.CONFIG.classes.signout));
            });

            it('only renders the signout link once', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                var signout = profile.dom.popup.querySelectorAll('.' + Profile.CONFIG.classes.signout);
                
                expect(signout.length === 1);
                profile.init();
                expect(signout.length === 1);
            });

            it('removes the signin link if you are logged out', function() {
                Cookies.add('GU_U', cookieData);
                profile.init();
                var signout = profile.dom.popup.querySelectorAll('.' + Profile.CONFIG.classes.signout);
                expect(signout.length === 1);
                Cookies.cleanUp(['GU_U']);
                profile.init();
                expect(signout.length === 0);
            });

            it('removes the profile popup if you are logged out', function() {
                var popup = context.querySelectorAll('.' + Profile.CONFIG.classes.popup);
                expect(popup.length).toBe(0);
            });
        });
    });

});
