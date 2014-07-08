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
                            '<p class="first-para"></p><p class="second-para"></p>'
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
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            contentType: 'Article',
                            isLiveBlog: false
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
                    expect(qwery('.ad-slot', fixture).length).toBe(0);
                });

                it('should not display ad slot if not on an article', function() {
                    config.page.contentType = 'Gallery';
                    expect(articleBodyAdverts.init(config)).toBe(false);
                    expect(qwery('.ad-slot', fixture).length).toBe(0);
                });

                it('should not display ad slot if a live blog', function() {
                    config.page.isLiveBlog = true;
                    expect(articleBodyAdverts.init(config)).toBe(false);
                    expect(qwery('.ad-slot', fixture).length).toBe(0);
                });

                it('should insert an inline ad container to the available slot', function() {
                    var paras = qwery('p', fixture);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    getParaWithSpaceStub.onSecondCall().returns(paras[1]);
                    articleBodyAdverts.init(config);
                    expect(qwery('.ad-slot--inline', fixture).length).toBeGreaterThan(0);
                    expect(getParaWithSpaceStub).toHaveBeenCalledWith({
                        minAbove: 250,
                        minBelow: 300,
                        selectors: {
                            ' > h2': {minAbove: 0, minBelow: 250},
                            ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250},
                            ' .ad-slot': {minAbove: 500, minBelow: 500}
                        }
                    })
                });
            });
        });

});
