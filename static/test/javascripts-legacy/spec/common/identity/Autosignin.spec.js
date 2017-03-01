define([
    'common/modules/identity/api',
    'common/modules/identity/autosignin',
    'common/modules/identity/facebook-authorizer'
], function (
    Id,
    AutoSignin,
    FacebookAuthorizer
) {
    describe('On Intitalisation', function () {
        var config = {
                'page' : {
                    'idApiUrl' : 'https://idapi.theguardian.com'
                }
            },
            spy;

        beforeEach(function () {
            Id.init(config);
            sinon.stub(Id, 'shouldAutoSigninInUser');
            spy = sinon.stub(FacebookAuthorizer.prototype, 'getLoginStatus');
        });

        afterEach(function () {
            Id.shouldAutoSigninInUser.restore();
            spy.restore();
        });

        it('does not get the users facebook status when they are not eligible for autosignin', function () {
            Id.shouldAutoSigninInUser.returns(false);
            new AutoSignin(config).init();
            expect(spy.callCount).toEqual(0);
        });

        it('gets the users facebook logged in status when eligible for signing on', function () {
            Id.shouldAutoSigninInUser.returns(true);
            new AutoSignin(config).init();
            expect(spy.callCount).toEqual(1);
        });
    });
});
