import Promise from 'Promise';
import tick from 'test/utils/tick';
import session from 'utils/oauth-session';
import {reauth} from 'utils/oauth-session';
import {CONST} from 'modules/vars';

describe('OAuth Session', function () {
    beforeEach(function () {
        var redirect = jasmine.createSpy('redirect');
        jasmine.clock().install();
        this.redirect = redirect;
    });
    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('re-authenticate every once in a while', function (done) {
        var panda = jasmine.createSpy('panda').and.callFake(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 100);
            });
        });

        session(panda, this.redirect);
        tick(CONST.reauthInterval + 200).then(() => {
            expect(this.redirect).not.toHaveBeenCalled();
            expect(panda).toHaveBeenCalledWith(CONST.reauthPath, CONST.reauthTimeout);

            done();
        })
        .catch(done.fail);
    });

    it('redirects on timeout', function (done) {
        var panda = jasmine.createSpy('panda').and.callFake(function () {
            return new Promise(function (resolve, reject) {
                setTimeout(reject, CONST.reauthTimeout);
            });
        });

        session(panda, this.redirect);
        tick(CONST.reauthInterval + CONST.reauthTimeout).then(() => {
            expect(this.redirect).toHaveBeenCalled();
            expect(panda).toHaveBeenCalledWith(CONST.reauthPath, CONST.reauthTimeout);

            done();
        })
        .catch(done.fail);
    });

    it('authenticates multiple requests', function (done) {
        var panda = jasmine.createSpy('panda').and.callFake(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 100);
            });
        });
        var spies = {
            one: function () {},
            two: function () {}
        };
        spyOn(spies, 'one');
        spyOn(spies, 'two');
        reauth(panda).then(spies.one);
        reauth(panda).then(spies.two);

        tick(110).then(() => {
            expect(this.redirect).not.toHaveBeenCalled();
            expect(panda.calls.count()).toBe(1);
            expect(spies.one).toHaveBeenCalled();
            expect(spies.two).toHaveBeenCalled();

            done();
        })
        .catch(done.fail);
    });
});
