import Injector from 'helpers/injector';

const injector = new Injector();

describe('Maintaining the freshness of a user`s adfree status', ()=> {
    const adfreeExpiryStorageKey = 'gu.adfree.user.expiry';

    let cookies, config, storage, identity, maintainAdfreeFreshness, renewAdfreeStatus;

    beforeEach(function (done) {
        injector.test([
            'common/utils/cookies',
            'common/utils/config',
            'common/utils/storage',
            'common/modules/identity/api',
            'common/modules/commercial/adfree/maintain-adfree-freshness',
            'common/modules/commercial/adfree/renew-adfree-status'
        ], function () {
            [cookies, config, storage, identity, maintainAdfreeFreshness, renewAdfreeStatus] = arguments;
            spyOn(renewAdfreeStatus, 'renew');
            done();
        });
    });

    describe('If the feature is disabled', ()=> {
        beforeEach(()=> {
            config.switches = {
                advertOptOut : false
            };
        });

        it('Makes no requests', ()=> {
            maintainAdfreeFreshness();
            expect(renewAdfreeStatus.renew).not.toHaveBeenCalled();
        });
    });

    describe('If the feature is enabled', ()=> {
        beforeEach(()=> {
            config.switches = {
                advertOptOut : true
            };
        });

        describe('If the user is logged in', ()=> {
            beforeEach(()=> {
                identity.isUserLoggedIn = ()=> true;
                cookies.remove('gu_adfree_user');
                storage.local.remove('gu_adfree_user_expiry');
            });

            it('Makes no requests if the user has an up-to-date adfree cookie', ()=> {
                cookies.add('gu_adfree_user', 'true');
                const futureTime = new Date().getTime() + 99999;
                storage.local.set(adfreeExpiryStorageKey, futureTime);

                maintainAdfreeFreshness();
                expect(renewAdfreeStatus.renew).not.toHaveBeenCalled();
            });

            it('Makes a request if user has out-of-date adfree cookie', ()=> {
                cookies.add('gu_adfree_user', 'true');
                const pastTime = new Date().getTime() - 99999;
                storage.local.set(adfreeExpiryStorageKey, pastTime);

                maintainAdfreeFreshness();
                expect(renewAdfreeStatus.renew).toHaveBeenCalled();
            });

            it('Makes a request if user has a cookie but no expiry time', ()=> {
                cookies.add('gu_adfree_user', 'true');
                maintainAdfreeFreshness();
                expect(renewAdfreeStatus.renew).toHaveBeenCalled();
            });

            it('Makes a request if user has valid expiry time but no cookie', ()=> {
                const futureTime = new Date().getTime() + 99999;
                storage.local.set(adfreeExpiryStorageKey, futureTime);

                maintainAdfreeFreshness();
                expect(renewAdfreeStatus.renew).toHaveBeenCalled();
            });
        });

        describe('If the user is logged out', ()=> {
            beforeEach(()=> {
                identity.isUserLoggedIn = ()=> false;
            });

            it('Makes no requests, because users must log in to see adfree', ()=> {
                maintainAdfreeFreshness();
                expect(renewAdfreeStatus.renew).not.toHaveBeenCalled();
            });
        });
    });
});

