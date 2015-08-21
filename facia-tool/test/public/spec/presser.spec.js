import sinon from 'sinon';
import Presser from 'modules/presser';
import {CONST} from 'modules/vars';
import mediator from 'utils/mediator';
import * as mockjax from 'test/utils/mockjax';
import * as wait from 'test/utils/wait';

describe('Presser', function () {
    beforeEach(function () {
        this.originaldetectPressFailureMs = CONST.detectPressFailureMs;
        CONST.detectPressFailureMs = 200;
        this.events = sinon.spy();
        this.ajax = sinon.spy();
        this.last = sinon.spy();
        this.scope = mockjax.scope();
        this.presser = new Presser();

        var testScope = this;
        this.scope({
            url: /\/press\/([a-z]+)\/(.+)/,
            urlParams: ['env', 'front'],
            response: function (request) {
                testScope.ajax(request.urlParams.env, request.urlParams.front);
                this.responseText = {};
            }
        }, {
            url: /\/front\/lastmodified\/(.+)/,
            urlParams: ['front'],
            response: function (request) {
                testScope.last(request.urlParams.front);
                this.responseText = (new Date(2015, 7, 16)).toISOString();
            }
        });

        mediator.on('presser:lastupdate', this.events);
    });

    afterEach(function () {
        this.scope.clear();
        mediator.off('presser:lastupdate', this.events);
        this.presser.dispose();
        this.events = null;
        this.ajax = null;
    });

    it('presses draft', function (done) {
        this.presser.press('draft', 'front/name')
        .then(() => {
            expect(this.ajax.getCall(0).args).toEqual(['draft', 'front/name']);
            return wait.ms(CONST.detectPressFailureMs + 10);
        })
        .then(() => {
            expect(this.events.called).toBe(false);
        })
        .then(done)
        .catch(done.fail);
    });

    it('ignores error in press', function (done) {
        this.scope.clear();
        this.scope({
            url: /\/press\/([a-z]+)\/(.+)/,
            urlParams: ['env', 'front'],
            responseText: {},
            status: 404
        });

        this.presser.press('draft', 'front/name')
        .then(done)
        .catch(done.fail);
    });

    it('presses live successfully', function (done) {
        this.presser.press('live', 'cool/front')
        .then(() => {
            expect(this.ajax.getCall(0).args).toEqual(['live', 'cool/front']);
            expect(this.last.getCall(0).args).toEqual(['cool/front']);
            expect(this.events.getCall(0).args).toEqual(['cool/front', new Date(2015, 7, 16)]);
        })
        .then(done)
        .catch(done.fail);
    });
});
