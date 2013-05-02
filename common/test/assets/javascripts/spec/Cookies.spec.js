define(['modules/cookies'], function(cookies) {
   
    describe("Cookie", function() {

        beforeEach(function() {
            cookies.cleanUp(['testname1', 'testname2', 'testname3', 'COOKIE_NAME']);
        });

        it("should let list of cookies be cleared", function() {

            document.cookie = 'testname1=testval1; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/';
            document.cookie = 'testname2=testval2; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/';
            document.cookie = 'testname3=testval3; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/';

            var c = document.cookie;

            expect(c).toMatch(/testname1/);
            expect(c).toMatch(/testname2/);
            expect(c).toMatch(/testname3/);

            cookies.cleanUp(['testname1', 'testname2']);

            var c = document.cookie;
            expect(c).not.toMatch(/testname1/);
            expect(c).not.toMatch(/testname2/);
            expect(c).toMatch(/testname3/);

        });

        it("should set a cookie", function() {
            cookies.add('COOKIE_NAME', 'cookie_value');
            expect(document.cookie).toMatch(/COOKIE_NAME=cookie_value/);
        });

    });

});

