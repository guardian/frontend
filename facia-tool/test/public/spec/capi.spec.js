import _ from 'underscore';
import sinon from 'sinon';
import vars from 'modules/vars';
import capi from 'modules/content-api';
import Mock from 'mock/search';

describe('Content API', function () {
    var default_capiBatchSize,
        createArticle = function (id) {
            return {
                id: function () {
                    return 'internal-code/content/' + id;
                },
                addCapiData: sinon.spy(),
                meta: {
                    href: function () { return true; }
                }
            };
        };

    beforeEach(function () {
        this.mock = new Mock();
        default_capiBatchSize = vars.CONST.capiBatchSize;
        vars.CONST.capiBatchSize = 3;
    });

    afterEach(function () {
        this.mock.destroy();
        vars.CONST.capiBatchSize = default_capiBatchSize;
    });

    it('decorateItems empty', function (done) {
        capi.decorateItems([]).then(function () {
            // Just make sure the callback is called for empty arrays
            expect(true).toBe(true);
            done();
        });
    });

    it('decorateItems in one batch', function (done) {
        this.mock.set({
            'internal-code/content/capi1,internal-code/content/capi2,internal-code/content/capi3': {
                response: {
                    results: [{
                        fields: {
                            internalContentCode: 'capi1'
                        }
                    }, {
                        fields: {
                            internalContentCode: 'capi2'
                        }
                    }, {
                        fields: {
                            internalContentCode: 'capi3'
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

        capi.decorateItems(articles).then(function () {
            // Just make sure the callback is called for empty arrays
            _.each(articles, function (article) {
                expect(article.addCapiData.called).toBe(true);
            });
            done();
        });
    });

    it('decorateItems in multiple batches', function (done) {
        this.mock.set({
            'internal-code/content/batch1,internal-code/content/batch2,internal-code/content/batch3': {
                response: {
                    results: [{
                        fields: {
                            internalContentCode: 'batch1'
                        }
                    }, {
                        fields: {
                            internalContentCode: 'batch2'
                        }
                    }, {
                        fields: {
                            internalContentCode: 'batch3'
                        }
                    }]
                }
            },
            'internal-code/content/batch4': {
                response: {
                    results: [{
                        fields: {
                            internalContentCode: 'batch4'
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

        capi.decorateItems(articles).then(function () {
            // Just make sure the callback is called for empty arrays
            _.each(articles, function (article) {
                expect(article.addCapiData.called).toBe(true);
            });
            done();
        });
    });
});
