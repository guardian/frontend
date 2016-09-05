define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-embed.html',
    'common/utils/robust',
    'text!common/views/giraffe-message.html',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config',
    'common/modules/experiments/embed',
    'common/modules/article/space-filler'

], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEmbed,
             robust,
             giraffeMessage,
             arrowRight,
             config,
             embed,
             spaceFiller
) {


    return function () {

        this.id = 'ContributionsEmbed20160905';
        this.start = '2016-09-05';
        this.expiry = '2016-09-10';
        this.author = 'Jonathan Rankin';
        this.description = 'Test whether contributions embed performs better inline and in-article than at the bottom of the article.';
        this.showForSensitive = false;
        this.audience = 0.10;
        this.audienceOffset = 0.23;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'The embed performs 20% better inline and in-article than it does at the bottom of the article';
        this.canRun = function () {
            var pageObj = config.page;
            return !(pageObj.isSensitive || pageObj.isLiveBlog || pageObj.isFront || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };

        function getSpacefinderRules() {
            return {
                bodySelector: '.js-article__body',
                slotSelector: ' > p',
                minAbove: 250,
                minBelow: 100,
                clearContentMeta: 50,
                selectors: {
                    ' .element-rich-link': {minAbove: 100, minBelow: 100},
                    ' .player': {minAbove: 200, minBelow: 200},
                    ' > h2': {minAbove: 200, minBelow: 0},
                    ' > *:not(p):not(h2):not(blockquote)': {minAbove: 35, minBelow: 200},
                    ' .ad-slot': {minAbove: 150, minBelow: 200}
                }
            };
        }

        var bottomWriter = function (component) {

            return fastdom.write(function () {
                var a = $('.submeta');
                component.insertBefore(a);
                embed.init();
                mediator.emit('contributions-embed:insert', component);
            });

        };

        var inArticleWriter = function (component) {

            return spaceFiller.fillSpace(getSpacefinderRules(), function (paras) {
                component.insertBefore(paras[0]);
                embed.init();
                mediator.emit('contributions-embed:insert', component);
            });

        };



        var completer = function (complete) {
            mediator.on('contributions-embed:insert', function () {
                bean.on(qwery('.js-submit-input')[0], 'click', function (){
                    complete();
                });
            });
        };


        this.variants = [

            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        linkHref : 'https://interactive.guim.co.uk/contributions-embeds/embed/embed.html',
                        variant: 'bottom',
                        intCMP : 'co_uk_cobedpos_like_control'
                    }));
                    bottomWriter(component);
                },
                success: completer
            },

            {
                id: 'inArticle',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'supporting',
                        linkHref : 'https://interactive.guim.co.uk/contributions-embeds/embed/embed.html',
                        variant : 'in-article',
                        intCMP : 'co_uk_cobedpos_like_article'

                    }));
                    inArticleWriter(component);
                },
                success: completer
            }
        ];
    };
});
