define([
    'Squire'
], function(
    Squire
) {

    new Squire()
        .store('common/modules/article/spacefinder')
        .require([
            'mocks',
            'qwery',
            'helpers/fixtures',
            'common/utils/$',
            'common/modules/commercial/article-body-adverts'
        ], function(
            mocks,
            qwery,
            fixtures,
            $,
            articleBodyAdverts
        ) {

            describe('Article Body Adverts', function() {

                var fixturesConfig = {
                        id: 'article-body-adverts',
                        fixtures: [
                            '<p class="first-para"></p><p class="second-para"></p><p class="third-para"></p>'
                        ]
                    },
                    fixture,
                    $style,
                    config,
                    getParaWithSpaceStub;

                beforeEach(function() {
                    fixtures.render(fixturesConfig);
                    fixture = qwery('#' + fixturesConfig.id)[0];
                    config = {
                        innerWidth: 900,
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            contentType: 'Article',
                            isLiveBlog: false,
                            hasInlineMerchandise: false
                        }
                    };
                    $style = $.create('<style type="text/css"></style>')
                        .html('body:after{ content: "wide"}')
                        .appendTo('head');
                    getParaWithSpaceStub = sinon.stub(mocks.store['common/modules/article/spacefinder'], 'getParaWithSpace');
                });

                afterEach(function() {
                    fixtures.clean(fixturesConfig.id);
                    articleBodyAdverts.reset();
                    $style.remove();
                    getParaWithSpaceStub.restore();
                });

                it('should exist', function() {
                    expect(articleBodyAdverts).toBeDefined();
                });

                it('should not not display ad slot if standard-adverts switch is off', function() {
                    config.switches.standardAdverts = false;
                    expect(articleBodyAdverts.init(config)).toBe(false);
                });

                it('should not display ad slot if not on an article', function() {
                    config.page.contentType = 'Gallery';
                    expect(articleBodyAdverts.init(config)).toBe(false);
                });

                it('should not display ad slot if a live blog', function() {
                    config.page.contentType = 'LiveBlog';
                    expect(articleBodyAdverts.init(config)).toBe(false);
                });

                it('should call \'getParaWithSpace\' with correct arguments', function() {
                    articleBodyAdverts.init(config);
                    expect(getParaWithSpaceStub).toHaveBeenCalledWith({
                        minAbove: 700,
                        minBelow: 300,
                        selectors: {
                            ' > h2': {minAbove: 0, minBelow: 250},
                            ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 250},
                            ' .ad-slot': {minAbove: 500, minBelow: 500}
                        }
                    })
                });

                it('should insert an inline ad container to the available slot', function() {
                    var paras = qwery('p', fixture);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    articleBodyAdverts.init(config);
                    expect(qwery('#dfp-ad--inline1', fixture).length).toBe(1);
                    expect(getParaWithSpaceStub).toHaveBeenCalledOnce();
                });

                it('should insert two inline ad slots if mobile', function() {
                    var paras = qwery('p', fixture);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    getParaWithSpaceStub.onSecondCall().returns(paras[1]);
                    $style.html('body:after{ content: "mobile"}');
                    articleBodyAdverts.init(config);
                    expect(qwery('#dfp-ad--inline1', fixture).length).toBe(1);
                    expect(qwery('#dfp-ad--inline2', fixture).length).toBe(1);
                });

                it('should insert two inline ad slots if not mobile and less than 900px wide', function() {
                    var paras = qwery('p', fixture);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    getParaWithSpaceStub.onSecondCall().returns(paras[1]);
                    config.innerWidth = 899;
                    articleBodyAdverts.init(config);
                    expect(qwery('#dfp-ad--inline1', fixture).length).toBe(1);
                    expect(qwery('#dfp-ad--inline2', fixture).length).toBe(1);
                });

                it('should insert an inline merchandising slot if page has one', function() {
                    var paras = qwery('p', fixture);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    getParaWithSpaceStub.onSecondCall().returns(paras[1]);
                    config.page.hasInlineMerchandise = true;
                    articleBodyAdverts.init(config);
                    expect(qwery('#dfp-ad--im', fixture).length).toBe(1);
                    expect(qwery('#dfp-ad--inline1', fixture).length).toBe(1);
                });

            });

        });

});
