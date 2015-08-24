import Promise from 'Promise';
import * as ajax from 'modules/authed-ajax';
import * as mockjax from 'test/utils/mockjax';
import $ from 'jquery';
import * as panda from 'panda-session';
import {CONST} from 'modules/vars';

describe('Authed Ajax', function () {
    beforeEach(function () {
        this.scope = mockjax.scope();
        this.scope({
            url: '/success',
            status: 200,
            responseText: {}
        }, {
            url: '/fail',
            status: 500,
            responseText: {}
        }, {
            url: '/auth',
            status: 419,
            responseText: {}
        }, {
            url: '/redirect',
            status: 403,
            responseText: {}
        });
        spyOn($, 'ajax').and.callThrough();
        var win = {
            location: {
                reload: function () {}
            }
        };
        spyOn(win.location, 'reload');
        this.win = win;
    });
    afterEach(function () {
        this.scope.clear();
    });

    it('sends a successful request', function (done) {
        ajax.request({
            url: '/success'
        }).then(function () {
            expect($.ajax).toHaveBeenCalledWith({
                url: '/success',
                dataType: 'json',
                contentType: undefined
            });
            done();
        });
    });

    it('sends a successful request override type', function (done) {
        ajax.request({
            url: '/success',
            type: 'banana'
        }).then(function () {
            expect($.ajax).toHaveBeenCalledWith({
                url: '/success',
                dataType: undefined,
                type: 'banana',
                contentType: undefined
            });
            done();
        });
    });

    it('sends a successful request override content type', function (done) {
        ajax.request({
            url: '/success',
            data: {}
        }).then(function () {
            expect($.ajax).toHaveBeenCalledWith({
                url: '/success',
                dataType: 'json',
                contentType: 'application/json',
                data: {}
            });
            done();
        });
    });

    it('fails with an un-handled error', function (done) {
        ajax.request({
            url: '/fail'
        }).then(done.fail, function () {
            expect($.ajax).toHaveBeenCalled();
            done();
        });
    });

    it('fails with a reload redirect', function (done) {
        ajax.request({
            url: '/redirect'
        }, this.win).then(done.fail, () => {
            expect(this.win.location.reload).toHaveBeenCalled();
            done();
        });
    });

    describe('tries again for auth', function () {
        it('works on second try', function (done) {
            spyOn(panda, 'reEstablishSession').and.callFake(() => {
                return new Promise(resolve => {
                    this.scope.clear();
                    // second requests works
                    this.scope({
                        url: '/auth',
                        status: 200,
                        responseText: {
                            works: true
                        }
                    });
                    resolve();
                });
            });

            ajax.request({
                url: '/auth'
            }, this.win).then(function (result) {
                expect(panda.reEstablishSession).toHaveBeenCalled();
                expect(result).toEqual({
                    works: true
                });
                done();
            });
        });

        it('fails on second try', function (done) {
            spyOn(panda, 'reEstablishSession').and.returnValue(Promise.resolve());

            // the second request keeps redirecting, don't loop
            ajax.request({
                url: '/auth'
            }, this.win).then(done.fail, () => {
                expect(panda.reEstablishSession).toHaveBeenCalled();
                expect(this.win.location.reload).toHaveBeenCalled();
                done();
            });
        });

        it('fails while reauth', function (done) {
            spyOn(panda, 'reEstablishSession').and.callFake(function () {
                return Promise.reject(new Error('bad'));
            });

            // auth failed for some reason, redirect
            ajax.request({
                url: '/auth'
            }, this.win).then(done.fail, () => {
                expect(panda.reEstablishSession).toHaveBeenCalled();
                expect(this.win.location.reload).toHaveBeenCalled();
                done();
            });
        });
    });
});

describe('Ajax Collections update', function () {
    describe('works', function () {
        beforeEach(function () {
            this.scope = mockjax.scope();
            this.scope({
                url: CONST.apiBase + '/edits',
                status: 200,
                responseText: {
                    'banana': {
                        works: true
                    },
                    'apple': {
                        removed: true
                    }
                }
            }, {
                url: CONST.apiBase + '/treats/banana',
                status: 200,
                responseText: {
                    'banana': {
                        works: true
                    },
                    'apple': {
                        removed: true
                    }
                }
            });
            spyOn($, 'ajax').and.callThrough();
        });
        afterEach(function () {
            this.scope.clear();
        });

        it('updates a collection', function (done) {
            var populateArg;
            ajax.updateCollections({
                update: {
                    collection: {
                        id: 'banana',
                        setPending: function () {},
                        populate: function (arg, callback) {
                            populateArg = arg;
                            callback();
                        }
                    },
                    mode: 'live'
                }
            })
            .then(() => {
                var call = $.ajax.calls.argsFor(0)[0], data = JSON.parse(call.data);
                expect(call.url).toBe(CONST.apiBase + '/edits');
                expect(call.type).toBe('POST');
                expect(data).toEqual({
                    type: 'Update',
                    update: {
                        id: 'banana',
                        live: true,
                        draft: false
                    }
                });
                expect(populateArg).toEqual({
                    works: true
                });
            })
            .then(done)
            .catch(done.fail);
        });

        it('removes a treat', function (done) {
            var populateArg;
            ajax.updateCollections({
                remove: {
                    collection: {
                        id: 'banana',
                        setPending: function () {},
                        populate: function (arg, callback) {
                            populateArg = arg;
                            callback();
                        }
                    },
                    mode: 'treats'
                }
            })
            .then(() => {
                var call = $.ajax.calls.argsFor(0)[0], data = JSON.parse(call.data);
                expect(call.url).toBe(CONST.apiBase + '/treats/banana');
                expect(call.type).toBe('POST');
                expect(data).toEqual({
                    type: 'Remove',
                    remove: {
                        id: 'banana',
                        live: false,
                        draft: false
                    }
                });
                expect(populateArg).toEqual({
                    works: true
                });
            })
            .then(done)
            .catch(done.fail);
        });

        it('updates and remove', function (done) {
            var populateArgUpdate, populateArgRemove;
            ajax.updateCollections({
                update: {
                    collection: {
                        id: 'banana',
                        setPending: function () {},
                        populate: function (arg, callback) {
                            populateArgUpdate = arg;
                            callback();
                        }
                    },
                    mode: 'draft'
                },
                remove: {
                    collection: {
                        id: 'apple',
                        setPending: function () {},
                        populate: function (arg, callback) {
                            populateArgRemove = arg;
                            callback();
                        }
                    },
                    mode: 'draft'
                }
            })
            .then(() => {
                var call = $.ajax.calls.argsFor(0)[0], data = JSON.parse(call.data);
                expect(call.url).toBe(CONST.apiBase + '/edits');
                expect(call.type).toBe('POST');
                expect(data).toEqual({
                    type: 'UpdateAndRemove',
                    update: {
                        id: 'banana',
                        live: false,
                        draft: true
                    },
                    remove: {
                        id: 'apple',
                        live: false,
                        draft: true
                    }
                });
                expect(populateArgUpdate).toEqual({
                    works: true
                });
                expect(populateArgRemove).toEqual({
                    removed: true
                });
            })
            .then(done)
            .catch(done.fail);
        });
    });

    describe('fails', function () {
        beforeEach(function () {
            this.scope = mockjax.scope();
            this.scope({
                url: CONST.apiBase + '/edits',
                status: 500,
                responseText: {}
            });
            spyOn($, 'ajax').and.callThrough();
        });
        afterEach(function () {
            this.scope.clear();
        });

        it('updates a collection', function (done) {
            var collection = {
                id: 'banana',
                setPending: function () {},
                load: function () {}
            };
            spyOn(collection, 'load');
            ajax.updateCollections({
                update: {
                    collection: collection,
                    mode: 'live'
                }
            })
            .then(done.fail)
            .catch(() => {
                expect(collection.load).toHaveBeenCalled();
                done();
            });
        });
    });
});
