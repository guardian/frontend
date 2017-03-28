define([
    'bean',
    'fastdom',
    'qwery',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/$'

], function (
    bean,
    fastdom,
    qwery,
    config,
    detect,
    mediator,
    $
) {
    return function () {
        var self = this;

        this.id = 'BundlesLandingPage';
        this.start = '2017-03-24';
        this.expiry = '2017-04-06'; // Thursday 6th April
        this.author = 'Justin Pinner';
        this.description = 'Route 10% of epic traffic to recurring contributions-enabled bundle page';
        this.showForSensitive = true;
        this.audience = 0.1;  // 10% (of epic-seeing readers)
        this.audienceOffset = 0;
        this.successMeasure = 'Two thousand conversions of any kind';
        this.audienceCriteria = 'Epic click-throughs';
        this.dataLinkNames = '';
        this.idealOutcome = 'We score some recurring contributions and don\'t miss out on others';
        this.hypothesis = 'People want recurring contributions, and the landing page serves all options';

        this.canRun = function () {
            return config.page.edition.toUpperCase() === 'UK';
        };

        this.completeFunc = function(complete) {
            // fire on Epic's [Make a monthly payment ->] or [Make a one-off payment ->] button clicks
            bean.on(qwery('.support__rewritten'), 'click', complete);
        };

        this.rewriteCtaButtons = function() {
            var buttons = document.querySelectorAll('.contributions__epic .contributions__option-button'),
                btnContrib = null,
                btnSupport = null,
                supportHref = null;

            for (var i = 0; i < buttons.length; i++) {
                var href = buttons[i].getAttribute('href'),
                    hrefParts = href.split('?');

                if (href.indexOf('membership.theguardian.com') > -1) {
                    btnSupport = $('#' + buttons[i].id);
                    supportHref = config.page.supportUrl + '?' + hrefParts[1];
                } else {
                    btnContrib = $('#' + buttons[i].id);
                }
            }

            if (btnContrib) {
                fastdom.write(function() {
                    btnContrib.text('Make a one-off payment');
                    btnContrib.addClass('support__rewritten');
                });
            }

            if (btnSupport && supportHref) {
                fastdom.write(function() {
                    btnSupport.attr('href', supportHref);
                    btnSupport.addClass('support__rewritten');
                    btnSupport.text('Make a monthly payment');
                });

            }

        };

        this.variants = [
            {
                id: 'intest',
                test: function() {
                    mediator.on('epic:inpage', self.rewriteCtaButtons);
                },
                success: this.completeFunc
            }
        ];
    };
});
