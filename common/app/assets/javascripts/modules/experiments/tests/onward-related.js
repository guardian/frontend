define([
    'common/modules/onward/related',
    'lodash/arrays/intersection'
], function(
    Related,
    _intersection
    ) {

    return function() {

        this.id = 'OnwardRelatedSports';
        this.start = '2014-03-03';
        this.expiry = '2014-3-10';
        this.author = "Matt Osborn";
        this.audience = 0.2;
        this.audienceOffset = 0.2;
        this.description = 'Test most-popular-in-tag as an override for story package / related content in various sports sections.';
        this.successMeasure = 'CTR on this container vs story package / related content containers, and page views per visit';
        this.audienceCriteria = 'All content pages with one of the whitelisted tags listed in the test (check .js source file)';
        this.dataLinkNames = 'trail';
        this.idealOutcome = 'Measurable increase in page view per visit for whitelisted content, and increase in trail CTR over story packages.';

        this.canRun = function(config) {
            return config.page.contentType && config.page.contentType.match(/Gallery|Article|ImageContent|Video/);
        };
        this.variants = [
            {
                id: 'contextual',
                test: function (context, config) {
                    var sportTags = ["sport/cricket", "sport/rugby-union", "sport/rugbyleague", "sport/formulaone",
                        "sport/tennis", "sport/cycling", "sport/motorsports", "sport/golf", "sport/horse-racing",
                        "sport/boxing", "sport/us-sport", "sport/australia-sport"];
                    var footballTags = [ "football/championsleague", "football/premierleague", "football/championship",
                        "football/europeanfootball", "football/world-cup-2014"];
                    var footballTeams = ["football/manchester-united", "football/chelsea", "football/arsenal",
                        "football/manchestercity", "football/tottenham-hotspur", "football/liverpool" ];
                    var allWhitelistedTags = Array.prototype.concat(sportTags, footballTags, footballTeams);
                    var tags = config.page.keywordIds.split(',');

                    var match = _intersection(allWhitelistedTags, tags);
                    if (match.length > 0) {
                        var url = '/popular-in-tag/' + match[0] + '.json';
                        Related.setOverrideUrl(url);
                    }
                }
            },
            {
                id: 'control',
                test: function (context, config) {
                }
            }
        ];
    };
});
