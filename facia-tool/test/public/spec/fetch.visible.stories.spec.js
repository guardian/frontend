import _ from 'underscore';
import fetch from 'utils/fetch-visible-stories';
import Mock from 'mock/stories-visible';

describe('Fetch visible stories', function () {
    function createGroups() {
        return _.map(arguments, function (group, index) {
            return {
                items: function () {
                    return _.map(group, function (item) {
                        return {
                            group: {
                                index: index
                            },
                            meta: {
                                isBoosted: function () {
                                    return item;
                                }
                            }
                        };
                    });
                }
            };
        });
    }

    beforeEach(function () {
        this.mock = new Mock();
    });
    afterEach(function () {
        this.mock.destroy();
    });

    it('fails when there are no stories', function (done) {
        fetch('anything', createGroups())
        .then(function () {
            expect(true).toBe(false);
            done();
        }, function (err) {
            expect(err.message).toMatch(/Empty collection/i);
            done();
        });
    });

    it('fails if the network fails', function (done) {
        return fetch('fail', createGroups([false]))
        .then(function () {
            expect(false).toBe(true);
            done();
        }, function (err) {
            expect(err).toMatch(/fail/i);
            done();
        });
    });

    it('gets the visible stories', function (done) {
        this.mock.set({
            'collection': {
                mobile: 1
            }
        });

        return fetch('collection', createGroups([false], [false, true]))
        .then(function (response) {
            expect(response).toEqual({
                mobile: 1
            });
            done();
        }, function (err) {
            expect(NaN).toBe(err);
            done();
        });
    });
});
