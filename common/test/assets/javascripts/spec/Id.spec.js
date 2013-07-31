define(['modules/cookies', 'modules/id'], function(Cookies, Id) {
    var cookieData = 'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY';
    
    describe('Get user data', function() {

        it ('gets user from cookie', function() {
            Cookies.add('GU_U', cookieData, 365);
            var user = Id.getUserFromCookie();
            expect(user.displayName).toBe('jamesgorrie');
        });

        it ('decodes a base64 string', function() {
            var string = 'sammandoo',
                encodedString = window.btoa(string),
                decodedString = Id.decodeBase64(encodedString);
                
            expect(decodedString).toBe(string);
        });

    });

})
