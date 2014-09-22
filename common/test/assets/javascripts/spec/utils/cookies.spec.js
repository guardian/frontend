define([
    'common/utils/_',
    'common/utils/cookies'
], function (
    _,
    cookies
) {
   
    describe('Cookies', function () {

        var clock,
            mockDocument;

        beforeEach(function () {
            // make a mock document cookie object
            clock = sinon.useFakeTimers();
            mockDocument = {
                value: '',

                get cookie() {
                    return this.value.replace('|', ';').replace(/^[;|]|[;|]$/g, '');
                },

                set cookie(value) {
                    var name = value.split('=')[0];
                    this.value = _(this.value.split('|'))
                        .remove(function (cookie) {
                            return cookie.split('=')[0] !== name;
                        })
                        .push(value)
                        .join('|');
                }
            };
            cookies._setDocument(mockDocument);
        });

        afterEach(function () {
            clock.restore();
            cookies._setDocument(null);
        });

        it('should be able the clean a list of cookies', function () {

            mockDocument.cookie = 'cookie-1-name=cookie-1-value';
            mockDocument.cookie = 'cookie-2-name=cookie-2-value';
            mockDocument.cookie = 'cookie-3-name=cookie-3-value';

            cookies.cleanUp(['cookie-1-name', 'cookie-2-name']);

            var c = mockDocument.cookie;

            expect(c).toMatch('cookie-1-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=localhost');
            expect(c).toMatch('cookie-2-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=localhost');

        });

        it('should be able to set a cookie', function () {
            cookies.add('cookie-1-name', 'cookie-1-value');
            expect(mockDocument.cookie).toMatch(
                'cookie-1-name=cookie-1-value; path=/; expires=Sun, 31 May 1970 23:00:00 GMT; domain=localhost'
            );
            clock.restore();
        });

        it('should be able to set a cookie for a specific number of days', function () {
            cookies.add('cookie-1-name', 'cookie-1-value', 7);
            expect(mockDocument.cookie).toEqual(
                'cookie-1-name=cookie-1-value; path=/; expires=Thu, 08 Jan 1970 00:00:00 GMT; domain=localhost'
            );
        });

        it('should be able to set a cookie for a specific number of minutes', function () {
            cookies.addForMinutes('cookie-1-name', 'cookie-1-value', 91);
            expect(mockDocument.cookie).toEqual(
                'cookie-1-name=cookie-1-value; path=/; expires=Thu, 01 Jan 1970 01:31:00 GMT; domain=localhost'
            );
        });

        it('should be able to set a session cookie', function () {
            cookies.addSessionCookie('cookie-1-name', 'cookie-1-value');
            expect(mockDocument.cookie).toEqual('cookie-1-name=cookie-1-value; path=/; domain=localhost');
        });

        it('should be able remove cookies', function () {
            cookies.remove('cookie-1-name');
            expect(mockDocument.cookie).toEqual(
                'cookie-1-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=localhost'
            );
        });

    });

});

