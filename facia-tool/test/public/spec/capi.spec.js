import _ from 'underscore';
import sinon from 'sinon';
import {CONST} from 'modules/vars';
import * as capi from 'modules/content-api';
import {scope} from 'test/utils/mockjax';
import * as cache from 'modules/cache';
import modalDialog from 'modules/modal-dialog';

describe('Content API', function () {
    var createArticle = function (id) {
            return {
                id: function () {
                    return 'internal-code/page/' + id;
                },
                addCapiData: sinon.spy(),
                meta: {
                    href: function () { return true; }
                }
            };
        };

    beforeEach(function () {
        this.scope = scope();
        this.defaultCapiBatchSize = CONST.capiBatchSize;
        CONST.capiBatchSize = 3;
    });

    afterEach(function () {
        this.scope.clear();
        CONST.capiBatchSize = this.defaultCapiBatchSize;
    });

    it('decorateItems empty', function (done) {
        capi.decorateItems([]).then(function () {
            // Just make sure the callback is called for empty arrays
            expect(true).toBe(true);
        })
        .then(done)
        .catch(done.fail);
    });

    it('decorateItems in one batch', function (done) {
        this.scope({
            url: /\/api\/preview\/search\?ids=.+capi1,.+capi2,.+capi3/,
            responseText: {
                response: {
                    results: [{
                        fields: {
                            internalPageCode: 'capi1'
                        }
                    }, {
                        fields: {
                            internalPageCode: 'capi2'
                        }
                    }, {
                        fields: {
                            internalPageCode: 'capi3'
                        }
                    }]
                }
            }
        });
        var articles = [
            createArticle('capi1'),
            createArticle('capi2'),
            createArticle('capi3')
        ];

        capi.decorateItems(articles).then(() => {
            // Just make sure the callback is called for empty arrays
            _.each(articles, function (article) {
                expect(article.addCapiData.called).toBe(true);
            });
        })
        .then(done)
        .catch(done.fail);
    });

    it('decorateItems in multiple batches', function (done) {
        this.scope({
            url: /\/api\/preview\/search\?ids=.+batch1,.+batch2,.+batch3/,
            responseText: {
                response: {
                    results: [{
                        fields: {
                            internalPageCode: 'batch1'
                        }
                    }, {
                        fields: {
                            internalPageCode: 'batch2'
                        }
                    }, {
                        fields: {
                            internalPageCode: 'batch3'
                        }
                    }]
                }
            }
        }, {
            url: /\/api\/preview\/search\?ids=.+batch4/,
            responseText: {
                response: {
                    results: [{
                        fields: {
                            internalPageCode: 'batch4'
                        }
                    }]
                }
            }
        });
        var articles = [
            createArticle('batch1'),
            createArticle('batch2'),
            createArticle('batch3'),
            createArticle('batch4')
        ];

        capi.decorateItems(articles).then(() => {
            // Just make sure the callback is called for empty arrays
            _.each(articles, function (article) {
                expect(article.addCapiData.called).toBe(true);
            });
        })
        .then(done)
        .catch(done.fail);
    });

    describe('fetchContent', function () {
        it('fails if no response', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/capi-url',
                status: 500
            });
            capi.fetchContent('capi-url')
            .then((resp) => {
                expect(resp).toBeUndefined();
                done();
            });
        });

        it('fails with empty intersection', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/capi-url',
                status: 200,
                responseText: {
                    respose: {
                        fruit: 'banana'
                    }
                }
            });
            capi.fetchContent('capi-url')
            .then((resp) => {
                expect(resp).toBeUndefined();
                done();
            });
        });

        it('fails with status error', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/capi-url',
                status: 200,
                responseText: {
                    response: {
                        status: 'error'
                    }
                }
            });
            capi.fetchContent('capi-url')
            .then((resp) => {
                expect(resp).toBeUndefined();
                done();
            });
        });

        it('returns from content', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/capi-url',
                status: 200,
                responseText: {
                    response: {
                        content: 'something here',
                        tag: {
                            webTitle: 'one'
                        },
                        section: {
                            webTitle: 'two'
                        }
                    }
                }
            });
            capi.fetchContent('capi-url')
            .then((resp) => {
                expect(resp).toEqual({
                    content: ['something here'],
                    title: 'one'
                });
                done();
            });
        });

        it('returns from other fields', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/capi-url',
                status: 200,
                responseText: {
                    response: {
                        editorsPicks: [
                            'one',
                            'two'
                        ],
                        mostViewed: {
                            ignoreBecauseNotAnArray: true
                        },
                        results: [
                            'three'
                        ],
                        tag: {
                            ignoredBecauseMissingTitle: 'one'
                        },
                        section: {
                            webTitle: 'two'
                        }
                    }
                }
            });
            capi.fetchContent('capi-url')
            .then((resp) => {
                expect(resp).toEqual({
                    content: ['one', 'two', 'three'],
                    title: 'two'
                });
                done();
            });
        });
    });

    describe('fetchMetaForPath', function () {
        beforeEach(function () {
            this.scope = scope();
        });
        afterEach(function () {
            this.scope.clear();
        });

        it('fails if no response', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/meta-capi-url*',
                status: 500,
                responseText: {
                    response: {
                        section: {
                            webTitle: 'one'
                        }
                    }
                }
            });
            capi.fetchMetaForPath('meta-capi-url')
            .then((resp) => {
                expect(resp).toBeUndefined();
                done();
            });
        });

        it('extract meta from the response', function (done) {
            this.scope({
                url: CONST.apiSearchBase + '/meta-capi-url*',
                status: 200,
                responseText: {
                    response: {
                        section: {
                            webTitle: 'one',
                            id: 'a/b/c',
                            description: 'apple'
                        },
                        tag: {
                            description: 'banana',
                            title: 'fruit'
                        }
                    }
                }
            });
            capi.fetchMetaForPath('meta-capi-url')
            .then((resp) => {
                expect(resp).toEqual({
                    section: 'c',
                    webTitle: 'one',
                    description: 'banana',
                    title: 'fruit'
                });
                done();
            });
        });
    });

    describe('validateItem', function () {
        beforeEach(function () {
            this.scope = scope();
            this.createItem = function (opts) {
                var item = {
                    id: function () {
                        return opts.id;
                    },
                    addCapiData: function () {},
                    group: {
                        parentType: opts.parentType || 'Clipboard'
                    },
                    meta: {
                        snapType: function () {
                            return opts.snapType;
                        }
                    },
                    convertToSnap: function () {},
                    convertToLatestSnap: function () {},
                    convertToLinkSnap: function () {}
                };
                spyOn(item, 'addCapiData');
                spyOn(item, 'convertToSnap');
                spyOn(item, 'convertToLatestSnap');
                spyOn(item, 'convertToLinkSnap');
                return item;
            };
        });
        afterEach(function () {
            this.scope.clear();
        });

        it('resolves a snapID', function (done) {
            var item = this.createItem({
                id: 'snap/23414'
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.addCapiData).not.toHaveBeenCalled();
                done();
            });
        });

        it('resolves from cache', function (done) {
            var item = this.createItem({
                id: '/internal'
            });
            cache.put('contentApi', 'internal', {
                title: 'cache'
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.addCapiData).toHaveBeenCalledWith({
                    title: 'cache'
                });
                done();
            });
        });

        it('resolves a single malformed capi item', function (done) {
            var item = this.createItem({
                id: '/item'
            });
            cache.put('contentApi', 'item', null);
            this.scope({
                url: CONST.apiSearchBase + '/item?*',
                status: 200,
                responseText: {
                    response: {
                        content: [{
                            fields: {
                                // page code is missing
                                // internalPageCode: 'banana'
                            }
                        }],
                        section: {
                            webTitle: 'one'
                        }
                    }
                }
            });

            capi.validateItem(item)
            .then(done.fail, (error) => {
                expect(error.message).toMatch(/internalPageCode/i);
                done();
            });
        });

        it('resolves a single valid capi item', function (done) {
            var item = this.createItem({
                id: '/item'
            });
            cache.put('contentApi', 'item', null);
            this.scope({
                url: CONST.apiSearchBase + '/item?*',
                status: 200,
                responseText: {
                    response: {
                        content: {
                            fields: {
                                internalPageCode: 'banana',
                                another: true
                            }
                        },
                        section: {
                            webTitle: 'one'
                        }
                    }
                }
            });

            capi.validateItem(item)
            .then((valid) => {
                var data = {
                    fields: {
                        internalPageCode: 'banana',
                        another: true
                    }
                };
                expect(valid).toBe(item);
                expect(item.addCapiData).toHaveBeenCalledWith(data);
                expect(cache.get('contentApi', 'internal-code/page/banana')).toEqual(data);
                done();
            });
        });

        it('fails on a relative snap', function (done) {
            var item = this.createItem({
                id: '/whatever'
            });
            cache.put('contentApi', 'whatever', null);
            this.scope({
                url: CONST.apiSearchBase + '/whatever?*',
                status: 200,
                responseText: {
                    response: {}
                }
            });

            capi.validateItem(item)
            .then(done.fail, (error) => {
                expect(error.message).toMatch(/URLs must begin with http/i);
                done();
            });
        });

        it('fails on snaps not in the clipboard', function (done) {
            var item = this.createItem({
                id: 'http://whatever.com/something',
                parentType: 'Not the clipboard'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {}
                }
            });

            capi.validateItem(item)
            .then(done.fail, (error) => {
                expect(error.message).toMatch(/dragged to the Clipboard/i);
                done();
            });
        });

        it('fails on links coming from self', function (done) {
            var item = this.createItem({
                id: 'http://' + window.location.hostname + '/something'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {}
                }
            });

            capi.validateItem(item)
            .then(done.fail, (error) => {
                expect(error.message).toMatch(/cannot be added/i);
                done();
            });
        });

        it('fails on guardian content not available', function (done) {
            var item = this.createItem({
                id: 'http://' + CONST.mainDomain + '/something'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {
                        results: []
                    }
                }
            });

            capi.validateItem(item)
            .then(done.fail, (error) => {
                expect(error.message).toMatch(/Guardian content is unavailable/i);
                done();
            });
        });

        it('validates a snap that contains a type', function (done) {
            var item = this.createItem({
                id: 'http://anything.com/something',
                snapType: 'link'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {}
                }
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.convertToSnap).toHaveBeenCalled();
                done();
            });
        });

        it('validates multiple snap results - latest', function (done) {
            var item = this.createItem({
                id: 'http://anything.com/something'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {
                        results: ['one', 'two'],
                        section: {
                            webTitle: 'one'
                        }
                    }
                }
            });
            spyOn(modalDialog, 'confirm').and.callFake(() => {
                return Promise.resolve();
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.convertToLatestSnap).toHaveBeenCalledWith('one');
                done();
            });
        });

        it('validates multiple snap results - link', function (done) {
            var item = this.createItem({
                id: 'http://anything.com/something'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {
                        results: ['one', 'two'],
                        section: {
                            webTitle: 'one'
                        }
                    }
                }
            });
            spyOn(modalDialog, 'confirm').and.callFake(() => {
                return Promise.reject();
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.convertToLinkSnap).toHaveBeenCalled();
                done();
            });
        });

        it('validates multiple snap link', function (done) {
            var item = this.createItem({
                id: 'http://anything.com/something'
            });
            cache.put('contentApi', 'something', null);
            this.scope({
                url: CONST.apiSearchBase + '/something?*',
                status: 200,
                responseText: {
                    response: {}
                }
            });

            capi.validateItem(item)
            .then((valid) => {
                expect(valid).toBe(item);
                expect(item.convertToLinkSnap).toHaveBeenCalled();
                done();
            });
        });
    });
});
