define([
    'common/modules/onward/related',
    'lodash/arrays/intersection'
], function(
    related,
    _intersection
    ) {

    return function() {

        this.id = 'OnwardRelated';
        this.expiry = '2014-3-10';
        this.audience = 0.3;
        this.audienceOffset = 0.7;
        this.description = 'Test alternate related stories for sports sections.';
        this.canRun = function(config) {
            return config.page.contentType.match(/Gallery|Article|ImageContent|Video/);
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
                        related(config, context, url, true);
                    } else {
                        related(config, context);
                    }
                }
            },
            {
                id: 'control',
                test: function (context, config) {
                    related(context, config);
                }
            }
        ];
    };
});
