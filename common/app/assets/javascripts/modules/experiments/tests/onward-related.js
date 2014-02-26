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
                    var specialTags = ["sport/cricket", "sport/football", "football/football", "sport/rugby-union", "sport/rugbyleague",
                        "sport/tennis", "sport/cycling", "sport/us-sport", "sport/formulaone", "sport/motorsports",
                        "sport/golf", "sport/horse-racing", "sport/boxing"];
                    var tags = config.page.keywordIds.split(',');

                    var match = _intersection(specialTags, tags);
                    if (match.length > 0) {
                        var url = '/popular-in-tag/' + match[0] + '.json';
                        related(config, context, url);
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
