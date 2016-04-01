define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/experiments/membership-thrasher'
], function (
    $,
    config,
    MembershipThrasher
) {
    return function () {

        this.id = 'Membership';
        this.start = '2016-03-29';
        this.expiry = '2016-04-05';
        this.author = 'Joseph Smith';
        this.description = '404 test to determine interest in three possible membership propositions';
        this.audience = 0.12;
        this.audienceOffset = 0.6;
        this.successMeasure = 'Users will show strong preference for one of the three membership propositions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'membership 2.0 test explore, membership 2.0 test explained, membership 2.0 test experience';
        this.idealOutcome = 'Users will show strong preference for one of the three membership propositions';

        // UK edition only
        // On UK home front, UK news front and politics front
        // On UK news articles and politics articles
        this.canRun = function () {
            if (config.page.edition !== 'UK') {
                return false;
            }

            if (config.page.isFront) {
                if (isUKNewsOrPolitics() || config.page.section == 'uk') {
                    return true;
                }
            } else if (config.page.contentType === 'Article' && isUKNewsOrPolitics()) {
                return true;
            }

            return false;
        };

        function isUKNewsOrPolitics() {
            return (config.page.section === 'politics' || config.page.section === 'uk-news');
        }

        function getContainer() {
            if (config.page.isFront) {
                return $('.js-container--first');
            }

            if (config.page.contentType === 'Article') {
                return $('.fc-container').first();
            }

            return null;
        }

        function displayThrasher(name, description, linkHref) {
            var $container = getContainer();

            if ($container) {
                var template = new MembershipThrasher({
                    $container: $container,
                    name: name,
                    description: description,
                    linkHref: linkHref
                });
                template.show();
            }
        }

        this.variants = [
            {
                id: 'explained',
                test: function () {
                    displayThrasher('explained', 'Better understand important issues through reporting, analysis and commentary expertly tailored to your level of knowledge', '/commercial/guardian-explain');
                }
            },
            {
                id: 'explore',
                test: function () {
                    displayThrasher('explore', 'Join Guardian journalists for long-term projects as they explore stories off the beaten news path', '/commercial/guardian-explore');
                }
            },
            {
                id: 'experience',
                test: function () {
                    displayThrasher('experience', 'Think globally - report locally, with in-depth journalism that you direct', '/commercial/guardian-experience');
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});
