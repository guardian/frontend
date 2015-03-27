define([
    'knockout',
    'models/collections/latest-articles',
    'modules/vars',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    LatestArticles,
    vars,
    mediator,
    updateScrollables
) {

    function Latest (params, element) {
        var self = this;
        this.column = params.column;

        this.showingDrafts = ko.observable(false);
        this.showDrafts = function() {
            self.showingDrafts(true);
            self.latestArticles.search();
        };
        this.showLive = function() {
            self.showingDrafts(false);
            self.latestArticles.search();
        };

        this.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes,
            container: element,
            showingDrafts: this.showingDrafts
        });

        this.latestArticles.search();
        this.latestArticles.startPoller();

        this.subscriptionOnVars = vars.model.switches.subscribe(function (switches) {
            if (!switches['facia-tool-draft-content']) {
                self.showingDrafts(false);
            }
        });
        this.subscriptionOnArticles = this.latestArticles.articles.subscribe(updateScrollables);

        mediator.emit('latest:loaded');
    }

    Latest.prototype.dispose = function () {
        this.subscriptionOnArticles.dispose();
        this.subscriptionOnVars.dispose();
    };

    return Latest;
});
